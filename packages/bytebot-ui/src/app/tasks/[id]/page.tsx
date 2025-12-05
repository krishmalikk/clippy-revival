"use client";

import React, { useEffect, useRef, useState } from "react";
import { Header } from "@/components/layout/Header";
import { ChatContainer } from "@/components/messages/ChatContainer";
import { DesktopContainer } from "@/components/ui/desktop-container";
import { useChatSession } from "@/hooks/useChatSession";
import { useScrollScreenshot } from "@/hooks/useScrollScreenshot";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Role, TaskStatus } from "@/types";
import { VirtualDesktopStatus } from "@/components/VirtualDesktopStatusHeader";
import { Clippy } from "@/components/Clippy";

export default function TaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const [lessonPhase, setLessonPhase] = useState<"watching" | "practicing" | "graded">("watching");
  const [grade, setGrade] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    groupedMessages,
    taskStatus,
    control,
    input,
    setInput,
    isLoading,
    isLoadingSession,
    isLoadingMoreMessages,
    hasMoreMessages,
    loadMoreMessages,
    handleAddMessage,
    handleTakeOverTask,
    handleResumeTask,
    handleCancelTask,
    currentTaskId,
  } = useChatSession({ initialTaskId: taskId });

  function isTaskInactive(): boolean {
    return (
      taskStatus === TaskStatus.COMPLETED ||
      taskStatus === TaskStatus.FAILED ||
      taskStatus === TaskStatus.CANCELLED
    );
  }

  function canTakeOver(): boolean {
    return control === Role.ASSISTANT && taskStatus === TaskStatus.RUNNING;
  }

  function hasUserControl(): boolean {
    return (
      control === Role.USER &&
      (taskStatus === TaskStatus.RUNNING ||
        taskStatus === TaskStatus.NEEDS_HELP)
    );
  }

  function canCancel(): boolean {
    return (
      taskStatus === TaskStatus.RUNNING || taskStatus === TaskStatus.NEEDS_HELP
    );
  }

  function vncViewOnly(): boolean {
    return !hasUserControl();
  }

  const { currentScreenshot } = useScrollScreenshot({
    messages,
    scrollContainerRef: chatContainerRef,
  });

  useEffect(() => {
    if (isTaskInactive() && hasMoreMessages && !isLoadingMoreMessages) {
      loadMoreMessages();
    }
  }, [
    isTaskInactive(),
    hasMoreMessages,
    isLoadingMoreMessages,
    loadMoreMessages,
  ]);

  const messageIdToIndex = React.useMemo(() => {
    const map: Record<string, number> = {};
    messages.forEach((msg, idx) => {
      map[msg.id] = idx;
    });
    return map;
  }, [messages]);

  useEffect(() => {
    if (currentTaskId && currentTaskId !== taskId) {
      router.push(`/tasks/${currentTaskId}`);
    }
  }, [currentTaskId, taskId, router]);

  // Update phase based on control
  useEffect(() => {
    if (hasUserControl()) {
      setLessonPhase("practicing");
    } else if (isTaskInactive()) {
      setLessonPhase("graded");
      // Generate a grade (in real app, this would be calculated)
      const grades = ['A', 'A', 'A', 'B', 'B'];
      setGrade(grades[Math.floor(Math.random() * grades.length)]);
    } else {
      setLessonPhase("watching");
    }
  }, [control, taskStatus, hasUserControl, isTaskInactive]);

  const getPhaseInfo = () => {
    switch (lessonPhase) {
      case "watching":
        return { 
          emoji: "👀", 
          text: "WATCH MODE", 
          color: "bg-[#000080]",
          message: "Watch carefully! I'm showing you how to do this step by step."
        };
      case "practicing":
        return { 
          emoji: "✋", 
          text: "YOUR TURN!", 
          color: "bg-[#808000]",
          message: "Now YOU try it! Repeat what I just showed you."
        };
      case "graded":
        return { 
          emoji: "📊", 
          text: `GRADE: ${grade}`, 
          color: grade === 'A' ? "bg-[#008000]" : grade === 'B' ? "bg-[#000080]" : "bg-[#808000]",
          message: grade === 'A' ? "🎉 PERFECT! You got 100%!" : grade === 'B' ? "Great job! Almost perfect!" : "Good try! Practice more!"
        };
      default:
        return { emoji: "📋", text: "Loading...", color: "bg-[#808080]", message: "Please wait..." };
    }
  };

  const phase = getPhaseInfo();

  const getClippyMode = (): "teaching" | "practice" | "grading" => {
    if (lessonPhase === "watching") return "teaching";
    if (lessonPhase === "practicing") return "practice";
    return "grading";
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#008080]">
      <div className="flex-1 p-4 overflow-hidden">
        <div className="win98-window h-full flex flex-col">
          <Header />

          <main className="flex-1 overflow-hidden bg-[#c0c0c0] p-2">
            {/* Phase Banner */}
            <div className={`${phase.color} text-white text-center py-2 mb-2 font-bold flex items-center justify-center gap-4`}>
              <span className="text-xl">{phase.emoji}</span>
              <span>{phase.text}</span>
              <span className="text-xl">{phase.emoji}</span>
              
              {/* Control Buttons */}
              <div className="ml-auto flex gap-2 pr-2">
                {canTakeOver() && (
                  <button 
                    onClick={handleTakeOverTask}
                    className="win98-button text-black text-[10px]"
                  >
                    ✋ My Turn!
                  </button>
                )}
                {hasUserControl() && (
                  <button 
                    onClick={handleResumeTask}
                    className="win98-button text-black text-[10px]"
                  >
                    ✓ Done! Grade Me
                  </button>
                )}
                {canCancel() && (
                  <button 
                    onClick={handleCancelTask}
                    className="win98-button text-black text-[10px]"
                  >
                    ⏹️ Stop
                  </button>
                )}
              </div>
            </div>

            <div className="h-full grid grid-cols-1 lg:grid-cols-5 gap-2" style={{ height: 'calc(100% - 50px)' }}>
              {/* Desktop View */}
              <div className="lg:col-span-3 flex flex-col">
                <div className="win98-window flex-1 flex flex-col overflow-hidden">
                  <div className="win98-titlebar">
                    <span>
                      {lessonPhase === "watching" && "👀 Watch Clippy Demonstrate"}
                      {lessonPhase === "practicing" && "✋ Your Turn - Practice!"}
                      {lessonPhase === "graded" && "📊 Lesson Complete!"}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <DesktopContainer
                      screenshot={isTaskInactive() ? currentScreenshot : null}
                      viewOnly={vncViewOnly()}
                      status={
                        (() => {
                          if (taskStatus === TaskStatus.RUNNING && control === Role.USER)
                            return "user_control";
                          if (taskStatus === TaskStatus.RUNNING) return "running";
                          if (taskStatus === TaskStatus.NEEDS_HELP) return "needs_attention";
                          if (taskStatus === TaskStatus.FAILED) return "failed";
                          if (taskStatus === TaskStatus.CANCELLED) return "canceled";
                          if (taskStatus === TaskStatus.COMPLETED) return "completed";
                          return "pending";
                        })() as VirtualDesktopStatus
                      }
                    >
                      {/* Buttons moved to banner */}
                    </DesktopContainer>
                  </div>
                </div>
              </div>

              {/* Right Panel */}
              <div className="lg:col-span-2 flex flex-col gap-2 overflow-hidden">
                {/* Clippy */}
                <div className="win98-window">
                  <div className="win98-titlebar">
                    <span>🎓 Clippy</span>
                  </div>
                  <div className="p-2 bg-[#c0c0c0] flex justify-center">
                    <Clippy 
                      message={phase.message}
                      showBubble={true}
                      size="sm"
                      mode={getClippyMode()}
                    />
                  </div>
                </div>

                {/* Grade Display (when graded) */}
                {lessonPhase === "graded" && grade && (
                  <div className="win98-window">
                    <div className="win98-titlebar">
                      <span>🏆 Your Grade</span>
                    </div>
                    <div className="p-3 bg-[#c0c0c0]">
                      <div className="report-card text-center">
                        <div className={`grade-score ${grade === 'A' ? 'grade-a' : grade === 'B' ? 'grade-b' : 'grade-c'}`}>
                          {grade}
                        </div>
                        <div className="star-rating justify-center mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span 
                              key={star} 
                              className={`star text-2xl ${star <= (grade === 'A' ? 5 : grade === 'B' ? 4 : 3) ? 'star-filled' : ''}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <p className="text-xs mt-2">
                          {grade === 'A' ? '100% - Perfect!' : grade === 'B' ? '85% - Great Job!' : '70% - Good Try!'}
                        </p>
                        <div className="mt-3 flex gap-2 justify-center">
                          <Link href="/">
                            <button className="win98-button text-[10px]">
                              📚 New Lesson
                            </button>
                          </Link>
                          <button 
                            onClick={() => window.location.reload()}
                            className="win98-button text-[10px]"
                          >
                            🔄 Try Again
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Chat / Steps */}
                <div className="win98-window flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0, maxHeight: '100%' }}>
                  <div className="win98-titlebar flex-shrink-0">
                    <span>💬 Lesson Steps</span>
                  </div>
                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden bg-white win98-scrollbar"
                    style={{ 
                      minHeight: 0,
                      maxHeight: '100%',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word'
                    }}
                  >
                    <ChatContainer
                      scrollRef={chatContainerRef}
                      messageIdToIndex={messageIdToIndex}
                      taskId={taskId}
                      input={input}
                      setInput={setInput}
                      isLoading={isLoading}
                      handleAddMessage={handleAddMessage}
                      groupedMessages={groupedMessages}
                      taskStatus={taskStatus}
                      control={control}
                      isLoadingSession={isLoadingSession}
                      isLoadingMoreMessages={isLoadingMoreMessages}
                      hasMoreMessages={hasMoreMessages}
                      loadMoreMessages={loadMoreMessages}
                    />
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Status Bar */}
          <div className="win98-statusbar">
            <div className="win98-statusbar-panel">
              Lesson: {taskId.slice(0, 8)}...
            </div>
            <div className="win98-statusbar-panel">
              Phase: {lessonPhase.toUpperCase()}
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
            📖 Current Lesson
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
