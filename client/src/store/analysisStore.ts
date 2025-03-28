import { create } from 'zustand';
import { 
  AnalysisResult, 
  AnalysisProgressEvent,
  AnalysisStartEvent
} from '../../../shared/types';

interface AnalysisState {
  code: string;
  language: string;
  result: AnalysisResult | null;
  loading: boolean;
  isFixing: boolean;
  error: string;
  progress: number;
  analysisStatus: string;
  serverUrl: string;
  
  // Actions
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  setServerUrl: (url: string) => void;
  setResult: (result: AnalysisResult | null) => void;
  setLoading: (loading: boolean) => void;
  setIsFixing: (isFixing: boolean) => void;
  setError: (error: string) => void;
  setProgress: (progress: number) => void;
  setAnalysisStatus: (status: string) => void;
  resetAnalysis: () => void;
  
  // Event handlers
  handleAnalysisStarted: (event: AnalysisStartEvent) => void;
  handleAnalysisProgress: (event: AnalysisProgressEvent) => void;
  handleAnalysisCompleted: (result: AnalysisResult) => void;
}

const initialState = {
  code: '',
  language: 'javascript',
  result: null,
  loading: false,
  isFixing: false,
  error: '',
  progress: 0,
  analysisStatus: '',
  serverUrl: 'http://localhost:3001',
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  ...initialState,

  // Actions
  setCode: (code) => set({ code }),
  setLanguage: (language) => set({ language }),
  setServerUrl: (serverUrl) => set({ serverUrl }),
  setResult: (result) => set({ result }),
  setLoading: (loading) => set({ loading }),
  setIsFixing: (isFixing) => set({ isFixing }),
  setError: (error) => set({ error }),
  setProgress: (progress) => set({ progress }),
  setAnalysisStatus: (analysisStatus) => set({ analysisStatus }),
  
  resetAnalysis: () => set({ 
    result: null, 
    loading: false, 
    isFixing: false, 
    error: '', 
    progress: 0, 
    analysisStatus: '' 
  }),

  // Event handlers
  handleAnalysisStarted: (event) => set({
    progress: event.progress || 0,
    analysisStatus: event.message || 'Analysis started',
  }),

  handleAnalysisProgress: (event) => set({
    progress: event.progress,
    analysisStatus: event.message,
  }),

  handleAnalysisCompleted: (result) => set({
    loading: false,
    progress: 100,
    result,
    analysisStatus: `Analysis completed with ${result.suggestions.length} suggestions`,
  }),
})); 