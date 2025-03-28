import { Request } from 'express';
import { Socket } from 'socket.io';
import {
  CodeSuggestion,
  AnalysisResult,
  AnalysisStartRequest,
  AnalysisRequest,
  FixRequest,
  AnalysisStartEvent,
  AnalysisProgressEvent,
  AnalysisCompletedEvent
} from '../types';

// Re-export the main types
export {
  CodeSuggestion,
  AnalysisResult,
  AnalysisStartRequest,
  AnalysisRequest,
  FixRequest,
  AnalysisStartEvent,
  AnalysisProgressEvent,
  AnalysisCompletedEvent
};

// Legacy types - keeping for backward compatibility
export interface CodeAnalysisRequest {
  code: string;
  language: string;
}

export interface CodeFixRequest extends CodeAnalysisRequest {
  suggestions: CodeSuggestion[];
}

export interface CodeAnalysisResult {
  status: string;
  message?: string;
  suggestions: CodeSuggestion[];
  fixedCode?: string;
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
  io: Socket;
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