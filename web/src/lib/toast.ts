import { toast as sonner, type ExternalToast } from "sonner";

/** The only place the app talks to the toast library. Use these everywhere. */
export const toast = {
    success: (message: string, options?: ExternalToast) => sonner.success(message, options),
    error: (message: string, options?: ExternalToast) => sonner.error(message, options),
    info: (message: string, options?: ExternalToast) => sonner(message, options),
    dismiss: (id?: string | number) => sonner.dismiss(id),
};