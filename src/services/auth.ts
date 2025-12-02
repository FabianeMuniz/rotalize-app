import * as SecureStore from "expo-secure-store";
import { API_PATHS } from "../config/apiConfig";
import { api } from "./api";

export async function verifyEmailCode(code: string) {
  // pega o token salvo no passo do login não confirmado
  const bearer = await SecureStore.getItemAsync("pending_verify_token");
  if (!bearer) {
    throw new Error("Token temporário ausente. Faça login novamente.");
  }

  // o Swagger mostra emailCode na QUERY, não no JSON
  return api.post(API_PATHS.verifyEmail, undefined, {
    params: { emailCode: Number(code) },    // int32
    headers: { Authorization: `Bearer ${bearer}` },
  });
}
// Mantemos a função para o futuro, mas só ativa quando tiver path
export async function resendVerificationCode(email: string) {
  if (!API_PATHS.resendVerification) {
    throw new Error("Endpoint de reenvio ainda não disponível.");
  }
  return api.post(API_PATHS.resendVerification, { email }, {
    headers: { "Content-Type": "application/json" },
  });
}

