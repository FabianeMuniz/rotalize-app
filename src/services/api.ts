//api.ts
import axios, { AxiosHeaders } from "axios";
import * as SecureStore from "expo-secure-store";
import { API_PATHS, BASE_URL } from "../config/apiConfig";

export const api = axios.create({ baseURL: BASE_URL});

const AUTHLESS = [API_PATHS.login, API_PATHS.createUser, API_PATHS.resetPassword, API_PATHS.requestPasswordReset];

api.interceptors.request.use(async (config) => {
  

  const raw = await SecureStore.getItemAsync("auth_token");
  if (raw) {
    const token = raw.replace(/^Bearer\s+/i, "");
    if (!config.headers || !(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers);
    }
    (config.headers as AxiosHeaders).set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// 2) Interceptor com log “seguro” (sem TS18048)
api.interceptors.request.use((cfg) => {
  const method = (cfg.method ?? "GET").toUpperCase();
  // monta a URL completa de forma tolerante
  const fullUrl = `${cfg.baseURL ?? BASE_URL}${cfg.url ?? ""}`;

  // LOG: não acessa nada que o TS considere possivelmente undefined
  console.log("➡️", method, fullUrl, "params:", cfg.params, "data:", cfg.data, "auth:", cfg.headers?.Authorization);

  return cfg;
});