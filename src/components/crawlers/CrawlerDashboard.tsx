"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  RefreshCw,
  Layers,
  Clock,
  Terminal,
  ChevronLeft,
  Hash,
  Database,
  ArrowUpRight,
  Zap,
  CalendarCheck,
} from "lucide-react";
import { CrawlerLogEntry, CrawlerStatus, PlatformSource } from "@/types/job";
import { INITIAL_CRAWLER_STATUSES } from "@/data/mockCrawlers";
import { PLATFORM_CONFIGS } from "@/utils/platforms";
import { formatTimeAgo, generateFingerprint } from "@/utils/formatters";

const LIVE_SOURCES = new Set<PlatformSource>(["TOPCV", "CAREERVIET", "CAREERLINK"]);

interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
  syncedAt?: string;
  sourcesBreakdown?: Partial<Record<PlatformSource, number>>;
  crawlerService?: {
    configured: boolean;
    triggered: boolean;
    error?: string;
  };
}

const EMPTY_CRAWLERS: CrawlerStatus[] = INITIAL_CRAWLER_STATUSES.map((crawler) => ({
  ...crawler,
  status: "IDLE",
  lastSync: "",
  newJobsPastHour: 0,
  deduplicatedCount: 0,
  totalActiveJobs: 0,
  healthPercent: 0,
}));

export const CrawlerDashboard: React.FC = () => {
  const [crawlers, setCrawlers] = useState<CrawlerStatus[]>(EMPTY_CRAWLERS);
  const [logs, setLogs] = useState<CrawlerLogEntry[]>([]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncingPlatform, setSyncingPlatform] = useState<PlatformSource | null>(null);

  // Hash calculator test state
  const [testTitle, setTestTitle] = useState("Senior Full-stack Engineer");
  const [testCompany, setTestCompany] = useState("VNG Corporation");
  const [testCity, setTestCity] = useState("Hồ Chí Minh");

  const computedHash = generateFingerprint(testTitle, testCompany, testCity);

  const applySyncResult = useCallback((data: SyncResponse, platform?: PlatformSource) => {
    const syncedAt = data.syncedAt || new Date().toISOString();
    setCrawlers((previous) =>
      previous.map((crawler) => {
        if (platform && crawler.platform !== platform) return crawler;
        const count = data.sourcesBreakdown?.[crawler.platform] ?? crawler.totalActiveJobs;
        return {
          ...crawler,
          status: count > 0 ? "ACTIVE" : "IDLE",
          lastSync: syncedAt,
          newJobsPastHour: count,
          totalActiveJobs: count,
          healthPercent: count > 0 ? 100 : 0,
        };
      })
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadStatus = async () => {
      try {
        const response = await fetch("/api/jobs", { signal: controller.signal });
        const data = (await response.json()) as SyncResponse;
        if (!response.ok || !data.success) throw new Error(data.error || "Không thể tải trạng thái");
        applySyncResult({ ...data, syncedAt: new Date().toISOString() });
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setLogs([{
          id: `load-error-${Date.now()}`,
          timestamp: new Date().toISOString(),
          platform: "TOPCV",
          level: "ERROR",
          message: error instanceof Error ? error.message : "Không thể tải trạng thái crawler",
        }]);
      }
    };
    void loadStatus();
    return () => controller.abort();
  }, [applySyncResult]);

  // Trigger sync for a specific platform
  const handleTriggerSync = async (platformKey: PlatformSource) => {
    setSyncingPlatform(platformKey);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: platformKey }),
      });
      const data = (await response.json()) as SyncResponse;
      if (!response.ok || !data.success) throw new Error(data.error || "Đồng bộ thất bại");
      applySyncResult(data, platformKey);
      const count = data.sourcesBreakdown?.[platformKey] ?? 0;
      const newLog: CrawlerLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: data.syncedAt || new Date().toISOString(),
        platform: platformKey,
        level: "SUCCESS",
        message: `[${PLATFORM_CONFIGS[platformKey].name}] đã nạp ${count} tin hiện có.`,
        details: LIVE_SOURCES.has(platformKey)
          ? "Nguồn được truy vấn trực tiếp từ trang tuyển dụng."
          : data.crawlerService?.triggered
            ? "Đã gửi yêu cầu tới crawler service ngoài."
            : "Nguồn này đang dùng dữ liệu snapshot gần nhất.",
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (error) {
      setLogs((prev) => [{
        id: `log-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        platform: platformKey,
        level: "ERROR",
        message: error instanceof Error ? error.message : "Đồng bộ thất bại",
      }, ...prev]);
    } finally {
      setSyncingPlatform(null);
    }
  };

  // Trigger sync all
  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = (await response.json()) as SyncResponse;
      if (!response.ok || !data.success) throw new Error(data.error || "Đồng bộ thất bại");
      applySyncResult(data);
      const total = Object.values(data.sourcesBreakdown ?? {}).reduce((sum, value) => sum + (value ?? 0), 0);
      const newLog: CrawlerLogEntry = {
        id: `log-all-${Date.now()}`,
        timestamp: data.syncedAt || new Date().toISOString(),
        platform: "TOPCV",
        level: "SUCCESS",
        message: `Đã nạp ${total} tin từ 8 nguồn.`,
        details: data.crawlerService?.triggered
          ? "Crawler service ngoài đã được kích hoạt."
          : "3 nguồn được truy vấn trực tiếp; 5 nguồn còn lại dùng snapshot.",
      };
      setLogs((prev) => [newLog, ...prev]);
    } catch (error) {
      setLogs((prev) => [{
        id: `log-all-error-${Date.now()}`,
        timestamp: new Date().toISOString(),
        platform: "TOPCV",
        level: "ERROR",
        message: error instanceof Error ? error.message : "Đồng bộ thất bại",
      }, ...prev]);
    } finally {
      setIsSyncingAll(false);
    }
  };

  // Aggregate stats
  const totalJobs = crawlers.reduce((acc, c) => acc + c.totalActiveJobs, 0);
  const liveJobs = crawlers
    .filter((crawler) => LIVE_SOURCES.has(crawler.platform))
    .reduce((acc, crawler) => acc + crawler.totalActiveJobs, 0);
  const snapshotJobs = totalJobs - liveJobs;

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
                3 live • 5 snapshot
              </span>
            </div>
          </div>

          <button
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncingAll ? "animate-spin" : ""}`} />
            <span>{isSyncingAll ? "Đang làm mới dữ liệu..." : "Làm Mới Toàn Bộ Nguồn"}</span>
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
              <span>Tin từ nguồn truy vấn trực tiếp</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-2">
              {liveJobs.toLocaleString()} tin
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              TopCV, CareerViet và CareerLink
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Nguồn truy vấn trực tiếp</span>
              <CalendarCheck className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
              3 / 8 nguồn
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              Làm mới theo yêu cầu và qua cron
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
              <span>Tin từ dữ liệu snapshot</span>
              <Layers className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">
              {snapshotJobs.toLocaleString()} tin
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              5 nguồn được nạp từ lần đồng bộ gần nhất
            </div>
          </div>
        </div>

        {/* 8 Crawler Pipelines Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Trạng Thái Nguồn Dữ Liệu (8 Nguồn)
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
                      <span className="text-slate-500">Tin hiện có:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {crawler.newJobsPastHour} tin
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
                    <span>{isSyncing ? "Đang làm mới..." : LIVE_SOURCES.has(crawler.platform) ? "Truy vấn lại" : "Nạp lại snapshot"}</span>
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
              <span>Nhật ký thao tác trong phiên</span>
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
