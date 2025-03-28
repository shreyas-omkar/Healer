import { analyzeJavaScript } from "../middlewares/jsAnalyser.js";
import { analyzePython } from "../middlewares/pyAnalyser.js";
import logger from "../utils/logger.js";

/**
 * Controller to test code with AI analysis
 * Used as part of the iterative fix process
 */
export const testWithAi = async (req, res) => {
  try {
    const { code, language } = req.body;

    // Input validation
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: "Missing or invalid code field" });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({ error: "Missing or invalid language field" });
    }

    // Run the appropriate analyzer
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

    // Filter out non-issue suggestions
    const suggestions = analysisResult.suggestions.filter(s => 
      !s.toLowerCase().includes("all good") && !s.startsWith("✅")
    );

    logger.info(`Test with AI completed for ${language} code, found ${suggestions.length} issues`);

    // Return the analysis results
    res.status(200).json({
      language,
      code,
      suggestions
    });
  } catch (error) {
    logger.error(`Error in testWithAi: ${error.message}`);
    res.status(500).json({ 
      error: "Failed to test code with AI", 
      details: error.message || error 
    });
  }
};