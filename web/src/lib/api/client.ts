import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiError } from "../../types";

export const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** All routes below are relative to /api/v1 */
export const api = axios.create({
  baseURL: `${API_ORIGIN}/api/v1`,
  withCredentials: true,          // session cookie (CALORIX_SESSION)
  withXSRFToken: true,            // axios >= 1.6: send the CSRF header cross-origin too
  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
  headers: { "Content-Type": "application/json" },
});

const SAFE_METHODS = ["get", "head", "options"];
const hasCsrfCookie = () =>
  typeof document !== "undefined" && document.cookie.includes("XSRF-TOKEN=");

// Make sure the CSRF cookie exists before the first POST/PUT/DELETE.
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toLowerCase();
  if (!SAFE_METHODS.includes(method) && !hasCsrfCookie()) {
    try { await api.get("/ping"); } catch { /* cookie may still be set on a 404 */ }
  }
  return config;
});

/** Normalised error you can use in catch blocks. */
export class ApiRequestError extends Error {
  status: number;
  code: string;
  fieldErrors: Record<string, string> | null;
  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string> | null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiError>) => {
    const data = error.response?.data;
    return Promise.reject(
      new ApiRequestError(
        error.response?.status ?? 0,
        data?.code ?? (error.response ? "UNKNOWN" : "NETWORK_ERROR"),
        data?.message ?? error.message,
        data?.fieldErrors ?? null,
      ),
    );
  },
);

export const isApiError = (e: unknown): e is ApiRequestError => e instanceof ApiRequestError;
