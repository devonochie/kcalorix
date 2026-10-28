import { api } from "./client";
import type {
  ProfileRequest, ProfileResponse, WeightLogParams, WeightLogRequest, WeightLogResponse,
} from "../../types";

export const profileApi = {
  get: () => api.get<ProfileResponse>("/profile").then((r) => r.data),
  update: (body: ProfileRequest) =>
    api.put<ProfileResponse>("/profile", body).then((r) => r.data),
};

export const weightLogsApi = {
  create: (body: WeightLogRequest) =>
    api.post<WeightLogResponse>("/weight-logs", body).then((r) => r.data),
  list: (params?: WeightLogParams) =>
    api.get<WeightLogResponse[]>("/weight-logs", { params }).then((r) => r.data),
};
