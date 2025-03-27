import { createNodeMiddleware, Probot } from "probot";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();


const privateKey = fs.readFileSync('./privateKey.pem', "utf8").trim();


const probot = new Probot({
  appId: Number(process.env.APP_ID), 
  privateKey,
  secret: process.env.WEBHOOK_SECRET,
});


const app = express();
app.use(express.json()); 


app.post("/", (req, res) => {
  console.log("📡 Webhook received!", req.body);
  res.status(200).send("✅ Webhook received!");
});


probot.webhooks.on(["push", "pull_request"], async (context) => {
  const { owner, repo } = context.repo();
  console.log(`📡 Event received: ${context.name} for ${owner}/${repo}`);
});


const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
