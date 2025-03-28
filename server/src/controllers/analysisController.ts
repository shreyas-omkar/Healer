import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';
import { 
  AnalysisResult, 
  CodeSuggestion, 
  AnalysisRequest,
  FixRequest,
  AnalysisStartEvent,
  AnalysisProgressEvent,
  AnalysisCompletedEvent 
} from '../types';

// Mock delay function for simulating async operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Analyze code via AI and return suggestions
 */
export const analyzeCode = async (req: Request, res: Response) => {
  try {
    const { code, language } = req.body as AnalysisRequest;
    
    if (!code || !language) {
      return res.status(400).json({ 
        status: 'error', 
        errorMessage: 'Code and language are required' 
      });
    }
    
    // Get socket for real-time updates
    const io = req.app.locals.io;
    const socket = req.app.locals.analysisSocket;
    
    // Generate a unique ID for this analysis
    const analysisId = uuidv4();
    
    // Send analysis started event
    if (socket) {
      const startEvent: AnalysisStartEvent = {
        message: `Starting ${language} code analysis`,
        timestamp: Date.now()
      };
      socket.emit('analysisStarted', startEvent);
    }
    
    // Simulate analysis process with progress updates
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      if (progress <= 90 && socket) {
        const progressEvent: AnalysisProgressEvent = {
          progress,
          message: `Analyzing code (${progress}%)`,
          timestamp: Date.now()
        };
        socket.emit('analysisProgress', progressEvent);
      }
    }, 500);
    
    // Simulate AI analysis
    await delay(5000);
    
    // Clear the interval
    clearInterval(progressInterval);
    
    // Generate mock suggestions based on language
    const suggestions: CodeSuggestion[] = generateMockSuggestions(code, language);
    
    // Send analysis completed event
    if (socket) {
      const completedEvent: AnalysisCompletedEvent = {
        suggestionsCount: suggestions.length,
        timestamp: Date.now()
      };
      socket.emit('analysisCompleted', completedEvent);
    }
    
    // Return the analysis results
    const result: AnalysisResult = {
      status: 'success',
      suggestions
    };
    
    return res.status(200).json(result);
    
  } catch (error) {
    logger.error('Error analyzing code:', error);
    return res.status(500).json({ 
      status: 'error',
      errorMessage: 'Failed to analyze code',
      suggestions: []
    });
  }
};

/**
 * Fix code based on the provided suggestions
 */
export const fixCode = async (req: Request, res: Response) => {
  try {
    const { code, language, suggestions } = req.body as FixRequest;
    
    if (!code || !language || !suggestions) {
      return res.status(400).json({ 
        status: 'error', 
        errorMessage: 'Code, language, and suggestions are required',
        suggestions: []
      });
    }
    
    // Simulate fixing process
    await delay(2000);
    
    // Simple mock implementation - in a real app, this would use AI to apply fixes
    let fixedCode = code;
    
    // Apply very simple fixes based on suggestions (just for demo)
    suggestions.forEach(suggestion => {
      if (suggestion.solution) {
        // In a real implementation, this would be much more sophisticated
        fixedCode = fixedCode.replace(suggestion.codeSnippet || '', suggestion.solution);
      }
    });
    
    return res.status(200).json({
      status: 'fixed',
      fixedCode,
      suggestions: [] // Cleared after fixing
    });
    
  } catch (error) {
    logger.error('Error fixing code:', error);
    return res.status(500).json({ 
      status: 'error',
      errorMessage: 'Failed to fix code',
      suggestions: [] 
    });
  }
};

/**
 * Generate mock code suggestions for demo purposes
 */
function generateMockSuggestions(code: string, language: string): CodeSuggestion[] {
  const suggestions: CodeSuggestion[] = [];
  
  // Simple pattern matching for demo purposes
  if (language === 'javascript' || language === 'typescript') {
    // Check for console.log statements
    const consoleRegex = /console\.log\(/g;
    let match;
    while ((match = consoleRegex.exec(code)) !== null) {
      suggestions.push({
        id: uuidv4(),
        type: 'warning',
        message: 'Avoid using console.log in production code',
        line: getLineNumber(code, match.index),
        column: getColumnNumber(code, match.index),
        severity: 'medium',
        codeSnippet: code.slice(Math.max(0, match.index - 10), match.index + 20),
        solution: '// console.log(' // Simple suggested fix
      });
    }
    
    // Check for var usage
    const varRegex = /var\s+[a-zA-Z_$][a-zA-Z0-9_$]*/g;
    while ((match = varRegex.exec(code)) !== null) {
      const varDeclaration = match[0];
      suggestions.push({
        id: uuidv4(),
        type: 'improvement',
        message: 'Use const or let instead of var',
        line: getLineNumber(code, match.index),
        column: getColumnNumber(code, match.index),
        severity: 'low',
        codeSnippet: varDeclaration,
        solution: varDeclaration.replace('var', 'const')
      });
    }
  } else if (language === 'python') {
    // Check for print statements
    const printRegex = /print\(/g;
    let match;
    while ((match = printRegex.exec(code)) !== null) {
      suggestions.push({
        id: uuidv4(),
        type: 'warning',
        message: 'Consider using a logger instead of print',
        line: getLineNumber(code, match.index),
        column: getColumnNumber(code, match.index),
        severity: 'low',
        codeSnippet: code.slice(Math.max(0, match.index - 10), match.index + 15),
        solution: 'logger.debug('
      });
    }
  }
  
  return suggestions;
}

/**
 * Helper function to get the line number for a character position
 */
function getLineNumber(code: string, position: number): number {
  const lines = code.slice(0, position).split('\n');
  return lines.length;
}

/**
 * Helper function to get the column number for a character position
 */
function getColumnNumber(code: string, position: number): number {
  const lines = code.slice(0, position).split('\n');
  const lastLine = lines[lines.length - 1];
  return lastLine.length + 1;
} 