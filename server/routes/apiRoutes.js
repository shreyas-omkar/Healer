import express from "express";
import { analyzeCode } from "../controllers/analyzeController.js";
import { fixCode } from "../controllers/fixController.js";
import { testWithAi } from "../controllers/testWithAiController.js";
import os from "os";

const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
    system: {
      memory: {
        free: os.freemem(),
        total: os.totalmem()
      },
      cpus: os.cpus().length,
      platform: os.platform(),
      version: os.version()
    }
  });
});

// Run Code Analysis - Apply cache middleware
router.post("/analyze", analyzeCode);
router.post("/fix", fixCode);
router.post("/testwithai", testWithAi);

// Push PR if Necessary
router.post("/push-pr", (req, res) => {
  console.log("🚀 Pushing PR if necessary...");
  res.status(200).json({ message: "PR pushed" });
});

export default router;
