// app/(user)/rota/route-progress.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { finishRoute, getActiveRoutes } from "../../../src/services/route";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
};

/* ===================== TIPOS (ajuste se seu service retornar diferente) ===================== */
type RouteItem = {
  id: string;
  routeName: string;
  createdAt: string;
  status: number | string; // no seu backend vimos 0/1/2 em alguns pontos
  routePoints?: Array<unknown>;
};

/* ===================== HELPERS ===================== */
const fmtDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    const date = new Date(iso);
    // força o formato brasileiro: DD/MM/AAAA
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const statusLabel = (s: unknown) => {
  if (s === 0 || s === "Pending") return "Pendente";
  if (s === 1 || s === "InProgress") return "Em andamento";
  if (s === 2 || s === "Completed") return "Concluída";
  return String(s ?? "");
};

/* ===================== TELA ===================== */
export default function RouteProgressScreen() {
  const insets = useSafeAreaInsets();

  // estado da tela
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [finishingId, setFinishingId] = useState<string | null>(null);

  // busca as rotas ativas
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getActiveRoutes(); // deve retornar { success, data: RouteItem[] }
      const list: RouteItem[] = Array.isArray(res?.data) ? res.data : [];
      setRoutes(list);
    } catch (err: any) {
      console.log("Erro ao carregar rotas ativas:", err?.response?.data || err);
      Alert.alert("Erro", "Não foi possível carregar as rotas ativas.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  // finalização da rota
  const askFinish = (route: RouteItem) => {
    Alert.alert(
      "Finalizar rota",
      `Deseja finalizar a rota "${route.routeName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar",
          style: "destructive",
          onPress: () => doFinish(route.id),
        },
      ]
    );
  };

  const doFinish = async (routeId: string) => {
    try {
      setFinishingId(routeId);
      // endpoint: PUT /Route/finish?routeId=...
      await finishRoute(routeId);
      // remove da lista local (ou recarrega)
      setRoutes((arr) => arr.filter((r) => r.id !== routeId));
      // feedback
      Alert.alert("Pronto", "Rota finalizada com sucesso.");
    } catch (err: any) {
  const status = err?.response?.status;
  const server =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors.join("; ") : null);

  console.log("Erro ao finalizar rota:", { status, data: err?.response?.data });
  Alert.alert(
    "Erro",
    status === 401
      ? "Sessão expirada ou sem permissão."
      : server
        ? `Servidor respondeu ${status}: ${server}`
        : `Falha ao finalizar (HTTP ${status ?? "?"}).`
  );
}};

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* TOPO: imagem fixa com o marcador e voltar */}
      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../../../assets/images/map-bg.png")}
          defaultSource={require("../../../assets/images/map-bg.png")}
          resizeMode="cover"
          style={styles.topBg}
          imageStyle={styles.topBgImg}
        >
          <Pressable
            onPress={() => router.back()}
            style={styles.backPin}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <FontAwesome5
              name="map-marker-alt"
              size={35}
              color={COLORS.navy}
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </Pressable>
        </ImageBackground>
      </View>

      {/* PAINEL */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Rotas ativas</Text>
        <Text style={styles.subtitle}>
          Toque para ver detalhes ou finalize pelo botão do card
        </Text>

        {/* CONTEÚDO ROLÁVEL */}
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 74 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Loading inicial */}
          {loading && (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator color={COLORS.navy} />
              <Text style={{ marginTop: 8, color: COLORS.text }}>Carregando…</Text>
            </View>
          )}

          {/* Estado vazio */}
          {!loading && routes.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Nenhuma rota ativa</Text>
              <Text style={styles.emptySub}>
                Crie uma nova rota para começar.
              </Text>
            </View>
          )}

          {/* Lista de rotas */}
          {routes.map((r) => {
            const finishing = finishingId === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => router.push(`/(user)/rota/route-detail?id=${r.id}`)}
                android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                style={styles.routeCard}
                accessibilityRole="button"
                accessibilityLabel={`Abrir detalhes da rota ${r.routeName}`}
              >
                {/* cabeçalho do card */}
                <View style={styles.cardHeader}>
                  <Text numberOfLines={1} style={styles.cardTitle}>
                    {r.routeName}
                  </Text>

                  {/* botão finalizar (canto superior direito) */}
                  <Pressable
                    onPress={() => askFinish(r)}
                    disabled={finishing}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.finishBtn,
                      finishing && { opacity: 0.6 },
                      pressed && { transform: [{ scale: 0.98 }] },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`Finalizar rota ${r.routeName}`}
                  >
                    {finishing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <FontAwesome5 name="flag-checkered" size={12} color="#fff" />
                        <Text style={styles.finishBtnText}>Finalizar</Text>
                      </>
                    )}
                  </Pressable>
                </View>

                {/* meta do card */}
                <View style={styles.metaRow}>
                  <FontAwesome5 name="info-circle" size={12} color={COLORS.navy} />
                  <Text style={styles.metaText}>
                    Status: <Text style={{ fontWeight: "700" }}>{statusLabel(r.status)}</Text>
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <FontAwesome5 name="calendar-alt" size={12} color={COLORS.navy} />
                  <Text style={styles.metaText}>Criada em {fmtDate(r.createdAt)}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "25%", backgroundColor: COLORS.greyBg },
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
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  heading: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: "Raleway_400Regular",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 20,
    color: COLORS.subtext,
    marginBottom: 12,
    fontFamily: "Raleway_400Regular",
  },

  /* estado vazio */
  emptyBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  emptySub: { color: "#555" },

  /* card de rota */
  routeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eaeaea",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginRight: 8,
  },
  finishBtn: {
    backgroundColor: COLORS.navy,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  finishBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  metaText: { color: COLORS.text },
});
