import { api } from "./client";
import type {
  DailyBalanceResponse, LocalDate, TargetsResponse, TrendsParams, TrendsResponse,
} from "../../types";

export const insightsApi = {
  targets: () => api.get<TargetsResponse>("/insights/targets").then((r) => r.data),
  balance: (date?: LocalDate) =>
    api.get<DailyBalanceResponse>("/insights/balance", { params: { date } }).then((r) => r.data),
  /** days defaults to 7 on the server; end = last day of the range */
  trends: (params?: TrendsParams) =>
    api.get<TrendsResponse>("/insights/trends", { params }).then((r) => r.data),
};
