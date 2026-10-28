import { api } from "./client";
import type { DeleteAccountRequest, UserDataExport } from "../../types";

export const accountApi = {
  /** DELETE /me (password in the body) */
  deleteAccount: (body: DeleteAccountRequest) =>
    api.delete<void>("/me", { data: body }).then(() => undefined),
  exportData: () => api.get<UserDataExport>("/me/export").then((r) => r.data),
  /** GET /me/export/csv -> zip of CSV files */
  exportCsv: () => api.get<Blob>("/me/export/csv", { responseType: "blob" }).then((r) => r.data),
};
