import express from "express";
import { analyze } from "../controllers/analyzeController.js";
import { fixCode } from "../controllers/fixController.js";
import { testWithAi } from "../controllers/testWithAiController.js";
import { pushPR } from "../controllers/pushPRController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Run Code Analysis
router.post("/analyze", analyze);
router.post("/fix",fixCode);
router.post("/testwithai", testWithAi)
router.post("/push_pr",pushPR);

export default router;
