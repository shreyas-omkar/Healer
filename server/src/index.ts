import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
import webhookRoutes from "./routes/webhookRoute";
import apiRoutes from "./routes/apiRoutes";
import { apiLimiter } from "./middlewares/rateLimiter";
import { errorHandler, notFoundHandler } from "./middlewares/errorMiddleware";
import { requestLogger } from "./middlewares/loggingMiddleware";
import logger from "./utils/logger";
import { AnalysisStartRequest } from "./types";
import winston from "winston";

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

dotenv.config();

// Initialize Express app
const app = express();

// Create HTTP server instance
const server = http.createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  logger.info(`WebSocket client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`WebSocket client disconnected: ${socket.id}`);
  });

  // Analysis progress updates
  socket.on("startAnalysis", (data: AnalysisStartRequest) => {
    logger.info(`Analysis started for client: ${socket.id}`);
    // Store the socket ID for later updates
    app.locals.analysisSocket = socket;
  });
});

// Pass Socket.IO to Express for use in routes
app.locals.io = io;

// Security middleware
app.use(helmet());

// Enable CORS for client requests
app.use(cors());
app.use(express.json());

// Add request logging
app.use(requestLogger);

// Apply routes
app.use("/webhook", webhookRoutes);
app.use("/api", apiLimiter, apiRoutes);

// Handle 404 errors
app.use(notFoundHandler);

// Global error handler - must be last middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => logger.info(`🚀 Server running on port ${PORT}`));

export { app, server, io }; 