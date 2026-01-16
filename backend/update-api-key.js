#!/usr/bin/env node

/**
 * Script to update GEMINI_API_KEY in .env file
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API key'i environment variable'dan al veya kullanıcıdan iste
const NEW_API_KEY = process.env.GEMINI_API_KEY || process.argv[2] || "your-gemini-api-key-here";
const ENV_FILE = path.join(__dirname, ".env");

try {
  if (!fs.existsSync(ENV_FILE)) {
    console.log("Creating .env file...");
    const envContent = `PORT=3001
GEMINI_API_KEY=${NEW_API_KEY}
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
`;
    fs.writeFileSync(ENV_FILE, envContent);
    console.log("✅ .env file created with new API key");
  } else {
    let envContent = fs.readFileSync(ENV_FILE, "utf8");

    // Update or add GEMINI_API_KEY
    if (envContent.includes("GEMINI_API_KEY=")) {
      envContent = envContent.replace(
        /GEMINI_API_KEY=.*/g,
        `GEMINI_API_KEY=${NEW_API_KEY}`
      );
      console.log("✅ Updated GEMINI_API_KEY in .env file");
    } else {
      envContent += `\nGEMINI_API_KEY=${NEW_API_KEY}\n`;
      console.log("✅ Added GEMINI_API_KEY to .env file");
    }

    fs.writeFileSync(ENV_FILE, envContent);
    console.log("✅ API key updated successfully!");
  }
} catch (error) {
  console.error("❌ Error updating .env file:", error.message);
  process.exit(1);
}
