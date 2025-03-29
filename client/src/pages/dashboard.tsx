import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

type AnalysisType = "bugs" | "features";

export default function Dashboard() {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState("");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("bugs");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    if (!repoUrl) {
      setError("Please enter a repository URL");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      // TODO: Implement API call to analyze repository
      console.log("Analyzing repo:", repoUrl, "for:", analysisType);
    } catch (err) {
      setError("Failed to analyze repository");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-league">
      <nav className="w-full flex justify-between items-center text-sm py-4 px-8 border-b border-gray-800">
        <h2 
          className="text-white hover:opacity-70 hover:cursor-pointer text-lg" 
          onClick={() => navigate("/")}
        >
          Scriptocol
        </h2>
        <div className="flex gap-6">
          <button 
            className="hover:opacity-70 hover:cursor-pointer text-white"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button
            className="px-3 py-1.5 rounded-xl hover:opacity-70 purpleGradient hover:cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Repository Analyzer</h1>
          
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Repository URL
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-purple-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Analysis Type
                </label>
                <div className="relative">
                  <select
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-purple-500 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none pr-10"
                  >
                    <option value="bugs">Find Bugs</option>
                    <option value="features">Suggest Features</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full py-3 rounded-xl text-white font-medium transition-all
                  ${isAnalyzing 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'purpleGradient hover:opacity-90'
                  }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Repository'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
