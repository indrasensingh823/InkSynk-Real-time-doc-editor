// client/src/pages/GameZone.js
import React from "react";
import "../styles/GameZone.css";
import { useNavigate } from "react-router-dom";
import Sidebar from '../components/Sidebar';
import { useState } from "react";

export default function GameZone() {
  const nav = useNavigate();
      const [open, setOpen] = useState(true);

  const games = [
    {
      id: 1,
      name: "Typing Speed Test",
      desc: "Test your typing accuracy & speed!",
      img: "https://cdn-icons-png.flaticon.com/512/1828/1828817.png",
      link: "/games/typing",
    },
    {
      id: 2,
      name: "Memory Match",
      desc: "Train your memory with a fun challenge.",
      img: "https://cdn-icons-png.flaticon.com/512/991/991952.png",
      link: "/games/memory",
    },
    {
      id: 3,
      name: "Color Reaction",
      desc: "Check your reflexes and focus speed!",
      img: "https://cdn-icons-png.flaticon.com/512/1048/1048953.png",
      link: "/games/reaction",
    },
    {
      id: 4,
      name: "Math Quiz",
      desc: "Solve math puzzles and earn points!",
      img: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      link: "/games/math",
    },
  ];

  return (
    <div className="gamezone-container">
     {/* Sidebar with toggle props */}
    <Sidebar open={open} setOpen={setOpen} />
      <h1 className="gamezone-title">🎮 Gamify Your Mind!</h1>
      <p className="gamezone-subtitle">
        Play mini games to refresh your brain between editing sessions.
      </p>

      <div className="game-grid">
        {games.map((game) => (
          <div
            key={game.id}
            className="game-card"
            onClick={() => nav(game.link)}
          >
            <img src={game.img} alt={game.name} className="game-icon" />
            <h3>{game.name}</h3>
            <p>{game.desc}</p>
            <button className="play-btn">Play Now</button>
          </div>
        ))}
      </div>
    </div>
  );
}
