import * as cheerio from "cheerio";
import News from "../models/news.js";
import AIAnalysis from "../models/AIAnalysis.js";
import { cleanAndParseJSON, logger } from "../utils/helpers.js";

// Exact prompt template provided by the user
const PROMPT_TEMPLATE = `You are a senior equity research analyst and financial market educator.

Your role is to analyze stock market news and company fundamentals to help investors understand implications, risks, and potential market impact.

You are NOT a financial advisor and must NOT give buy/sell recommendations.

You are an analyst who interprets data, explains meaning, and provides structured insights based on financial fundamentals and news context.

---

INPUT DATA

NEWS:
Title: {{title}}
Description: {{description}}
Content: {{content}}

COMPANY FUNDAMENTALS (WILL ALWAYS BE PROVIDED WHEN AVAILABLE)
{{companyFundamentals}}

---

CORE PRINCIPLE

* Use ONLY provided data.
* You MAY interpret and reason from the data.
* You MAY add analytical commentary and insights.
* You MUST NOT invent missing data.
* You MUST NOT pretend to access external sources.

---

PRIMARY OBJECTIVE

Transform raw news + fundamentals into clear, structured investor understanding:

* What is happening
* Why it matters
* How strong/weak the company looks based on fundamentals
* What risks or opportunities exist

---

ANALYSIS REQUIREMENTS

1. NEWS EXPLANATION (NOT SUMMARY)

* Explain the event in simple language.
* Focus on meaning and impact, not rewriting.

2. MARKET IMPACT

* Affected companies (if mentioned)
* Affected sectors
* Broader market implications

3. SENTIMENT ANALYSIS

* Bullish / Bearish / Neutral
* Based on both news + fundamentals

4. FUNDAMENTAL ANALYSIS (IMPORTANT)
   Evaluate the company using provided metrics:

* Valuation: Is PE high/low vs typical market behavior?
* Profitability: ROE, margins strength
* Growth: Revenue and EPS trend strength
* Financial Health: Debt levels, book value strength

Then provide:

* Clear interpretation of what these fundamentals suggest
* Strengths and weaknesses
* Overall quality assessment of the company

You MAY include:

* Analytical remarks
* Comparative interpretation (e.g., “high debt indicates higher financial risk”)
* Structured reasoning

You MUST NOT:

* Give buy/sell instructions
* Act like a licensed financial advisor

5. INVESTOR INTERPRETATION

* What existing investors should understand from this news + fundamentals
* What new investors should consider before making decisions
* What key signals are important

6. RISK ANALYSIS

* Financial risks
* Market risks
* Event-specific risks

7. OUTLOOK

* Very Positive / Positive / Neutral / Negative / Very Negative
* Based on combined news + fundamentals reasoning

You are allowed to:

* Use reasoning and inference
* Form scenario-based expectations
* Interpret financial strength or weakness

But you must NOT:

* Give direct investment instructions
* Guarantee outcomes

8. CONFIDENCE SCORE (0–100)

Based on:

* Data completeness
* Clarity of news
* Strength of fundamentals

---

IMPORTANT RULES

* Never hallucinate missing information.
* Never act as a licensed financial advisor.
* Never give direct buy/sell/hold instructions.
* Focus on interpretation, reasoning, and investor education.
* Be structured, clear, and professional.
* If company fundamentals are not available (e.g., 'No company fundamentals data available' is provided), or if the metrics needed to analyze a specific category (e.g., PE ratio for valuation, ROE/margins for profitability, revenue/EPS for growth, debt/book value for financial health) are 'Data Not Available', you MUST set that specific JSON field under 'fundamentalAnalysis' to EXACTLY 'Data Not Available'. Do NOT add any commentary, explanation, or other text to that field.

---

OUTPUT FORMAT

Return ONLY valid JSON:

{
"newsExplanation": "",
"sentiment": "",
"marketImpact": "",
"fundamentalAnalysis": {
"valuation": "",
"profitability": "",
"growth": "",
"financialHealth": "",
"overallInterpretation": ""
},
"investorInsight": {
"existingInvestors": "",
"newInvestors": ""
},
"risks": [],
"outlook": "",
"confidenceScore": 0
}`;

/**
 * Safely fetches 10 company fundamental metrics from Yahoo Finance.
 * Employs a robust fallback to a basic quote if the summary details fail,
 * and defaults all missing properties to "Data Not Available".
 * 
 * @param {string} symbol - The stock ticker (e.g., "INFY.NS").
 * @returns {Promise<object>} The extracted fundamentals object.
 */
const cleanSymbol = (sym) => {
  return sym.replace(/\.(NS|BO)$/i, '').replace(/-BL$/i, '').trim();
};

export const fetchFundamentals = async (rawSymbol) => {
  const symbol = cleanSymbol(rawSymbol);
  const urls = [
    `https://www.screener.in/company/${symbol}/standalone/`,
    `https://www.screener.in/company/${symbol}/`
  ];

  let html = null;
  let lastError = null;

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      if (res.ok) {
        html = await res.text();
        break;
      } else {
        lastError = new Error(`HTTP ${res.status} for ${url}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  const getVal = (val) => {
    if (val === undefined || val === null || val === "" || val === "N/A" || val === "Error") {
      return "Data Not Available";
    }
    return val;
  };

  const formatPct = (val) => {
    if (!val || val === "N/A" || val === "Error") return "Data Not Available";
    if (val.includes("%")) return val;
    return `${val}%`;
  };

  if (!html) {
    logger.error(`Screener fetch failed for ${rawSymbol}: ${lastError ? lastError.message : "unknown error"}`);
    return {
      trailingPE: "Data Not Available",
      forwardPE: "Data Not Available",
      roe: "Data Not Available",
      eps: "Data Not Available",
      marketCap: "Data Not Available",
      debtToEquity: "Data Not Available",
      revenueGrowth: "Data Not Available",
      profitMargins: "Data Not Available",
      dividendYield: "Data Not Available",
      bookValue: "Data Not Available",
    };
  }

  try {
    const $ = cheerio.load(html);

    // Parse Top Ratios
    const ratios = {};
    $("#top-ratios li").each((i, el) => {
      const rawName = $(el).find(".name").text().trim();
      const name = rawName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
      const value = $(el).find(".number").text().trim();
      if (name) {
        ratios[name] = value;
      }
    });

    const getFloatVal = (str) => {
      if (!str) return null;
      return parseFloat(str.replace(/,/g, ''));
    };

    const price = getFloatVal(ratios["current price"]);
    const pe = getFloatVal(ratios["stock pe"]);

    let eps = null;
    if (price && pe) {
      eps = (price / pe).toFixed(2);
    }

    // Parse Balance Sheet for Debt-to-Equity
    const balanceSheet = {};
    $("#balance-sheet table tr").each((i, el) => {
      const rawName = $(el).find("td.text").text().trim();
      const name = rawName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
      if (name) {
        const values = [];
        $(el).find("td").each((j, tdEl) => {
          if (j > 0) values.push($(tdEl).text().trim());
        });
        balanceSheet[name] = values;
      }
    });

    const getRowValue = (rowTextArr) => {
      if (!rowTextArr || rowTextArr.length === 0) return null;
      const lastVal = rowTextArr[rowTextArr.length - 1];
      return getFloatVal(lastVal);
    };

    const equityCapital = getRowValue(balanceSheet["equity capital"]) || getRowValue(balanceSheet["share capital"]) || 0;
    const reserves = getRowValue(balanceSheet["reserves"]) || 0;
    const borrowings = getRowValue(balanceSheet["borrowings"]) || 0;

    let debtToEquity = null;
    const totalEquity = equityCapital + reserves;
    if (totalEquity > 0) {
      debtToEquity = (borrowings / totalEquity).toFixed(2);
    }

    return {
      trailingPE: getVal(ratios["stock pe"]),
      forwardPE: "Data Not Available",
      roe: formatPct(ratios["roe"]),
      eps: getVal(eps),
      marketCap: ratios["market cap"] ? `${ratios["market cap"]} Cr` : "Data Not Available",
      debtToEquity: getVal(debtToEquity),
      revenueGrowth: "Data Not Available",
      profitMargins: "Data Not Available",
      dividendYield: formatPct(ratios["dividend yield"]),
      bookValue: getVal(ratios["book value"]),
    };
  } catch (parseErr) {
    logger.error(`Screener parsing failed for ${rawSymbol}: ${parseErr.message}`);
    return {
      trailingPE: "Data Not Available",
      forwardPE: "Data Not Available",
      roe: "Data Not Available",
      eps: "Data Not Available",
      marketCap: "Data Not Available",
      debtToEquity: "Data Not Available",
      revenueGrowth: "Data Not Available",
      profitMargins: "Data Not Available",
      dividendYield: "Data Not Available",
      bookValue: "Data Not Available",
    };
  }
};

/**
 * Builds the final prompt by injecting news metadata and stock metrics into the template.
 * 
 * @param {object} news - The News document.
 * @param {Array<object>} companyList - List of company metrics.
 * @returns {string} The complete prompt.
 */
export const buildPrompt = (news, companyList) => {
  let fundamentalsText = "";
  if (companyList && companyList.length > 0) {
    fundamentalsText = companyList
      .map((c) => {
        return `Company: ${c.name} (${c.symbol})
* PE Ratio (Trailing): ${c.trailingPE}
* PE Ratio (Forward): ${c.forwardPE}
* ROE (Return on Equity): ${c.roe}
* EPS: ${c.eps}
* Market Cap: ${c.marketCap}
* Debt to Equity: ${c.debtToEquity}
* Revenue Growth: ${c.revenueGrowth}
* Profit Margins: ${c.profitMargins}
* Dividend Yield: ${c.dividendYield}
* Book Value: ${c.bookValue}`;
      })
      .join("\n---\n");
  } else {
    fundamentalsText = "No company fundamentals data available.";
  }

  return PROMPT_TEMPLATE
    .replace("{{title}}", news.title || "N/A")
    .replace("{{description}}", news.description || "N/A")
    .replace("{{content}}", news.content || news.description || "N/A")
    .replace("{{companyFundamentals}}", fundamentalsText);
};

/**
 * Calls the Gemini API via direct HTTP request using the API key in process.env.GEMINI.
 * Enforces JSON output using generationConfig.
 * 
 * @param {string} prompt - The assembled prompt string.
 * @returns {Promise<string>} The raw text response from Gemini.
 */
export const callGemini = async (prompt) => {
  const apiKey = process.env.GEMINI;
  if (!apiKey) {
    throw new Error("Gemini API key not found in environment variables (process.env.GEMINI)");
  }

  // Support gemini-3-flash-preview as the default preview model, configurable via env
  const modelName = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
    },
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
    throw new Error(`Gemini API HTTP error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  if (
    data &&
    data.candidates &&
    data.candidates[0] &&
    data.candidates[0].content &&
    data.candidates[0].content.parts &&
    data.candidates[0].content.parts[0]
  ) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new Error("Invalid response structure received from Gemini API");
};

/**
 * Main orchestrator of the AI news analysis pipeline.
 * Iterates through all news articles sequentially, skips already processed articles,
 * fetches Yahoo Finance metrics, executes Gemini analysis with a single retry upon parsing failure,
 * and saves results to the database.
 */
/**
 * Analyzes a single news article: fetches stock metrics, queries Gemini,
 * normalizes the output, saves the analysis to MongoDB, and returns it.
 * 
 * @param {object} article - The News mongoose document.
 * @returns {Promise<object|null>} The saved AIAnalysis document, or null if it failed.
 */
export const analyzeArticle = async (article) => {
  // Check if analysis already exists to prevent duplicate calls
  const existing = await AIAnalysis.findOne({ uuid: article.uuid }).lean();
  if (existing) {
    return existing;
  }

  // Step 4: Retrieve company fundamentals for entities
  const companyList = [];
  if (article.entities && article.entities.length > 0) {
    for (const entity of article.entities) {
      if (entity.symbol) {
        logger.info(`Fetching fundamentals for ${entity.symbol}...`);
        const metrics = await fetchFundamentals(entity.symbol);
        companyList.push({
          symbol: entity.symbol,
          name: entity.name || entity.symbol,
          ...metrics,
        });
      }
    }
  }

  // Step 5: Build final prompt
  const prompt = buildPrompt(article, companyList);

  // Step 6 & 7: Call Gemini & validate/parse response (Single attempt)
  let analysisJSON = null;
  const modelName = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

  try {
    logger.info("Calling Gemini API...");
    const rawResponse = await callGemini(prompt);
    analysisJSON = cleanAndParseJSON(rawResponse);

    // Post-process fundamentalAnalysis fields for clean "Data Not Available" handling
    if (analysisJSON && analysisJSON.fundamentalAnalysis) {
      const keys = ["valuation", "profitability", "growth", "financialHealth", "overallInterpretation"];
      if (!companyList || companyList.length === 0) {
        // If no companies are provided, everything under fundamentalAnalysis must be "Data Not Available"
        keys.forEach(key => {
          analysisJSON.fundamentalAnalysis[key] = "Data Not Available";
        });
      } else {
        // Normalize any "not available" or similar phrases to exactly "Data Not Available"
        keys.forEach(key => {
          const val = analysisJSON.fundamentalAnalysis[key];
          if (typeof val === "string") {
            const lowerVal = val.trim().toLowerCase();
            if (
              lowerVal.includes("data not available") ||
              lowerVal.includes("not available") ||
              lowerVal.includes("no data available") ||
              lowerVal.includes("not provided") ||
              lowerVal.includes("cannot be conducted") ||
              lowerVal.includes("cannot be assessed") ||
              lowerVal.includes("cannot be evaluated") ||
              lowerVal === ""
            ) {
              analysisJSON.fundamentalAnalysis[key] = "Data Not Available";
            }
          } else if (val === undefined || val === null) {
            analysisJSON.fundamentalAnalysis[key] = "Data Not Available";
          }
        });
      }
    }
  } catch (err) {
    logger.error(`Failed to parse or fetch Gemini response for article [${article.uuid}]: ${err.message}. Skipping.`);
    throw err;
  }

  // Step 8: Save AI Analysis (Only if successfully generated & parsed)
  if (analysisJSON) {
    const newAnalysis = new AIAnalysis({
      uuid: article.uuid,
      newsId: article._id,
      analysis: analysisJSON,
      aiModel: modelName,
      generatedAt: new Date(),
    });

    const saved = await newAnalysis.save();
    logger.info(`Saved AI Analysis for article [${article.uuid}] in MongoDB.`);
    return saved;
  }

  return null;
};

/**
 * Main orchestrator of the AI news analysis pipeline.
 * Iterates through all news articles sequentially, skips already processed articles,
 * fetches Yahoo Finance metrics, executes Gemini analysis with a single retry upon parsing failure,
 * and saves results to the database.
 */
export const runAIAnalysisPipeline = async () => {
  logger.info("Starting AI News Analysis Pipeline...");
  
  try {
    const totalNews = await News.countDocuments();
    logger.info(`Found ${totalNews} news articles in database.`);

    const existingAnalyses = await AIAnalysis.find({}, { uuid: 1 }).lean();
    const existingUuids = existingAnalyses.map((a) => a.uuid);

    const maxArticles = parseInt(process.env.MAX_ARTICLES_PER_RUN || "1", 10);
    const articles = await News.find({ uuid: { $nin: existingUuids } })
      .limit(maxArticles)
      .lean();

    for (const article of articles) {
      try {
        logger.info(`Processing article [${article.uuid}] - Title: "${article.title}"`);
        await analyzeArticle(article);
      } catch (articleErr) {
        // Fail-safe at individual article level to ensure the pipeline continues
        logger.error(`Error processing article [${article.uuid}]: ${articleErr.message}`);
      }
    }

    logger.info("AI News Analysis Pipeline completed.");
  } catch (pipelineErr) {
    logger.error(`Fatal pipeline error: ${pipelineErr.message}`);
  }
};
