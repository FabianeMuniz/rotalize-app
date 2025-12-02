import { AxiosHeaders } from "axios";
import * as SecureStore from "expo-secure-store";
import { api } from "./api";

const TOKEN_KEY = "auth_token";

export interface UserDTO {
  id: string; name: string; email: string;
  role?: string; isActive?: boolean; createdAt?: string;
}

export async function getAllUsers(): Promise<UserDTO[]> {
  const raw = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!raw) throw new Error("Sem token. Faça login pelo app.");

  const token = raw.replace(/^Bearer\s+/i, ""); // garante sem prefixo

  // ✅ use AxiosHeaders para garantir que o Axios v1 não descarte o header
  const headers = new AxiosHeaders();
  headers.set("Authorization", `Bearer ${token}`);

  const { data } = await api.get("/User/all", { headers });
  const list = Array.isArray(data) ? data : data?.data;
  return (Array.isArray(list) ? list : []) as UserDTO[];
}
