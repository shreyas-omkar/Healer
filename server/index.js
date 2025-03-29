import express from "express";
import cors from "cors";
import { webHook } from './controllers/webhookController.js';
import { analyze } from './controllers/analyzeController.js';
import { auth } from './middleware/authMiddleware.js';
import { authRoutes } from './routes/authRoutes.js';
import { apiRoutes } from './routes/apiRoutes.js';
import { webhookRoute } from './routes/webhookRoute.js';

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
app.use('/api', auth, apiRoutes);
app.use('/webhook', webhookRoute);

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
