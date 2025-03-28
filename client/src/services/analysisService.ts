import axios from 'axios';
import { AnalysisResult, AnalysisRequest, FixRequest } from '../../../shared/types';

const createClient = (baseURL: string) => {
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
  });
};

export const AnalysisService = {
  analyzeCode: async (serverUrl: string, code: string, language: string): Promise<AnalysisResult> => {
    const client = createClient(serverUrl);
    const payload: AnalysisRequest = { code, language };
    
    try {
      const response = await client.post<AnalysisResult>('/api/analyze', payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.errorMessage || error.message);
      }
      throw new Error('Failed to analyze code');
    }
  },
  
  fixCode: async (serverUrl: string, code: string, language: string, suggestions: any[]): Promise<AnalysisResult> => {
    const client = createClient(serverUrl);
    const payload: FixRequest = { code, language, suggestions };
    
    try {
      const response = await client.post<AnalysisResult>('/api/fix', payload);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.errorMessage || error.message);
      }
      throw new Error('Failed to fix code');
    }
  },
  
  healthCheck: async (serverUrl: string): Promise<boolean> => {
    const client = createClient(serverUrl);
    
    try {
      const response = await client.get('/api/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}; 