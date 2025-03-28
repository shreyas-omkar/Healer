import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { 
  AnalysisResult, 
  AnalysisStartEvent, 
  AnalysisProgressEvent,
  AnalysisCompletedEvent 
} from './types'

// Loading spinner component
const LoadingSpinner = () => (
  <div className="spinner">
    <div className="spinner-inner"></div>
  </div>
)

// Progress bar component
const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="progress-container">
    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    <div className="progress-text">{progress}%</div>
  </div>
)

function App() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isFixing, setIsFixing] = useState(false)
  const [serverUrl, setServerUrl] = useState('http://localhost:3001')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [progress, setProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState('')

  // Connect to WebSocket server
  useEffect(() => {
    if (!serverUrl) return

    const newSocket = io(serverUrl)
    setSocket(newSocket)

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server')
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
    })

    newSocket.on('analysisStarted', (data: AnalysisStartEvent) => {
      setProgress(0)
      setAnalysisStatus(`Analysis started: ${data.message}`)
    })

    newSocket.on('analysisProgress', (data: AnalysisProgressEvent) => {
      setProgress(data.progress)
      setAnalysisStatus(data.message)
    })

    newSocket.on('analysisCompleted', (data: AnalysisCompletedEvent) => {
      setProgress(100)
      setAnalysisStatus(`Analysis completed with ${data.suggestionsCount} suggestions`)
    })

    // Cleanup on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [serverUrl])

  const analyzeCode = async () => {
    if (!code.trim()) {
      setError('Please enter some code to analyze')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)
    setProgress(0)
    
    // Notify server about analysis start via WebSocket
    if (socket && socket.connected) {
      socket.emit('startAnalysis', { language })
    }
    
    try {
      const response = await fetch(`${serverUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze code')
      }
      
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fixCode = async () => {
    if (!result?.suggestions || result.suggestions.length === 0) {
      setError('No issues to fix')
      return
    }

    setIsFixing(true)
    setError('')
    
    try {
      const response = await fetch(`${serverUrl}/api/fix`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language,
          suggestions: result.suggestions,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fix code')
      }
      
      // Update the result with fixed code
      setResult({
        status: 'fixed',
        fixedCode: data.fixedCode,
        suggestions: []
      })
      
      // Update the code editor with the fixed code
      setCode(data.fixedCode)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fixing code')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Code Analyzer</h1>
        <p className="subtitle">AI-powered code analysis and fixing</p>
      </header>
      
      <div className="settings">
        <div className="form-group">
          <label htmlFor="server-url">Server URL:</label>
          <input
            id="server-url"
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="http://localhost:3001"
          />
          <div className="connection-status">
            {socket?.connected ? 
              <span className="connected">● Connected</span> : 
              <span className="disconnected">● Disconnected</span>
            }
          </div>
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="language">Language:</label>
        <select 
          id="language" 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          disabled={loading || isFixing}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>
      
      <div className="form-group">
        <label htmlFor="code">Enter your code:</label>
        <textarea
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={10}
          placeholder={`Enter your ${language} code here...`}
          disabled={loading || isFixing}
        />
      </div>
      
      <div className="button-group">
        <button 
          onClick={analyzeCode} 
          disabled={loading || isFixing || !code.trim()}
          className="primary"
        >
          {loading ? 'Analyzing...' : 'Analyze Code'}
        </button>
        
        {result && result.suggestions && result.suggestions.length > 0 && (
          <button 
            onClick={fixCode} 
            disabled={loading || isFixing}
            className="secondary"
          >
            {isFixing ? 'Fixing...' : 'Fix Code'}
          </button>
        )}
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {loading && progress > 0 && (
        <div className="analysis-progress">
          <ProgressBar progress={progress} />
          <p className="status-message">{analysisStatus}</p>
        </div>
      )}
      
      {(loading || isFixing) && progress === 0 && (
        <div className="loading-container">
          <LoadingSpinner />
          <p>{loading ? 'Initializing analysis...' : 'Fixing code...'}</p>
        </div>
      )}
      
      {result && !loading && !isFixing && (
        <div className="result">
          <h2>Analysis Results</h2>
          
          {result.status === 'fixed' ? (
            <>
              <p className="success">✅ Code fixed successfully!</p>
              <h3>Fixed Code:</h3>
              <pre>{result.fixedCode}</pre>
            </>
          ) : (
            <>
              <p className={result.suggestions.length ? 'warning' : 'success'}>
                {result.message || 'Analysis complete'}
              </p>
              
              {result.suggestions.length > 0 ? (
                <>
                  <h3>Suggestions:</h3>
                  <ul>
                    {result.suggestions.map((suggestion: string, index: number) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="success-message">No issues found in your code! 🎉</p>
              )}
            </>
          )}
        </div>
      )}
      
      <footer>
        <p>© {new Date().getFullYear()} Code Analyzer - AI-powered code analysis</p>
      </footer>
    </div>
  )
}

export default App
