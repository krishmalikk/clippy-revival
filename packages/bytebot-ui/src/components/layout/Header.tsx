"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClippyMini } from "../Clippy";

export function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname?.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const baseClasses = "px-3 py-1 text-xs cursor-pointer";
    const activeClasses = "bg-[#000080] text-white";
    const inactiveClasses = "hover:bg-[#000080] hover:text-white";
    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="win98-window">
      {/* Windows 98 Title Bar */}
      <div className="win98-titlebar">
        <div className="flex items-center gap-2">
          <ClippyMini />
          <span className="font-bold text-sm tracking-wide">
            📎 Clippy&apos;s Computer Classroom
          </span>
        </div>
        <div className="flex gap-1">
          <button className="win98-titlebar-btn" title="Minimize">_</button>
          <button className="win98-titlebar-btn" title="Maximize">□</button>
          <button className="win98-titlebar-btn" title="Close">✕</button>
        </div>
      </div>

      {/* Windows 98 Menu Bar */}
      <div className="win98-menubar flex items-center">
        <Link href="/" className={getLinkClasses("/")}>
          <span className="underline">F</span>ile
        </Link>
        <Link href="/tasks" className={getLinkClasses("/tasks")}>
          <span className="underline">L</span>essons
        </Link>
        <Link href="/desktop" className={getLinkClasses("/desktop")}>
          <span className="underline">P</span>ractice
        </Link>
        <Link
          href="https://docs.bytebot.ai/quickstart"
          target="_blank"
          rel="noopener noreferrer"
          className={getLinkClasses("https://docs.bytebot.ai")}
        >
          <span className="underline">H</span>elp
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-[#c0c0c0] border-b border-[#808080] p-1 flex items-center gap-1">
        <Link href="/" className="win98-button flex items-center gap-1 text-[10px] py-0.5 px-2 min-w-0">
          🏠 Home
        </Link>
        <Link href="/tasks" className="win98-button flex items-center gap-1 text-[10px] py-0.5 px-2 min-w-0">
          📚 My Lessons
        </Link>
        <Link href="/desktop" className="win98-button flex items-center gap-1 text-[10px] py-0.5 px-2 min-w-0">
          🖥️ Practice
        </Link>
        <div className="h-4 w-px bg-[#808080] mx-1" />
        <span className="text-[10px] text-[#404040]">
          Watch → Learn → Practice → Get Graded! 🎓
        </span>
      </div>
    </div>
  );
}
