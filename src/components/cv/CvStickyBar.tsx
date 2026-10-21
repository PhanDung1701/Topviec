"use client";

import React from "react";
import { Sparkles, Edit3, X, CheckCircle2 } from "lucide-react";
import { UserCVProfile } from "@/types/job";

interface CvStickyBarProps {
  cv: UserCVProfile | null;
  onOpenModal: () => void;
  onClearCV: () => void;
  bestMatchScore?: number;
}

export const CvStickyBar: React.FC<CvStickyBarProps> = ({
  cv,
  onOpenModal,
  onClearCV,
  bestMatchScore,
}) => {
  if (!cv) {
    return (
      <div className="rounded-2xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 transition-all">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Bật tính năng AI Chấm điểm CV để tìm việc chuẩn xác nhất
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Tải lên CV của bạn (PDF / DOCX) để hệ thống AI tự động phân tích và so khớp độ tương thích với từng việc làm IT.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenModal}
            className="shrink-0 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition"
          >
            Tải lên CV phân tích ngay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-indigo-950/40 p-4 shadow-sm transition">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Profile Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                {cv.fullName}
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 dark:bg-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {cv.targetRole}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • {cv.yearsOfExperience} năm KN
              </span>
            </div>
            {/* Skills preview */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Kỹ năng trọng tâm:
              </span>
              {cv.skills.slice(0, 5).map((skill, idx) => (
                <span
                  key={idx}
                  className="rounded bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))}
              {cv.skills.length > 5 && (
                <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                  +{cv.skills.length - 5} kỹ năng khác
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Match Highlights & Actions */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200 dark:border-slate-800">
          {bestMatchScore !== undefined && (
            <div className="text-right">
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Độ khớp cao nhất</div>
              <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {bestMatchScore}% Match
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenModal}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Chỉnh sửa / Đổi CV</span>
            </button>
            <button
              onClick={onClearCV}
              title="Gỡ bỏ hồ sơ này"
              className="rounded-xl border border-slate-300 dark:border-slate-700 p-2 text-slate-400 hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-900 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
