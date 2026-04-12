import React, { useState, useEffect, useRef } from 'react';
import '../styles/WordCounter.css';
import Sidebar from '../components/Sidebar';

export default function WordCounter() {
    const [open, setOpen] = useState(true);
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpaces: 0,
    paragraphs: 0,
    sentences: 0,
    readingTime: 0,
    speakingTime: 0,
    longestWord: '',
    wordFrequency: {},
    keywords: []
  });
  
  const [isCopied, setIsCopied] = useState(false);
  const [textHistory, setTextHistory] = useState([]);
  const textareaRef = useRef(null);

  // Calculate all statistics
  useEffect(() => {
    const calculateStats = () => {
      const trimmedText = text.trim();
      
      // Basic counts
      const words = trimmedText === '' ? 0 : trimmedText.split(/\s+/).length;
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, '').length;
      const paragraphs = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
      const sentences = text ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
      
      // Time calculations
      const readingTime = (words / 200).toFixed(2); // 200 WPM
      const speakingTime = (words / 150).toFixed(2); // 150 WPM
      
      // Word analysis
      const wordsArray = trimmedText.toLowerCase().match(/\b\w+\b/g) || [];
      const wordFrequency = {};
      wordsArray.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });
      
      // Find longest word
      const longestWord = wordsArray.reduce((longest, current) => 
        current.length > longest.length ? current : longest, ''
      );
      
      // Get top keywords (most frequent)
      const keywords = Object.entries(wordFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));

      setStats({
        words,
        characters,
        charactersNoSpaces,
        paragraphs,
        sentences,
        readingTime,
        speakingTime,
        longestWord,
        wordFrequency,
        keywords
      });
    };

    calculateStats();
  }, [text]);

  // Text manipulation functions
  const handleClearText = () => {
    setTextHistory(prev => [text, ...prev.slice(0, 4)]); // Keep last 5 entries
    setText('');
    setIsCopied(false);
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handlePasteText = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(prev => prev + clipboardText);
    } catch (err) {
      console.error('Failed to paste text:', err);
    }
  };

  const handleUppercase = () => {
    setText(prev => prev.toUpperCase());
  };

  const handleLowercase = () => {
    setText(prev => prev.toLowerCase());
  };

  const handleCapitalize = () => {
    setText(prev => 
      prev.replace(/(^\w|\s\w)/g, m => m.toUpperCase())
    );
  };

  const handleRemoveSpaces = () => {
    setText(prev => prev.replace(/\s+/g, ' ').trim());
  };

  const handleUndo = () => {
    if (textHistory.length > 0) {
      const [lastText, ...remainingHistory] = textHistory;
      setText(lastText);
      setTextHistory(remainingHistory);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `word-counter-${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFocusTextarea = () => {
    textareaRef.current?.focus();
  };

  return (
    <div className="word-counter-container">
             {/* Sidebar with toggle props */}
            <Sidebar open={open} setOpen={setOpen} />
      <header className="counter-header">
        <div className="header-content">
          <h1>📊 Advanced Word Counter</h1>
          <p>Real-time text analysis and statistics</p>
        </div>
      </header>

      <div className="main-content">
        {/* Text Input Section */}
        <section className="input-section">
          <div className="section-header">
            <h2>Your Text</h2>
            <div className="action-buttons">
              <button 
                onClick={handleFocusTextarea}
                className="btn-secondary"
                title="Focus textarea"
              >
                📍 Focus
              </button>
              <button 
                onClick={handlePasteText}
                className="btn-secondary"
                title="Paste from clipboard"
              >
                📋 Paste
              </button>
              <button 
                onClick={handleClearText}
                className="btn-danger"
                title="Clear all text"
              >
                🗑️ Clear
              </button>
            </div>
          </div>
          
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Start typing or paste your text here to see real-time analysis..."
            className="text-input"
            rows="12"
          />
          
          <div className="text-actions">
            <button 
              onClick={handleCopyText}
              className={`btn-primary ${isCopied ? 'copied' : ''}`}
              disabled={!text}
            >
              {isCopied ? '✅ Copied!' : '📄 Copy Text'}
            </button>
            
            <button 
              onClick={handleDownload}
              className="btn-secondary"
              disabled={!text}
            >
              💾 Download
            </button>
            
            <button 
              onClick={handleUndo}
              className="btn-secondary"
              disabled={textHistory.length === 0}
            >
              ↩️ Undo
            </button>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="stats-section">
          <h2>📈 Text Statistics</h2>
          
          <div className="stats-grid">
            {/* Basic Stats */}
            <div className="stat-card primary">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Words</h3>
                <span className="stat-number">{stats.words}</span>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-icon">🔤</div>
              <div className="stat-content">
                <h3>Characters</h3>
                <span className="stat-number">{stats.characters}</span>
              </div>
            </div>
            
            <div className="stat-card tertiary">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <h3>No Spaces</h3>
                <span className="stat-number">{stats.charactersNoSpaces}</span>
              </div>
            </div>
            
            <div className="stat-card primary">
              <div className="stat-icon">📑</div>
              <div className="stat-content">
                <h3>Paragraphs</h3>
                <span className="stat-number">{stats.paragraphs}</span>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-icon">💬</div>
              <div className="stat-content">
                <h3>Sentences</h3>
                <span className="stat-number">{stats.sentences}</span>
              </div>
            </div>

            {/* Time Stats */}
            <div className="stat-card info">
              <div className="stat-icon">📖</div>
              <div className="stat-content">
                <h3>Reading Time</h3>
                <span className="stat-number">{stats.readingTime}m</span>
              </div>
            </div>
            
            <div className="stat-card info">
              <div className="stat-icon">🎤</div>
              <div className="stat-content">
                <h3>Speaking Time</h3>
                <span className="stat-number">{stats.speakingTime}m</span>
              </div>
            </div>

            {/* Advanced Stats */}
            <div className="stat-card advanced">
              <div className="stat-icon">🏆</div>
              <div className="stat-content">
                <h3>Longest Word</h3>
                <span className="stat-text">{stats.longestWord || 'N/A'}</span>
              </div>
            </div>

            {/* Word Frequency */}
            {stats.keywords.length > 0 && (
              <div className="keyword-card">
                <h3>🔍 Top Keywords</h3>
                <div className="keywords-list">
                  {stats.keywords.map(({ word, count }, index) => (
                    <div key={word} className="keyword-item">
                      <span className="keyword-rank">#{index + 1}</span>
                      <span className="keyword-word">{word}</span>
                      <span className="keyword-count">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Text Tools Section */}
        <section className="tools-section">
          <h2>🛠️ Text Tools</h2>
          <div className="tools-grid">
            <button 
              onClick={handleUppercase}
              className="tool-btn"
              disabled={!text}
            >
              UPPERCASE
            </button>
            <button 
              onClick={handleLowercase}
              className="tool-btn"
              disabled={!text}
            >
              lowercase
            </button>
            <button 
              onClick={handleCapitalize}
              className="tool-btn"
              disabled={!text}
            >
              Capitalize Words
            </button>
            <button 
              onClick={handleRemoveSpaces}
              className="tool-btn"
              disabled={!text}
            >
              Remove Extra Spaces
            </button>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="tips-section">
          <h2>💡 Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <h4>Ideal Lengths</h4>
              <ul>
                <li>Email: 50-125 words</li>
                <li>Blog Post: 1,000-2,500 words</li>
                <li>Academic Paper: 3,000-5,000 words</li>
              </ul>
            </div>
            <div className="tip-card">
              <h4>Reading Speeds</h4>
              <ul>
                <li>Average: 200 WPM</li>
                <li>Slow: 150 WPM</li>
                <li>Fast: 250 WPM</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}