"use client";

import React, { useState, useEffect } from "react";

interface ClippyProps {
  message?: string;
  showBubble?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  mode?: "teaching" | "practice" | "grading";
}

const teacherMessages = [
  "Hi! I'm Clippy, your computer teacher! 👋",
  "Watch me first, then you'll try it yourself!",
  "Ready to learn something new? Let's go!",
  "Don't worry - I'll show you step by step!",
  "Practice makes perfect! You've got this!",
];

export function Clippy({ 
  message, 
  showBubble = true, 
  size = "md",
  className = "",
  mode = "teaching",
}: ClippyProps) {
  const [currentMessage, setCurrentMessage] = useState(message || teacherMessages[0]);
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Cycle through messages if no custom message
  useEffect(() => {
    if (!message) {
      const messageInterval = setInterval(() => {
        setCurrentMessage(teacherMessages[Math.floor(Math.random() * teacherMessages.length)]);
      }, 8000);

      return () => clearInterval(messageInterval);
    } else {
      setCurrentMessage(message);
    }
  }, [message]);

  // Eye following mouse
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = Math.min(Math.max((e.clientX - window.innerWidth / 2) / 100, -2), 2);
      const y = Math.min(Math.max((e.clientY - window.innerHeight / 2) / 100, -2), 2);
      setEyePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const sizeClasses = {
    sm: "w-16 h-20",
    md: "w-24 h-32",
    lg: "w-32 h-40",
  };

  const bubbleSizes = {
    sm: "max-w-[180px] text-[10px]",
    md: "max-w-[250px] text-xs",
    lg: "max-w-[300px] text-sm",
  };

  // Mode-specific styling
  const getModeStyle = () => {
    switch (mode) {
      case "practice":
        return "border-2 border-yellow-500";
      case "grading":
        return "border-2 border-green-500";
      default:
        return "";
    }
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Speech Bubble */}
      {showBubble && (
        <div className={`clippy-bubble mb-3 ${bubbleSizes[size]} ${getModeStyle()}`}>
          <p className="leading-relaxed">{currentMessage}</p>
          {mode === "practice" && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <p className="text-[10px] font-bold text-yellow-700">
                🎯 YOUR TURN! Try it yourself!
              </p>
            </div>
          )}
          {mode === "grading" && (
            <div className="mt-2 pt-2 border-t border-gray-300">
              <p className="text-[10px] font-bold text-green-700">
                ✓ Checking your work...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Clippy Character - SVG Paperclip */}
      <div className={`clippy-animate ${sizeClasses[size]} relative cursor-pointer`}>
        <svg
          viewBox="0 0 100 130"
          className="w-full h-full drop-shadow-lg"
          style={{ filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))" }}
        >
          {/* Paperclip body - main wire */}
          <path
            d="M35 120 
               L35 30 
               C35 15 50 5 65 5 
               C80 5 85 15 85 30 
               L85 95 
               C85 105 75 115 65 115 
               C55 115 50 105 50 95 
               L50 40
               C50 35 55 30 60 30
               C65 30 70 35 70 40
               L70 85"
            fill="none"
            stroke="#808080"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M35 120 
               L35 30 
               C35 15 50 5 65 5 
               C80 5 85 15 85 30 
               L85 95 
               C85 105 75 115 65 115 
               C55 115 50 105 50 95 
               L50 40
               C50 35 55 30 60 30
               C65 30 70 35 70 40
               L70 85"
            fill="none"
            stroke="linear-gradient(#c0c0c0, #808080)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Shiny highlight */}
          <path
            d="M37 118 
               L37 32 
               C37 18 51 8 65 8"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Eyes background */}
          <ellipse cx="55" cy="50" rx="12" ry="10" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          <ellipse cx="75" cy="50" rx="12" ry="10" fill="#ffffff" stroke="#000000" strokeWidth="1" />
          
          {/* Pupils that follow mouse */}
          <ellipse 
            cx={55 + eyePosition.x} 
            cy={50 + eyePosition.y} 
            rx={isBlinking ? 4 : 4} 
            ry={isBlinking ? 1 : 4} 
            fill="#000000"
          />
          <ellipse 
            cx={75 + eyePosition.x} 
            cy={50 + eyePosition.y} 
            rx={isBlinking ? 4 : 4} 
            ry={isBlinking ? 1 : 4} 
            fill="#000000"
          />
          
          {/* Eye shine */}
          <circle cx={53 + eyePosition.x * 0.5} cy={48 + eyePosition.y * 0.5} r="1.5" fill="#ffffff" />
          <circle cx={73 + eyePosition.x * 0.5} cy={48 + eyePosition.y * 0.5} r="1.5" fill="#ffffff" />

          {/* Eyebrows */}
          <path
            d="M45 40 Q55 36 63 40"
            fill="none"
            stroke="#404040"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M67 40 Q75 36 85 40"
            fill="none"
            stroke="#404040"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Smile */}
          <path
            d="M55 65 Q65 75 75 65"
            fill="none"
            stroke="#000000"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Teacher's graduation cap for teaching mode */}
          {mode === "teaching" && (
            <>
              <polygon points="65,0 85,10 65,20 45,10" fill="#000080" stroke="#000000" strokeWidth="1" />
              <rect x="63" y="10" width="4" height="8" fill="#000080" />
              <circle cx="65" cy="18" r="3" fill="#ffcc00" />
              <path d="M68 18 Q75 25 70 30" stroke="#ffcc00" strokeWidth="2" fill="none" />
            </>
          )}

          {/* Practice mode - pencil */}
          {mode === "practice" && (
            <>
              <rect x="85" y="70" width="6" height="25" fill="#ffcc00" transform="rotate(30 88 82)" />
              <polygon points="88,95 85,105 91,105" fill="#ffcccc" transform="rotate(30 88 100)" />
            </>
          )}

          {/* Grading mode - checkmark */}
          {mode === "grading" && (
            <path
              d="M80 55 L85 65 L95 45"
              fill="none"
              stroke="#00aa00"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>
    </div>
  );
}

// Smaller inline Clippy for messages
export function ClippyMini({ className = "" }: { className?: string }) {
  return (
    <div className={`w-6 h-8 ${className}`}>
      <svg viewBox="0 0 100 130" className="w-full h-full">
        <path
          d="M35 120 L35 30 C35 15 50 5 65 5 C80 5 85 15 85 30 L85 95 C85 105 75 115 65 115 C55 115 50 105 50 95 L50 40 C50 35 55 30 60 30 C65 30 70 35 70 40 L70 85"
          fill="none"
          stroke="#808080"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <ellipse cx="55" cy="50" rx="10" ry="8" fill="#ffffff" stroke="#000" strokeWidth="1" />
        <ellipse cx="75" cy="50" rx="10" ry="8" fill="#ffffff" stroke="#000" strokeWidth="1" />
        <circle cx="55" cy="50" r="3" fill="#000000" />
        <circle cx="75" cy="50" r="3" fill="#000000" />
      </svg>
    </div>
  );
}

export default Clippy;
