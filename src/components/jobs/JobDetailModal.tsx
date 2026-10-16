"use client";

import React from "react";
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
}

export const JobDetailModal: React.FC<JobDetailModalProps> = ({
  job,
  onClose,
  matchAnalysis,
  activeCV,
  isSaved = false,
  onToggleSave,
}) => {
  if (!job) return null;

  const platform = PLATFORM_CONFIGS[job.source_platform] || PLATFORM_CONFIGS.TOPCV;
  const applyUrl = buildApplyUrl(job.source_url, job.source_platform, job.id, job.title, job.company_name);
  const remaining = formatDaysRemaining(job.expires_at, job.is_expired);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Tuyển dụng ${job.title} tại ${job.company_name} trên TopViec`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Đã sao chép liên kết vào bộ nhớ tạm!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-lg px-2.5 py-1 text-xs font-black shadow-xs ${platform.badgeBg} ${platform.badgeText}`}
            >
              {platform.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Mã tin: {job.source_job_id} • Cập nhật {formatTimeAgo(job.crawled_at)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Chia sẻ tin tuyển dụng"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onToggleSave?.(job.id)}
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
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Title & Company Header */}
          <div className="flex items-start gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company_name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <Building2 className="h-8 w-8 text-slate-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                {job.title}
              </h1>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
                {job.company_name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {job.address_detail || `${job.location_district}, ${job.location_city}`}
              </p>
            </div>
          </div>

          {/* Key Facts Pill Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Mức lương</div>
              <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                {formatSalary(job.salary_raw_text, job.salary_min, job.salary_max, job.salary_currency)}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Khu vực</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {job.location_city}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Cấp bậc</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {EXPERIENCE_LABELS[job.experience_level]}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Hình thức</div>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                {JOB_TYPE_LABELS[job.job_type]}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Chuyên ngành IT</div>
              <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 mt-0.5 truncate">
                {job.it_subfield ? IT_SUBFIELD_LABELS[job.it_subfield] : "Công nghệ thông tin"}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 p-3">
              <div className="text-[11px] font-medium text-slate-500">Hạn ứng tuyển</div>
              <div
                className={`text-xs font-bold mt-0.5 ${
                  remaining.isExpired
                    ? "text-rose-600 dark:text-rose-400"
                    : remaining.isUrgent
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-teal-700 dark:text-teal-400"
                }`}
              >
                {remaining.label}
              </div>
            </div>
          </div>

          {/* DEDUPLICATION CROSS-POST NOTICE */}
          {job.source_cross_posted && job.source_cross_posted.length > 0 && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 dark:border-indigo-900/60 dark:bg-indigo-950/30 p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" />
                <span className="text-indigo-900 dark:text-indigo-200 font-medium">
                  Tin tuyển dụng này được đăng tải đồng thời trên:{" "}
                  <strong>{platform.name}</strong> và{" "}
                  <strong>{job.source_cross_posted.join(", ")}</strong>. TopViec đã tự động gộp trùng lặp bằng mã vân tay dữ liệu.
                </span>
              </div>
            </div>
          )}

          {/* AI CV MATCHING BREAKDOWN SECTION */}
          {matchAnalysis && activeCV && (
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
                      Thuật toán phân tích ngữ nghĩa và yêu cầu tuyển dụng
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

          {/* Job Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-emerald-600" />
              Mô tả công việc
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Yêu cầu ứng viên
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              Quyền lợi được hưởng
            </h3>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
              {job.benefits.map((ben, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <span>{ben}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Skills Tags */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Kỹ năng & Từ khóa liên quan
            </h3>
            <div className="flex flex-wrap gap-2">
              {job.skills_tags.map((skill, idx) => (
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Nguồn tin gốc: <strong className="text-slate-700 dark:text-slate-200">{platform.name}</strong> • Có UTM tracking an toàn
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition"
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
