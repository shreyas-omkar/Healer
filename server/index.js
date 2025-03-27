import { createNodeMiddleware, Probot } from "probot";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Read private key
const privateKey = fs.readFileSync('./privateKey.pem', "utf8").trim();

// Initialize Probot
const probot = new Probot({
  appId: Number(process.env.APP_ID), // Ensure it's a number
  privateKey,
  secret: process.env.WEBHOOK_SECRET,
});

// Express setup
const app = express();
app.use(express.json()); // Enable JSON parsing

// Route for Webhook Events
app.post("/", (req, res) => {
  console.log("📡 Webhook received!", req.body);
  res.status(200).send("✅ Webhook received!");
});

// Listen for GitHub events
probot.webhooks.on(["push", "pull_request"], async (context) => {
  const { owner, repo } = context.repo();
  console.log(`📡 Event received: ${context.name} for ${owner}/${repo}`);
});

// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
