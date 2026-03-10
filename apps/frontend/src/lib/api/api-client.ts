import { ApiError } from "@/lib/query/query-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

const TOKEN_KEY = "lms_token";

export const tokenStorage = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  set: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem(TOKEN_KEY, token);
      document.cookie = `accessToken=${token}; path=/`;
    }
  },
  remove: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      document.cookie = "accessToken=; Max-Age=0; path=/";
    }
  },
};

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = tokenStorage.get();

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      /* ignore */
    }
    const message =
      (data as { message?: string })?.message ??
      `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, data);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  patch: <T>(path: string, body: unknown) => request<T>("PATCH", path, body),
  delete: <T>(path: string) => request<T>("DELETE", path),
  /** Multipart form data (e.g. file upload). Do not set Content-Type. */
  async postFormData<T>(path: string, formData: FormData): Promise<T> {
    const token = tokenStorage.get();
    const headers: HeadersInit = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      let data: unknown;
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }
      const message =
        (data as { message?: string })?.message ??
        `Upload failed: ${res.status}`;
      throw new ApiError(res.status, message, data);
    }
    return res.json() as Promise<T>;
  },
};

export { BASE_URL };
