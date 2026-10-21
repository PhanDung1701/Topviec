import { NextResponse } from "next/server";
import { getLiveRealtimeJobs } from "@/services/liveJobService";
import { ITSubfield, PlatformSource } from "@/types/job";
import { isJobValidWithinMonth, removeVietnameseTones } from "@/utils/formatters";
import { callCrawlerService } from "@/services/crawlerService";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") || "";
  const city = searchParams.get("city") || "";
  const source = searchParams.get("source") as PlatformSource | null;
  const itSubfield = searchParams.get("itSubfield") as ITSubfield | null;
  const includeExpired = searchParams.get("includeExpired") === "true";

  // Fetch live in real-time directly from original job platforms
  const liveResult = await getLiveRealtimeJobs(keyword);
  let results = liveResult.jobs;

  // Filter 1: Expired and older than 1 month check
  if (!includeExpired) {
    results = results.filter((j) => isJobValidWithinMonth(j));
  }

  // Filter 2: IT Subfield
  if (itSubfield && itSubfield !== "ALL") {
    results = results.filter((j) => {
      if (j.it_subfield === itSubfield) return true;
      if (itSubfield === "SECURITY_AN_NINH" && (j.it_subfield as string) === "SECURITY") return true;
      if (itSubfield === "INFRASTRUCTURE_CLOUD" && (j.it_subfield as string) === "DEVOPS_CLOUD") return true;
      return false;
    });
  }

  // Filter 3: City (Supports Thanh Hóa, Hà Nội, TP.HCM, etc.)
  if (city && city !== "Toàn quốc") {
    const normCity = removeVietnameseTones(city).toLowerCase();
    results = results.filter((j) => {
      const jCity = removeVietnameseTones(j.location_city).toLowerCase();
      const jAddr = removeVietnameseTones(j.address_detail || "").toLowerCase();
      return jCity.includes(normCity) || jAddr.includes(normCity);
    });
  }

  // Filter 4: Source
  if (source) {
    results = results.filter((j) => j.source_platform === source);
  }

  return NextResponse.json({
    success: true,
    isRealtime: liveResult.isRealtime,
    total: results.length,
    data: results,
    sourcesBreakdown: liveResult.sources,
    liveSources: liveResult.liveSources,
    snapshotSources: liveResult.snapshotSources,
    liveJobCount: liveResult.liveJobCount,
    snapshotJobCount: liveResult.snapshotJobCount,
    fallbackJobCount: liveResult.snapshotJobCount,
    directSourcesBreakdown: liveResult.directSourcesBreakdown,
    directSourcesWithResults: liveResult.directSourcesWithResults,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const platform = body.platform as PlatformSource | undefined;
    const crawlerResult = await callCrawlerService(
      "/api/crawl/run",
      {
        method: "POST",
        body: JSON.stringify({ platform }),
      },
      5_000
    );
    const liveResult = await getLiveRealtimeJobs("");
    const crawledCount = platform
      ? liveResult.sources[platform] ?? 0
      : liveResult.liveJobCount;

    return NextResponse.json({
      success: true,
      message: platform
        ? `Đã làm mới dữ liệu nguồn ${platform}.`
        : "Đã truy vấn trực tiếp và làm mới cả 8 nguồn tuyển dụng.",
      syncedAt: new Date().toISOString(),
      crawledCount,
      totalCount: liveResult.total,
      sourcesBreakdown: liveResult.sources,
      liveSources: liveResult.liveSources,
      snapshotSources: liveResult.snapshotSources,
      directSourcesBreakdown: liveResult.directSourcesBreakdown,
      directSourcesWithResults: liveResult.directSourcesWithResults,
      crawlerService: {
        configured: crawlerResult.configured,
        triggered: crawlerResult.ok,
        error: crawlerResult.error,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Lỗi đồng bộ dữ liệu" },
      { status: 500 }
    );
  }
}
