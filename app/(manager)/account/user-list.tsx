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
    getManagerActiveUsers,
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
  badgeGreen: "#119955",
  badgeGrey: "#8f8f8f",
};

export default function ManagerUserListScreen() {
  const [users, setUsers] = useState<ManagerUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getManagerActiveUsers();
      setUsers(list);
    } catch (err: any) {
      const status = err?.response?.status;
      const baseMsg =
        status === 401
          ? "Sessão expirada. Faça login novamente."
          : status === 403
          ? "Acesso negado para listar usuários."
          : "Erro ao carregar usuários da empresa.";
      Alert.alert(baseMsg);
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
    setRefreshing(true);
    try {
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

  const renderItem = ({ item }: { item: ManagerUserDTO }) => {
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

          {/* Exemplo: detalhe do usuário (se tiver rota) */}
          {/* <Pressable
            onPress={() =>
              router.push({ pathname: "./detail", params: { id: String(item.id) } })
            }
            style={styles.btnSmall}
          >
            <Text style={styles.btnSmallText}>Detalhes</Text>
          </Pressable> */}
        </View>
      </View>
    );
  };

  return (
    <RoleProtected allow={["manager"]}>
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
          <Text style={styles.heading}>Usuários da empresa</Text>

          {/* busca local */}
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

          <View style={styles.card}>
            {loading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8, color: COLORS.subtext }}>
                  Carregando usuários…
                </Text>
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
    fontSize: 34,
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
  },
  userName: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  userEmail: { color: "#444", fontSize: 14 },
  userRole: { color: "#666", fontSize: 13, marginTop: 2 },
  rightCol: { marginLeft: 10, alignItems: "flex-end", gap: 8 },

  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  emptyText: {
    color: COLORS.subtext,
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 12,
  },
});
