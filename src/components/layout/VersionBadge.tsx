"use client";

import React, { useState, useEffect, useRef } from "react";
import { Copy, Check, Info, ExternalLink, X, Activity, ShieldCheck, Clock } from "lucide-react";
import { APP_VERSION_CONFIG } from "@/config/version";

export const VersionBadge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCopyVersion = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${APP_VERSION_CONFIG.name} ${APP_VERSION_CONFIG.displayVersion} (${APP_VERSION_CONFIG.buildId})`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-3 left-3 z-40 select-none print:hidden font-sans"
      aria-label="Thông tin phiên bản ứng dụng"
    >
      {/* Expanded Version Info Card */}
      {isOpen && (
        <div className="mb-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-150 text-slate-800 dark:text-slate-100">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Activity className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-none">{APP_VERSION_CONFIG.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Hệ thống thông tin phiên bản</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition"
              title="Đóng"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-2 py-2.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Phiên bản hiện tại:</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                  {APP_VERSION_CONFIG.displayVersion}
                </span>
                <button
                  onClick={handleCopyVersion}
                  className="text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 p-0.5 rounded transition"
                  title="Sao chép phiên bản"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Môi trường:</span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {APP_VERSION_CONFIG.channel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                Chu kỳ thu thập:
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Mỗi 6 tiếng</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-slate-400" />
                URL gốc tin tuyển:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">100% Trực tiếp</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Phát hành:</span>
              <span className="text-slate-600 dark:text-slate-400 font-mono text-[10px]">{APP_VERSION_CONFIG.releaseDate}</span>
            </div>
          </div>

          {/* Quick Action Link */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
            <span className="text-slate-400">Crawler Dashboard</span>
            <a
              href="/admin/crawlers"
              className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
            >
              Chi tiết crawler
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}

      {/* Main Bottom-Left Pill Badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title={`TopViec ${APP_VERSION_CONFIG.displayVersion} - Nhấp để xem thông tin chi tiết`}
        className={`group inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-mono shadow-xs backdrop-blur-md transition-all duration-200 cursor-pointer ${
          isOpen
            ? "border-emerald-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-2 ring-emerald-500/20"
            : "border-slate-200/90 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 hover:border-emerald-400/60 hover:text-slate-900 dark:hover:text-slate-100 hover:shadow-md"
        }`}
      >
        {/* Pulsing Live Status Dot */}
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>

        {/* Version Text */}
        <span className="font-semibold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {APP_VERSION_CONFIG.displayVersion}
        </span>

        {/* Small badge */}
        <span className="rounded bg-slate-100 dark:bg-slate-800 px-1 py-0.2 text-[9px] font-sans font-medium text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/60 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          ver
        </span>
      </button>
    </div>
  );
};
