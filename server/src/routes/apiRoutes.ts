import express from "express";
import os from "os";
import { analyzeCode, fixCode } from "../controllers/analysisController";
import { testWithAi } from "../controllers/testWithAiController";
import { cacheMiddleware } from "../middlewares/cacheMiddleware";

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

// Real-time analysis status
router.get("/analysis/status/:id", (req, res) => {
  const { id } = req.params;
  
  // In a real app, you'd check a database or cache for status
  // For now, just return a mock response
  res.status(200).json({
    analysisId: id,
    status: "completed",
    progress: 100,
    startTime: Date.now() - 5000,
    endTime: Date.now()
  });
});

// Run Code Analysis - Apply cache middleware
router.post("/analyze", cacheMiddleware, analyzeCode);
router.post("/fix", fixCode);
router.post("/testwithai", testWithAi);

// Push PR if Necessary
router.post("/push-pr", (req, res) => {
  console.log("🚀 Pushing PR if necessary...");
  res.status(200).json({ message: "PR pushed" });
});

export default router; 