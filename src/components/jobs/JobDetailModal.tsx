"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ExternalLink,
  MapPin,
  DollarSign,
  Clock,
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  BookmarkCheck,
  Bookmark,
  Share2,
  Briefcase,
  Layers,
  Lightbulb,
  GraduationCap,
  Users,
  Calendar,
  Globe,
  RefreshCw,
  Send,
  ShieldCheck,
  Check,
} from "lucide-react";
import { JobListing, MatchAnalysis, UserCVProfile } from "@/types/job";
import { PLATFORM_CONFIGS, buildApplyUrl } from "@/utils/platforms";
import {
  EXPERIENCE_LABELS,
  IT_SUBFIELD_LABELS,
  JOB_TYPE_LABELS,
  formatDaysRemaining,
  formatSalary,
  formatTimeAgo,
} from "@/utils/formatters";

interface JobDetailModalProps {
  job: JobListing | null;
  onClose: () => void;
  matchAnalysis?: MatchAnalysis;
  activeCV: UserCVProfile | null;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
  onJobEnriched?: (enrichedJob: JobListing) => void;
}

type TabType = "all" | "desc" | "benefits" | "reqs" | "summary" | "contact" | "company" | "cv_match";

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  matchAnalysis,
  activeCV,
  isSaved = false,
  onToggleSave,
  onJobEnriched,
}) => {
  const [currentJob, setCurrentJob] = useState<JobListing | null>(job);
  const [isLoadingEnrichment, setIsLoadingEnrichment] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("all");

  useEffect(() => {
    setCurrentJob(job);
    if (!job) return;

    // Check if the job already has deep full detail
    const hasFullDetail =
      (job.other_info?.work_type && job.other_info?.degree) ||
      (job.contact_info?.name && job.company_website) ||
      (job.description && job.description.length > 500);

    if (!hasFullDetail && job.source_url) {
      setIsLoadingEnrichment(true);
      fetch(`/api/jobs/detail?id=${encodeURIComponent(job.id)}&url=${encodeURIComponent(job.source_url)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setCurrentJob(data.data);
            onJobEnriched?.(data.data);
          }
        })
        .catch((err) => {
          console.warn("Detail enrichment notice:", err);
        })
        .finally(() => {
          setIsLoadingEnrichment(false);
        });
    }
  }, [job, onJobEnriched]);

  if (!currentJob) return null;

  const platform = PLATFORM_CONFIGS[currentJob.source_platform] || PLATFORM_CONFIGS.TOPCV;
  const applyUrl = buildApplyUrl(
    currentJob.source_url,
    currentJob.source_platform,
    currentJob.id,
    currentJob.title,
    currentJob.company_name
  );
  const remaining = formatDaysRemaining(currentJob.expires_at, currentJob.is_expired);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentJob.title,
        text: `Tuyển dụng ${currentJob.title} tại ${currentJob.company_name} trên TopViec`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết vào bộ nhớ tạm!");
    }
  };

  // Helper to render formatted description with section subheadings
  const renderFormattedDescription = (text: string) => {
    const lines = text.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
    return (
      <div className="space-y-3">
        {lines.map((line, idx) => {
          const isHeading =
            line.startsWith("*") ||
            line.startsWith("【") ||
            /^\d+\.\s+[A-ZÀ-Ỹ]/.test(line);

          if (isHeading) {
            return (
              <h4
                key={idx}
                className="text-sm font-bold text-slate-900 dark:text-white pt-2.5 first:pt-0 flex items-center gap-2"
              >
                <span className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-400 shrink-0" />
                <span>{line.replace(/^[*【】\s]+/, "")}</span>
              </h4>
            );
          }

          const isBullet = line.startsWith("-") || line.startsWith("•") || line.startsWith("+");
          const cleanLine = line.replace(/^[-•+\s]+/, "").trim();

          return (
            <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {isBullet ? (
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
              ) : null}
              <span className={isBullet ? "" : "font-normal"}>{cleanLine}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-900/65 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-3.5 bg-slate-50/90 dark:bg-slate-950/60 backdrop-blur-sm shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-black shadow-xs ${platform.badgeBg} ${platform.badgeText}`}
            >
              {platform.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Mã tin: <strong>{currentJob.source_job_id}</strong> • Cập nhật {formatTimeAgo(currentJob.crawled_at)}
            </span>
            {isLoadingEnrichment ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 animate-pulse">
                <RefreshCw className="h-3 w-3 animate-spin text-sky-600" />
                Đang đối chiếu dữ liệu gốc...
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Dữ liệu đầy đủ từ trang gốc
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Chia sẻ tin tuyển dụng"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleSave?.(currentJob.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title={isSaved ? "Bỏ lưu tin" : "Lưu tin"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-amber-500 fill-amber-500" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Main Title & Company Header */}
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-center p-2 shadow-sm">
              {currentJob.company_logo ? (
                <img
                  src={currentJob.company_logo}
                  alt={currentJob.company_name}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <Building2 className="h-9 w-9 text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {currentJob.title}
              </h1>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1">
                {currentJob.company_name}
              </p>
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 dark:text-slate-400 mt-1.5">
                <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                  {currentJob.address_detail || `${currentJob.location_district}, ${currentJob.location_city}`}
                </span>
                {currentJob.other_info?.posted_date_text && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    Ngày đăng: {currentJob.other_info.posted_date_text}
                  </span>
                )}
                <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <Clock className="h-3.5 w-3.5" />
                  {currentJob.other_info?.deadline_text || remaining.label}
                </span>
              </div>
            </div>

            {/* Quick Action Buttons on Desktop */}
            <div className="hidden sm:flex flex-col gap-2 shrink-0">
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-black shadow-md hover:brightness-105 active:scale-95 transition ${platform.badgeBg} ${platform.badgeText}`}
              >
                <span>Nộp đơn tại {platform.name}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Quick Stats Grid (Identical to Original Platform Specs) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Mức lương</div>
              <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
                {currentJob.salary_raw_text && currentJob.salary_raw_text !== "Thỏa thuận"
                  ? currentJob.salary_raw_text
                  : formatSalary(currentJob.salary_raw_text, currentJob.salary_min, currentJob.salary_max, currentJob.salary_currency)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Khu vực</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {currentJob.location_city}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Kinh nghiệm</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {currentJob.other_info?.experience_required || EXPERIENCE_LABELS[currentJob.experience_level]}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Cấp bậc</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {currentJob.other_info?.job_level || EXPERIENCE_LABELS[currentJob.experience_level]}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Hình thức</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {currentJob.other_info?.work_type || JOB_TYPE_LABELS[currentJob.job_type]}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Hạn nộp hồ sơ</div>
              <div
                className={`text-xs font-bold mt-0.5 truncate ${
                  remaining.isExpired
                    ? "text-rose-600 dark:text-rose-400"
                    : remaining.isUrgent
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-teal-700 dark:text-teal-400"
                }`}
              >
                {currentJob.other_info?.deadline_text || remaining.label}
              </div>
            </div>
          </div>

          {/* DEDUPLICATION CROSS-POST NOTICE */}
          {currentJob.source_cross_posted && currentJob.source_cross_posted.length > 0 && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/30 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="text-indigo-900 dark:text-indigo-200 font-medium leading-relaxed">
                  Tin tuyển dụng này được đăng tải đồng thời trên: <strong>{platform.name}</strong> và{" "}
                  <strong>{currentJob.source_cross_posted.join(", ")}</strong>. TopViec đã tự động gộp trùng lặp bằng mã vân tay dữ liệu.
                </span>
              </div>
            </div>
          )}

          {/* Tab Navigation Matching Original Platform Experience */}
          <div className="border-b border-slate-200 dark:border-slate-800 -mx-5 sm:-mx-7 px-5 sm:px-7">
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-px no-scrollbar">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition ${
                  activeTab === "all"
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Tất cả thông tin
              </button>
              <button
                onClick={() => setActiveTab("desc")}
                className={`px-3 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition ${
                  activeTab === "desc"
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Mô tả công việc
              </button>
              <button
                onClick={() => setActiveTab("benefits")}
                className={`px-3 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition ${
                  activeTab === "benefits"
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Phúc lợi & Quyền lợi
              </button>
              <button
                onClick={() => setActiveTab("reqs")}
                className={`px-3 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition ${
                  activeTab === "reqs"
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Kỹ năng & Yêu cầu
              </button>
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-3 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition ${
                  activeTab === "summary"
                    ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                Chi tiết công việc
              </button>
              {currentJob.contact_info?.name && (
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`px-3 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition ${
                    activeTab === "contact"
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Thông tin liên hệ
                </button>
              )}
              {currentJob.company_intro && (
                <button
                  onClick={() => setActiveTab("company")}
                  className={`px-3 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition ${
                    activeTab === "company"
                      ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  Về công ty
                </button>
              )}
              {matchAnalysis && activeCV && (
                <button
                  onClick={() => setActiveTab("cv_match")}
                  className={`px-3 py-2 text-xs sm:text-sm font-bold whitespace-nowrap border-b-2 transition flex items-center gap-1.5 ${
                    activeTab === "cv_match"
                      ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400"
                      : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  Khớp CV AI ({matchAnalysis.score}%)
                </button>
              )}
            </div>
          </div>

          {/* AI MATCHING BREAKDOWN BANNER */}
          {matchAnalysis && activeCV && (activeTab === "all" || activeTab === "cv_match") && (
            <div className="rounded-3xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-indigo-50/60 dark:border-emerald-800 dark:from-emerald-950/50 dark:via-teal-950/30 dark:to-indigo-950/40 p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/60 dark:border-emerald-800/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      Phân Tích Độ Khớp CV AI ({activeCV.fullName})
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      Thuật toán đối chiếu thông minh theo tiêu chuẩn tuyển dụng thực tế
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                    {matchAnalysis.score}%
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      matchAnalysis.score >= 80
                        ? "bg-emerald-600 text-white"
                        : matchAnalysis.score >= 55
                        ? "bg-amber-500 text-white"
                        : "bg-slate-600 text-white"
                    }`}
                  >
                    {matchAnalysis.score >= 80
                      ? "Rất phù hợp"
                      : matchAnalysis.score >= 55
                      ? "Khá phù hợp"
                      : "Cần bổ sung"}
                  </span>
                </div>
              </div>

              {/* Recommendation note */}
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                💡 {matchAnalysis.recommendation}
              </p>

              {/* Matched vs Missing Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Matched */}
                <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-white/80 dark:bg-slate-900/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      Kỹ năng đã khớp ({matchAnalysis.matchedSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchAnalysis.matchedSkills.length > 0 ? (
                      matchAnalysis.matchedSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[11px] font-bold text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                        >
                          ✓ {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic">Chưa khớp kỹ năng cụ thể nào</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-white/80 dark:bg-slate-900/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      Kỹ năng còn thiếu ({matchAnalysis.missingSkills.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {matchAnalysis.missingSkills.length > 0 ? (
                      matchAnalysis.missingSkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
                        >
                          + {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-emerald-600 font-semibold">
                        Bạn đã đáp ứng toàn bộ kỹ năng yêu cầu!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actionable Tips */}
              {matchAnalysis.adviceTips.length > 0 && (
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-3 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    Lời khuyên phỏng vấn & tối ưu hồ sơ cho vị trí này:
                  </div>
                  <ul className="space-y-1 text-slate-600 dark:text-slate-400 pl-4 list-disc">
                    {matchAnalysis.adviceTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Section 1: Mô tả công việc */}
          {(activeTab === "all" || activeTab === "desc") && (
            <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Briefcase className="h-4 w-4 text-blue-600" />
                Mô tả công việc
              </h3>
              <div className="pt-1">
                {renderFormattedDescription(currentJob.description)}
              </div>
            </div>
          )}

          {/* Section 2: Phúc lợi được hưởng */}
          {(activeTab === "all" || activeTab === "benefits") && (
            <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                Phúc lợi & Chế độ đãi ngộ
              </h3>
              <ul className="space-y-2.5 pt-1 text-sm text-slate-700 dark:text-slate-300">
                {currentJob.benefits.map((ben, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                    <span className="font-medium leading-relaxed">{ben}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 3: Yêu cầu ứng viên / Kinh nghiệm & kỹ năng chi tiết */}
          {(activeTab === "all" || activeTab === "reqs") && (
            <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Kinh nghiệm / Kỹ năng chi tiết
              </h3>
              <ul className="space-y-2.5 pt-1 text-sm text-slate-700 dark:text-slate-300">
                {currentJob.requirements.map((req, idx) => {
                  const isSubHeading = req.startsWith("*") || req.includes("Qualification:") || req.includes("Experience:") || req.includes("skills:");
                  if (isSubHeading) {
                    return (
                      <li key={idx} className="pt-2 first:pt-0 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 shrink-0" />
                        <span>{req.replace(/^[*【】\s]+/, "")}</span>
                      </li>
                    );
                  }
                  return (
                    <li key={idx} className="flex items-start gap-2.5 pl-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                      <span className="leading-relaxed">{req}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Section 4: Chi tiết công việc (Job Summary Grid like Original CareerLink / TopCV) */}
          {(activeTab === "all" || activeTab === "summary") && (
            <div className="space-y-3 rounded-2xl border border-blue-100 dark:border-blue-950/60 bg-blue-50/40 dark:bg-slate-900 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-blue-200/60 dark:border-slate-800 pb-2.5">
                <Layers className="h-4 w-4 text-blue-600" />
                Chi tiết công việc
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                <div className="rounded-xl border border-blue-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium">Loại công việc / Hình thức</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentJob.other_info?.work_type || JOB_TYPE_LABELS[currentJob.job_type]}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium">Cấp bậc</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentJob.other_info?.job_level || EXPERIENCE_LABELS[currentJob.experience_level]}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium">Học vấn / Bằng cấp</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentJob.other_info?.degree || "Cao đẳng / Đại học"}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium">Kinh nghiệm yêu cầu</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentJob.other_info?.experience_required || EXPERIENCE_LABELS[currentJob.experience_level]}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium">Giới tính</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentJob.other_info?.gender || "Bất kỳ (Không yêu cầu)"}
                  </div>
                </div>

                <div className="rounded-xl border border-blue-200/80 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-3.5 space-y-1">
                  <div className="text-slate-500 font-medium">Ngành nghề tuyển dụng</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {currentJob.other_info?.industry_category || currentJob.industry}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Thông tin liên hệ */}
          {(activeTab === "all" || activeTab === "contact") && currentJob.contact_info?.name && (
            <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Send className="h-4 w-4 text-emerald-600" />
                Thông tin liên hệ & Nộp hồ sơ
              </h3>

              <div className="space-y-2.5 pt-1 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2">
                  <strong className="text-slate-900 dark:text-white shrink-0">Tên liên hệ:</strong>
                  <span>{currentJob.contact_info.name}</span>
                </div>

                <div className="flex items-start gap-2">
                  <strong className="text-slate-900 dark:text-white shrink-0">Địa chỉ nộp hồ sơ:</strong>
                  <span>{currentJob.contact_info.address}</span>
                </div>

                {currentJob.contact_info.instructions && (
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 p-3 text-xs text-amber-900 dark:text-amber-200">
                    💡 <strong>Hướng dẫn:</strong> {currentJob.contact_info.instructions}
                  </div>
                )}

                <div className="flex items-start gap-2 text-xs text-slate-500">
                  <span>Nhận hồ sơ bằng ngôn ngữ:</span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {currentJob.contact_info.language || "Tiếng Việt"}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Section 6: Về công ty */}
          {(activeTab === "all" || activeTab === "company") && (
            <div className="space-y-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <Building2 className="h-4 w-4 text-blue-600" />
                Về nhà tuyển dụng ({currentJob.company_name})
              </h3>

              <div className="space-y-3 pt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {currentJob.company_website && (
                    <a
                      href={currentJob.company_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {currentJob.company_website}
                    </a>
                  )}

                  {currentJob.company_size && (
                    <span className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      Quy mô: {currentJob.company_size}
                    </span>
                  )}
                </div>

                {currentJob.company_intro && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {currentJob.company_intro}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Section 7: Kỹ năng & Từ khóa liên quan */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kỹ năng & Từ khóa liên quan
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentJob.skills_tags.map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950 shrink-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Nguồn tin gốc: <strong className="text-slate-700 dark:text-slate-200">{platform.name}</strong> • Có UTM tracking an toàn
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              Đóng
            </button>

            {/* Direct Original Application Button */}
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:brightness-105 active:scale-95 transition ${platform.badgeBg} ${platform.badgeText}`}
            >
              <span>Ứng tuyển gốc tại {platform.name}</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
