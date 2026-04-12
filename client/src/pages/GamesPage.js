// client/src/pages/AdvancedGamesPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GamesPage.css";

const AdvancedGamesPage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState({
    username: "DocumentMaster",
    level: 1,
    exp: 0,
    totalExp: 1000,
    gamesCompleted: 0,
    documentsCreated: 12,
    rank: "Novice Writer",
    joinDate: "2024-01-15"
  });
  const [activeGame, setActiveGame] = useState(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [gameProgress, setGameProgress] = useState({});

  // Enhanced games data with difficulty levels and time estimates
  const games = {
    beginner: [
      {
        id: 1,
        title: "📝 Typing Dojo",
        description: "Master the art of fast and accurate typing",
        icon: "⌨️",
        color: "#3B82F6",
        difficulty: "Beginner",
        timeEstimate: "5-10 mins",
        expReward: 100,
        completionRate: "85%",
        tags: ["typing", "warm-up"],
        featured: false
      },
      {
        id: 2,
        title: "🎴 Format Memory",
        description: "Match formatting styles and document elements",
        icon: "🧠",
        color: "#10B981",
        difficulty: "Beginner",
        timeEstimate: "8-12 mins",
        expReward: 120,
        completionRate: "78%",
        tags: ["memory", "formatting"],
        featured: false
      }
    ],
    intermediate: [
      {
        id: 3,
        title: "🔍 Document Detective",
        description: "Find errors and inconsistencies in complex documents",
        icon: "🕵️",
        color: "#F59E0B",
        difficulty: "Intermediate",
        timeEstimate: "15-25 mins",
        expReward: 250,
        completionRate: "65%",
        tags: ["analysis", "proofreading"],
        featured: true
      },
      {
        id: 4,
        title: "⚡ Speed Editor",
        description: "Edit and format documents against the clock",
        icon: "⚡",
        color: "#EF4444",
        difficulty: "Intermediate",
        timeEstimate: "12-18 mins",
        expReward: 200,
        completionRate: "70%",
        tags: ["editing", "speed"],
        featured: false
      }
    ],
    advanced: [
      {
        id: 5,
        title: "🏛️ Document Architect",
        description: "Design complete document structures from requirements",
        icon: "🏛️",
        color: "#8B5CF6",
        difficulty: "Advanced",
        timeEstimate: "25-40 mins",
        expReward: 400,
        completionRate: "45%",
        tags: ["structure", "design"],
        featured: true
      },
      {
        id: 6,
        title: "🎯 Precision Proofer",
        description: "Catch subtle errors in professional documents",
        icon: "🎯",
        color: "#06B6D4",
        difficulty: "Advanced",
        timeEstimate: "20-30 mins",
        expReward: 350,
        completionRate: "52%",
        tags: ["proofreading", "detail"],
        featured: false
      },
      {
        id: 7,
        title: "📊 Data Documenter",
        description: "Create comprehensive reports from raw data",
        icon: "📊",
        color: "#84CC16",
        difficulty: "Advanced",
        timeEstimate: "30-45 mins",
        expReward: 500,
        completionRate: "38%",
        tags: ["data", "reporting"],
        featured: true
      },
      {
        id: 8,
        title: "🌐 Global Formatter",
        description: "Adapt documents for international standards",
        icon: "🌐",
        color: "#F97316",
        difficulty: "Expert",
        timeEstimate: "35-50 mins",
        expReward: 600,
        completionRate: "28%",
        tags: ["formatting", "international"],
        featured: true
      }
    ]
  };

  const leaderboardData = [
    { rank: 1, name: "EditorPro", level: 25, exp: 12500, gamesCompleted: 47 },
    { rank: 2, name: "DocMaster", level: 23, exp: 11400, gamesCompleted: 42 },
    { rank: 3, name: "FormatKing", level: 22, exp: 10900, gamesCompleted: 39 },
    { rank: 4, name: "WordSmith", level: 21, exp: 10400, gamesCompleted: 37 },
    { rank: 5, name: "PageTurner", level: 20, exp: 9800, gamesCompleted: 35 },
  ];

  useEffect(() => {
    // Load user data and progress
    const savedProfile = JSON.parse(localStorage.getItem("userGameProfile")) || userProfile;
    const savedProgress = JSON.parse(localStorage.getItem("gameProgress")) || {};
    
    setUserProfile(savedProfile);
    setGameProgress(savedProgress);
  }, []);

  const updateUserProgress = (expEarned, gameId) => {
    const newExp = userProfile.exp + expEarned;
    const newLevel = Math.floor(newExp / 1000) + 1;
    const newProgress = {
      ...gameProgress,
      [gameId]: { completed: true, expEarned, completedAt: new Date().toISOString() }
    };

    const newProfile = {
      ...userProfile,
      exp: newExp,
      level: newLevel,
      gamesCompleted: userProfile.gamesCompleted + 1,
      rank: getRankFromLevel(newLevel)
    };

    setUserProfile(newProfile);
    setGameProgress(newProgress);
    
    localStorage.setItem("userGameProfile", JSON.stringify(newProfile));
    localStorage.setItem("gameProgress", JSON.stringify(newProgress));
  };

  const getRankFromLevel = (level) => {
    if (level >= 20) return "Grand Master";
    if (level >= 15) return "Expert Editor";
    if (level >= 10) return "Senior Writer";
    if (level >= 5) return "Junior Editor";
    return "Novice Writer";
  };

  const getExpToNextLevel = () => {
    return (userProfile.level * 1000) - userProfile.exp;
  };

  const getProgressPercentage = () => {
    return (userProfile.exp % 1000) / 10;
  };

  const handleGameStart = (game) => {
    setActiveGame(game);
  };

  const handleGameComplete = (expEarned) => {
    if (activeGame) {
      updateUserProgress(expEarned, activeGame.id);
    }
    setActiveGame(null);
  };

  const getGameStatus = (gameId) => {
    return gameProgress[gameId] ? "completed" : "available";
  };

  const getAllGames = () => {
    return [...games.beginner, ...games.intermediate, ...games.advanced];
  };

  const getFilteredGames = () => {
    switch(activeTab) {
      case "beginner": return games.beginner;
      case "intermediate": return games.intermediate;
      case "advanced": return games.advanced;
      case "featured": return getAllGames().filter(game => game.featured);
      default: return getAllGames();
    }
  };

  const renderGameComponent = () => {
    if (!activeGame) return null;

    switch(activeGame.id) {
      case 1:
        return <TypingDojo onComplete={handleGameComplete} game={activeGame} />;
      case 2:
        return <FormatMemory onComplete={handleGameComplete} game={activeGame} />;
      case 3:
        return <DocumentDetective onComplete={handleGameComplete} game={activeGame} />;
      case 4:
        return <SpeedEditor onComplete={handleGameComplete} game={activeGame} />;
      case 5:
        return <DocumentArchitect onComplete={handleGameComplete} game={activeGame} />;
      case 6:
        return <PrecisionProofer onComplete={handleGameComplete} game={activeGame} />;
      case 7:
        return <DataDocumenter onComplete={handleGameComplete} game={activeGame} />;
      case 8:
        return <GlobalFormatter onComplete={handleGameComplete} game={activeGame} />;
      default:
        return null;
    }
  };

  return (
    <div className="advanced-games-page">
      {/* Navigation Header */}
      <nav className="games-nav">
        <div className="nav-brand">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back to Editor
          </button>
          <h1>Document Master Games</h1>
        </div>
        <div className="nav-actions">
          <button 
            className="leaderboard-btn"
            onClick={() => setShowLeaderboard(true)}
          >
            🏆 Leaderboard
          </button>
          <button className="profile-btn">
            👤 {userProfile.username}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="games-content">
        {/* User Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">
              {userProfile.username.substring(0, 2).toUpperCase()}
            </div>
            <div className="profile-info">
              <h2>{userProfile.username}</h2>
              <p className="rank">{userProfile.rank}</p>
              <p className="join-date">Member since {userProfile.joinDate}</p>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-value">Level {userProfile.level}</div>
              <div className="stat-label">Current Level</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userProfile.exp}</div>
              <div className="stat-label">Total EXP</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userProfile.gamesCompleted}</div>
              <div className="stat-label">Games Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{userProfile.documentsCreated}</div>
              <div className="stat-label">Documents Created</div>
            </div>
          </div>

          <div className="level-progress">
            <div className="progress-header">
              <span>Progress to Level {userProfile.level + 1}</span>
              <span>{getExpToNextLevel()} EXP needed</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Games Section */}
        <div className="games-section">
          <div className="section-header">
            <h2>Document Mastery Challenges</h2>
            <p>Improve your document skills through engaging challenges</p>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            <button 
              className={`tab ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Games
            </button>
            <button 
              className={`tab ${activeTab === "featured" ? "active" : ""}`}
              onClick={() => setActiveTab("featured")}
            >
              Featured
            </button>
            <button 
              className={`tab ${activeTab === "beginner" ? "active" : ""}`}
              onClick={() => setActiveTab("beginner")}
            >
              Beginner
            </button>
            <button 
              className={`tab ${activeTab === "intermediate" ? "active" : ""}`}
              onClick={() => setActiveTab("intermediate")}
            >
              Intermediate
            </button>
            <button 
              className={`tab ${activeTab === "advanced" ? "active" : ""}`}
              onClick={() => setActiveTab("advanced")}
            >
              Advanced
            </button>
          </div>

          {/* Games Grid */}
          <div className="games-grid">
            {getFilteredGames().map(game => (
              <GameCard 
                key={game.id}
                game={game}
                status={getGameStatus(game.id)}
                onStart={handleGameStart}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Game Modal */}
      {activeGame && (
        <div className="game-modal">
          <div className="game-modal-container">
            {renderGameComponent()}
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="leaderboard-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h2>🏆 Global Leaderboard</h2>
              <button 
                className="close-modal"
                onClick={() => setShowLeaderboard(false)}
              >
                ✕
              </button>
            </div>
            <div className="leaderboard-list">
              {leaderboardData.map(player => (
                <div key={player.rank} className="leaderboard-item">
                  <div className="rank-badge">#{player.rank}</div>
                  <div className="player-info">
                    <div className="player-name">{player.name}</div>
                    <div className="player-stats">
                      Level {player.level} • {player.exp} EXP • {player.gamesCompleted} Games
                    </div>
                  </div>
                  <div className="player-rank">{getRankFromLevel(player.level)}</div>
                </div>
              ))}
              {/* Current User Position */}
              <div className="leaderboard-item current-user">
                <div className="rank-badge">#{6}</div>
                <div className="player-info">
                  <div className="player-name">{userProfile.username} (You)</div>
                  <div className="player-stats">
                    Level {userProfile.level} • {userProfile.exp} EXP • {userProfile.gamesCompleted} Games
                  </div>
                </div>
                <div className="player-rank">{userProfile.rank}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, status, onStart }) => {
  return (
    <div 
      className={`game-card ${status} ${game.featured ? 'featured' : ''}`}
      style={{ '--card-color': game.color }}
      onClick={() => onStart(game)}
    >
      {game.featured && <div className="featured-badge">Featured</div>}
      <div className="game-card-header">
        <div className="game-icon">{game.icon}</div>
        <div className="game-meta">
          <span className="difficulty-badge">{game.difficulty}</span>
          <span className="time-estimate">⏱️ {game.timeEstimate}</span>
        </div>
      </div>
      <div className="game-card-body">
        <h3>{game.title}</h3>
        <p>{game.description}</p>
        <div className="game-tags">
          {game.tags.map(tag => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      </div>
      <div className="game-card-footer">
        <div className="exp-reward">+{game.expReward} EXP</div>
        <div className="completion-rate">✓ {game.completionRate}</div>
        {status === "completed" && (
          <div className="completed-badge">Completed</div>
        )}
      </div>
    </div>
  );
};

// Advanced Game Components (Simplified versions for demonstration)

const TypingDojo = ({ onComplete, game }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleComplete = () => {
    const expEarned = Math.floor(game.expReward * (accuracy / 100) * (wpm / 50));
    onComplete(expEarned);
  };

  return (
    <div className="game-interface">
      <div className="game-header">
        <h2>{game.title}</h2>
        <div className="game-stats">
          <div>Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
          <div>WPM: {wpm}</div>
          <div>Accuracy: {accuracy}%</div>
        </div>
      </div>
      <div className="game-content">
        <div className="typing-test">
          <div className="sample-text">
            Professional document editing requires exceptional typing skills. 
            The ability to quickly transcribe thoughts into well-structured documents 
            separates amateur writers from professional editors. Practice makes perfect.
          </div>
          <textarea 
            placeholder="Start typing the text above..."
            rows="6"
            onChange={(e) => {
              const words = e.target.value.trim().split(/\s+/).length;
              const timeMinutes = (300 - timeLeft) / 60;
              setWpm(Math.floor(words / timeMinutes));
            }}
          />
        </div>
        <button onClick={handleComplete} className="complete-btn">
          Complete Challenge
        </button>
      </div>
    </div>
  );
};

const DocumentDetective = ({ onComplete, game }) => {
  const [errorsFound, setErrorsFound] = useState(0);
  const [totalErrors, setTotalErrors] = useState(8);

  return (
    <div className="game-interface">
      <div className="game-header">
        <h2>{game.title}</h2>
        <div className="game-stats">
          <div>Errors Found: {errorsFound}/{totalErrors}</div>
          <div>Time: 15:00</div>
        </div>
      </div>
      <div className="game-content">
        <div className="document-review">
          <h3>Review this document for errors:</h3>
          <div className="document-content">
            <p>
              The <span className="error-candidate">companys</span> quarterly report shows 
              significant growth in all <span className="error-candidate">departments</span>. 
              However, there are several <span className="error-candidate">inconsistencies</span> 
              that need to be <span className="error-candidate">adressed</span> before final 
              <span className="error-candidate">submision</span>.
            </p>
            <p>
              The <span className="error-candidate">finacial</span> data indicates a 
              <span className="error-candidate">15% increase</span> in revenue, but the 
              <span className="error-candidate">expenses</span> have also risen by 
              <span className="error-candidate">12%</span>.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onComplete(game.expReward)} 
          className="complete-btn"
        >
          Submit Findings
        </button>
      </div>
    </div>
  );
};

const DocumentArchitect = ({ onComplete, game }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  return (
    <div className="game-interface">
      <div className="game-header">
        <h2>{game.title}</h2>
        <div className="game-stats">
          <div>Step: {currentStep}/{totalSteps}</div>
          <div>Time: 25:00</div>
        </div>
      </div>
      <div className="game-content">
        <div className="architecture-task">
          <h3>Design a Business Proposal Document Structure</h3>
          <div className="requirements">
            <p>Create a comprehensive structure including:</p>
            <ul>
              <li>Executive Summary</li>
              <li>Problem Statement</li>
              <li>Proposed Solution</li>
              <li>Implementation Timeline</li>
              <li>Budget Breakdown</li>
            </ul>
          </div>
          <div className="structure-builder">
            <textarea 
              placeholder="Outline your document structure here..."
              rows="10"
            />
          </div>
        </div>
        <div className="step-navigation">
          <button disabled={currentStep === 1}>Previous</button>
          <span>Step {currentStep} of {totalSteps}</span>
          <button onClick={() => {
            if (currentStep < totalSteps) {
              setCurrentStep(currentStep + 1);
            } else {
              onComplete(game.expReward);
            }
          }}>
            {currentStep === totalSteps ? 'Complete' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

const DataDocumenter = ({ onComplete, game }) => {
  const [reportProgress, setReportProgress] = useState(0);

  return (
    <div className="game-interface">
      <div className="game-header">
        <h2>{game.title}</h2>
        <div className="game-stats">
          <div>Progress: {reportProgress}%</div>
          <div>Time: 30:00</div>
        </div>
      </div>
      <div className="game-content">
        <div className="data-reporting">
          <h3>Create a Comprehensive Data Report</h3>
          <div className="data-set">
            <h4>Quarterly Sales Data:</h4>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Q1 Sales</th>
                  <th>Q2 Sales</th>
                  <th>Growth</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Product A</td>
                  <td>$125,000</td>
                  <td>$145,000</td>
                  <td>+16%</td>
                </tr>
                <tr>
                  <td>Product B</td>
                  <td>$89,000</td>
                  <td>$102,000</td>
                  <td>+14.6%</td>
                </tr>
                <tr>
                  <td>Product C</td>
                  <td>$210,000</td>
                  <td>$195,000</td>
                  <td>-7.1%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="report-editor">
            <textarea 
              placeholder="Write your analysis and report here..."
              rows="12"
              onChange={(e) => {
                const progress = Math.min(100, Math.floor(e.target.value.length / 10));
                setReportProgress(progress);
              }}
            />
          </div>
        </div>
        <button 
          onClick={() => onComplete(game.expReward)} 
          className="complete-btn"
        >
          Submit Report
        </button>
      </div>
    </div>
  );
};

// Simplified versions of other games for brevity
const FormatMemory = ({ onComplete, game }) => (
  <div className="game-interface">
    <h2>{game.title}</h2>
    <div className="game-content">
      <p>Memory matching game with formatting styles...</p>
      <button onClick={() => onComplete(game.expReward)}>Complete</button>
    </div>
  </div>
);

const SpeedEditor = ({ onComplete, game }) => (
  <div className="game-interface">
    <h2>{game.title}</h2>
    <div className="game-content">
      <p>Speed editing challenge...</p>
      <button onClick={() => onComplete(game.expReward)}>Complete</button>
    </div>
  </div>
);

const PrecisionProofer = ({ onComplete, game }) => (
  <div className="game-interface">
    <h2>{game.title}</h2>
    <div className="game-content">
      <p>Advanced proofreading challenge...</p>
      <button onClick={() => onComplete(game.expReward)}>Complete</button>
    </div>
  </div>
);

const GlobalFormatter = ({ onComplete, game }) => (
  <div className="game-interface">
    <h2>{game.title}</h2>
    <div className="game-content">
      <p>International formatting standards challenge...</p>
      <button onClick={() => onComplete(game.expReward)}>Complete</button>
    </div>
  </div>
);

export default AdvancedGamesPage;