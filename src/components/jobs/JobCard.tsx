"use client";

import React from "react";
import {
  MapPin,
  Clock,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { JobListing, MatchAnalysis, UserCVProfile } from "@/types/job";
import { PLATFORM_CONFIGS, buildApplyUrl } from "@/utils/platforms";
import {
  EXPERIENCE_LABELS,
  IT_SUBFIELD_LABELS,
  formatDaysRemaining,
  formatSalary,
  formatTimeAgo,
} from "@/utils/formatters";

interface JobCardProps {
  job: JobListing;
  matchAnalysis?: MatchAnalysis;
  activeCV: UserCVProfile | null;
  onSelectJob: (job: JobListing) => void;
  onOpenMatchBreakdown?: (job: JobListing, analysis: MatchAnalysis) => void;
  isSaved?: boolean;
  onToggleSave?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  matchAnalysis,
  activeCV,
  onSelectJob,
  onOpenMatchBreakdown,
  isSaved = false,
  onToggleSave,
}) => {
  const platform = PLATFORM_CONFIGS[job.source_platform] || PLATFORM_CONFIGS.TOPCV;
  const applyUrl = buildApplyUrl(job.source_url, job.source_platform, job.id, job.title, job.company_name);
  const remaining = formatDaysRemaining(job.expires_at, job.is_expired);

  // Score styling
  const score = matchAnalysis?.score;
  const isHighMatch = score !== undefined && score >= 80;
  const isMediumMatch = score !== undefined && score >= 55 && score < 80;

  const getScoreColor = () => {
    if (score === undefined) return "text-slate-400 border-slate-200 dark:border-slate-800";
    if (isHighMatch) return "text-emerald-600 dark:text-emerald-400 border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40";
    if (isMediumMatch) return "text-amber-600 dark:text-amber-400 border-amber-500 bg-amber-50/50 dark:bg-amber-950/40";
    return "text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900";
  };

  return (
    <div
      className={`group relative rounded-2xl border bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:shadow-md ${
        isHighMatch
          ? "border-emerald-300/80 dark:border-emerald-700/50 ring-1 ring-emerald-500/20"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      }`}
    >
      {/* Top Bar: Company, Logo, Title, Match Ring */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Logo & Core Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Company Logo */}
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company_name}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <Building2 className="h-6 w-6 text-slate-400" />
            )}
          </div>

          {/* Title & Company */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {/* Primary Source Badge */}
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-bold shadow-xs ${platform.badgeBg} ${platform.badgeText}`}
                title={`Thu thập tự động từ ${platform.name}`}
              >
                <span>{platform.logoLetter}</span>
                <span>•</span>
                <span>{platform.name}</span>
              </span>

              {/* Cross-posted badge if deduplicated */}
              {job.source_cross_posted && job.source_cross_posted.length > 0 && (
                <span
                  className="rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300"
                  title={`Đã gộp trùng lặp từ: ${job.source_cross_posted.join(", ")}`}
                >
                  +{job.source_cross_posted.length} nguồn khác
                </span>
              )}

              {/* IT Subfield Badge */}
              {job.it_subfield && (
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  {IT_SUBFIELD_LABELS[job.it_subfield] || "IT"}
                </span>
              )}

              {/* Time ago with pulse dot */}
              <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {formatTimeAgo(job.crawled_at)}
              </span>
            </div>

            <h3
              onClick={() => onSelectJob(job)}
              className="font-bold text-slate-900 dark:text-white text-base hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition line-clamp-1"
            >
              {job.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              <span className="font-medium truncate">{job.company_name}</span>
              <span title="Nhà tuyển dụng đã xác minh" className="inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              </span>
            </div>
          </div>
        </div>

        {/* Right: AI Match Score Circle OR Save button */}
        <div className="flex items-center gap-2 shrink-0">
          {score !== undefined ? (
            <div
              onClick={() => matchAnalysis && onOpenMatchBreakdown?.(job, matchAnalysis)}
              className={`flex flex-col items-center justify-center h-13 w-13 rounded-2xl border-2 p-1 cursor-pointer transition hover:scale-105 ${getScoreColor()}`}
              title="Nhấn để xem phân tích kỹ năng đã khớp và còn thiếu"
            >
              <div className="flex items-center gap-0.5 text-xs font-black leading-none">
                <Sparkles className="h-2.5 w-2.5" />
                <span>{score}%</span>
              </div>
              <span className="text-[9px] font-bold mt-0.5 tracking-tighter">
                {isHighMatch ? "Rất khớp" : isMediumMatch ? "Khá khớp" : "Cần học"}
              </span>
            </div>
          ) : (
            <button
              onClick={() => onToggleSave?.(job.id)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-2 text-slate-400 hover:text-amber-500 hover:border-amber-300 dark:hover:border-amber-700 transition"
              title={isSaved ? "Bỏ lưu tin" : "Lưu tin tuyển dụng này"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-5 w-5 text-amber-500 fill-amber-500" />
              ) : (
                <Bookmark className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Middle Bar: Salary, Location & Expiration Badges */}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
        {/* Salary Pill */}
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-1 font-bold text-emerald-800 dark:text-emerald-300">
          {formatSalary(job.salary_raw_text, job.salary_min, job.salary_max, job.salary_currency)}
        </div>

        {/* Location Pill */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-slate-700 dark:text-slate-300 font-medium">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {job.location_district}, {job.location_city}
          </span>
        </div>

        {/* Level */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-2 py-1 text-slate-600 dark:text-slate-400 text-[11px]">
          {EXPERIENCE_LABELS[job.experience_level]}
        </div>

        {/* Expiration Deadline Pill (Requirement 2) */}
        <div
          className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold border ${
            remaining.isExpired
              ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900"
              : remaining.isUrgent
              ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
              : "bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900"
          }`}
        >
          {remaining.isUrgent ? (
            <AlertTriangle className="h-3 w-3 text-amber-500" />
          ) : (
            <Calendar className="h-3 w-3 text-teal-600" />
          )}
          <span>{remaining.label}</span>
        </div>
      </div>

      {/* Skills Tags: Highlight matching skills in Green */}
      <div className="flex flex-wrap items-center gap-1.5 mt-3">
        {job.skills_tags.map((skill, sIdx) => {
          const isMatched = matchAnalysis?.matchedSkills.includes(skill);
          return (
            <span
              key={sIdx}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition ${
                isMatched
                  ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold"
                  : "bg-slate-100 dark:bg-slate-800/70 text-slate-600 dark:text-slate-400 border border-transparent"
              }`}
            >
              {isMatched && <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />}
              {skill}
            </span>
          );
        })}
      </div>

      {/* Match Snippet if CV active */}
      {matchAnalysis && (
        <div
          onClick={() => onOpenMatchBreakdown?.(job, matchAnalysis)}
          className="mt-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5 text-xs border border-slate-100 dark:border-slate-800/80 cursor-pointer hover:bg-slate-100/70 transition flex items-center justify-between"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Khớp {matchAnalysis.matchedSkills.length}/{job.skills_tags.length} kỹ năng:
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium truncate">
              {matchAnalysis.matchedSkills.join(", ") || "Chưa có kỹ năng trùng"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 flex items-center shrink-0 ml-2">
            Chi tiết <ChevronRight className="h-3 w-3" />
          </span>
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 mt-4 pt-3.5">
        <button
          onClick={() => onSelectJob(job)}
          className="text-xs font-bold text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition flex items-center gap-1"
        >
          <span>Xem chi tiết JD</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>

        <div className="flex items-center gap-2">
          {score !== undefined && (
            <button
              onClick={() => onToggleSave?.(job.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition"
              title={isSaved ? "Bỏ lưu tin" : "Lưu tin này"}
            >
              {isSaved ? (
                <BookmarkCheck className="h-4 w-4 text-amber-500 fill-amber-500" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Primary External Apply Button with UTM */}
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 dark:hover:text-slate-950 transition shadow-xs"
            title={`Chuyển đến trang tuyển dụng gốc trên ${platform.name}`}
          >
            <span>Ứng tuyển tại {platform.shortName}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
