import express from "express";
import { probot } from "../probot.js";
import { webHook } from "../controllers/webHookController.js";
const app = express();
const router = express.Router();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies (in case the webhook sends data this way)
app.use(express.urlencoded({ extended: true }));

// Webhook Route to handle the incoming GitHub webhook
router.post('/', (req, res) => {
  console.log("Received Webhook Payload:", req.body); // Logs the parsed payload
  res.status(200).send('Webhook received');
});

// Handle GitHub Webhook events (push and PR events)
probot.webhooks.on(["push", "pull_request"], async (context) => {
  const { owner, repo } = context.repo();
  console.log(`📡 Event received: ${context.name} for ${owner}/${repo}`);
});

export default router;
