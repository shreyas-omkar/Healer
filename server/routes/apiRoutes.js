import express from "express";
import { analyze } from "../controllers/analyzeController.js";
import { fixCode } from "../controllers/fixController.js";
import { testWithAi } from "../controllers/testWithAiController.js";
import { pushPR } from "../controllers/pushPRController.js";
import { checkAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes - require authentication
router.post("/analyze", checkAuth, (req, res, next) => {
    // Pass through to analyze controller without modifying it
    next();
}, analyze);

router.post("/fix", checkAuth, fixCode);
router.post("/testwithai", checkAuth, testWithAi);
router.post("/push_pr", checkAuth, pushPR);

export default router;
