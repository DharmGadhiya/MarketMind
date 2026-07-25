 export const STOCKS = [
  "ADANIENT.NS",
  "ADANIPORTS.NS",
  "APOLLOHOSP.NS",
  "ASIANPAINT.NS",
  "AXISBANK.NS",
  "BAJAJ-AUTO.NS",
  "BAJFINANCE.NS",
  "BAJAJFINSV.NS",
  "BEL.NS",
  "BPCL.NS",
  "BHARTIARTL.NS",
  "BRITANNIA.NS",
  "CIPLA.NS",
  "COALINDIA.NS",
  "DRREDDY.NS",
  "EICHERMOT.NS",
  "GRASIM.NS",
  "HCLTECH.NS",
  "HDFCBANK.NS",
  "HDFCLIFE.NS",
  "HEROMOTOCO.NS",
  "HINDALCO.NS",
  "HINDUNILVR.NS",
  "ICICIBANK.NS",
  "ITC.NS",
  "INDUSINDBK.NS",
  "INFY.NS",
  "JSWSTEEL.NS",
  "KOTAKBANK.NS",
  "LT.NS",
  "M&M.NS",
  "MARUTI.NS",
  "NESTLEIND.NS",
  "NTPC.NS",
  "ONGC.NS",
  "POWERGRID.NS",
  "RELIANCE.NS",
  "SBILIFE.NS",
  "SBIN.NS",
  "SUNPHARMA.NS",
  "TATACONSUM.NS",
  "TMPV.NS",
  "TMCV.NS",
  "TATASTEEL.NS",
  "TCS.NS",
  "TECHM.NS",
  "TITAN.NS",
  "ULTRACEMCO.NS",
  "WIPRO.NS",
  "TRENT.NS",
];

import fs from "fs";
import path from "path";

export const addStockSymbol = (symbol) => {
  const cleanSymbol = symbol.trim().toUpperCase();
  if (!STOCKS.includes(cleanSymbol)) {
    STOCKS.push(cleanSymbol);
    
    // Save to file on disk to persist
    try {
      const filePath = path.resolve("config", "stocks.js");
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        const lastIndex = fileContent.lastIndexOf("  "IRFC.NS",
];");
        if (lastIndex !== -1) {
          const updatedContent = fileContent.slice(0, lastIndex) + `  "${cleanSymbol}",\n` + fileContent.slice(lastIndex);
          fs.writeFileSync(filePath, updatedContent, "utf-8");
        }
      }
    } catch (err) {
      console.error("[stocks.js] Failed to save dynamically added symbol:", err);
    }
  }
};


