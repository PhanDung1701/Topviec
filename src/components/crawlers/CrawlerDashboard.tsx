"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Activity,
  RefreshCw,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Terminal,
  ShieldCheck,
  ChevronLeft,
  Search,
  Hash,
  Database,
  ArrowUpRight,
  Zap,
  CalendarCheck,
} from "lucide-react";
import { CrawlerLogEntry, CrawlerStatus, PlatformSource } from "@/types/job";
import { INITIAL_CRAWLER_LOGS, INITIAL_CRAWLER_STATUSES } from "@/data/mockCrawlers";
import { PLATFORM_CONFIGS } from "@/utils/platforms";
import { formatTimeAgo, generateFingerprint } from "@/utils/formatters";

export const CrawlerDashboard: React.FC = () => {
  const [crawlers, setCrawlers] = useState<CrawlerStatus[]>(INITIAL_CRAWLER_STATUSES);
  const [logs, setLogs] = useState<CrawlerLogEntry[]>(INITIAL_CRAWLER_LOGS);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<PlatformSource | null>(null);

  // Hash calculator test state
  const [testTitle, setTestTitle] = useState("Senior Full-stack Engineer");
  const [testCompany, setTestCompany] = useState("VNG Corporation");
  const [testCity, setTestCity] = useState("Hồ Chí Minh");

  const computedHash = generateFingerprint(testTitle, testCompany, testCity);

  // Trigger sync for a specific platform
  const handleTriggerSync = (platformKey: PlatformSource) => {
    setSyncingPlatform(platformKey);

    setTimeout(() => {
      const addedJobs = Math.floor(Math.random() * 25) + 10;
      const deduplicated = Math.floor(Math.random() * 6) + 1;

      // Update crawler status
      setCrawlers((prev) =>
        prev.map((c) => {
          if (c.platform === platformKey) {
            return {
              ...c,
              status: "ACTIVE",
              lastSync: new Date().toISOString(),
              newJobsPastHour: c.newJobsPastHour + addedJobs,
              deduplicatedCount: c.deduplicatedCount + deduplicated,
              totalActiveJobs: c.totalActiveJobs + addedJobs,
            };
          }
          return c;
        })
      );

      // Add log
      const newLog: CrawlerLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        platform: platformKey,
        level: "SUCCESS",
        message: `[${PLATFORM_CONFIGS[platformKey].name}] Hoàn tất đồng bộ thủ công: +${addedJobs} việc làm mới, ${deduplicated} tin trùng đã gộp mã vân tay.`,
        details: `Tốc độ: 52 jobs/sec • Khớp fingerprint hash 100% không trùng lặp.`,
      };

      setLogs((prev) => [newLog, ...prev]);
      setSyncingPlatform(null);
    }, 1200);
  };

  // Trigger sync all
  const handleSyncAll = () => {
    setIsSyncingAll(true);

    setTimeout(() => {
      let totalNew = 0;
      let totalDedup = 0;

      setCrawlers((prev) =>
        prev.map((c) => {
          const added = Math.floor(Math.random() * 20) + 12;
          const dedup = Math.floor(Math.random() * 5) + 1;
          totalNew += added;
          totalDedup += dedup;
          return {
            ...c,
            lastSync: new Date().toISOString(),
            newJobsPastHour: c.newJobsPastHour + added,
            deduplicatedCount: c.deduplicatedCount + dedup,
            totalActiveJobs: c.totalActiveJobs + added,
            status: "ACTIVE",
          };
        })
      );

      const newLog: CrawlerLogEntry = {
        id: `log-all-${Date.now()}`,
        timestamp: new Date().toISOString(),
        platform: "TOPCV",
        level: "SUCCESS",
        message: `ĐỒNG BỘ TOÀN BỘ 8 NGUỒN THÀNH CÔNG: Tổng cộng +${totalNew} việc làm mới được lưu, +${totalDedup} tin đăng trùng đã gộp.`,
        details: "TopCV, VietnamWorks, Vieclam24h, CareerViet, JobsGO, CareerLink, Joboko, Indeed đều ở trạng thái ACTIVE (100%).",
      };

      setLogs((prev) => [newLog, ...prev]);
      setIsSyncingAll(false);
    }, 2000);
  };

  // Aggregate stats
  const totalJobs = crawlers.reduce((acc, c) => acc + c.totalActiveJobs, 0);
  const totalNewHourly = crawlers.reduce((acc, c) => acc + c.newJobsPastHour, 0);
  const totalDeduplicated = crawlers.reduce((acc, c) => acc + c.deduplicatedCount, 0);
  const avgHealth = (
    crawlers.reduce((acc, c) => acc + c.healthPercent, 0) / crawlers.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* Top Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 shadow-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Về Trang Tìm Việc</span>
            </Link>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
                <Activity className="h-4 w-4" />
              </div>
              <h1 className="text-base font-bold text-slate-900 dark:text-white">
                TopViec IT • Crawler & Scraper Manager
              </h1>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                100% IT Pipeline Active
              </span>
            </div>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingAll ? "animate-spin" : ""}`} />
            <span>{isSyncingAll ? "Đang đồng bộ 8 nguồn IT..." : "Chạy Đồng Bộ Toàn Bộ IT (Trigger All)"}</span>
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Tổng việc làm IT đang kích hoạt</span>
              <Database className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
              {totalJobs.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <span>↑ Không giới hạn số lượng tin</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Việc làm IT mới lấy về (1 giờ)</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
              +{totalNewHourly.toLocaleString()} tin
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Chu kỳ cào: 60 phút/lần từ 8 sàn
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Tin hết hạn đã lọc bỏ (&gt; 1 tháng)</span>
              <CalendarCheck className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
              1,840 tin
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              ✓ Đảm bảo 100% tin còn hạn nộp hồ sơ
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Tin trùng lặp IT đã gộp (Deduplicated)</span>
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
              {totalDeduplicated.toLocaleString()} tin
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Khớp mã vân tay đa nền tảng
            </div>
          </div>
        </div>

        {/* 8 Crawler Pipelines Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Tiến Trình Cào Dữ Liệu Theo Giờ (8 Nguồn)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi thời gian đồng bộ gần nhất, số lượng tin mới và kích hoạt cào thủ công từng nguồn
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {crawlers.map((crawler) => {
              const platformConfig = PLATFORM_CONFIGS[crawler.platform];
              const isSyncing = syncingPlatform === crawler.platform || isSyncingAll;

              return (
                <div
                  key={crawler.platform}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-4 flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-black shadow-xs ${platformConfig.badgeBg} ${platformConfig.badgeText}`}
                      >
                        {platformConfig.logoLetter} • {platformConfig.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {isSyncing ? "SYNCING..." : crawler.status}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`https://${crawler.targetDomain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <span>{crawler.targetDomain}</span>
                      <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-2 py-2 border-y border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Chạy gần nhất:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatTimeAgo(crawler.lastSync)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Mới lấy (1 giờ):</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{crawler.newJobsPastHour} tin
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Trùng lặp đã gộp:</span>
                      <span className="font-semibold text-purple-600 dark:text-purple-400">
                        {crawler.deduplicatedCount} tin
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tổng đang lưu:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {crawler.totalActiveJobs.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleTriggerSync(crawler.platform)}
                    disabled={isSyncing}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Đang cào..." : "Chạy đồng bộ ngay"}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deduplication & Fingerprint Hash Architecture Showcase */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Hash className="h-5 w-5 text-indigo-600" />
                Kiến Trúc Chống Trùng Lặp Tin Tuyển Dụng (Fingerprint Deduplication)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Thuật toán tạo mã băm chuẩn hóa loại bỏ dấu tiếng Việt để phát hiện 1 công ty đăng cùng 1 tin trên nhiều sàn
              </p>
            </div>
            <div className="rounded-full bg-indigo-50 border border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              Fingerprint Hash = MD5(Normalized_Title + Company + City)
            </div>
          </div>

          {/* Interactive Hash Simulator */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-4 space-y-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Thử nghiệm trực tiếp thuật toán băm vân tay:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Tiêu đề công việc:
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Tên công ty:
                </label>
                <input
                  type="text"
                  value={testCompany}
                  onChange={(e) => setTestCompany(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Thành phố:
                </label>
                <input
                  type="text"
                  value={testCity}
                  onChange={(e) => setTestCity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-900 text-white p-3 text-xs font-mono">
              <span className="text-slate-400">Kết quả Fingerprint Hash:</span>
              <span className="text-emerald-400 font-bold">{computedHash}</span>
            </div>
          </div>
        </div>

        {/* Live Crawler Logs Terminal */}
        <div className="rounded-3xl border border-slate-900 bg-slate-950 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Live Crawler Ingestion Stream (Log Terminal)</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Streaming logs realtime</span>
            </div>
          </div>

          <div className="font-mono text-xs space-y-2 max-h-64 overflow-y-auto pr-2">
            {logs.map((log) => {
              const platformConfig = PLATFORM_CONFIGS[log.platform];
              return (
                <div key={log.id} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString("vi-VN")}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${platformConfig.badgeBg} ${platformConfig.badgeText}`}
                    >
                      {log.platform}
                    </span>
                    <span
                      className={
                        log.level === "SUCCESS"
                          ? "text-emerald-400 font-bold"
                          : log.level === "WARN"
                          ? "text-amber-400 font-bold"
                          : log.level === "ERROR"
                          ? "text-rose-400 font-bold"
                          : "text-blue-400"
                      }
                    >
                      [{log.level}]
                    </span>
                    <span className="text-slate-200 text-xs">{log.message}</span>
                  </div>
                  {log.details && (
                    <div className="text-[11px] text-slate-400 pl-2 border-l-2 border-slate-700 ml-4">
                      {log.details}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
