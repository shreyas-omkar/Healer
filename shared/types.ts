/**
 * Shared types between client and server
 */

// Analysis Result Structure
export interface CodeSuggestion {
  id: string;
  type: 'warning' | 'error' | 'improvement';
  message: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  severity: 'low' | 'medium' | 'high';
  codeSnippet?: string;
  solution?: string;
}

export interface AnalysisResult {
  status: 'success' | 'error' | 'fixed';
  message?: string;
  suggestions: CodeSuggestion[];
  fixedCode?: string;
  errorMessage?: string;
  analysisId?: string;
}

// Socket Event Types
export interface AnalysisStartRequest {
  language: string;
  code?: string;
}

export interface AnalysisRequest {
  code: string;
  language: string;
}

export interface FixRequest {
  code: string;
  language: string;
  suggestions: CodeSuggestion[];
}

export interface AnalysisStartEvent {
  analysisId: string;
  message: string;
  progress: number;
  timestamp: number;
}

export interface AnalysisProgressEvent {
  analysisId: string;
  message: string;
  progress: number;
  timestamp: number;
}

export interface AnalysisCompletedEvent {
  analysisId: string;
  message: string;
  progress: number;
  hasErrors: boolean;
  suggestionsCount: number;
  timestamp: number;
} 