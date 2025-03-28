import { io, Socket } from 'socket.io-client';
import { 
  AnalysisStartEvent, 
  AnalysisProgressEvent, 
  AnalysisCompletedEvent,
  AnalysisStartRequest
} from '../../../shared/types';

export interface SocketHandlers {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onAnalysisStarted?: (data: AnalysisStartEvent) => void;
  onAnalysisProgress?: (data: AnalysisProgressEvent) => void;
  onAnalysisCompleted?: (data: AnalysisCompletedEvent) => void;
  onError?: (error: Error) => void;
}

export class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000;
  private handlers: SocketHandlers;
  
  constructor(serverUrl: string, handlers: SocketHandlers = {}) {
    this.serverUrl = serverUrl;
    this.handlers = handlers;
  }
  
  connect(): void {
    if (this.socket?.connected) {
      return;
    }
    
    try {
      this.socket = io(this.serverUrl, {
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
        timeout: 10000,
      });
      
      this.setupEventListeners();
    } catch (error) {
      console.error('Socket connection error:', error);
      if (this.handlers.onError) {
        this.handlers.onError(new Error('Failed to connect to server'));
      }
    }
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  isConnected(): boolean {
    return !!this.socket?.connected;
  }
  
  startAnalysis(data: AnalysisStartRequest): void {
    if (!this.socket?.connected) {
      this.connect();
    }
    
    this.socket?.emit('startAnalysis', data);
  }
  
  private setupEventListeners(): void {
    if (!this.socket) return;
    
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.reconnectAttempts = 0;
      if (this.handlers.onConnect) this.handlers.onConnect();
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      if (this.handlers.onDisconnect) this.handlers.onDisconnect();
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts > this.maxReconnectAttempts && this.handlers.onError) {
        this.handlers.onError(new Error('Failed to connect after several attempts'));
      }
    });
    
    this.socket.on('analysisStarted', (data: AnalysisStartEvent) => {
      if (this.handlers.onAnalysisStarted) this.handlers.onAnalysisStarted(data);
    });
    
    this.socket.on('analysisProgress', (data: AnalysisProgressEvent) => {
      if (this.handlers.onAnalysisProgress) this.handlers.onAnalysisProgress(data);
    });
    
    this.socket.on('analysisCompleted', (data: AnalysisCompletedEvent) => {
      if (this.handlers.onAnalysisCompleted) this.handlers.onAnalysisCompleted(data);
    });
  }
  
  updateServerUrl(url: string): void {
    if (this.serverUrl !== url) {
      const wasConnected = this.isConnected();
      if (wasConnected) {
        this.disconnect();
      }
      
      this.serverUrl = url;
      
      if (wasConnected) {
        this.connect();
      }
    }
  }
} 