import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// Helper to parse CSV simply and robustly
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[IPO API] File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n").map(line => line.trim()).filter(Boolean);
  if (lines.length <= 1) return [];
  
  const headers = parseCSVLine(lines[0]);
  const result = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const obj = {};
      headers.forEach((header, idx) => {
        obj[header] = values[idx];
      });
      result.push(obj);
    }
  }
  return result;
}

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

router.get("/ipo/:type", (req, res) => {
  const { type } = req.params;
  let filename = "";

  if (type === "current") {
    filename = "nse_ipo_current.csv";
  } else if (type === "upcoming") {
    filename = "nse_ipo_upcoming.csv";
  } else if (type === "past") {
    filename = "nse_ipo_past.csv";
  } else {
    return res.status(400).json({ success: false, message: "Invalid IPO type. Must be current, upcoming, or past." });
  }

  const filePath = path.resolve("Logic Files", filename);
  try {
    const data = parseCSV(filePath);
    res.status(200).json({ success: true, type, data });
  } catch (err) {
    console.error(`Error reading IPO CSV file (${filename}):`, err);
    res.status(500).json({ success: false, message: "Failed to load IPO data", error: err.message });
  }
});

export default router;
