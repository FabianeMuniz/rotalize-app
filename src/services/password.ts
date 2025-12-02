// src/services/password.ts
import { API_PATHS } from "../config/apiConfig";
import { api } from "./api";


/** Dispara o e-mail com token de recuperação */
export async function requestPasswordReset(email: string) {
  // Swagger: POST /PasswordRecovery/request-recovery?email=...
  return api.post(API_PATHS.requestPasswordReset, null, {
    params: { email },
  });
}

/** Reseta a senha usando token + nova senha */
export async function resetPassword(token: string, newPassword: string) {
  // Swagger: POST /PasswordRecovery/reset-password?token=...&newPassword=...
  return api.post(API_PATHS.resetPassword, null, {
    params: { token, newPassword },
  });
}