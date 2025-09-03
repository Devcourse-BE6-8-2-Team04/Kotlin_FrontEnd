import api from "@/lib/api";

type ApiFetchOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: any;
};

function normalizeUrl(url: string) {
  // path와 query 분리 후 path만 치환 (쿼리 안전)
  const [path, qs] = url.split("?");
  const newPath = path.replace(/^\/api\/v1\/comments(?=[\/]|$)/, "/api/v1/reviews");
  const newUrl = qs ? `${newPath}?${qs}` : newPath;

  // 디버깅 로그
  console.log("[apiFetch] url 변환:", url, "→", newUrl);
  return newUrl;
}

function tryParseJson(input: any) {
  if (typeof input === "string") {
    try { return JSON.parse(input); } catch { return input; }
  }
  return input;
}

export async function apiFetch<T = any>(url: string, options: ApiFetchOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  const headers = options.headers ?? {};
  const data = options.body ? tryParseJson(options.body) : undefined;

  const res = await api.request<T>({
    url: normalizeUrl(url),
    method,
    headers: {
      "Content-Type": "application/json",
      accept: "*/*",
      ...headers,
    },
    data,
  });

  return res.data as T;
}
