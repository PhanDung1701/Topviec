"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Bot, Briefcase, Activity, BookmarkCheck, Upload, CheckCircle2 } from "lucide-react";
import { UserCVProfile } from "@/types/job";

interface NavbarProps {
  activeCV: UserCVProfile | null;
  onOpenCvModal: () => void;
  savedJobsCount: number;
  onToggleSavedModal?: () => void;
  activeTab?: "jobs" | "admin";
}

export const Navbar: React.FC<NavbarProps> = ({
  activeCV,
  onOpenCvModal,
  savedJobsCount,
  activeTab = "jobs",
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2.5 transition">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Top<span className="text-emerald-600 dark:text-emerald-400">Viec</span>
                  <span className="ml-1 text-indigo-600 dark:text-indigo-400">IT</span>
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                  AI Aggregator
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block">
                3 nguồn trực tiếp • 5 nguồn đã đồng bộ
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              href="/"
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
                activeTab === "jobs"
                  ? "bg-slate-100 text-emerald-700 font-semibold dark:bg-slate-800 dark:text-emerald-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Việc Làm IT</span>
              <span className="rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.2 text-[11px] font-bold">
                Mới nhất
              </span>
            </Link>

            <button
              onClick={onOpenCvModal}
              className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50 transition"
            >
              <Bot className="h-4 w-4 text-indigo-500" />
              <span>AI CV Matcher</span>
              <span className="rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.2 text-[11px] font-bold">
                Hot
              </span>
            </button>

            <Link
              href="/admin/crawlers"
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 transition ${
                activeTab === "admin"
                  ? "bg-slate-100 text-indigo-700 font-semibold dark:bg-slate-800 dark:text-indigo-400"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/50"
              }`}
            >
              <Activity className="h-4 w-4 text-amber-500" />
              <span>Crawler Monitor</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </Link>
          </nav>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {/* Active CV indicator or Upload Button */}
          {activeCV ? (
            <button
              onClick={onOpenCvModal}
              className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-emerald-800 shadow-sm transition hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-950/50 dark:text-emerald-300"
              title="Nhấn để đổi CV hoặc xem kỹ năng đã phân tích"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div className="text-left hidden sm:block">
                <span className="block font-semibold leading-tight line-clamp-1 max-w-[120px]">
                  {activeCV.fullName}
                </span>
                <span className="block text-[10px] text-emerald-600 dark:text-emerald-400">
                  {activeCV.skills.length} kỹ năng đã nhận diện
                </span>
              </div>
              <span className="rounded bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 font-bold">
                Đang khớp
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenCvModal}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md shadow-emerald-600/25 transition hover:brightness-105 active:scale-95"
            >
              <Upload className="h-4 w-4" />
              <span>Tải CV & Khớp AI</span>
            </button>
          )}

          {/* Saved Jobs Counter */}
          <div
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:text-slate-300"
            title="Số việc làm bạn đã đánh dấu"
          >
            <BookmarkCheck className="h-4 w-4 text-amber-500" />
            <span className="font-semibold">{savedJobsCount}</span>
            <span className="hidden sm:inline text-slate-500">đã lưu</span>
          </div>
        </div>
      </div>
    </header>
  );
};
