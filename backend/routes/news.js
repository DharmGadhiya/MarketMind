import { Router } from "express";
import NEWS from "../models/news.js";
import cron from "node-cron";
import express from "express";
import AIAnalysis from "../models/AIAnalysis.js";
import { analyzeArticle } from "../services/analysis.service.js";

//commit from dharm
const router = Router();

cron.schedule("*/15 * * * *", async () => {
  try {
    console.log("Fetching latest news...");

    const latestNews = await NEWS.findOne()
      .sort({ published_at: -1 })
      .select({ published_at: 1 })
      .lean();

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
      .limit(limit)
      .lean();

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
    const news = await NEWS.findById(req.params.id).lean();

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
    const newsItem = await NEWS.findById(req.params.id).lean();
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
    }).lean();

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

// POST endpoint for interactive chat about a news article
router.post("/news/:id/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    const newsItem = await NEWS.findById(req.params.id).lean();
    if (!newsItem) {
      return res.status(404).json({
        success: false,
        message: "News article not found",
      });
    }

    // Look up existing analysis context
    const analysisRecord = await AIAnalysis.findOne({
      $or: [
        { newsId: newsItem._id },
        { uuid: newsItem.uuid }
      ]
    }).lean();

    // Map chat history to Gemini API format
    const contents = (history || []).map(msg => ({
      role: msg.sender === "ai" ? "model" : "user",
      parts: [{ text: msg.text }]
    }));

    // Append the latest user message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const apiKey = process.env.GEMINI;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "Gemini API key is not configured on the server",
      });
    }

    const systemInstructionText = `You are MarketMind, a real-time personalised financial AI assistant.
Engage in a natural, 2-way chat with the user about this news article and its market/financial implications.
Context of the News Article:
- Title: ${newsItem.title}
- Source: ${newsItem.source}
- Published At: ${newsItem.published_at}
- Description: ${newsItem.description}

Entities and Market Sentiments associated:
${JSON.stringify(newsItem.entities || [])}

AI Analysis Report Context:
${analysisRecord ? JSON.stringify(analysisRecord.analysis) : "Not available."}

Provide real-time answers. Answer questions clearly, accurately, and contextually. Keep replies professional, yet engaging and formatted nicely in markdown. Do NOT use JSON formatting, return clean markdown and text response directly.`;

    const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const payload = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstructionText }]
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        success: false,
        message: "Error communicating with Gemini API",
        error: errorText,
      });
    }

    const data = await response.json();
    let replyText = "";

    if (
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0]
    ) {
      replyText = data.candidates[0].content.parts[0].text;
    } else {
      return res.status(500).json({
        success: false,
        message: "Invalid response structure from Gemini API",
      });
    }

    res.status(200).json({
      success: true,
      reply: replyText,
    });
  } catch (err) {
    console.error(`Error in /news/:id/chat route:`, err);
    res.status(500).json({
      success: false,
      message: "Server error during chat",
      error: err.message,
    });
  }
});

export default router;
