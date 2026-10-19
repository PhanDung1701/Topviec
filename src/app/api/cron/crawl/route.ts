import { NextResponse } from "next/server";

/**
 * Endpoint Cron Job cho Next.js (hỗ trợ Vercel Cron / External Cron Runner)
 * Tần suất khuyến nghị: 0 *\/6 * * * (Mỗi 6 tiếng 1 lần)
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Nếu có CRON_SECRET trong env thì kiểm tra xác thực an toàn
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 1. Thử gọi Scrapling FastAPI Microservice nếu đang chạy (cổng 8000)
    let triggeredPythonService = false;
    try {
      const apiRes = await fetch("http://127.0.0.1:8000/api/crawl/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (apiRes.ok) {
        triggeredPythonService = true;
      }
    } catch {
      // Python service offline, không ảnh hưởng
    }

    return NextResponse.json({
      success: true,
      message: "Chu kỳ cập nhật định kỳ 6 tiếng đã được kích hoạt thành công.",
      timestamp: new Date().toISOString(),
      triggeredMicroservice: triggeredPythonService,
      nextSchedule: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
