"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { accountApi, insightsApi, notificationsApi, profileApi, weightLogsApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";
import type {
  DeleteAccountRequest, ProfileRequest, UpdatePreferencesRequest, UserResponse, WeightLogRequest,
} from "@/types";

export function useProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: () => profileApi.get() });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Targets updated" },
    mutationFn: (body: ProfileRequest) => profileApi.update(body),
    onSuccess: (profile) => {
      qc.setQueryData(keys.profile, profile);
      // Mark onboarding done right away so the route guards let the person into the app.
      qc.setQueryData<UserResponse | null>(keys.me, (old) => (old ? { ...old, onboardingCompleted: true } : old));
      void qc.invalidateQueries({ queryKey: keys.targets });
      void qc.invalidateQueries({ queryKey: ["balance"] });
      void qc.invalidateQueries({ queryKey: ["trends"] });
      void qc.invalidateQueries({ queryKey: ["weight-logs"] });
    },
  });
}

export function useTargets(enabled = true) {
  return useQuery({ queryKey: keys.targets, queryFn: () => insightsApi.targets(), enabled });
}

export function useNotificationPrefs() {
  return useQuery({ queryKey: keys.notifications.prefs, queryFn: () => notificationsApi.getPreferences() });
}

export function useUpdateNotificationPrefs() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Preferences saved" },
    mutationFn: (body: UpdatePreferencesRequest) => notificationsApi.updatePreferences(body),
    onSuccess: (prefs) => qc.setQueryData(keys.notifications.prefs, prefs),
  });
}

/** Downloads everything the backend stores about the person as a JSON file. */
export function useExportData() {
  return useMutation({
    meta: { success: "Data exported" },
    mutationFn: async () => {
      const data = await accountApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kcalorix-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}

/** Downloads the same data as a zip of CSV files (opens in Excel / Sheets). */
export function useExportCsv() {
  return useMutation({
    meta: { success: "CSV exported" },
    mutationFn: async () => {
      const blob = await accountApi.exportCsv();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kcalorix-data-${new Date().toISOString().slice(0, 10)}-csv.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
  });
}

export function useDeleteAccount() {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    meta: { success: "Account deleted" },
    mutationFn: (body: DeleteAccountRequest) => accountApi.deleteAccount(body),
    onSuccess: () => {
      qc.clear();
      qc.setQueryData(keys.me, null);
      router.replace("/");
    },
  });
}

/** Saves a weigh-in, then refreshes everything that shows weight. */
export function useLogWeight() {
  const qc = useQueryClient();
  return useMutation({
    meta: { success: "Weight logged" },
    mutationFn: (body: WeightLogRequest) => weightLogsApi.create(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["trends"] });
      void qc.invalidateQueries({ queryKey: ["weight-logs"] });
      void qc.invalidateQueries({ queryKey: keys.profile });
      void qc.invalidateQueries({ queryKey: keys.targets });
    },
  });
}