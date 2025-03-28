import { Request } from 'express';
import { Server, Socket } from 'socket.io';

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
  analysisId?: string;
  progress?: number;
}

export interface AnalysisProgressEvent {
  progress: number;
  message: string;
  timestamp: number;
  analysisId?: string;
}

export interface AnalysisCompletedEvent {
  suggestionsCount: number;
  timestamp: number;
  analysisId?: string;
  message?: string;
  progress?: number;
  hasErrors?: boolean;
}

// Express extensions
export interface ExtendedRequest extends Request {
  id?: string;
}

// Socket.IO related types
export interface AnalysisSocketData {
  language: string;
}

export interface AppLocals {
  io: Server;
  analysisSocket?: Socket;
}

// Error types
export interface AppError extends Error {
  statusCode: number;
}

// WebHook types
export interface WebhookEvent {
  repository?: {
    name: string;
    owner: {
      login: string;
    };
  };
  action?: string;
  pull_request?: {
    number: number;
    html_url: string;
    head: {
      ref: string;
      sha: string;
    };
  };
} 