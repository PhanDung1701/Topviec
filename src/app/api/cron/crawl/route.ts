import { NextResponse } from "next/server";
import { callCrawlerService } from "@/services/crawlerService";
import { getLiveRealtimeJobs } from "@/services/liveJobService";

export const maxDuration = 60;

/**
 * Endpoint Cron Job cho Next.js (hỗ trợ Vercel Cron / External Cron Runner)
 * Vercel Hobby schedule: chạy mỗi ngày theo vercel.json.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Nếu có CRON_SECRET trong env thì kiểm tra xác thực an toàn
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Production uses a separately deployed Python service configured through
    // CRAWLER_API_URL. Localhost is only used during development.
    const crawlerResult = await callCrawlerService(
      "/api/crawl/run",
      { method: "POST", body: "{}" },
      10_000
    );

    // Always refresh the live-capable TypeScript sources. This gives the cron
    // useful work even when the optional Python service is not configured.
    const liveResult = await getLiveRealtimeJobs("");

    return NextResponse.json({
      success: true,
      message: crawlerResult.ok
        ? "Đã kích hoạt crawler service và làm mới nguồn trực tiếp."
        : "Đã làm mới nguồn trực tiếp; crawler service ngoài chưa được kích hoạt.",
      timestamp: new Date().toISOString(),
      triggeredMicroservice: crawlerResult.ok,
      crawlerServiceConfigured: crawlerResult.configured,
      crawlerServiceError: crawlerResult.error,
      refreshedLiveJobs: liveResult.liveJobCount,
      totalJobs: liveResult.total,
      sourcesBreakdown: liveResult.sources,
      nextSchedule: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
