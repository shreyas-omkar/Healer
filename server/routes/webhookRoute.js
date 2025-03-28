import express from "express";
import { probot } from "../probot.js";
import { webHook } from "../controllers/webHookController.js";

const router = express.Router();

// Middleware to handle GitHub webhook events
router.post("/", (req, res) => {
  if (!probot) {
    console.warn("⚠️ Probot is not initialized, GitHub webhook events will be ignored");
    return res.status(501).json({ 
      error: "GitHub App features are not configured",
      message: "Check server configuration for APP_ID, WEBHOOK_SECRET, and privateKey.pem" 
    });
  }
  
  // Process the webhook event
  webHook(req, res);
  
  // Forward the request to Probot's middleware if needed
  // probot.webhooks.middleware(req, res);
});

// Listen to PR & push events only if probot is initialized
if (probot && probot.webhooks) {
  probot.webhooks.on(["push", "pull_request"], async (context) => {
    const { owner, repo } = context.repo();
    console.log(`📡 Event received: ${context.name} for ${owner}/${repo}`);
  });
}

export default router;
