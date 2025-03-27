import { createNodeMiddleware, Probot } from "probot";
import express from "express";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();


const privateKey = fs.readFileSync('./privateKey.pem', "utf8").trim();


const probot = new Probot({
  appId: Number(process.env.APP_ID), // Ensure it's a number
  privateKey,
  secret: process.env.WEBHOOK_SECRET,
});

const appFn = (app) => {
  app.on(["push", "pull_request"], async (context) => {
    try {
      const { owner, repo } = context.repo();
      console.log(`📡 Event received: ${context.name} for ${owner}/${repo}`);
    } catch (error) {
      console.error("❌ Error processing event:", error);
    }
  });
};

const app = express();
app.use(createNodeMiddleware(appFn, { probot })); 

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
