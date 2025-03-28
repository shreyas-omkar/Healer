import express from "express";
import { analyzeCode } from "../controllers/analyzeController.js";
import {fixCode} from "../controllers/fixController.js";
import { testWithAi } from "../controllers/testWithAiController.js";
import { pushPR } from "../controllers/pushPRController.js";

const router = express.Router();

// Run Code Analysis
router.post("/analyze", analyzeCode);
router.post("/fix",fixCode);
router.post("/testwithai", testWithAi)
router.post("/push_pr",pushPR);

export default router;
