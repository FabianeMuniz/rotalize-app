//apiConfig.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { jwtDecode } from 'jwt-decode';
/** Base URL para DEV (escolha UMA) */
const BASE_URL_ANDROID = "http://10.0.2.2:44350";   // Android Emulator (recomendado)
const BASE_URL_IOS     = "http://localhost:44350";  // iOS Simulator (Mac)
const BASE_URL_WEB     = "http://localhost:44350";  // Expo web

export const BASE_URL = "https://willful-clamorous-nico.ngrok-free.dev";

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// injeta token em cada request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("auth_token");
  if (token) {
    // se for AxiosHeaders, funciona; se for objeto, também
    (config.headers ||= {} as any)["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// se tomar 401, limpe credenciais (sem navegar aqui — o Gate vai redirecionar)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      await SecureStore.deleteItemAsync("auth_token");
      await SecureStore.deleteItemAsync("auth_role");
      // não navegue aqui — apenas limpe. O Gate vai perceber token nulo.
    }
    return Promise.reject(error);
  }
);

/** Endpoints do seu backend (pelo seu Swagger) */
export const API_PATHS = {
  login: "/User/login",
  createUser: "/User",
  // perfil
  userMe: "/User",           // GET: retorna o usuário do token
  userById: (id: string) => `/User/${id}`, // fallback caso precise do id
  userUpdateOwn: "/User/own", //edita user
  // valida o código do e-mail
  verifyEmail: "/ApprovalProcess/confirm-email",
  // (futuro) resend envio novamente de email:
  resendVerification: "",
  // fluxo de recuperação
  requestPasswordReset: "/PasswordRecovery/request-recovery",        // envia e-mail com token
  resetPassword: "/PasswordRecovery/reset-password",        // usa token + nova senha
  // cadastro do veículo do usuário
  vehicle: "/Vehicle",
  // desativar veículo (não apagar, só marcar inativo)
  vehicleDeactivate: "/Vehicle/deactivate",
  // ativar veículo
   vehicleActivate: "/Vehicle/activate", 
  // listar veiculo por id
  vehiclebyuserid: "/Vehicle/by-user-id",
  vehicleById: (id: string) => `/Vehicle/${id}`,
  // cadastrar rotas do usuário
  processRoutePoints: "/RoutePoint/process-route-points",
  // obter rotas ativas do usuário
  getActiveRoutes: "/Route/active-routes",
  // obter detalhes de uma rota específica  
  getRouteDetailed: "/Route/detailed",
  // finalizar rota
  finishRoute: "/Route/finish",
  // histórico de rotas
  routeHistory: "/Route/history",
  // empresa por usuario
  enterpriseByUser: "/Enterprise/enterprise-by-user",
  //todos os usuarios vinuclado a uma empresa, visao do manager
  managerActiveUsers: "/Manager/active-users",
  // usuarios sem empresa vinculada
  managerUsersWithoutEnterprise: "/Manager/users-without-enterprise",
  // vincular usuario a empresa do manager logado 
  setAsManager: "/User/set-as-manager",
} as const;


/** Papéis aceitos no app */
export type UserRole = "admin" | "manager" | "user" | "unknown";

/** Payload de login do seu backend */
export function buildLoginPayload(username: string, password: string) {
  return { username, password };
}

/** Extrai o token de { success, data: { token } } OU { success, data: [ { token } ] } */
export function extractTokenFromLoginResponse(resp: any): string | null {
  const d = resp?.data ?? resp;
  if (Array.isArray(d) && d.length && d[0]?.token) return String(d[0].token);
  if (d?.token) return String(d.token);
  return null;
}

/** Lê as claims do JWT e tenta mapear o papel */
export function roleFromJwt(token: string): UserRole {
  try {
    const claims = jwtDecode<Record<string, any>>(token);

    const raw =
      claims["UserType"] ?? // vimos "UserType": "User"
      claims["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ?? // claim padrão MS
      claims["role"] ??
      (Array.isArray(claims["roles"]) ? claims["roles"][0] : null);

    const val = String(raw ?? "").toLowerCase();

    if (val.includes("admin")) return "admin";
    if (val.includes("manager")) return "manager";
    if (val.includes("user") || val.includes("usu")) return "user";
    return "unknown";
  } catch {
    return "unknown";
  }
}
  // fallback (só se um dia não vier no body)
export function readEmailConfirmedFromToken(token: string): boolean {
  try {
    const p: any = jwtDecode(token);
    const candidates = ["emailConfirmed", "emailVerified", "isEmailConfirmed", "isVerified"];
    for (const k of candidates) {
      if (typeof p?.[k] === "boolean") return p[k];
      if (typeof p?.[k] === "string") return ["true", "1"].includes(p[k].toLowerCase());
    }
  } catch {}
  return false;
  }

  

  

