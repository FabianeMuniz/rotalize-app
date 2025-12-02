// app/(user)/rota/route-detail.tsx
// app/(user)/rota/route-detail.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Linking,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getRouteDetailed, RouteDetailedResponse, RoutePointDetailed } from "../../../src/services/route";

/* ===================== PALETA ===================== */
const COLORS = { navy: "#0a0322", text: "#0a0322", bg: "#D9D9D9", card: "#fff" };

/* ===================== HELPERS ===================== */
const fmtDate = (iso: string) => {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
};
const consumed = (d?: number | null) => {
  if (typeof d !== "number" || !Number.isFinite(d)) return "-";
  return `${d.toFixed(2)} L`;
};

const fmtDist = (d?: number) => {
  if (typeof d !== "number" || !Number.isFinite(d)) return null;
  if (d >= 1000) return `${(d / 1000).toFixed(1)} km`;
  return `${d.toFixed(0)} m`;
}; 
const statusLabel = (s: unknown) => {
  if (s === 1 || s === "Pending") return "Pendente";
  if (s === 2 || s === "InProgress") return "Em andamento";
  if (s === 3 || s === "Completed") return "Concluída";
  return String(s ?? "");
};

/* ===================== TELA ===================== */
export default function RouteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RouteDetailedResponse["data"] | null>(null);

  // Carrega detalhe da rota
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getRouteDetailed(String(id));
        const raw = res?.data ?? null;

        // Normaliza estrutura (tolerante ao backend)
        const normalized = raw
          ? {
              ...raw,
              // ✅ Garante tipos do contrato (número e string)
              estimatedConsumption:
                typeof raw.estimatedConsumption === "number"
                  ? raw.estimatedConsumption
                  : parseFloat(String(raw.estimatedConsumption ?? "")) || 0,

              // aceita vehicleModel/vehicle/vehicleMode vindo do backend
              vehicleMode: String(
                raw.vehicleModel ?? ""
              ),

              routePoints: (raw.routePoints ?? []).map((p: any) => ({
                id: p.id ?? `${Math.random()}`,
                address: p.address ?? "",
                position:
                  typeof p.position === "number"
                    ? p.position
                    : parseInt(String(p.position ?? "0"), 10) || 0,
                distance:
                  typeof p.distance === "number"
                    ? p.distance
                    : parseFloat(String(p.distance ?? "")),
                latitude: typeof p.latitude === "number" ? p.latitude : undefined,
                longitude: typeof p.longitude === "number" ? p.longitude : undefined,
                isInitialPoint: !!p.isInitialPoint,
              })),
            }
          : null;

        setData(normalized);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg }}>
        <ActivityIndicator color={COLORS.navy} />
      </SafeAreaView>
    );
  }

  // Sem dados
  if (!data) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.bg }}>
        <Text style={{ color: COLORS.text }}>Rota não encontrada.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="dark-content" />

      {/* TOPO: imagem fixa com ícone de voltar (mesmo padrão das outras telas) */}
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

      {/* PAINEL arredondado com conteúdo rolável */}
      <View style={styles.panel}>
        <Text style={styles.heading}>{data.routeName}</Text>
        <Text style={styles.subtitle}>
          Status: {statusLabel(data.status)} • Criada em {fmtDate(data.createdAt)}
        </Text>
        {(Number.isFinite(data.estimatedConsumption) || data.vehicleModel) && (
        <Text style={styles.subtitle}>
          {Number.isFinite(data.estimatedConsumption)
            ? `Consumo: ${consumed(data.estimatedConsumption)}`
            : ""}
          {Number.isFinite(data.estimatedConsumption) && data.vehicleModel ? " • " : ""}
          {data.vehicleModel ? `Veículo: ${data.vehicleModel}` : ""}
        </Text>
      )}



        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        >
          {/* Botão para abrir a rota no Google Maps (se vier o link) */}
          {data.routeLink ? (
            <Pressable
              onPress={() => Linking.openURL(data.routeLink!)}
              style={styles.linkBtn}
              accessibilityRole="button"
            >
              <FontAwesome5 name="external-link-alt" size={14} color="#fff" />
              <Text style={styles.linkBtnText}>Abrir no Google Maps</Text>
            </Pressable>
          ) : null}

          {/* Lista de pontos da rota */}
          <View style={styles.pointsBox}>
            {(!data.routePoints || data.routePoints.length === 0) && (
              <Text style={{ padding: 12, color: "#0a0322" }}>Rota sem pontos cadastrados.</Text>
            )}

            {data.routePoints
              ?.slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
              .map((p: RoutePointDetailed, idx) => {
                const isStart = p.isInitialPoint || p.position === 1;
                const dist =
                  typeof p.distance === "number" && isFinite(p.distance)
                    ? p.distance >= 1000
                      ? `${(p.distance / 1000).toFixed(1)} km`
                      : `${p.distance.toFixed(0)} m`
                    : null;

                return (
                  <View key={p.id ?? String(idx)} style={styles.pointRow}>
                    <FontAwesome5
                      name={isStart ? "flag" : "map-marker-alt"}
                      size={16}
                      color={isStart ? COLORS.navy : "#0a0322"}
                    />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text numberOfLines={2} style={{ color: COLORS.text, fontWeight: isStart ? "800" : "600" }}>
                        {p.address || "Sem endereço"}
                      </Text>
                      <Text style={{ color: COLORS.text, fontSize: 12 }}>
                        Ordem: {p.position ?? "-"}{dist ? ` • Dist.: ${dist}` : ""}
                      </Text>
                    </View>
                    {isStart && <Text style={styles.badge}>INÍCIO</Text>}
                  </View>
                );
              })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  // topo com mapa
  topWrap: { height: "25%", backgroundColor: COLORS.bg },
  topBg: { flex: 1, width: "100%" },
  topBgImg: { opacity: 0.9 },

  // botão “voltar” igual às outras telas (ícone girado)
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

  // painel arredondado
  panel: {
    flex: 1,
    backgroundColor: COLORS.bg,
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // título/subtítulo
  heading: {
    textAlign: "center",
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginBottom: 12,
  },

  // botão de abrir no maps
  linkBtn: {
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    marginBottom: 10,
  },
  linkBtnText: { color: "#fff", fontWeight: "800" },

  // caixa de pontos
  pointsBox: {
    marginTop: 4,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 74,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  badge: { fontSize: 13, fontWeight: "700", color: COLORS.navy },
});
