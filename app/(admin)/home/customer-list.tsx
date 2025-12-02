import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { AxiosHeaders } from "axios";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getAllUsers, type UserDTO } from "../../../src/services/users";
import { decodeJwt, type AnyJwt } from "../../../src/utils/jwt";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
  subtext: "#0a0322",
  badgeGreen: "#119955",
  badgeGrey: "#8f8f8f",
};

// helpers locais
const TOKEN_KEY = "auth_token";
const isLikelyJwt = (t: string | null | undefined): t is string =>
  !!t && t.split(".").length === 3;

export default function UserListScreen() {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      
      // ---- DIAGNÓSTICO DO TOKEN ----
      function getRolesFromPayload(p?: AnyJwt) {
  if (!p) return [];
  const r =
    p.role ??
    p.roles ??
    p["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
  return Array.isArray(r) ? r : r ? [r] : [];
}
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (!isLikelyJwt(token)) {
        console.log("⚠️ Token ausente ou inválido no SecureStore:", String(token)?.slice(0, 12));
        Alert.alert(
          "Sessão inválida",
          "Faça login novamente para listar os usuários."
        );
        setUsers([]);
        return;
      }
    console.log("Token salvo:", token?.slice(0, 50));

      const payload = decodeJwt(token);
      console.log("JWT payload (raw):", payload); // <<< veja TODO o payload no console

      const roles = getRolesFromPayload(payload!);
      const email =
        payload?.email ??
        payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
      const expIso = payload?.exp ? new Date(payload.exp * 1000).toISOString() : "sem exp";

      console.log("JWT payload debug:", {
        sub: payload?.sub,
        email: payload?.email,
        exp: payload?.exp,
        expIso,
        roles,
      });
      
      if (!(Array.isArray(roles) ? roles.includes("Admin") : roles === "Admin")) {
         Alert.alert("Sem permissão", "Esta lista requer perfil Admin.");
         setUsers([]);
         return;
       }

      // ---- BUSCA ----
      const list = await getAllUsers();
      setUsers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      // serialize headers do Axios v1
      const hdrs = err?.config?.headers;
      const serialized =
        hdrs && typeof hdrs?.toJSON === "function"
          ? hdrs.toJSON()
          : hdrs instanceof AxiosHeaders
          ? (hdrs as AxiosHeaders).toJSON?.()
          : hdrs;

      const authHeader =
        serialized?.Authorization ?? serialized?.authorization ?? undefined;

        
      console.log("GET /User/all error:", {
        message: err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
        url: err?.config?.baseURL + err?.config?.url,
        headersSent: serialized, // aqui deve aparecer Authorization
        authHeader,
      });

      const status = err?.response?.status;
      const baseMsg =
        status === 401
          ? "Não autorizado. Verifique o login ou a expiração do token."
          : status === 403
          ? "Acesso negado. Seu usuário não tem permissão."
          : "Erro ao carregar usuários.";

      Alert.alert(
        baseMsg,
        `Status: ${status ?? "?"}\nURL: ${err?.config?.baseURL}${err?.config?.url}`
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  const filtered = useMemo(() => {
    if (!q.trim()) return users;
    const term = q.trim().toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(term) ||
        u.email?.toLowerCase().includes(term) ||
        u.role?.toLowerCase().includes(term)
    );
  }, [users, q]);

  const renderItem = ({ item }: { item: UserDTO }) => {
    const active = item.isActive ?? true;
    return (
      <View style={styles.userCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName} numberOfLines={1}>
            {item.name || "—"}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {item.email || "—"}
          </Text>
          {!!item.role && (
            <Text style={styles.userRole} numberOfLines={1}>
              {item.role}
            </Text>
          )}
        </View>

        <View style={styles.rightCol}>
          <View
            style={[
              styles.badge,
              { backgroundColor: active ? COLORS.badgeGreen : COLORS.badgeGrey },
            ]}
          >
            <Text style={styles.badgeText}>{active ? "Ativo" : "Inativo"}</Text>
          </View>
          {/* <Pressable onPress={() => router.push({ pathname: "./user-detail", params: { id: item.id } })} style={styles.btnSmall}>
            <Text style={styles.btnSmallText}>Detalhes</Text>
          </Pressable> */}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* topo com imagem */}
      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../../../assets/images/map-bg.png")}
          defaultSource={require("../../../assets/images/map-bg.png")}
          resizeMode="cover"
          style={styles.topBg}
          imageStyle={styles.topBgImg}
        >
          <Pressable onPress={() => router.back()} style={styles.backPin} hitSlop={10}>
            <FontAwesome5
              name="map-marker-alt"
              size={35}
              color={COLORS.navy}
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </Pressable>
        </ImageBackground>
      </View>

      {/* painel */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Usuários</Text>

        {/* busca local */}
        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Busque por nome ou e-mail"
            placeholderTextColor="#666"
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <View style={styles.card}>
          {loading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: COLORS.subtext }}>Carregando usuários…</Text>
            </View>
          ) : filtered.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum usuário encontrado.</Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              contentContainerStyle={{ paddingVertical: 4 }}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "18%" },
  topBg: { flex: 1, width: "100%" },
  topBgImg: { opacity: 0.9 },
  backPin: {
    position: "absolute",
    top: 25,
    left: 16,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  panel: {
    flex: 1,
    backgroundColor: COLORS.greyPanel,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  heading: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
  },

  searchWrap: { marginBottom: 12 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    fontSize: 16,
    color: COLORS.text,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 96,
    flex: 1,
  },

  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    flexDirection: "row",
    alignItems: "center",
  },
  userName: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  userEmail: { color: "#444", fontSize: 14 },
  userRole: { color: "#666", fontSize: 13, marginTop: 2 },
  rightCol: { marginLeft: 10, alignItems: "flex-end", gap: 8 },

  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  emptyText: { color: COLORS.subtext, fontSize: 16, textAlign: "center", paddingVertical: 12 },
});
