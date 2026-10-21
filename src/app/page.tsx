"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ArrowUpDown,
  SearchX,
  SlidersHorizontal,
  Code2,
  CalendarCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { SearchBar } from "@/components/jobs/SearchBar";
import { FilterSidebar } from "@/components/jobs/FilterSidebar";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { CvUploadModal } from "@/components/cv/CvUploadModal";
import { CvStickyBar } from "@/components/cv/CvStickyBar";
import { MOCK_JOBS } from "@/data/mockJobs";
import { calculateMatchAnalysis } from "@/utils/aiMatcher";
import { FilterState, JobListing, MatchAnalysis, PlatformSource, UserCVProfile } from "@/types/job";
import { ALL_PLATFORMS, PLATFORM_CONFIGS } from "@/utils/platforms";
import { isJobValidWithinMonth, removeVietnameseTones } from "@/utils/formatters";

export default function HomePage() {
  // Dynamic Real-Time Job Feed (Requirement: trực tiếp liên tục cập nhật từ trang gốc)
  const [jobs, setJobs] = useState<JobListing[]>(MOCK_JOBS);
  const [isLiveLoading, setIsLiveLoading] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Vừa cập nhật");
  const [liveJobCount, setLiveJobCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Active User CV Profile (Defaults to null - User uploads or pastes their own CV)
  const [activeCV, setActiveCV] = useState<UserCVProfile | null>(null);
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  // Selected Job for Detail Modal
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  // Saved Jobs Bookmarking
  const [savedJobIds, setSavedJobIds] = useState<string[]>(["job-it-001"]);

  // Search & Filter State
  const [filters, setFilters] = useState<FilterState>({
    keyword: "",
    city: "Toàn quốc",
    district: "Tất cả quận/huyện",
    sources: [...ALL_PLATFORMS],
    itSubfield: "ALL",
    techStack: [],
    salaryRange: "all",
    experienceLevels: [],
    jobTypes: [],
    timePosted: "all",
    sortBy: "newest",
    minMatchScore: undefined,
    onlyActiveWithinMonth: true, // REQUIREMENT 2: Filter out expired jobs and strictly keep <= 1 month
  });

  // Pagination State (Requirement: Mỗi trang hiển thị 15 JD)
  const ITEMS_PER_PAGE = 15;
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Toggle Save Job
  const handleToggleSave = (jobId: string) => {
    setSavedJobIds((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  // Enriched Job Callback to update in-memory state
  const handleJobEnriched = useCallback((enriched: JobListing) => {
    setSelectedJob(enriched);
    setJobs((prev) =>
      prev.map((j) => (j.id === enriched.id ? enriched : j))
    );
  }, []);

  // Change CV Handler with celebration
  const handleSelectCV = (cv: UserCVProfile | null) => {
    setActiveCV(cv);
    if (cv) {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // Safe fallback
      }
    }
  };

  // Real-time Fetch from Original Pages via /api/jobs
  const fetchRealtimeJobs = useCallback(async (searchQuery: string = "") => {
    setIsLiveLoading(true);
    try {
      const res = await fetch(`/api/jobs?keyword=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setJobs(data.data);
          setLiveJobCount(data.liveJobCount ?? 0);
          setLastSyncTime(new Date().toLocaleTimeString("vi-VN"));
        }
      }
    } catch (err) {
      console.warn("Live fetch error, keeping current stream:", err);
    } finally {
      setIsLiveLoading(false);
    }
  }, []);

  // Debounced auto-fetch on keyword change (real-time continuously updating)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRealtimeJobs(filters.keyword);
    }, 450);
    return () => clearTimeout(timer);
  }, [filters.keyword, fetchRealtimeJobs]);

  useEffect(() => {
    const timer = setTimeout(() => setCurrentTime(Date.now()), 0);
    return () => clearTimeout(timer);
  }, []);

  // Pre-calculate Match Analysis for all jobs based on active CV
  const jobAnalyses = useMemo(() => {
    const map = new Map<string, MatchAnalysis>();
    if (!activeCV) return map;

    for (const job of jobs) {
      const analysis = calculateMatchAnalysis(activeCV, job);
      map.set(job.id, analysis);
    }
    return map;
  }, [activeCV, jobs]);

  // Compute Platform Counts for Active Valid Jobs
  const platformCounts = useMemo(() => {
    const counts: Record<PlatformSource, number> = {
      TOPCV: 0,
      VIETNAMWORKS: 0,
      VIECLAM24H: 0,
      CAREERVIET: 0,
      JOBSGO: 0,
      CAREERLINK: 0,
      JOBOKO: 0,
      INDEED: 0,
    };
    for (const job of jobs) {
      if (counts[job.source_platform] !== undefined) {
        if (!filters.onlyActiveWithinMonth || isJobValidWithinMonth(job)) {
          counts[job.source_platform]++;
        }
      }
    }
    return counts;
  }, [jobs, filters.onlyActiveWithinMonth]);

  // Filter & Sort Logic
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. REQUIREMENT 2: Expiration and 1-month freshness filter
      if (filters.onlyActiveWithinMonth && !isJobValidWithinMonth(job)) {
        return false;
      }

      // 2. REQUIREMENT 1: IT Subfield filter (Strict matching for targeted IT roles)
      if (filters.itSubfield !== "ALL") {
        if (job.it_subfield !== filters.itSubfield) {
          if (filters.itSubfield === "SECURITY_AN_NINH" && (job.it_subfield as string) === "SECURITY") {
            // match
          } else if (filters.itSubfield === "INFRASTRUCTURE_CLOUD" && (job.it_subfield as string) === "DEVOPS_CLOUD") {
            // match
          } else {
            return false;
          }
        }
      }

      // 3. Tech Stack filter (if any tech is selected)
      if (filters.techStack && filters.techStack.length > 0) {
        const hasMatchingTech = filters.techStack.some((tech) =>
          job.skills_tags.some((st) => st.toLowerCase() === tech.toLowerCase())
        );
        if (!hasMatchingTech) {
          return false;
        }
      }

      // 4. Keyword filter
      if (filters.keyword.trim()) {
        const normKey = removeVietnameseTones(filters.keyword).toLowerCase();
        const normTitle = removeVietnameseTones(job.title).toLowerCase();
        const normCompany = removeVietnameseTones(job.company_name).toLowerCase();
        const normSkills = job.skills_tags
          .map((s) => removeVietnameseTones(s).toLowerCase())
          .join(" ");

        if (!normTitle.includes(normKey) && !normCompany.includes(normKey) && !normSkills.includes(normKey)) {
          return false;
        }
      }

      // 5. City filter (Supporting Thanh Hóa, Hà Nội, TP.HCM, etc.)
      if (filters.city !== "Toàn quốc") {
        const normCity = removeVietnameseTones(filters.city).toLowerCase();
        const jCity = removeVietnameseTones(job.location_city).toLowerCase();
        const jAddr = removeVietnameseTones(job.address_detail || "").toLowerCase();
        if (!jCity.includes(normCity) && !jAddr.includes(normCity)) {
          return false;
        }
      }

      // 6. District filter
      if (filters.district !== "Tất cả quận/huyện" && filters.district !== "Tất cả địa điểm") {
        const normDistrict = removeVietnameseTones(filters.district).toLowerCase();
        const jDistrict = removeVietnameseTones(job.location_district || "").toLowerCase();
        const jAddr = removeVietnameseTones(job.address_detail || "").toLowerCase();
        if (!jDistrict.includes(normDistrict) && !jAddr.includes(normDistrict)) {
          return false;
        }
      }

      // 7. Source Platform filter
      if (!filters.sources.includes(job.source_platform)) {
        return false;
      }

      // 8. Salary Range filter
      if (filters.salaryRange !== "all") {
        if (filters.salaryRange === "under_15" && (job.salary_max > 15 || job.salary_currency === "USD"))
          return false;
        if (
          filters.salaryRange === "15_25" &&
          (job.salary_max < 15 || job.salary_min > 25 || job.salary_currency === "USD")
        )
          return false;
        if (
          filters.salaryRange === "25_40" &&
          (job.salary_max < 25 || job.salary_min > 40 || job.salary_currency === "USD")
        )
          return false;
        if (filters.salaryRange === "above_40" && job.salary_max < 40 && job.salary_currency !== "USD")
          return false;
        if (filters.salaryRange === "usd" && job.salary_currency !== "USD") return false;
        if (filters.salaryRange === "negotiable" && job.salary_min > 0) return false;
      }

      // 9. Experience Level filter
      if (filters.experienceLevels.length > 0) {
        if (!filters.experienceLevels.includes(job.experience_level)) {
          return false;
        }
      }

      // 10. Job Type filter
      if (filters.jobTypes.length > 0) {
        if (!filters.jobTypes.includes(job.job_type)) {
          return false;
        }
      }

      // 11. Time Posted filter (within 30 days)
      if (filters.timePosted !== "all") {
        if (currentTime === 0) return true;
        const postTime = new Date(job.crawled_at).getTime();
        const diffHours = (currentTime - postTime) / (1000 * 60 * 60);

        if (filters.timePosted === "24h" && diffHours > 24) return false;
        if (filters.timePosted === "7d" && diffHours > 168) return false;
        if (filters.timePosted === "14d" && diffHours > 336) return false;
      }

      // 12. AI Match Score Threshold
      if (filters.minMatchScore !== undefined && activeCV) {
        const analysis = jobAnalyses.get(job.id);
        if (!analysis || analysis.score < filters.minMatchScore) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      if (filters.sortBy === "match" && activeCV) {
        const scoreA = jobAnalyses.get(a.id)?.score || 0;
        const scoreB = jobAnalyses.get(b.id)?.score || 0;
        return scoreB - scoreA;
      }
      if (filters.sortBy === "salary_desc") {
        return b.salary_max - a.salary_max;
      }
      // newest
      return new Date(b.crawled_at).getTime() - new Date(a.crawled_at).getTime();
    });
  }, [filters, activeCV, jobAnalyses, jobs, currentTime]);

  // Requirement: Mỗi trang hiển thị 15 JD
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, filteredJobs.length);

  const displayedJobs = useMemo(() => {
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, startIndex, endIndex]);

  const handlePageChange = (page: number) => {
    const clamped = Math.min(Math.max(1, page), totalPages);
    setCurrentPage(clamped);
    if (typeof window !== "undefined") {
      const el = document.getElementById("job-results-container");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 380, behavior: "smooth" });
      }
    }
  };

  // Highest match score
  const bestScore = useMemo(() => {
    if (!activeCV || filteredJobs.length === 0) return undefined;
    let max = 0;
    for (const j of filteredJobs) {
      const s = jobAnalyses.get(j.id)?.score || 0;
      if (s > max) max = s;
    }
    return max;
  }, [activeCV, filteredJobs, jobAnalyses]);

  const handleResetFilters = () => {
    setFilters({
      keyword: "",
      city: "Toàn quốc",
      district: "Tất cả quận/huyện",
      sources: [...ALL_PLATFORMS],
      itSubfield: "ALL",
      techStack: [],
      salaryRange: "all",
      experienceLevels: [],
      jobTypes: [],
      timePosted: "all",
      sortBy: activeCV ? "match" : "newest",
      minMatchScore: undefined,
      onlyActiveWithinMonth: true,
    });
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeCV={activeCV}
        onOpenCvModal={() => setIsCvModalOpen(true)}
        savedJobsCount={savedJobIds.length}
        activeTab="jobs"
      />

      {/* Hero Search Section - Focused on IT (Requirement 1) */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-gradient-to-b from-white via-emerald-50/20 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 py-10 sm:py-14">
        {/* Subtle Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none opacity-40">
          <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-indigo-400/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs">
              <Code2 className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>Việc Làm IT • 3 Nguồn Trực Tiếp + 5 Nguồn Đã Đồng Bộ</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Tất Cả Việc Làm IT Việt Nam Với{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
                TopViec AI
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
              Tổng hợp dữ liệu ngành Công nghệ thông tin và truy vấn trực tiếp cả 8 nguồn:{" "}
              <strong className="text-slate-900 dark:text-white">
                TopCV, VietnamWorks, Vieclam24h, CareerViet, JobsGO, CareerLink, Joboko và Indeed
              </strong>
              . Dữ liệu đồng bộ gần nhất chỉ được dùng làm dự phòng khi nguồn tạm thời không phản hồi.
            </p>

            {/* Key Quality Assurances (Requirements 1, 2, 3) */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950 px-2.5 py-1 rounded-full">
                <CalendarCheck className="h-3.5 w-3.5" />
                100% Tin còn hạn ứng tuyển (≤ 1 tháng)
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-100/70 dark:bg-indigo-950 px-2.5 py-1 rounded-full">
                <Sparkles className="h-3.5 w-3.5" />
                Không giới hạn số lượng tin hiển thị
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-blue-700 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-950 px-2.5 py-1 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5" />
                Tự động gộp tin trùng lặp đa nguồn
              </span>
            </div>
          </div>

          {/* Search Bar Input */}
          <div className="max-w-4xl mx-auto space-y-3">
            <SearchBar
              keyword={filters.keyword}
              onKeywordChange={(val) => setFilters((prev) => ({ ...prev, keyword: val }))}
              onSearchSubmit={() => fetchRealtimeJobs(filters.keyword)}
              city={filters.city}
              onCityChange={(val) => setFilters((prev) => ({ ...prev, city: val }))}
              district={filters.district}
              onDistrictChange={(val) => setFilters((prev) => ({ ...prev, district: val }))}
            />

            {/* Real-time Status Card & Manual Live Refresh */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/40 p-3 sm:px-4 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <div className="text-left">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <span>⚡ Chế độ trực tiếp: truy vấn song song cả 8 nguồn</span>
                    {isLiveLoading && (
                      <span className="animate-pulse text-[11px] text-emerald-600 font-bold">
                        (Đang truy vấn dữ liệu mới...)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Đã truy vấn trực tiếp 8 nền tảng ({liveJobCount} tin mới) • Làm mới lúc: <strong>{lastSyncTime}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => fetchRealtimeJobs(filters.keyword)}
                disabled={isLiveLoading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLiveLoading ? "animate-spin" : ""}`} />
                <span>{isLiveLoading ? "Đang làm mới..." : "Làm mới dữ liệu"}</span>
              </button>
            </div>

            {/* Quick Keyword Buttons Requested by User */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="h-3 w-3 text-amber-500" />
                Từ khóa mục tiêu:
              </span>
              {[
                "IT Support",
                "Nhân viên IT",
                "Helpdesk",
                "System Admin",
                "Network",
                "Mạng",
                "System",
                "Admin",
                "IT",
              ].map((kw) => {
                const isActive = filters.keyword.toLowerCase() === kw.toLowerCase();
                return (
                  <button
                    key={kw}
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, keyword: kw }));
                      fetchRealtimeJobs(kw);
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${isActive
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white/90 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600"
                      }`}
                  >
                    {kw}
                  </button>
                );
              })}
              {filters.keyword && (
                <button
                  onClick={() => {
                    setFilters((prev) => ({ ...prev, keyword: "" }));
                    fetchRealtimeJobs("");
                  }}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Xóa lọc từ khóa
                </button>
              )}
            </div>
          </div>

          {/* Platform Badges Ribbon */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Nguồn cào IT:
            </span>
            {ALL_PLATFORMS.map((pkey) => {
              const cfg = PLATFORM_CONFIGS[pkey];
              return (
                <span
                  key={pkey}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${cfg.badgeBg} ${cfg.badgeText}`}
                >
                  <span>{cfg.logoLetter}</span>
                  <span>{cfg.name}</span>
                </span>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Sticky CV Match Banner */}
        <CvStickyBar
          cv={activeCV}
          onOpenModal={() => setIsCvModalOpen(true)}
          onClearCV={() => setActiveCV(null)}
          bestMatchScore={bestScore}
        />

        {/* Layout Grid: Left Sidebar + Right Job Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              onReset={handleResetFilters}
              jobCountsByPlatform={platformCounts}
              hasActiveCV={!!activeCV}
            />
          </aside>

          {/* Mobile Filter Button */}
          <div className="block lg:hidden">
            <button
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 text-xs font-bold shadow-xs"
            >
              <SlidersHorizontal className="h-4 w-4 text-emerald-600" />
              <span>Mở Bộ Lọc Chuyên Ngành IT & Công Nghệ</span>
            </button>

            {isMobileFilterOpen && (
              <div className="mt-3">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  onReset={handleResetFilters}
                  jobCountsByPlatform={platformCounts}
                  hasActiveCV={!!activeCV}
                />
              </div>
            )}
          </div>

          {/* Right Column: Search Results */}
          <div id="job-results-container" className="lg:col-span-8 space-y-4">
            {/* Results Header: Count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Việc Làm IT Còn Hạn Tuyển Dụng</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 text-xs font-black">
                    {filteredJobs.length} tin
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{liveJobCount > 0 ? `${liveJobCount} tin trực tiếp` : "Đang dùng dữ liệu dự phòng"}</span>
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filteredJobs.length > 0 && (
                    <span className="font-semibold text-slate-700 dark:text-slate-300 mr-1.5">
                      Trang {validCurrentPage} / {totalPages} (Hiện {startIndex + 1} - {endIndex} tin) •
                    </span>
                  )}
                  {filters.onlyActiveWithinMonth && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold mr-1">
                      ✓ Đã loại bỏ các tuyển dụng hết hạn
                    </span>
                  )}
                  {activeCV
                    ? `• Xếp hạng theo % độ khớp AI với CV của ${activeCV.fullName}`
                    : "• Cập nhật mới nhất trong vòng 30 ngày qua"}
                </p>
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  Sắp xếp:
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as "match" | "newest" | "salary_desc",
                    }))
                  }
                  className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {activeCV && <option value="match">Độ khớp AI cao nhất (%)</option>}
                  <option value="newest">Vừa cập nhật mới nhất</option>
                  <option value="salary_desc">Lương cao nhất</option>
                </select>
              </div>
            </div>

            {/* Job Cards Stream (Requirement: Mỗi trang hiển thị 15 JD) */}
            {displayedJobs.length > 0 ? (
              <div className="space-y-3.5">
                {displayedJobs.map((job, idx) => (
                  <JobCard
                    key={`${job.id}-${job.source_platform}-${idx}`}
                    job={job}
                    matchAnalysis={jobAnalyses.get(job.id)}
                    activeCV={activeCV}
                    onSelectJob={(j) => setSelectedJob(j)}
                    onOpenMatchBreakdown={(j) => setSelectedJob(j)}
                    isSaved={savedJobIds.includes(job.id)}
                    onToggleSave={handleToggleSave}
                  />
                ))}

                {/* Pagination Controls (Requirement: Mỗi trang hiển thị 15 JD) */}
                {totalPages > 1 && (
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Hiển thị <span className="font-bold text-slate-800 dark:text-slate-200">{startIndex + 1} - {endIndex}</span> trong tổng số <span className="font-bold text-emerald-600 dark:text-emerald-400">{filteredJobs.length}</span> việc làm IT (Trang {validCurrentPage}/{totalPages})
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Prev Page Button */}
                      <button
                        onClick={() => handlePageChange(validCurrentPage - 1)}
                        disabled={validCurrentPage <= 1}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Trước</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          if (totalPages <= 7) return true;
                          if (page === 1 || page === totalPages) return true;
                          if (Math.abs(page - validCurrentPage) <= 1) return true;
                          return false;
                        })
                        .reduce<(number | string)[]>((acc, page, idx, arr) => {
                          if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                            acc.push("...");
                          }
                          acc.push(page);
                          return acc;
                        }, [])
                        .map((item, idx) => {
                          if (item === "...") {
                            return (
                              <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">
                                ...
                              </span>
                            );
                          }
                          const pageNum = item as number;
                          const isActive = pageNum === validCurrentPage;
                          return (
                            <button
                              key={`page-${pageNum}`}
                              onClick={() => handlePageChange(pageNum)}
                              className={`min-w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer ${isActive
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                      {/* Next Page Button */}
                      <button
                        onClick={() => handlePageChange(validCurrentPage + 1)}
                        disabled={validCurrentPage >= totalPages}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Empty Search State */
              <div className="rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <SearchX className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white">
                    Không tìm thấy việc làm IT nào phù hợp với bộ lọc hiện tại
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Hãy thử nới lỏng mức lương, chọn lại chuyên ngành hoặc bỏ bớt các công nghệ/kỹ năng đang lọc.
                  </p>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                >
                  Đặt lại toàn bộ bộ lọc IT
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CV Upload Modal */}
      <CvUploadModal
        isOpen={isCvModalOpen}
        onClose={() => setIsCvModalOpen(false)}
        currentCV={activeCV}
        onSelectCV={handleSelectCV}
      />

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        matchAnalysis={selectedJob ? jobAnalyses.get(selectedJob.id) : undefined}
        activeCV={activeCV}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onToggleSave={handleToggleSave}
        onJobEnriched={handleJobEnriched}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500 mt-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">TopViec IT</span>
            <span>• Nền tảng Tổng hợp Việc làm IT & Khớp CV Thông Minh tại Việt Nam</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              100% Tin IT còn hạn (≤ 30 ngày)
            </span>
            <a
              href="/admin/crawlers"
              className="text-slate-600 dark:text-slate-300 font-semibold hover:underline"
            >
              Crawler Dashboard →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
