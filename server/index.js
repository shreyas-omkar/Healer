import express from "express";
import cors from "cors";
import { webHook } from './controllers/webHookController.js';
import { analyze } from './controllers/analyzeController.js';
import { checkAuth } from './middleware/authMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import webhookRoutes from './routes/webhookRoute.js';

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/api', checkAuth, apiRoutes);
app.use('/webhook', webHook);

//Check Webhook

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
