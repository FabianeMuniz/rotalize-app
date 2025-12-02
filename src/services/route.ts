// src/services/route.ts
import { API_PATHS } from "../config/apiConfig";
import { api } from "./api";

/** ===== Tipagens do backend (ajuste se necessário) ===== */
export type RoutePointPayload = {
  latitude: number;
  longitude: number;
  address: string;
  isInitialPoint: boolean;
};

export type CreateRoutePayload = {
  routeName: string;
  routePoints: RoutePointPayload[];
};

export type ActiveRoute = {
  id: string;
  routeName: string;
  createdAt: string;
  status: string;       // "InProgress" etc.
  routePoints: any[];   // se quiser, tipar depois
};

export type CreateRouteResponse = {
  success: boolean;
  data?: { routeId?: string };
  message?: string;
};

export type ActiveRoutesResponse = {
  success: boolean;
  data: ActiveRoute[];
};

// src/services/route.ts

/** Ponto detalhado que o backend retorna no /Route/detailed */
export type RoutePointDetailed = {
  id: string;
  address: string;
  position: number;     // ordem
  distance: number;     // em metros
  // estes podem não vir — deixe opcionais
  latitude?: number | string | null;
  longitude?: number | string | null;
  isInitialPoint?: boolean;
  createdAt?: string;
  
};

export type RouteDetailedResponse = {
  success: boolean;
  data: {
    id: string;
    routeName: string;
    createdAt: string;
    status: number | string;       // na sua resposta veio 2
    routeLink?: string;
    routePoints: RoutePointDetailed[];
    estimatedConsumption: number; // em litros,
    vehicleModel: string;
  };
};


/** ===== Chamadas ===== */
export async function processRoutePoints(payload: CreateRoutePayload) {
  try {
    const { data } = await api.post<CreateRouteResponse>(API_PATHS.processRoutePoints, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 20000,
    });
    return data;
  } catch (err: any) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors.join("; ") : String(err));
    throw Object.assign(new Error(msg), { response: err?.response });
  }
}


export async function getActiveRoutes() {
  const { data } = await api.get<ActiveRoutesResponse>(API_PATHS.getActiveRoutes);
  return data;
}

export async function getRouteDetailed(routeId: string) {
  const url = `${API_PATHS.getRouteDetailed}?routeId=${encodeURIComponent(routeId)}`;
  const { data } = await api.get<RouteDetailedResponse>(url);
  return data;
}

export async function finishRoute(routeId: string) {
  const url = `${API_PATHS.finishRoute}?routeId=${encodeURIComponent(routeId)}`;
  // importante: PUT sem body -> passe null como segundo arg
  const { data } = await api.put(url, null, {
    headers: { "Content-Type": "application/json" },
    timeout: 20000,
  });
  return data; // esperado: { success: true } ou 200 OK
}

/** GET /Route/history -> rotas concluídas */
export async function getRouteHistory() {
  const { data } = await api.get(API_PATHS.routeHistory); // deve ser "/Route/history"
  return data; // { success: boolean, data: HistoryRoute[] }
}

