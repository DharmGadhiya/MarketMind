import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

// Helper to parse CSV simply and robustly
function parseCSV(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[Announcements API] File not found: ${filePath}`);
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

router.get("/corporate-announcements", (req, res) => {
  const filePath = path.resolve("Logic Files", "nse_corporate_announcements.csv");
  try {
    const data = parseCSV(filePath);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error(`Error reading Announcements CSV file:`, err);
    res.status(500).json({ success: false, message: "Failed to load corporate announcements", error: err.message });
  }
});

export default router;
