import { Probot } from "probot";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

let probot = null;

// Only initialize Probot if all required environment variables are present
try {
  const privateKeyPath = path.join(__dirname, "./privateKey.pem");
  // Check if the key file exists
  if (fs.existsSync(privateKeyPath)) {
    const privateKey = fs.readFileSync(privateKeyPath, "utf8").trim();
    
    probot = new Probot({
      appId: Number(process.env.APP_ID || "0"),
      privateKey,
      secret: process.env.WEBHOOK_SECRET || "webhook_secret",
    });
    
    console.log("🤖 Probot initialized successfully");
  } else {
    console.warn("⚠️ privateKey.pem file not found, GitHub App features will be disabled");
  }
} catch (error) {
  console.error("❌ Error initializing Probot:", error.message);
}

export { probot };
