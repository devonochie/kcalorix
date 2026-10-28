import { api } from "./client";
import type {
  NotificationListParams, NotificationResponse, PageResponse, PreferencesResponse,
  UnreadCountResponse, UpdatePreferencesRequest, UUID,
} from "../../types";

export interface PushSubscribeBody { endpoint: string; p256dh: string; auth: string }

export const notificationsApi = {
  getPreferences: () =>
      api.get<PreferencesResponse>("/notifications/preferences").then((r) => r.data),
  updatePreferences: (body: UpdatePreferencesRequest) =>
      api.put<PreferencesResponse>("/notifications/preferences", body).then((r) => r.data),
  list: (params?: NotificationListParams) =>
      api.get<PageResponse<NotificationResponse>>("/notifications", { params }).then((r) => r.data),
  unreadCount: () =>
      api.get<UnreadCountResponse>("/notifications/unread-count").then((r) => r.data),
  markRead: (id: UUID) =>
      api.post<void>(`/notifications/${id}/read`).then(() => undefined),
  markAllRead: () => api.post<void>("/notifications/read-all").then(() => undefined),

  // push (phone/browser alerts)
  pushPublicKey: () =>
      api.get<{ publicKey: string }>("/notifications/push/public-key").then((r) => r.data.publicKey),
  pushSubscribe: (body: PushSubscribeBody) =>
      api.post<void>("/notifications/push/subscribe", body).then(() => undefined),
  pushUnsubscribe: (endpoint: string) =>
      api.post<void>("/notifications/push/unsubscribe", { endpoint }).then(() => undefined),
};