import express from "express";
import { analyzeCode } from "../controllers/analyzeController.js";
import {fixCode} from "../controllers/fixController.js";
import { testWithAi } from "../controllers/testWithAiController.js";

const router = express.Router();

// Run Code Analysis
router.post("/analyze", analyzeCode);
router.post("/fix",fixCode);
router.post("/testwithai", testWithAi)

// Push PR if Necessary
router.post("/push-pr", (req, res) => {
  console.log("🚀 Pushing PR if necessary...");
  res.status(200).json({ message: "PR pushed" });
});

export default router;
