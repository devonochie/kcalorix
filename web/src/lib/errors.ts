import { isApiError } from "@/lib/api";

/** One readable sentence for any error thrown by your API layer. */
export function errorMessage(e: unknown): string {
  if (isApiError(e)) {
    if (e.code === "NETWORK_ERROR") return "Can't reach the server. Check your connection and try again.";
    return e.message || "Something went wrong.";
  }
  if (e instanceof Error && e.message) return e.message;
  return "Something went wrong.";
}

/** Login gets a friendlier text for a wrong email or password. */
export function loginErrorMessage(e: unknown): string {
  if (isApiError(e) && e.status === 401) return "Incorrect email or password.";
  return errorMessage(e);
}

/** { email: "must be valid" } style errors for showing under each input. */
export function fieldErrors(e: unknown): Record<string, string> {
  return isApiError(e) ? (e.fieldErrors ?? {}) : {};
}
