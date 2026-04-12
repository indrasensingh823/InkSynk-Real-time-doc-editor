// client/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Workspace from "./pages/Workspace";
import Editor from "./pages/Editor";
import History from "./pages/History";
import Planner from "./pages/Planner";
import Templates from "./pages/Templates";
import WordCounter from "./pages/WordCounter";
import Whiteboard from "./pages/Whiteboard";
import Sidebar from "./components/Sidebar";
import GameZone from "./pages/GameZone";
import TypingGame from "./pages/games/TypingGame";
// In your App.js, add the route for GamesPage
import GamesPage from './pages/GamesPage';



function App() {
  const isAuthenticated = !!localStorage.getItem("user");

  return (
    <Router>
      <Routes>
        {/* ---------- Public Routes ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* ✅ Shared document link — can open without login */}
        <Route path="/documents/:id" element={<Editor />} />

        {/* ---------- Protected Routes ---------- */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex" }}>
                {/* <Sidebar /> */}
                <Home />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/templates"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex" }}>
                <Sidebar />
                <Templates />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/wordcounter"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex" }}>
                <Sidebar />
                <WordCounter />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/planner"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex" }}>
                <Sidebar />
                <Planner />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/whiteboard"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex" }}>
                <Sidebar />
                <Whiteboard />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/workspace"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex" }}>
                <Sidebar />
                <Workspace />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/history"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex" }}>
                <Sidebar />
                <History />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* ✅ Editor for logged-in users */}
        <Route
          path="/documents/:id/edit"
          element={
            isAuthenticated ? (
              <div style={{ display: "flex" }}>
                <Sidebar />
                <Editor />
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route path="/gamezone" element={<GameZone />} />
        <Route path="/games/typing" element={<TypingGame />} />

        // Add this route to your Routes
        <Route path="/gamepage" element={<GamesPage />} />

        {/* ---------- Catch-all ---------- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
