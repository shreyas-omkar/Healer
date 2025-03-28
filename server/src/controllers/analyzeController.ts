import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { analyzeJavaScript } from "../middlewares/jsAnalyser";
import { analyzePython } from "../middlewares/pyAnalyser";
import axios from "axios";
import logger from "../utils/logger";
import { CodeAnalysisRequest, CodeAnalysisResult } from "../types";

export const analyzeCode = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, language } = req.body as CodeAnalysisRequest;
        const analysisId = uuidv4();
        
        // Enhanced input validation
        if (!code || typeof code !== 'string') {
            res.status(400).json({ error: "Missing or invalid code field" });
            return;
        }

        if (!language || typeof language !== 'string') {
            res.status(400).json({ error: "Missing or invalid language field" });
            return;
        }

        // Validate code length to prevent DoS attacks
        if (code.length > 50000) {
            res.status(400).json({ error: "Code exceeds maximum length of 50000 characters" });
            return;
        }

        // Check if we have an active socket connection for real-time updates
        const socket = req.app.locals.analysisSocket;
        if (socket) {
            socket.emit("analysisStarted", { 
                analysisId,
                message: "Analysis started",
                progress: 0 
            });
        }

        // Analysis progress simulation for WebSocket updates
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 20;
            if (socket && progress < 100) {
                socket.emit("analysisProgress", { 
                    analysisId,
                    message: `Analysis in progress... ${progress}%`,
                    progress 
                });
            }
            if (progress >= 100) {
                clearInterval(progressInterval);
            }
        }, 500);

        // Actual language-specific analysis
        let analysisResult;
        switch (language.toLowerCase()) {
            case "javascript":
            case "node":
                analysisResult = analyzeJavaScript(code);
                break;
            case "python":
                analysisResult = await analyzePython(code);
                break;
            default:
                clearInterval(progressInterval);
                res.status(400).json({ error: "Unsupported language" });
                return;
        }

        // Filter out suggestions that are clean or contain "all good" or equivalent messages
        const filteredSuggestions = analysisResult.suggestions.filter((s: string) => 
            !s.toLowerCase().includes("all good") && !s.startsWith("✅")
        );

        const hasErrors = filteredSuggestions.some((s: string) => s.startsWith("❌"));

        // Send final progress update
        if (socket) {
            socket.emit("analysisCompleted", { 
                analysisId,
                message: "Analysis completed",
                progress: 100,
                hasErrors,
                suggestionsCount: filteredSuggestions.length
            });
        }

        clearInterval(progressInterval);

        if (hasErrors) {
            logger.info(`🚨 Errors detected for analysis ${analysisId}! Calling /fix endpoint...`);

            try {
                const fixResponse = await axios.post(`http://localhost:${process.env.PORT || 3001}/api/fix`, { 
                    code, 
                    language, 
                    suggestions: filteredSuggestions 
                });
                
                res.status(200).json({ 
                    analysisId,
                    status: "fixed", 
                    fixedCode: fixResponse.data.fixedCode 
                });
                return;
            } catch (fixError) {
                logger.error(`❌ Error calling /fix endpoint: ${(fixError as Error).message}`);
                res.status(500).json({ 
                    error: "Failed to fix code", 
                    details: (fixError as Error).message || fixError 
                });
                return;
            }
        }

        // If there are no errors, return success with the filtered suggestions
        const result: CodeAnalysisResult = { 
            status: "done", 
            message: "✅ Code looks clean!", 
            suggestions: filteredSuggestions  // Only return meaningful suggestions (if any)
        };
        
        res.status(200).json(result);
    } catch (error) {
        logger.error(`❌ Error analyzing code: ${(error as Error).message}`);
        res.status(500).json({ 
            error: "Internal server error", 
            details: (error as Error).message || error 
        });
    }
}; 