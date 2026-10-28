import { api } from "./client";
import type {
  ForgotPasswordRequest, LoginRequest, MessageResponse, RegisterRequest,
  ResetPasswordRequest, UserResponse, VerifyEmailRequest,
} from "../../types";

export const authApi = {
  register: (body: RegisterRequest) =>
    api.post<UserResponse>("/auth/register", body).then((r) => r.data),
  login: (body: LoginRequest) =>
    api.post<UserResponse>("/auth/login", body).then((r) => r.data),
  logout: () => api.post<void>("/auth/logout").then(() => undefined),
  me: () => api.get<UserResponse>("/auth/me").then((r) => r.data),
  verifyEmail: (body: VerifyEmailRequest) =>
    api.post<void>("/auth/verify-email", body).then(() => undefined),
  resendVerification: () =>
    api.post<void>("/auth/resend-verification").then(() => undefined),
  forgotPassword: (body: ForgotPasswordRequest) =>
    api.post<MessageResponse>("/auth/forgot-password", body).then((r) => r.data),
  resetPassword: (body: ResetPasswordRequest) =>
    api.post<MessageResponse>("/auth/reset-password", body).then((r) => r.data),
};
