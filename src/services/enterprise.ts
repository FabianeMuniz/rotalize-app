import { AxiosHeaders } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_PATHS } from "../config/apiConfig";
import { api } from "./api";

const TOKEN_KEY = "auth_token";

export interface EnterpriseDTO {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
  createdAt?: string;
  registerNumber?: string;
}

// 🔐 Função auxiliar para gerar headers autenticados
async function authHeaders(): Promise<AxiosHeaders> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!raw) throw new Error("Sem token. Faça login pelo app.");
  const token = raw.replace(/^Bearer\s+/i, "");

  const headers = new AxiosHeaders();
  headers.set("Authorization", `Bearer ${token}`);
  return headers;
}

// 📋 Buscar todas as empresas
export async function getAllEnterprises(): Promise<EnterpriseDTO[]> {
  const headers = await authHeaders();
  const { data } = await api.get("/Enterprise/all", { headers });

  const list = Array.isArray(data) ? data : data?.data;
  return (Array.isArray(list) ? list : []) as EnterpriseDTO[];
}

// ✏️ Atualizar empresa
export async function updateEnterprise(input: {
  id: string;
  name: string;
  registerNumber?: string;
}): Promise<void> {
  const headers = await authHeaders();
  await api.put("/Enterprise", input, { headers });
}

// 🗑️ Excluir empresa
export async function deleteEnterprise(enterpriseId: string): Promise<void> {
  const headers = await authHeaders();
  await api.delete("/Enterprise", {
    headers,
    params: { enterpriseId }, // conforme Swagger (query)
  });
}
// Cadastrar nova empresa
export async function createEnterprise(input: {
  name: string;
  registerNumber?: string;
}): Promise<void> {
  const headers = await authHeaders();
  await api.post("/Enterprise", input, { headers });
}

export async function getEnterpriseByUser(): Promise<EnterpriseDTO | null> {
  try {
    const headers = await authHeaders();
    const { data } = await api.get(API_PATHS.enterpriseByUser);
    // Alguns backends envolvem em { data: {...} }
    const payload = (data?.data ?? data) as EnterpriseDTO | null;
    return payload ?? null;
  } catch (err: any) {
    const status = err?.response?.status;
    // Swagger mostrou 400 { "status":400, "data":"Company not found" }
    if (status === 400 || status === 404) return null; // sem empresa
    throw err;
  }
}
