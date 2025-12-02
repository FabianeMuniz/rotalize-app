// src/contexts/AuthContext.tsx
import * as SecureStore from "expo-secure-store";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  API_PATHS,
  buildLoginPayload,
  extractTokenFromLoginResponse,
  roleFromJwt,
  type UserRole,
} from "../config/apiConfig";
import { api } from "../services/api";

type AuthContextType = {
  token: string | null;
  role: UserRole;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<UserRole>;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  token: null,
  role: "unknown",
  loading: true,
  signIn: async () => "unknown",
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = "auth_token";
const ROLE_KEY = "auth_role";

// remove prefixo "Bearer " se vier do backend assim
function stripBearer(t: string | null | undefined) {
  return (t ?? "").replace(/^Bearer\s+/i, "");
}

// valida forma básica de JWT (3 partes separadas por ponto)
function isLikelyJwt(t: string | null | undefined) {
  return !!t && t.split(".").length === 3;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("unknown");
  const [loading, setLoading] = useState(true);

  // Restaura sessão no boot
  useEffect(() => {
    (async () => {
      try {
        const savedTokenRaw = await SecureStore.getItemAsync(TOKEN_KEY);
        const savedToken = stripBearer(savedTokenRaw);
        const savedRole = (await SecureStore.getItemAsync(ROLE_KEY)) as
          | UserRole
          | null;

        if (isLikelyJwt(savedToken)) {
          setToken(savedToken);
          api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
        } else {
          // se estava algo inválido, limpa para evitar 401 confuso
          await SecureStore.deleteItemAsync(TOKEN_KEY);
        }

        if (savedRole) setRole(savedRole);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    // monta payload do seu backend
    const payload = buildLoginPayload(username, password);
    const { data } = await api.post(API_PATHS.login, payload);

    // Tente extrair com seu helper; se necessário, adapte aqui
    let accessToken = extractTokenFromLoginResponse(data);
    if (!accessToken) {
      // fallback comum (ajuste se seu backend usa outro campo)
      accessToken =
        (data?.data?.token as string | undefined) ??
        (data?.token as string | undefined) ??
        (data?.accessToken as string | undefined) ??
        (data?.jwt as string | undefined) ??
        null;
    }

    accessToken = stripBearer(accessToken);

    if (!isLikelyJwt(accessToken)) {
      throw new Error(
        "Token inválido na resposta de login (não parece um JWT)."
      );
    }

    const userRole = roleFromJwt(accessToken) as UserRole;

    // mantém em memória
    setToken(accessToken);
    setRole(userRole);

    // injeta no axios global
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    // persiste
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(ROLE_KEY, userRole);

    return userRole; // a tela decide pra onde navegar
  }, []);

  const signOut = useCallback(async () => {
    try {
      setToken(null);
      setRole("unknown");
      delete api.defaults.headers.common.Authorization;
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(ROLE_KEY);
    } finally {
      // nada além disso: o Gate (_layout) cuida do redirect
    }
  }, []);

  const value = useMemo(
    () => ({ token, role, loading, signIn, signOut }),
    [token, role, loading, signIn, signOut]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
