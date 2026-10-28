import { api, API_ORIGIN } from "./client";

export const systemApi = {
  ping: () => api.get("/ping").then((r) => r.data),
  health: () =>
    api.get<{ status: string }>("/actuator/health", { baseURL: API_ORIGIN }).then((r) => r.data),
};
