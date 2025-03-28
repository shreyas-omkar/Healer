import express from "express";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';
import webhookRoutes from "./routes/webhookRoute.js";
import apiRoutes from "./routes/apiRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
const result = dotenv.config({ path: path.join(__dirname, '.env') });

if (result.error) {
    console.error('Error loading .env file:', result.error);
} else {
    console.log('Environment variables loaded successfully');
    console.log('APP_ID:', process.env.APP_ID);
    console.log('OPENAI_API_KEY exists:', !!process.env.OPENAI_API_KEY);
}

const app = express();
app.use(express.json()); 

app.use("/webhook", webhookRoutes);
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
