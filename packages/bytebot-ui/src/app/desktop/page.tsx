"use client";

import React from "react";
import { Header } from "@/components/layout/Header";
import { DesktopContainer } from "@/components/ui/desktop-container";
import Link from "next/link";
import { Clippy } from "@/components/Clippy";

export default function DesktopPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#008080]">
      <div className="flex-1 p-4 overflow-hidden">
        <div className="win98-window h-full flex flex-col">
          <Header />

          <main className="flex-1 overflow-hidden bg-[#c0c0c0] p-2">
            <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-2">
              {/* Desktop View */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="win98-window flex-1 flex flex-col overflow-hidden">
                  <div className="win98-titlebar">
                    <span>🖥️ Practice Desktop</span>
                    <div className="flex gap-1">
                      <button className="win98-titlebar-btn">_</button>
                      <button className="win98-titlebar-btn">□</button>
                      <button className="win98-titlebar-btn">✕</button>
                    </div>
                  </div>
                  
                  {/* Practice Mode Banner */}
                  <div className="practice-mode">
                    🎯 PRACTICE MODE - Try things out here! Nothing can break!
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <DesktopContainer viewOnly={false} status="live_view">
                      {/* No extra controls */}
                    </DesktopContainer>
                  </div>
                </div>
              </div>

              {/* Side Panel */}
              <div className="flex flex-col gap-2">
                {/* Clippy */}
                <div className="win98-window">
                  <div className="win98-titlebar">
                    <span>🎓 Practice Tips</span>
                  </div>
                  <div className="p-2 bg-[#c0c0c0]">
                    <Clippy 
                      message="This is your practice area! Try clicking around - you can't break anything here! 🖱️"
                      showBubble={true}
                      size="sm"
                      mode="practice"
                    />
                  </div>
                </div>

                {/* Quick Tips */}
                <div className="win98-window flex-1">
                  <div className="win98-titlebar">
                    <span>💡 Quick Tips</span>
                  </div>
                  <div className="p-2 bg-[#c0c0c0] text-[10px] space-y-2">
                    <div className="win98-inset p-2">
                      <strong>🖱️ Single Click:</strong><br/>
                      Select an item
                    </div>
                    <div className="win98-inset p-2">
                      <strong>🖱️🖱️ Double Click:</strong><br/>
                      Open an item
                    </div>
                    <div className="win98-inset p-2">
                      <strong>🖱️➡️ Right Click:</strong><br/>
                      Show options menu
                    </div>
                    <div className="win98-inset p-2">
                      <strong>⌨️ Ctrl+C / Ctrl+V:</strong><br/>
                      Copy and Paste
                    </div>
                    <div className="win98-inset p-2">
                      <strong>⌨️ Ctrl+Z:</strong><br/>
                      Undo mistake
                    </div>
                  </div>
                </div>

                {/* Back to Lessons */}
                <Link href="/">
                  <button className="win98-button w-full">
                    📚 Back to Lessons
                  </button>
                </Link>
              </div>
            </div>
          </main>

          {/* Status Bar */}
          <div className="win98-statusbar">
            <div className="win98-statusbar-panel">
              Practice Mode - Safe to experiment!
            </div>
            <div className="win98-statusbar-panel w-24 text-right">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="win98-taskbar">
        <button className="win98-start-btn">
          <span className="text-base">🪟</span>
          <span>Start</span>
        </button>
        <div className="h-full w-px bg-[#808080]" />
        <div className="flex-1 flex gap-1">
          <Link href="/">
            <div className="win98-button text-[10px] py-0.5 px-2">
              📎 Clippy&apos;s Classroom
            </div>
          </Link>
          <Link href="/tasks">
            <div className="win98-button text-[10px] py-0.5 px-2">
              📚 My Lessons
            </div>
          </Link>
          <div className="win98-button text-[10px] py-0.5 px-2 bg-[#dfdfdf]">
            🖥️ Practice
          </div>
        </div>
        <div className="win98-inset px-2 py-0.5 text-[10px] flex items-center gap-2">
          <span>🔊</span>
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  );
}
