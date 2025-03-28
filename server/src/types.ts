// Types for server-side data structures

// Defines the structure of a suggestion from code analysis
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

// The result of code analysis
export interface AnalysisResult {
  status: 'success' | 'error' | 'fixed';
  suggestions: CodeSuggestion[];
  fixedCode?: string;
  errorMessage?: string;
}

// Socket event types
export interface AnalysisStartRequest {
  language: string;
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
  message: string;
  timestamp: number;
}

export interface AnalysisProgressEvent {
  progress: number;
  message: string;
  timestamp: number;
}

export interface AnalysisCompletedEvent {
  suggestionsCount: number;
  timestamp: number;
} 