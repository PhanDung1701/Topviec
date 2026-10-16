import { NextResponse } from "next/server";
import { enrichJobDetail } from "@/services/jobDetailScraper";
import { getLiveRealtimeJobs } from "@/services/liveJobService";
import { MOCK_JOBS } from "@/data/mockJobs";
import { JobListing } from "@/types/job";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const url = searchParams.get("url");

    if (!id && !url) {
      return NextResponse.json(
        { success: false, error: "Thiếu id hoặc url công việc" },
        { status: 400 }
      );
    }

    // 1. Try finding job by id from active feeds
    let targetJob: JobListing | undefined;

    if (id) {
      // Check MOCK_JOBS
      targetJob = MOCK_JOBS.find((j) => j.id === id || j.source_job_id === id);

      // If not in MOCK_JOBS, check live feed
      if (!targetJob) {
        const live = await getLiveRealtimeJobs("");
        targetJob = live.jobs.find((j) => j.id === id || j.source_job_id === id);
      }
    }

    // 2. If job not found by id but url is present, construct minimal job
    if (!targetJob && url) {
      targetJob = {
        id: id || `temp-${Date.now()}`,
        title: "Tuyển dụng IT",
        company_name: "Doanh nghiệp",
        company_logo: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
        location_city: "Toàn quốc",
        location_district: "",
        address_detail: "Việt Nam",
        salary_min: 15,
        salary_max: 30,
        salary_currency: "VND",
        salary_raw_text: "Thỏa thuận",
        description: "",
        requirements: [],
        benefits: [],
        skills_tags: ["IT Support"],
        job_type: "FULL_TIME",
        experience_level: "MIDDLE",
        industry: "Công nghệ thông tin",
        source_platform: url.includes("careerlink.vn")
          ? "CAREERLINK"
          : url.includes("topcv.vn")
            ? "TOPCV"
            : "CAREERVIET",
        source_url: url,
        source_job_id: id || "LIVE",
        fingerprint_hash: "",
        posted_at: new Date().toISOString(),
        crawled_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        is_active: true,
      };
    }

    if (!targetJob) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy thông tin tin tuyển dụng" },
        { status: 404 }
      );
    }

    // 3. Scrape and enrich with 100% full original details
    const enrichedJob = await enrichJobDetail(targetJob);

    return NextResponse.json({
      success: true,
      data: enrichedJob,
      isEnriched: true,
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API /api/jobs/detail error:", error);
    return NextResponse.json(
      { success: false, error: "Lỗi trích xuất chi tiết tin tuyển dụng" },
      { status: 500 }
    );
  }
}
