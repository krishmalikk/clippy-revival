"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskTabs, TabKey, TAB_CONFIGS } from "@/components/tasks/TaskTabs";
import { Pagination } from "@/components/ui/pagination";
import { fetchTasks, fetchTaskCounts } from "@/utils/taskUtils";
import { Task } from "@/types";
import Link from "next/link";
import { Suspense } from "react";
import { ClippyMini } from "@/components/Clippy";

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getInitialTab = (): TabKey => {
    const tabParam = searchParams.get("tab");
    if (tabParam && Object.keys(TAB_CONFIGS).includes(tabParam)) {
      return tabParam as TabKey;
    }
    return "ALL";
  };

  const [activeTab, setActiveTab] = useState<TabKey>(getInitialTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [taskCounts, setTaskCounts] = useState<Record<TabKey, number>>({
    ALL: 0,
    ACTIVE: 0,
    COMPLETED: 0,
    CANCELLED_FAILED: 0,
  });
  const PAGE_SIZE = 10;

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const statuses =
          activeTab === "ALL" ? undefined : TAB_CONFIGS[activeTab].statuses;
        const result = await fetchTasks({
          page: currentPage,
          limit: PAGE_SIZE,
          statuses,
        });
        setTasks(result.tasks);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [currentPage, activeTab]);

  useEffect(() => {
    const loadTaskCounts = async () => {
      try {
        const counts = await fetchTaskCounts();
        setTaskCounts(counts);
      } catch (error) {
        console.error("Failed to load task counts:", error);
      }
    };

    loadTaskCounts();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const newTab: TabKey =
      tabParam && Object.keys(TAB_CONFIGS).includes(tabParam)
        ? (tabParam as TabKey)
        : "ALL";

    if (newTab !== activeTab) {
      setActiveTab(newTab);
      setCurrentPage(1);
    }
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentPage(1);

    const newSearchParams = new URLSearchParams(searchParams);
    if (tab === "ALL") {
      newSearchParams.delete("tab");
    } else {
      newSearchParams.set("tab", tab);
    }

    const newUrl = `/tasks${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ""}`;
    router.push(newUrl, { scroll: false });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Mock grades for demonstration (in real app, store in DB)
  const getRandomGrade = (taskId: string) => {
    const hash = taskId.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const grades = ['A', 'A', 'B', 'B', 'B', 'C', 'A'];
    return grades[hash % grades.length];
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'grade-a';
      case 'B': return 'grade-b';
      case 'C': return 'grade-c';
      case 'D': return 'grade-d';
      default: return 'grade-f';
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#008080]">
      <div className="flex-1 p-4 overflow-hidden">
        <div className="win98-window h-full flex flex-col">
          <Header />

          <main className="flex-1 overflow-auto bg-[#c0c0c0] p-4 win98-scrollbar">
            <div className="max-w-4xl mx-auto">
              {/* Title */}
              <div className="win98-window mb-4">
                <div className="win98-titlebar">
                  <span>📚 My Lessons & Grades</span>
                </div>
                <div className="p-3 bg-[#c0c0c0]">
                  <div className="flex items-center gap-3">
                    <ClippyMini />
                    <div>
                      <span className="text-xs font-bold">
                        Your lesson history and grades are shown here!
                      </span>
                      <p className="text-[10px] text-gray-600">
                        Click any lesson to review it or try again for a better grade.
                      </p>
                    </div>
                    <Link href="/" className="ml-auto">
                      <button className="win98-button">
                        ➕ New Lesson
                      </button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Report Card Summary */}
              <div className="win98-window mb-4">
                <div className="win98-titlebar">
                  <span>📊 Report Card</span>
                </div>
                <div className="p-3 bg-[#c0c0c0]">
                  <div className="report-card">
                    <div className="flex justify-around text-center">
                      <div>
                        <div className="text-2xl font-bold text-[#000080]">{total}</div>
                        <div className="text-[10px]">Total Lessons</div>
                      </div>
                      <div className="w-px bg-gray-400" />
                      <div>
                        <div className="text-2xl font-bold grade-a">{taskCounts.COMPLETED}</div>
                        <div className="text-[10px]">Completed</div>
                      </div>
                      <div className="w-px bg-gray-400" />
                      <div>
                        <div className="text-2xl font-bold text-[#808000]">{taskCounts.ACTIVE}</div>
                        <div className="text-[10px]">In Progress</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              {!isLoading && (
                <div className="mb-4">
                  <TaskTabs
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    taskCounts={taskCounts}
                  />
                </div>
              )}

              {/* Lessons List */}
              <div className="win98-window">
                <div className="win98-titlebar">
                  <span>📋 {TAB_CONFIGS[activeTab]?.label || "All"} Lessons ({total})</span>
                </div>
                <div className="p-2 bg-[#c0c0c0]">
                  {isLoading ? (
                    <div className="win98-inset p-8 text-center">
                      <p className="text-xs">⏳ Loading lessons...</p>
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="win98-inset p-8 text-center">
                      <p className="text-xs mb-2">📭 No lessons yet!</p>
                      <p className="text-[10px] text-gray-600 mb-4">
                        Start your first lesson to begin learning!
                      </p>
                      <Link href="/">
                        <button className="win98-button">
                          🎓 Start Learning
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="win98-inset bg-white">
                        {tasks.map((task, index) => (
                          <div 
                            key={task.id}
                            className={`flex items-center gap-2 p-2 border-b border-gray-300 ${index % 2 === 0 ? 'bg-white' : 'bg-[#f0f0f0]'}`}
                          >
                            {/* Grade Badge */}
                            <div className={`lesson-card-grade-badge ${getGradeColor(getRandomGrade(task.id))} relative`} style={{ position: 'static' }}>
                              {getRandomGrade(task.id)}
                            </div>
                            
                            {/* Task Info */}
                            <div className="flex-1">
                              <TaskItem task={task} />
                            </div>
                            
                            {/* Stars */}
                            <div className="star-rating">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                  key={star} 
                                  className={`star ${star <= (getRandomGrade(task.id) === 'A' ? 5 : getRandomGrade(task.id) === 'B' ? 4 : 3) ? 'star-filled' : ''}`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalPages > 1 && (
                        <div className="mt-3">
                          <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            total={total}
                            pageSize={PAGE_SIZE}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Status Bar */}
          <div className="win98-statusbar">
            <div className="win98-statusbar-panel">
              {total} lesson(s) taken
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
          <div className="win98-button text-[10px] py-0.5 px-2 bg-[#dfdfdf]">
            📚 My Lessons
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

function TasksPageFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#008080]">
      <div className="win98-window p-8">
        <p className="text-xs">⏳ Loading...</p>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<TasksPageFallback />}>
      <TasksPageContent />
    </Suspense>
  );
}
