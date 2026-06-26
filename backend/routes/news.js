import { Router } from "express";
import NEWS from "../models/news.js";
import cron from "node-cron";
import express from "express";
import AIAnalysis from "../models/AIAnalysis.js";
import { analyzeArticle } from "../services/analysis.service.js";

//commit from dharm
const router = Router();

cron.schedule("*/18 * * * *", async () => {
  try {
    console.log("Fetching latest news...");

    const latestNews = await NEWS.findOne().sort({
      published_at: -1,
    });

    const publishedAfter = latestNews
      ? new Date(latestNews.published_at).toISOString().slice(0, 19)
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 19);

    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?countries=in&filter_entities=true&limit=3&published_after=${publishedAfter}&api_token=${process.env.NEWS_API}`,
    );

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log("No new news found.");
      return;
    }
    console.log(data);
    const newsToInsert = data.data.map((article) => ({
      uuid: article.uuid,
      title: article.title || "",
      description: article.description || "",
      url: article.url || "",
      image_url: article.image_url || "",
      source: article.source || "",

      // Convert to Date explicitly
      published_at: article.published_at
        ? new Date(article.published_at)
        : null,

      // Your schema has keywords as String
      keywords: Array.isArray(article.keywords)
        ? article.keywords
        : article.keywords
          ? [article.keywords]
          : [],

      entities: (article.entities || []).map((entity) => ({
        symbol: entity.symbol || "",
        name: entity.name || "",
        industry: entity.industry || "",
        sentiment_score:
          typeof entity.sentiment_score === "number"
            ? entity.sentiment_score
            : null,
      })),
    }));

    console.log("newsToInsert length:", newsToInsert.length);
    console.dir(newsToInsert, { depth: null });

    try {
      const inserted = await NEWS.insertMany(newsToInsert, {
        ordered: false,
      });

      console.log(
        `Fetched: ${data.data.length} | Inserted: ${inserted.length}`,
      );
    } catch (err) {
      console.log("FULL ERROR:");
      console.dir(err, { depth: null });
    }
  } catch (err) {
    console.error("NEWS fetch error:", err.message);
  }
});

// GET ALL NEWS WITH PAGINATION
router.get("/allnews", async (req, res) => {
  try {
    // Current page (default = 1)
    const page = parseInt(req.query.page) || 1;

    // Number of news per request
    const limit = 20;

    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // Fetch news from MongoDB
    const news = await NEWS.find({})
      .sort({ published_at: -1 }) // Latest first
      .skip(skip)
      .limit(limit);

    // Total news count
    const totalNews = await NEWS.countDocuments();

    res.status(200).json({
      success: true,
      page,
      limit,
      totalNews,
      totalPages: Math.ceil(totalNews / limit),
      hasMore: page * limit < totalNews,
      news,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: err.message,
    });
  }
});

router.get("/news/:id", async (req, res) => {
  try {
    const news = await NEWS.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        message: "News not found",
      });
    }

    res.status(200).json({
      news,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// GET AI ANALYSIS FOR A SPECIFIC ARTICLE (With on-demand generation fallback)
router.get("/news/:id/analysis", async (req, res) => {
  try {
    const newsItem = await NEWS.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Look up existing analysis using a bulletproof match by newsId OR uuid
    let analysisRecord = await AIAnalysis.findOne({
      $or: [
        { newsId: newsItem._id },
        { uuid: newsItem.uuid }
      ]
    });

    // If it doesn't exist, generate it on-the-fly!
    if (!analysisRecord) {
      try {
        console.log(`AI Analysis not found for article [${newsItem._id}]. Generating on-demand...`);
        analysisRecord = await analyzeArticle(newsItem);
      } catch (genErr) {
        console.error(`On-demand AI generation failed: ${genErr.message}`);
        // If the error is a 429 quota error, return a specific helpful message
        if (genErr.message.includes("429") || genErr.message.includes("quota")) {
          return res.status(429).json({
            success: false,
            message: "AI service is temporarily unavailable due to daily usage limits. Please try again later.",
            error: genErr.message,
          });
        }
        return res.status(502).json({
          success: false,
          message: "Failed to generate AI analysis on-demand.",
          error: genErr.message,
        });
      }
    }

    if (!analysisRecord) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve or generate AI analysis.",
      });
    }

    res.status(200).json({
      success: true,
      analysis: analysisRecord.analysis,
      aiModel: analysisRecord.aiModel,
      generatedAt: analysisRecord.generatedAt,
    });
  } catch (err) {
    console.error(`Error in /news/:id/analysis route:`, err);
    res.status(500).json({
      success: false,
      message: "Server error retrieving AI analysis",
      error: err.message,
    });
  }
});

export default router;
