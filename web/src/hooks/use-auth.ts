"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authApi, isApiError } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import type { LoginRequest, RegisterRequest, UserResponse } from "@/types";

/** The logged-in user. user === null means "not logged in" (that is not an error). */
export function useMe() {
  const q = useQuery({
    queryKey: keys.me,
    queryFn: async (): Promise<UserResponse | null> => {
      try {
        return await authApi.me();
      } catch (e) {
        // 401 / 403 = no valid session = not logged in
        if (isApiError(e) && (e.status === 401 || e.status === 403)) return null;
        throw e;
      }
    },
    retry: false,
    staleTime: 60_000,
  });
  return {
    user: q.data ?? null,
    isLoading: q.isLoading,
    isError: q.isError,
    refetch: q.refetch,
  };
}

const homeFor = (user: UserResponse) => (user.onboardingCompleted ? "/today" : "/onboarding");

export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (user) => {
      qc.setQueryData(keys.me, user);
      router.replace(homeFor(user));
    },
  });
}

/** Your backend's register does NOT start a session, so we log in right after. */
export function useRegister() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: async (body: RegisterRequest) => {
      await authApi.register(body);
      try {
        return await authApi.login({ email: body.email, password: body.password });
      } catch {
        throw new Error("Your account was created, but we couldn't log you in. Please go to the log in page.");
      }
    },
    onSuccess: (user) => {
      qc.setQueryData(keys.me, user);
      router.replace(homeFor(user));
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => {
      qc.clear();
      qc.setQueryData(keys.me, null);
      router.replace("/login");
    },
  });
}

export function useResendVerification() {
  return useMutation({ meta: { success: "Verification email sent" }, mutationFn: () => authApi.resendVerification() });
}

export function useVerifyEmail() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail({ token }),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.me }),
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => authApi.forgotPassword({ email }) });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (v: { token: string; newPassword: string }) => authApi.resetPassword(v),
  });
}