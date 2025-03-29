import express from "express";
import { probotMiddleware } from "../probot.js";
import { webHook } from "../controllers/webHookController.js";

const app = express();
const router = express.Router();

app.use(express.json());

app.use(express.urlencoded({ extended: true }));


router.post("/", probotMiddleware, webHook);

// Listen to PR & push events
probotMiddleware.webhooks.on(["push", "pull_request"], async (context) => {
  const { owner, repo } = context.repo();
  console.log(`📡 Event received: ${context.name} for ${owner}/${repo}`);
});

export default router;
