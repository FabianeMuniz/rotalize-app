// app/(manager)/account/user-vinculation.tsx
// Tela para MANAGER vincular usuários sem empresa usando:
//  - GET  /Manager/users-without-enterprise   -> lista candidatos
//  - PUT  /Manager/bind-user?userId=<id>      -> vincula um usuário

import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useFocusEffect } from "expo-router";
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
import RoleProtected from "../../../src/components/RoleProtected";
import {
    bindUserToEnterprise,
    getUsersWithoutEnterprise,
    type ManagerUserDTO,
} from "../../../src/services/manager";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
  subtext: "#0a0322",
  badgeGrey: "#8f8f8f",
};

/* ===================== HELPERS ===================== */
/** Normaliza qualquer id (string | number) para string — resolve erros de tipagem
 *  em setState/FlatList/chamada de service etc.
 */
const asId = (v: string | number) => String(v);

export default function ManagerLinkUserScreen() {
  // Lista retornada pelo endpoint
  const [users, setUsers] = useState<ManagerUserDTO[]>([]);
  // Loading inicial
  const [loading, setLoading] = useState(true);
  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);
  // Busca local
  const [q, setQ] = useState("");
  // Qual usuário está sendo vinculado agora (mostra spinner no botão)
  const [bindingId, setBindingId] = useState<string | null>(null);

  /** Carrega os usuários sem empresa (GET /Manager/users-without-enterprise) */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getUsersWithoutEnterprise();
      setUsers(Array.isArray(list) ? list : []);
    } catch (err: any) {
      const status = err?.response?.status;
      Alert.alert(
        "Erro",
        status === 401
          ? "Sessão expirada. Faça login novamente."
          : status === 403
          ? "Acesso negado."
          : "Não foi possível carregar os usuários sem empresa."
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  /** Pull-to-refresh */
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  /** Filtro local de busca (nome, e-mail ou perfil) */
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

  /** Vincula um usuário à empresa do manager logado (PUT /Manager/bind-user) */
  const doBind = async (user: ManagerUserDTO) => {
    // NORMALIZA id para string — evita os erros:
    // "Argument of type 'string | number' is not assignable to parameter of type 'string'"
    const id = asId(user.id);

    try {
      setBindingId(id); // estado pede string|null

      // Endpoint espera ?userId=<string>; o service já faz String(userId) por segurança
      await bindUserToEnterprise(id);

      // Remove da lista local para feedback instantâneo
      setUsers((arr) => arr.filter((u) => asId(u.id) !== id));

      Alert.alert("Sucesso", `Usuário “${user.name}” vinculado à sua empresa.`);
    } catch (err: any) {
      const status = err?.response?.status;
      const server =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.join("; ")
          : null);

      Alert.alert(
        "Erro ao vincular",
        status === 401
          ? "Sessão expirada ou sem permissão."
          : server
          ? `Servidor respondeu ${status}: ${server}`
          : `Falha ao vincular (HTTP ${status ?? "?"}).`
      );
    } finally {
      setBindingId(null);
    }
  };

  /** Renderização de cada item da lista */
  const renderItem = ({ item }: { item: ManagerUserDTO }) => {
    // bindingId é string; item.id pode ser number|string, então compare como string
    const binding = bindingId === asId(item.id);

    return (
      <View style={styles.userCard}>
        {/* Coluna esquerda: dados do usuário */}
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

        {/* Botão "Vincular" do lado direito */}
        <Pressable
          onPress={() => doBind(item)}
          disabled={binding}
          style={({ pressed }) => [
            styles.bindBtn,
            binding && { opacity: 0.6 },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Vincular usuário ${item.name}`}
        >
          {binding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <FontAwesome5 name="user-plus" size={12} color="#fff" />
              <Text style={styles.bindBtnText}>Vincular</Text>
            </>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    // Garante que somente MANAGER acesse a tela
    <RoleProtected allow={["manager"]}>
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        {/* ===== Topo com imagem (mapa) + botão Voltar ===== */}
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

        {/* ===== Painel cinza com conteúdo ===== */}
        <View style={styles.panel}>
          <Text style={styles.heading}>Vincular usuário</Text>
          <Text style={styles.subtitle}>
            Liste os usuários sem empresa e vincule-os à sua.
          </Text>

          {/* Campo de busca local */}
          <View style={styles.searchWrap}>
            <TextInput
              placeholder="Busque por nome, e-mail ou perfil"
              placeholderTextColor="#666"
              value={q}
              onChangeText={setQ}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>

          {/* Cartão com a lista */}
          <View style={styles.card}>
            {loading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8, color: COLORS.subtext }}>
                  Carregando usuários…
                </Text>
              </View>
            ) : filtered.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum usuário disponível.</Text>
            ) : (
              <FlatList
                data={filtered}
                // keyExtractor precisa ser string → normalizamos
                keyExtractor={(item) => asId(item.id)}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                contentContainerStyle={{ paddingVertical: 4 }}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
              />
            )}
          </View>
        </View>
      </SafeAreaView>
    </RoleProtected>
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
    textAlign: "center",
    fontSize: 34,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 6,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: COLORS.subtext,
    marginBottom: 12,
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
    marginBottom: 16,
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
    gap: 10,
  },

  userName: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  userEmail: { color: "#444", fontSize: 14 },
  userRole: { color: "#666", fontSize: 13, marginTop: 2 },

  bindBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  bindBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  emptyText: {
    color: COLORS.subtext,
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 12,
  },
});
