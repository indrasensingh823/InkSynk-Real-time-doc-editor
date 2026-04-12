// client/src/pages/games/TypingGame.js
import React, { useState, useEffect, useRef } from "react";
import "../../styles/TypingGame.css";
import { useNavigate } from "react-router-dom";

export default function TypingGame() {
  const nav = useNavigate();
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [started, setStarted] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const inputRef = useRef(null);

  // Random typing text
  const paragraphs = [
    "The quick brown fox jumps over the lazy dog.",
    "Typing games help improve your speed and focus.",
    "JavaScript makes web pages interactive and fun.",
    "Learning new skills daily makes you unstoppable.",
    "Artificial intelligence is changing the world fast.",
  ];

  useEffect(() => {
    const random = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    setText(random);
  }, []);

  // Timer
  useEffect(() => {
    let timer;
    if (started && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [started, timeLeft]);

  const startGame = () => {
    setStarted(true);
    setUserInput("");
    setTimeLeft(30);
    setWpm(0);
    setAccuracy(0);
    inputRef.current.focus();
  };

  const endGame = () => {
    const wordsTyped = userInput.trim().split(/\s+/).length;
    const correctChars = userInput
      .split("")
      .filter((ch, i) => ch === text[i]).length;

    const acc = Math.round((correctChars / text.length) * 100);
    const calculatedWpm = Math.round((wordsTyped / 30) * 60);

    setWpm(calculatedWpm);
    setAccuracy(acc);
    setStarted(false);
  };

  return (
    <div className="typing-container">
      <div className="typing-card">
        <h1 className="typing-title">⌨️ Typing Speed Challenge</h1>
        <p className="typing-subtitle">
          Type as fast and accurately as you can in 30 seconds!
        </p>

        {!started && timeLeft === 30 ? (
          <button className="start-btn" onClick={startGame}>
            Start Game
          </button>
        ) : (
          <>
            <div className="timer">⏱ Time Left: {timeLeft}s</div>
            <div className="text-box">
              {text.split("").map((char, i) => {
                let color;
                if (i < userInput.length) {
                  color = char === userInput[i] ? "#00ff99" : "#ff0044";
                }
                return (
                  <span key={i} style={{ color }}>
                    {char}
                  </span>
                );
              })}
            </div>

            <textarea
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={!started}
              placeholder="Start typing here..."
              className="typing-area"
            />
          </>
        )}

        {!started && timeLeft !== 30 && (
          <div className="result-card">
            <h2>🏁 Game Over!</h2>
            <p>Speed: <strong>{wpm} WPM</strong></p>
            <p>Accuracy: <strong>{accuracy}%</strong></p>
            <button className="restart-btn" onClick={startGame}>Play Again</button>
            <button className="back-btn" onClick={() => nav("/gamezone")}>
              ← Back to Game Zone
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
