type CrawlerServiceResult = {
  ok: boolean;
  configured: boolean;
  status?: number;
  data?: unknown;
  error?: string;
};

function getCrawlerServiceBaseUrl(): string | null {
  const configuredUrl = process.env.CRAWLER_API_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (process.env.NODE_ENV === "development") {
    return "http://127.0.0.1:8000";
  }

  return null;
}

export async function callCrawlerService(
  path: string,
  init: RequestInit = {},
  timeoutMs = 15_000
): Promise<CrawlerServiceResult> {
  const baseUrl = getCrawlerServiceBaseUrl();
  if (!baseUrl) {
    return {
      ok: false,
      configured: false,
      error: "CRAWLER_API_URL chưa được cấu hình",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const token = process.env.CRAWLER_API_TOKEN?.trim();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
      signal: controller.signal,
    });
    const data = await response.json().catch(() => null);

    return {
      ok: response.ok,
      configured: true,
      status: response.status,
      data,
      error: response.ok ? undefined : `Crawler service trả về HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      error:
        error instanceof Error && error.name === "AbortError"
          ? "Crawler service phản hồi quá thời gian"
          : error instanceof Error
            ? error.message
            : "Không thể kết nối crawler service",
    };
  } finally {
    clearTimeout(timeout);
  }
}

