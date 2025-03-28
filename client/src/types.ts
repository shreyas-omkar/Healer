// Analysis-related types
export interface AnalysisResult {
  status: string;
  message?: string;
  suggestions: string[];
  fixedCode?: string;
  analysisId?: string;
}

// Socket.IO event types
export interface AnalysisStartEvent {
  analysisId: string;
  message: string;
  progress: number;
}

export interface AnalysisProgressEvent {
  analysisId: string;
  message: string;
  progress: number;
}

export interface AnalysisCompletedEvent {
  analysisId: string;
  message: string;
  progress: number;
  hasErrors: boolean;
  suggestionsCount: number;
} 