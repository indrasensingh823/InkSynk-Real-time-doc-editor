import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Editor from "../pages/Editor";
import Templates from "../pages/Templates";
import WordCounter from "../pages/WordCounter";
import Planner from "../pages/Planner";
// import { Route, Routes } from "react-router-dom";
import Whiteboard from "../pages/Whiteboard";


export default function MainContent({ open }) {
  return (
    <div className={`transition-all duration-300 ${open ? 'ml-64' : 'ml-20'} p-6 w-full`}>
      <Routes>
       <Route path="/" element={<Home />} />
       <Route path="/documents/:id" element={<Editor />} />
       <Route path="/templates" element={<Templates />} />
       <Route path="/word-counter" element={<WordCounter />} />
       <Route path="/planner" element={<Planner />} />
       <Route path="/whiteboard" element={<Whiteboard />} />

      </Routes>
    </div>
  );
}
