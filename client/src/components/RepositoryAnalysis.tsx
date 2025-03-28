import { useState, useEffect } from 'react';
import axios from 'axios';

interface AnalysisProgress {
  message: string;
  status: 'info' | 'loading' | 'success' | 'error';
}

interface AnalysisResult {
  status: 'completed' | 'error';
  message: string;
  securityIssuesFixed?: number;
  bugIssuesFixed?: number;
  bestPracticesFound?: number;
  qualityIssuesFound?: number;
  error?: string;
  details?: string;
}

export function RepositoryAnalysis() {
  const [progress, setProgress] = useState<AnalysisProgress[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress([]);
    setResult(null);
    setError(null);

    try {
      const eventSource = new EventSource('http://localhost:3000/api/analyze');

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.status === 'completed' || data.status === 'error') {
          setResult(data);
          setIsAnalyzing(false);
          eventSource.close();
        } else {
          setProgress(prev => [...prev, data]);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setError('Connection error occurred');
        setIsAnalyzing(false);
        eventSource.close();
      };
    } catch (error) {
      console.error('Error starting analysis:', error);
      setError('Failed to start analysis');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="repository-analysis">
      <h2>Repository Analysis</h2>
      
      {!isAnalyzing && !result && (
        <button 
          onClick={startAnalysis}
          className="start-analysis-btn"
        >
          Start Analysis
        </button>
      )}

      {isAnalyzing && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Analysis in progress...</p>
        </div>
      )}

      {progress.length > 0 && (
        <div className="progress-log">
          {progress.map((item, index) => (
            <div key={index} className={`progress-item ${item.status}`}>
              {item.message}
            </div>
          ))}
        </div>
      )}

      {result && (
        <div className={`result ${result.status}`}>
          <h3>{result.message}</h3>
          {result.status === 'completed' && (
            <div className="stats">
              <p>Security Issues Fixed: {result.securityIssuesFixed}</p>
              <p>Bug Issues Fixed: {result.bugIssuesFixed}</p>
              <p>Best Practices Found: {result.bestPracticesFound}</p>
              <p>Quality Issues Found: {result.qualityIssuesFound}</p>
            </div>
          )}
          {result.status === 'error' && (
            <div className="error-details">
              <p>Error: {result.error}</p>
              <p>Details: {result.details}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}
    </div>
  );
} 