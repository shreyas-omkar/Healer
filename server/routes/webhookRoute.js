import express from "express";
import { webHook } from "../controllers/webHookController.js";

const router = express.Router();

// Handle GitHub webhooks
router.post("/", webHook);

export default router;
