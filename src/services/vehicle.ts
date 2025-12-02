// src/services/vehicle.ts
// Serviço de veículo: cria, lista (by user), busca por id e desativa

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from "jwt-decode";
import { API_PATHS, BASE_URL } from "../config/apiConfig";
import { getToken } from "./session";

/* ========= instância com timeout ========= */
export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/* ========= helpers ========= */
async function getAuthToken(): Promise<string | null> {
  // tenta sua função de sessão
  const fromSession = await getToken();
  if (fromSession) return fromSession;

  // fallback direto no SecureStore (chave mais comum do seu app)
  const fromStore = await SecureStore.getItemAsync("auth_token");
  return fromStore ?? null;
}

function extractUserIdFromJwt(token: string | null): string | null {
  if (!token) return null;
  try {
    const raw = token.replace(/^Bearer\s+/i, "");
    const claims = jwtDecode<Record<string, any>>(raw);
    return (
      claims["nameid"] ||
      claims["sub"] ||
      claims["userId"] ||
      claims["uid"] ||
      claims["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      null
    ) as string | null;
  } catch {
    return null;
  }
}

/* ========= interceptors ========= */
api.interceptors.request.use(async (cfg) => {
  const token = await getAuthToken();
  if (token) {
    const bearer = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    (cfg.headers as any) = { ...(cfg.headers || {}), Authorization: bearer };
  }
  return cfg;
});

api.interceptors.request.use((cfg) => {
  const method = (cfg.method ?? "GET").toUpperCase();
  const fullUrl = `${cfg.baseURL ?? BASE_URL}${cfg.url ?? ""}`;
  const auth = (cfg.headers as any)?.Authorization ? "Bearer ***" : "none";
  console.log("🚗➡️", method, fullUrl, "params:", cfg.params, "auth:", auth);
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const fullUrl = `${err?.config?.baseURL ?? ""}${err?.config?.url ?? ""}`;
    console.warn("🚗❌", err?.config?.method?.toUpperCase(), fullUrl, err?.response?.status, err?.message);
    return Promise.reject(err);
  }
);

/* ========= tipos ========= */
export type VehicleCreateDTO = {
  model: string;
  motor: string;
  estimatedConsumption: number; // km/l
  year: number;
};

export type VehicleDTO = {
  id: string;
  model: string;
  motor: string;
  estimatedConsumption: number;
  year: number;
  isActive: boolean;
};

/* ========= calls ========= */

export async function createVehicle(body: VehicleCreateDTO): Promise<VehicleDTO> {
  const res = await api.post(API_PATHS.vehicle, body);
  return res.data;
}

/** GET /Vehicle/by-user-id?userId=<uuid> */
export async function getVehiclesByUserId(userId: string): Promise<VehicleDTO[]> {
  const res = await api.get(API_PATHS.vehiclebyuserid, { params: { userId } });
  const payload = res?.data;

  // formatos suportados:
  // [ ... ] | { data: [ ... ] } | { success: true, data: [ ... ] } | { items: [ ... ] } | { result: [ ... ] }
  let list: any[] = [];
  if (Array.isArray(payload)) list = payload;
  else if (payload && typeof payload === "object") {
    if (Array.isArray(payload.data)) list = payload.data;
    else if (Array.isArray((payload as any).items)) list = (payload as any).items;
    else if (Array.isArray((payload as any).result)) list = (payload as any).result;
    else if (Array.isArray((payload as any)?.data?.items)) list = (payload as any).data.items;
  }

  console.log("🚗 by-user-id -> qtd:", list.length, "sample:", list[0]);

  // normaliza campos essenciais
  return list.map((v: any) => ({
    id: v.id ?? v.vehicleId ?? "",
    model: v.model ?? "",
    motor: v.motor ?? "",
    estimatedConsumption: Number(v.estimatedConsumption ?? v.consumption ?? 0),
    year: Number(v.year ?? 0),
    isActive: Boolean(v.isActive ?? true),
  })) as VehicleDTO[];
}

/** Usa o token para descobrir o userId e chamar o endpoint por usuário */
export async function getMyVehicles(): Promise<VehicleDTO[]> {
  const token = await getAuthToken();
  const userId = extractUserIdFromJwt(token);
  if (!userId) {
    console.warn("🚗 getMyVehicles: sem userId no token");
    return [];
  }
  console.log("🚗 getMyVehicles: userId =", userId);
  return getVehiclesByUserId(userId);
  
}

/** PATCH /Vehicle/deactivate?vehicleId=<uuid> */
export async function deactivateVehicle(vehicleId: string): Promise<void> {
  await api.patch(API_PATHS.vehicleDeactivate, null, { params: { vehicleId } });
}

/** GET /Vehicle/by-id?vehicleId=<uuid> */
export async function getVehicleById(vehicleId: string): Promise<VehicleDTO | null> {
  try {
    const res = await api.get("/Vehicle/by-id", { params: { vehicleId } });
    const payload = res?.data;
    let item: any = null;

    if (payload?.data) {
      item = Array.isArray(payload.data) ? payload.data[0] : payload.data;
    } else if (Array.isArray(payload)) {
      item = payload[0] ?? null;
    } else if (payload && typeof payload === "object" && payload.item) {
      item = payload.item;
    }

    if (!item) return null;

    const normalized: VehicleDTO = {
      id: item.id ?? item.vehicleId ?? "",
      model: item.model ?? "",
      motor: item.motor ?? "",
      estimatedConsumption: Number(item.estimatedConsumption ?? item.consumption ?? 0),
      year: Number(item.year ?? 0),
      isActive: Boolean(item.isActive ?? true),
    };
    return normalized;
  } catch {
    return null;
  }
}

export async function updateVehicle(vehicle: VehicleDTO): Promise<void> {
  const body = {
    id: vehicle.id,
    model: vehicle.model,
    motor: vehicle.motor,
    estimatedConsumption: vehicle.estimatedConsumption,
    year: vehicle.year,
  };
  await api.put(API_PATHS.vehicle, body);
}

/** PATCH /Vehicle/activate?vehicleId=<uuid> */
export async function activateVehicle(vehicleId: string): Promise<void> {
  await api.patch(API_PATHS.vehicleActivate, null, { params: { vehicleId } });
}
