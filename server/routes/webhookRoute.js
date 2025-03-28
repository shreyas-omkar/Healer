import express from "express";
import { probot } from "../probot.js";
import { webHook } from "../controllers/webHookController.js";

const router = express.Router();

// Handle GitHub Webhooks
const app = express();

app.use(express.json());

// Middleware to parse URL-encoded bodies (in case the webhook sends data this way)
app.use(express.urlencoded({ extended: true }));

// Your webhook route
router.post('/webhook', (req, res) => {
  console.log("Received Webhook Payload:", req.body); // Logs the parsed payload
  res.status(200).send('Webhook received');
});




// Listen to PR & push events
probot.webhooks.on(["push", "pull_request"], async (context) => {
  const { owner, repo } = context.repo();
  console.log(`📡 Event received: ${context.name} for ${owner}/${repo}`);
});

export default router;
