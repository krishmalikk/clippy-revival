"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { ChatInput } from "@/components/messages/ChatInput";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { startTask } from "@/utils/taskUtils";
import { Model } from "@/types";
import { Clippy } from "@/components/Clippy";

interface FileWithBase64 {
  name: string;
  base64: string;
  type: string;
  size: number;
}

// Lessons with grading - AI demonstrates then user practices
const LESSONS = [
  {
    id: "web-search",
    icon: "🔍",
    title: "Search the Internet",
    description: "Learn to find information on Google",
    difficulty: "Beginner",
    prompt: `LESSON: How to Search the Internet

PHASE 1 - DEMONSTRATION:
I will now show you how to search the internet. Watch carefully!

Step 1: I'm opening the web browser (Firefox)
Step 2: I'm clicking on the address bar at the top
Step 3: I'm typing "google.com" and pressing Enter
Step 4: Now I'm clicking on the search box
Step 5: I'm typing "weather today" and pressing Enter
Step 6: Look! The search results appear!

PHASE 2 - YOUR TURN:
Now it's YOUR turn to try! I'll reset the screen.
Please repeat what I just showed you:
1. Open the browser
2. Go to google.com
3. Search for "weather today"

I'll watch and grade your performance. Take your time - you've got this!

When you complete the task, type "DONE" and I'll give you your grade.`,
  },
  {
    id: "open-app",
    icon: "📂",
    title: "Open an Application",
    description: "Learn to find and open programs",
    difficulty: "Beginner",
    prompt: `LESSON: How to Open an Application

PHASE 1 - DEMONSTRATION:
Watch me open an application!

Step 1: I'm looking at the desktop
Step 2: I see the application menu at the bottom
Step 3: I'm clicking on "Applications" menu
Step 4: I'm finding "Text Editor" 
Step 5: I'm clicking to open it
Step 6: The text editor is now open!

PHASE 2 - YOUR TURN:
Now YOU try! I'll close everything first.
Please repeat these steps:
1. Find the Applications menu
2. Open the Text Editor

Take your time. When done, type "DONE" for your grade!`,
  },
  {
    id: "type-save",
    icon: "💾",
    title: "Type and Save a File",
    description: "Learn to write and save your work",
    difficulty: "Beginner",
    prompt: `LESSON: How to Type and Save a File

PHASE 1 - DEMONSTRATION:
I'll show you how to type and save!

Step 1: Opening a text editor
Step 2: Clicking in the text area
Step 3: Typing "Hello World!"
Step 4: Clicking File menu
Step 5: Clicking "Save As"
Step 6: Typing a filename "my_file.txt"
Step 7: Clicking Save button
Step 8: Done! The file is saved!

PHASE 2 - YOUR TURN:
Now it's your turn to practice!
1. Open a text editor
2. Type "Hello World!"
3. Save it as "my_file.txt"

Type "DONE" when finished for your grade!`,
  },
  {
    id: "copy-paste",
    icon: "📋",
    title: "Copy and Paste",
    description: "Learn the most useful computer trick",
    difficulty: "Beginner",
    prompt: `LESSON: How to Copy and Paste

PHASE 1 - DEMONSTRATION:
Copy and paste is super useful! Watch me!

Step 1: Opening a text editor
Step 2: Typing "Copy this text"
Step 3: Selecting the text by clicking and dragging
Step 4: Right-clicking and choosing "Copy" (or Ctrl+C)
Step 5: Clicking at a new location
Step 6: Right-clicking and choosing "Paste" (or Ctrl+V)
Step 7: The text appears twice!

PHASE 2 - YOUR TURN:
Your turn to try!
1. Type some text
2. Select it
3. Copy it
4. Paste it somewhere else

Type "DONE" when finished!`,
  },
  {
    id: "browse-files",
    icon: "📁",
    title: "Browse Your Files",
    description: "Learn to find files on your computer",
    difficulty: "Beginner",
    prompt: `LESSON: How to Browse Files

PHASE 1 - DEMONSTRATION:
Let me show you the file browser!

Step 1: Opening the File Manager
Step 2: This shows all your folders
Step 3: Double-clicking a folder opens it
Step 4: I can see files inside
Step 5: I can go back with the back button
Step 6: The path at the top shows where I am

PHASE 2 - YOUR TURN:
Now you explore!
1. Open the File Manager
2. Open any folder
3. Go back to the previous folder

Type "DONE" when you've explored!`,
  },
  {
    id: "take-screenshot",
    icon: "📸",
    title: "Take a Screenshot",
    description: "Capture what's on your screen",
    difficulty: "Intermediate",
    prompt: `LESSON: How to Take a Screenshot

PHASE 1 - DEMONSTRATION:
Screenshots capture your screen! Watch!

Step 1: Opening any application first
Step 2: Now I'll take a screenshot
Step 3: Using the Screenshot tool or pressing Print Screen
Step 4: The screenshot is captured!
Step 5: I can save it as an image

PHASE 2 - YOUR TURN:
Try it yourself!
1. Open any application
2. Take a screenshot
3. Find where it was saved

Type "DONE" when complete!`,
  },
];

export default function Home() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileWithBase64[]>([]);
  const [clippyMessage, setClippyMessage] = useState(
    "Welcome to Clippy's Classroom! 🎓 Pick a lesson - I'll SHOW you first, then YOU try, and I'll grade your work!"
  );
  const [clippyMode, setClippyMode] = useState<"teaching" | "practice" | "grading">("teaching");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tasks/models")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch models: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          console.error("No models available");
          setClippyMessage("⚠️ No AI models are available. Please check your API keys.");
          return;
        }
        setModels(data);
        if (data.length > 0) {
          setSelectedModel(data[0]);
          console.log("Models loaded:", data);
        }
      })
      .catch((err) => {
        console.error("Failed to load models", err);
        setClippyMessage("⚠️ Failed to load AI models. Please check your connection and API keys.");
      });
  }, []);

  const handleStartLesson = async (lesson: typeof LESSONS[0]) => {
    setIsLoading(true);
    setClippyMessage(`Starting "${lesson.title}"... First, watch me demonstrate! 👀`);
    setClippyMode("teaching");

    try {
      if (!selectedModel) {
        throw new Error("No model selected. Please select an AI model first.");
      }
      
      const task = await startTask({
        description: lesson.prompt,
        model: selectedModel,
      });

      if (!task) {
        throw new Error("Failed to create task. The server did not return a task.");
      }

      if (!task.id) {
        throw new Error("Task created but missing ID.");
      }

      router.push(`/tasks/${task.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setClippyMessage(`Oops! ${errorMessage} Please check the browser console for details.`);
      console.error("Error starting lesson:", error);
      
      // Log more details for debugging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          selectedModel,
          lessonTitle: lesson.title,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomRequest = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setClippyMessage("Great question! Let me show you how, then you'll try!");

    try {
      if (!selectedModel) {
        throw new Error("No model selected. Please select an AI model first.");
      }
      
      const lessonPrompt = `LESSON: ${input}

PHASE 1 - DEMONSTRATION:
I will now demonstrate how to: ${input}
Watch each step carefully!

[Perform the task step by step, explaining each action]

PHASE 2 - YOUR TURN:
Now it's YOUR turn to practice!
Please repeat what I just showed you.
Take your time - there's no rush!

When you complete the task, type "DONE" and I'll grade your performance!`;

      const taskData: {
        description: string;
        model: Model;
        files?: FileWithBase64[];
      } = {
        description: lessonPrompt,
        model: selectedModel,
      };

      if (uploadedFiles.length > 0) {
        taskData.files = uploadedFiles;
      }

      const task = await startTask(taskData);

      if (!task) {
        throw new Error("Failed to create task. The server did not return a task.");
      }

      if (!task.id) {
        throw new Error("Task created but missing ID.");
      }

      router.push(`/tasks/${task.id}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setClippyMessage(`Oops! ${errorMessage} Please check the browser console for details.`);
      console.error("Error creating custom lesson:", error);
      
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          selectedModel,
          input,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (files: FileWithBase64[]) => {
    setUploadedFiles(files);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#008080]">
      <div className="flex-1 p-4 overflow-hidden">
        {/* Main Window */}
        <div className="win98-window h-full flex flex-col">
          <Header />

          <main className="flex-1 overflow-hidden bg-[#c0c0c0]">
            <div className="h-full p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-auto win98-scrollbar">
              {/* Left Side - Lessons */}
              <div className="flex flex-col gap-4">
                {/* How It Works Panel */}
                <div className="win98-window">
                  <div className="win98-titlebar">
                    <span>📖 How Lessons Work</span>
                  </div>
                  <div className="p-3 bg-[#c0c0c0]">
                    <div className="flex gap-4 justify-center text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-[#000080] text-white flex items-center justify-center font-bold">1</div>
                        <span className="text-[10px] mt-1">👀 WATCH</span>
                        <span className="text-[9px] text-gray-600">I demonstrate</span>
                      </div>
                      <div className="text-xl self-center">→</div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-[#808000] text-white flex items-center justify-center font-bold">2</div>
                        <span className="text-[10px] mt-1">✋ PRACTICE</span>
                        <span className="text-[9px] text-gray-600">You try it</span>
                      </div>
                      <div className="text-xl self-center">→</div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-[#008000] text-white flex items-center justify-center font-bold">3</div>
                        <span className="text-[10px] mt-1">📊 GRADE</span>
                        <span className="text-[9px] text-gray-600">Get scored!</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="win98-window flex-1 overflow-hidden flex flex-col">
                  <div className="win98-titlebar">
                    <span>📚 Choose a Lesson</span>
                  </div>
                  <div className="flex-1 overflow-auto p-2 bg-[#c0c0c0] win98-scrollbar">
                    <div className="grid grid-cols-1 gap-2">
                      {LESSONS.map((lesson) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleStartLesson(lesson)}
                          disabled={isLoading}
                          className="win98-outset p-3 text-left hover:bg-[#d0d0d0] disabled:opacity-50 flex items-start gap-3"
                        >
                          <span className="text-2xl">{lesson.icon}</span>
                          <div className="flex-1">
                            <div className="font-bold text-sm">{lesson.title}</div>
                            <div className="text-[10px] text-gray-600">{lesson.description}</div>
                            <div className="mt-1">
                              <span className="text-[9px] px-2 py-0.5 bg-[#000080] text-white">
                                {lesson.difficulty}
                              </span>
                            </div>
                          </div>
                          <div className="text-[10px] text-gray-500">
                            Click to Start →
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Question */}
                {!showCustomInput ? (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="win98-button w-full py-2"
                  >
                    ✍️ Ask Clippy to Teach Something Else...
                  </button>
                ) : (
                  <div className="win98-window">
                    <div className="win98-titlebar">
                      <span>✍️ Custom Lesson</span>
                      <button 
                        onClick={() => setShowCustomInput(false)}
                        className="win98-titlebar-btn"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="p-2 bg-[#c0c0c0]">
                      <label className="block text-xs mb-1">What do you want to learn?</label>
                      <div className="win98-inset p-1 mb-2">
                        <ChatInput
                          input={input}
                          isLoading={isLoading}
                          onInputChange={setInput}
                          onSend={handleCustomRequest}
                          onFileUpload={handleFileUpload}
                          minLines={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select
                          value={selectedModel?.name}
                          onValueChange={(val) =>
                            setSelectedModel(models.find((m) => m.name === val) || null)
                          }
                        >
                          <SelectTrigger className="win98-inset text-[10px] h-6 flex-1">
                            <SelectValue placeholder="Select AI" />
                          </SelectTrigger>
                          <SelectContent className="win98-window">
                            {models.map((m) => (
                              <SelectItem key={m.name} value={m.name} className="text-[10px]">
                                {m.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          onClick={handleCustomRequest}
                          disabled={isLoading || !input.trim()}
                          className="win98-button"
                        >
                          Start Lesson
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side - Clippy & Info */}
              <div className="flex flex-col gap-4">
                {/* Clippy */}
                <div className="win98-window">
                  <div className="win98-titlebar">
                    <span>🎓 Your Teacher</span>
                  </div>
                  <div className="p-4 bg-[#c0c0c0] flex flex-col items-center">
                    <Clippy 
                      message={clippyMessage}
                      showBubble={true}
                      size="lg"
                      mode={clippyMode}
                    />
                  </div>
                </div>

                {/* Grading Info */}
                <div className="win98-window">
                  <div className="win98-titlebar">
                    <span>📊 Grading System</span>
                  </div>
                  <div className="p-3 bg-[#c0c0c0]">
                    <div className="report-card">
                      <div className="report-card-header">
                        <div className="report-card-title">🏆 How Grades Work</div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="report-card-row">
                          <span>⭐⭐⭐⭐⭐ 100%</span>
                          <span className="grade-a font-bold">A - Perfect!</span>
                        </div>
                        <div className="report-card-row">
                          <span>⭐⭐⭐⭐ 80-99%</span>
                          <span className="grade-b font-bold">B - Great Job!</span>
                        </div>
                        <div className="report-card-row">
                          <span>⭐⭐⭐ 60-79%</span>
                          <span className="grade-c font-bold">C - Good Try!</span>
                        </div>
                        <div className="report-card-row">
                          <span>⭐⭐ 40-59%</span>
                          <span className="grade-d font-bold">D - Keep Practicing</span>
                        </div>
                        <div className="report-card-row">
                          <span>⭐ 0-39%</span>
                          <span className="grade-f font-bold">Try Again!</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-400 text-[10px] text-center">
                        Complete the same steps I show you to get 100%!
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="win98-inset p-3">
                  <p className="text-[10px]">
                    <strong>💡 Tip:</strong> Don&apos;t worry about speed! 
                    Take your time and follow each step carefully. 
                    You can always try a lesson again to improve your grade!
                  </p>
                </div>
              </div>
            </div>
          </main>

          {/* Status Bar */}
          <div className="win98-statusbar">
            <div className="win98-statusbar-panel">
              Ready to learn!
            </div>
            <div className="win98-statusbar-panel w-32">
              {LESSONS.length} Lessons Available
            </div>
            <div className="win98-statusbar-panel w-24 text-right">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>

      {/* Windows 98 Taskbar */}
      <div className="win98-taskbar">
        <button className="win98-start-btn">
          <span className="text-base">🪟</span>
          <span>Start</span>
        </button>
        <div className="h-full w-px bg-[#808080]" />
        <div className="flex-1 flex gap-1">
          <div className="win98-button text-[10px] py-0.5 px-2 bg-[#dfdfdf]">
            📎 Clippy&apos;s Classroom
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
