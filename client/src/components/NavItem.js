// src/components/NavItem.jsx
import React from "react";
import { NavLink } from "react-router-dom";

export default function NavItem({ icon, label, to, open }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-300
        ${
          isActive
            ? "bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-white border border-cyan-300/20 shadow-md"
            : "text-gray-200 hover:bg-white/10 hover:text-white"
        }`
      }
    >
      <div className="shrink-0">{icon}</div>

      <span
        className={`text-sm font-medium transition-all duration-300 overflow-hidden whitespace-nowrap ${
          open ? "opacity-100 w-auto" : "opacity-0 w-0 lg:hidden"
        }`}
      >
        {label}
      </span>
    </NavLink>
  );
}
