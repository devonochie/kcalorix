"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/lib/api";
import { keys } from "@/lib/query-keys";

/** Number on the bell. Refreshes every minute while the app is open. */
export function useUnreadCount(enabled = true) {
  const q = useQuery({
    queryKey: keys.notifications.unreadCount,
    queryFn: () => notificationsApi.unreadCount(),
    enabled,
    refetchInterval: 60_000,
  });
  return q.data?.count ?? 0;
}

/** The notification list, 20 at a time. unreadOnly = the "Unread" filter. */
export function useNotificationList(unreadOnly: boolean) {
  return useInfiniteQuery({
    queryKey: keys.notifications.list({ unreadOnly }),
    queryFn: ({ pageParam }) => notificationsApi.list({ unreadOnly, page: pageParam, size: 20 }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.page + 1 < last.totalPages ? last.page + 1 : undefined),
  });
}

/** After reading anything, refresh the list and the bell badge. */
function useRefreshNotifications() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: ["notifications"] });
}

export function useMarkRead() {
  const refresh = useRefreshNotifications();
  return useMutation({ mutationFn: (id: string) => notificationsApi.markRead(id), onSuccess: refresh });
}

export function useMarkAllRead() {
  const refresh = useRefreshNotifications();
  return useMutation({ meta: { success: "All caught up" }, mutationFn: () => notificationsApi.markAllRead(), onSuccess: refresh });
}