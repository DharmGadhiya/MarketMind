const { Router } = require("express");
const NEWS = require("../models/news");
const corn = require("node-cron");

const router = Router();
const express = require("express");
const NEWS = require("../models/NEWS");

cron.schedule("*/20 * * * *", async () => {
  try {
    console.log("Fetching latest news...");

    const latestNews = await NEWS.findOne().sort({
      published_at: -1,
    });

    const publishedAfter = latestNews
      ? new Date(latestNews.published_at).toISOString()
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?countries=in&filter_entities=true&limit=10&published_after=${publishedAfter}&api_token=${process.env.NEWS_API}`,
    );

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      res.status(204);
      console.log("No new news found.");
      return;
    }

    const newsToInsert = data.data.map((article) => ({
      uuid: article.uuid,
      title: article.title,
      description: article.description,
      url: article.url,
      image_url: article.image_url,
      source: article.source,
      published_at: article.published_at,
      keywords: article.keywords || [],
      entities: article.entities || [],
    }));

    try {
      await NEWS.insertMany(newsToInsert, {
        ordered: false,
      });
    } catch (err) {
      if (err.code !== 11000) {
        throw err;
      }
    }

    console.log(
      `Fetched: ${data.data.length} | Stored: ${newsToInsert.length}`,
    );
    res.status(200);
  } catch (err) {
    res.status(500);
    console.error("NEWS fetch error:", err.message);
  }
});

router.get("/allnews", async (req, res) => {
  try {
    const news = (await NEWS.find({})).sort({published_at : -1});
     res.status(200).json({
      news,
    });
  } catch (err) {
    res.status(500).json({
        message : "Failed to fetch news",
        error : err.message
    })
  }
});

module.exports = router;
