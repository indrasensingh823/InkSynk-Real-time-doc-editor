import {
  Menu,
  X,
  Home,
  LayoutTemplate,
  TextCursorInput,
  CalendarDays,
  PenTool,
  LogOut,
  Briefcase,
  Gamepad2,
} from "lucide-react";
import NavItem from "./NavItem";
import React from "react";
import { FaUserCircle } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ open, setOpen }) {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen
          transition-all duration-300 ease-in-out
          ${open ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-24"}
          
          bg-white/10 backdrop-blur-2xl
          border-r border-white/20
          shadow-[0_8px_32px_0_rgba(31,38,135,0.25)]
          
          flex flex-col justify-between
        `}
      >
        {/* Gradient Glow Layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-fuchsia-500/5 to-blue-500/10 pointer-events-none" />

        {/* Top Section */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                IS
              </div>

              <div
                className={`transition-all duration-300 overflow-hidden ${
                  open ? "opacity-100 w-auto" : "opacity-0 w-0 lg:hidden"
                }`}
              >
                <h1 className="text-xl font-bold tracking-wide text-white">
                  InkSync
                </h1>
                <p className="text-xs text-gray-300">Creative Workspace</p>
              </div>
            </div>

            <button
              onClick={() => setOpen(!open)}
              aria-label="Toggle Sidebar"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white hover:bg-white/10 transition-all duration-300"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* User Card */}
          <div className="px-4 pt-5">
            <div
              className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 shadow-md transition-all duration-300 ${
                open ? "opacity-100" : "opacity-0 lg:opacity-100 lg:p-2"
              }`}
            >
              <div className="flex items-center gap-3">
                <FaUserCircle size={34} className="text-cyan-300 shrink-0" />

                <div
                  className={`transition-all duration-300 overflow-hidden ${
                    open ? "opacity-100 w-full" : "opacity-0 w-0 lg:hidden"
                  }`}
                >
                  <h2 className="text-sm font-semibold text-white">
                    {currentUser?.displayName || "User"}
                  </h2>
                  <p className="text-xs text-gray-300 truncate">
                    {currentUser?.email || "Guest User"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3 flex flex-col gap-2">
            <NavItem icon={<Home size={20} />} label="Home" to="/" open={open} />
            <NavItem
              icon={<Briefcase size={20} />}
              label="Workspace"
              to="/workspace"
              open={open}
            />
            <NavItem
              icon={<LayoutTemplate size={20} />}
              label="Templates"
              to="/templates"
              open={open}
            />
            <NavItem
              icon={<TextCursorInput size={20} />}
              label="Word Counter"
              to="/wordcounter"
              open={open}
            />
            <NavItem
              icon={<CalendarDays size={20} />}
              label="Planner"
              to="/planner"
              open={open}
            />
            <NavItem
              icon={<PenTool size={20} />}
              label="Whiteboard"
              to="/whiteboard"
              open={open}
            />
            {/* <NavItem
              icon={<Gamepad2 size={20} />}
              label="GameZone"
              to="/gamezone"
              open={open}
            /> */}
            {/* <NavItem
              icon={<Gamepad2 size={20} />}
              label="GamePage"
              to="/gamepage"
              open={open}
            /> */}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="relative z-10 px-4 pb-5">
          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-red-300 hover:text-white hover:bg-red-500/20 border border-red-400/20 transition-all duration-300 mb-4"
            >
              <LogOut size={18} />
              {open && <span className="text-sm font-medium">Logout</span>}
            </button>
          )}

          <div
            className={`text-xs text-gray-300 text-center transition-all duration-300 ${
              open ? "opacity-100" : "opacity-0 lg:opacity-100"
            }`}
          >
            © 2026 InkSync
          </div>
        </div>
      </aside>
    </>
  );
}