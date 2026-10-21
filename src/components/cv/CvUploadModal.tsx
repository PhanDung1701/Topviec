"use client";

import React, { useState } from "react";
import {
  X,
  UploadCloud,
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { UserCVProfile } from "@/types/job";
import { parseCVText } from "@/utils/aiMatcher";

interface CvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCV: UserCVProfile | null;
  onSelectCV: (cv: UserCVProfile | null) => void;
}

export const CvUploadModal: React.FC<CvUploadModalProps> = ({
  isOpen,
  onClose,
  currentCV,
  onSelectCV,
}) => {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [draftCV, setDraftCV] = useState<UserCVProfile | null>(currentCV);
  const [pastedText, setPastedText] = useState("");
  const [newSkillInput, setNewSkillInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState("");

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/cv/extract", {
        method: "POST",
        body: formData,
      });
      const result = (await response.json()) as {
        success?: boolean;
        text?: string;
        error?: string;
      };

      if (!response.ok || !result.success || !result.text) {
        throw new Error(result.error || "Không thể đọc tệp CV");
      }

      const parsed = parseCVText(result.text, file.name);
      setDraftCV(parsed);
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Không thể đọc tệp này. Hãy thử dán nội dung văn bản CV."
      );
    } finally {
      setIsProcessing(false);
      e.target.value = "";
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      const parsed = parseCVText(pastedText, "CV_Dan_Truc_Tiep.txt");
      setDraftCV(parsed);
      setIsProcessing(false);
    }, 300);
  };

  const handleAddSkill = () => {
    if (!newSkillInput.trim() || !draftCV) return;
    if (!draftCV.skills.includes(newSkillInput.trim())) {
      setDraftCV({
        ...draftCV,
        skills: [...draftCV.skills, newSkillInput.trim()],
      });
    }
    setNewSkillInput("");
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!draftCV) return;
    setDraftCV({
      ...draftCV,
      skills: draftCV.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleApply = () => {
    onSelectCV(draftCV);
    onClose();
  };

  const handleRemoveCurrentCV = () => {
    onSelectCV(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-indigo-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-indigo-600 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Phân Tích & Khớp CV
                <span className="rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 dark:bg-emerald-950 dark:text-emerald-300">
                  Real-time Matching
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động tính % tương thích với các tin tuyển dụng IT từ 8 nguồn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 px-6 pt-3 gap-2 text-sm font-medium">
          <button
            onClick={() => setActiveTab("upload")}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === "upload"
                ? "border-emerald-600 text-emerald-700 font-bold dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Tải Lên Tệp CV (PDF/DOCX)</span>
          </button>
          <button
            onClick={() => setActiveTab("paste")}
            className={`pb-3 px-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === "paste"
                ? "border-emerald-600 text-emerald-700 font-bold dark:border-emerald-400 dark:text-emerald-400"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Dán Nội Dung CV</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 2: File Upload */}
          {activeTab === "upload" && (
            <div className="space-y-4">
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:border-emerald-500/60 dark:hover:bg-emerald-950/20 cursor-pointer transition">
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 mb-3">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Nhấn để chọn tệp hoặc kéo thả CV vào đây
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Hỗ trợ định dạng PDF, DOCX, TXT (Dung lượng tối đa 10MB)
                </p>
                <span className="mt-4 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Duyệt tệp từ máy tính
                </span>
              </label>
              {uploadError && (
                <p role="alert" className="text-xs font-medium text-rose-600 dark:text-rose-400">
                  {uploadError}
                </p>
              )}

              {draftCV?.fileName && (
                <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                      Tệp hiện tại: {draftCV.fileName}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    Đã trích xuất {draftCV.skills.length} kỹ năng
                  </span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Paste CV text */}
          {activeTab === "paste" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Dán toàn bộ hoặc các đoạn quan trọng trong CV (Kinh nghiệm, Kỹ năng, Dự án) để AI tự động bóc tách:
              </p>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="VD: Senior React Developer với 4 năm kinh nghiệm. Thành thạo TypeScript, Next.js, Node.js, AWS, Docker, RESTful API. Tiếng Anh giao tiếp tốt..."
                rows={6}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 p-3 text-xs leading-relaxed text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                disabled={!pastedText.trim() || isProcessing}
                className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-2 text-xs font-semibold text-white dark:text-slate-900 hover:bg-slate-800 disabled:opacity-50 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isProcessing ? "Đang phân tích..." : "AI Phân Tích Kỹ Năng & Kinh Nghiệm"}</span>
              </button>
            </div>
          )}

          {/* AI EXTRACTION PREVIEW & EDIT SECTION */}
          {draftCV && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-emerald-600" />
                  Hồ sơ ứng viên đang dùng để chấm điểm
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {draftCV.skills.length} Kỹ năng nhận diện
                </span>
              </div>

              {/* Editable Fields: Role and Exp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Vị trí chuyên môn / Chức danh:
                  </label>
                  <input
                    type="text"
                    value={draftCV.targetRole}
                    onChange={(e) => setDraftCV({ ...draftCV, targetRole: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Số năm kinh nghiệm ({draftCV.yearsOfExperience} năm):
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="1"
                    value={draftCV.yearsOfExperience}
                    onChange={(e) =>
                      setDraftCV({ ...draftCV, yearsOfExperience: parseInt(e.target.value, 10) })
                    }
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Skills Tags List */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Danh sách kỹ năng đã trích xuất (Bấm X để xóa hoặc thêm mới):
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                  {draftCV.skills.map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-emerald-700 hover:text-rose-600 dark:text-emerald-400"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new skill inline */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                    placeholder="Thêm kỹ năng khác (VD: GraphQL, Tiếng Hàn...)"
                    className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-950">
          {currentCV ? (
            <button
              onClick={handleRemoveCurrentCV}
              className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400"
            >
              <Trash2 className="h-4 w-4" />
              <span>Gỡ bỏ CV hiện tại</span>
            </button>
          ) : (
            <span className="text-xs text-slate-500">
              Chưa kích hoạt CV nào
            </span>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 transition"
            >
              Đóng
            </button>
            <button
              onClick={handleApply}
              disabled={!draftCV}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:brightness-105 active:scale-95 disabled:opacity-50 transition"
            >
              <Sparkles className="h-4 w-4" />
              <span>Áp Dụng & Khớp Việc Làm</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
