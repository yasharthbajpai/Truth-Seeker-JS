import { useState, useEffect, useRef } from 'react';
import './App.css';
import ReactMarkdown from 'react-markdown';

function App() {
  const [factChecks, setFactChecks] = useState([]);
  const [inputContent, setInputContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const resultsEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new fact checks arrive
  useEffect(() => {
    scrollToBottom();
  }, [factChecks]);

  const scrollToBottom = () => {
    resultsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Focus input field when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Function to determine verdict color
  const getVerdictColor = (verdict) => {
    const verdictLower = verdict.toLowerCase();
    if (verdictLower.includes('true') || verdictLower.includes('correct') || verdictLower.includes('accurate')) {
      return 'green-verdict';
    } else if (verdictLower.includes('false') || verdictLower.includes('incorrect') || verdictLower.includes('inaccurate')) {
      return 'red-verdict';
    } else if (verdictLower.includes('partially')) {
      return 'yellow-verdict';
    } else {
      return 'gray-verdict';
    }
  };

  const handleFactCheck = async () => {
    if (inputContent.trim() === '') return;
    
    // Add user content to list
    const userSubmission = {
      id: Date.now(),
      content: inputContent,
      type: 'submission',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setFactChecks(prev => [...prev, userSubmission]);
    setInputContent('');
    setIsLoading(true);
    
    try {
      // Send content to backend for fact-checking
      const response = await fetch('/api/fact-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: inputContent }),
      });
      
      const data = await response.json();
      
      if (data.ok) {
        // Add fact-check result
        const factCheckResult = {
          id: Date.now() + 1,
          type: 'result',
          original: data.original,
          verdict: data.factCheck.verdict,
          explanation: data.factCheck.explanation,
          corrections: data.factCheck.corrections,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setFactChecks(prev => [...prev, factCheckResult]);
      } else {
        // Handle error
        const errorMessage = {
          id: Date.now() + 1,
          type: 'error',
          text: 'Sorry, I encountered an error while fact-checking. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        setFactChecks(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error:', error);
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Network error. Please check your connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setFactChecks(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFactCheck();
    }
  };

  return (
    <>
      <div className="video-background">
        <video autoPlay muted loop>
          <source src="./src/assets/videoplayback.webm" type="video/webm" />
        </video>
      </div>
      
      <div className="fact-check-container">
        <div className="fact-check-header">
          <h1>Fact Checker</h1>
          <p>Submit information to verify its accuracy</p>
        </div>
        
        <div className="results-container">
          {factChecks.length === 0 ? (
            <div className="welcome-message">
              <h2>Welcome to the Fact Checker!</h2>
              <p>Submit a statement or claim below to verify its accuracy.</p>
            </div>
          ) : (
            factChecks.map((item) => {
              if (item.type === 'submission') {
                return (
                  <div key={item.id} className="user-submission">
                    <div className="submission-content">
                      <h3>Submitted for fact-checking:</h3>
                      <p>{item.content}</p>
                      <span className="submission-time">{item.timestamp}</span>
                    </div>
                  </div>
                );
              } else if (item.type === 'result') {
                const verdictClass = getVerdictColor(item.verdict);
                return (
                  <div key={item.id} className="fact-check-result">
                    <div className={`verdict ${verdictClass}`}>
                      <h3>Verdict: {item.verdict}</h3>
                    </div>
                    <div className="result-details">
                      <div className="explanation">
                        <h4>Explanation:</h4>
                        <ReactMarkdown>{item.explanation}</ReactMarkdown>
                      </div>
                      {item.corrections && item.corrections !== "No corrections needed." && (
                        <div className="corrections">
                          <h4>Corrections:</h4>
                          <ReactMarkdown>{item.corrections}</ReactMarkdown>
                        </div>
                      )}
                      <span className="result-time">{item.timestamp}</span>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={item.id} className="error-message">
                    <p>{item.text}</p>
                    <span className="error-time">{item.timestamp}</span>
                  </div>
                );
              }
            })
          )}
          {isLoading && (
            <div className="loading-indicator">
              <div className="fact-checking-message">
                <p>Fact-checking in progress...</p>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={resultsEndRef} />
        </div>
        
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputContent}
            onChange={(e) => setInputContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter a statement to fact-check..."
            rows="3"
          />
          <button 
            onClick={handleFactCheck}
            disabled={isLoading || inputContent.trim() === ''}
            className={isLoading ? 'checking' : ''}
          >
            {isLoading ? 'Checking...' : 'Fact Check'}
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
