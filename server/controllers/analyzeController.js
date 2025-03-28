import { analyzeJavaScript } from "../middlewares/jsAnalyser.js";
import { analyzePython } from "../middlewares/pyAnalyser.js";
import axios from "axios"; // Import axios for making requests

export const analyzeCode = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({ error: "Missing code or language field" });
        }

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
                return res.status(400).json({ error: "Unsupported language" });
        }

        // Filter out suggestions that are clean or contain "all good" or equivalent messages
        const filteredSuggestions = analysisResult.suggestions.filter(s => 
            !s.toLowerCase().includes("all good") && !s.startsWith("✅")
        );

        const hasErrors = filteredSuggestions.some(s => s.startsWith("❌"));

        if (hasErrors) {
            console.log("🚨 Errors detected! Calling /fix endpoint...");

            try {
                const fixResponse = await axios.post("http://localhost:3000/api/fix", { 
                    code, 
                    language, 
                    suggestions: filteredSuggestions 
                });
                return res.status(200).json({ status: "fixed", fixedCode: fixResponse.data.fixedCode });

            } catch (fixError) {
                console.error("❌ Error calling /fix endpoint:", fixError);
                return res.status(500).json({ error: "Failed to fix code", details: fixError.message || fixError });
            }
        }

        // If there are no errors, return success with the filtered suggestions
        res.status(200).json({ 
            status: "done", 
            message: "✅ Code looks clean!", 
            suggestions: filteredSuggestions  // Only return meaningful suggestions (if any)
        });
    } catch (error) {
        console.error("❌ Error analyzing code:", error);
        res.status(500).json({ error: "Internal server error", details: error.message || error });
    }
};
