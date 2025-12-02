import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // ⬅️ novo

/* ====== PALETA ====== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
};

type RouteDetail = {
  id: string;
  dateISO: string;
  startTime: string;
  endTime: string;
  addresses: string[];
};

const formatBR = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

async function fetchRouteDetail(id: string): Promise<RouteDetail> {
  await new Promise((r) => setTimeout(r, 300));
  return {
    id,
    dateISO: new Date(2025, 7, 21).toISOString(),
    startTime: "09:02:55",
    endTime: "11:54:22",
    addresses: [
      "Leandro Alberti 35, Guara...",
      "Astolfo miguel 158, Jardim...",
      "Tiradentes de Araujo 596...",
      "Chile, 15999, Água Verde...",
      "Antonio filadelfo colaço...",
      "Avenida João Xavier 258...",
    ],
  };
}

export default function RouteSelectedScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [route, setRoute] = useState<RouteDetail | null>(null);

  const insets = useSafeAreaInsets(); // ⬅️ pega altura do menu inferior / notch

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchRouteDetail(String(id));
        setRoute(data);
      } catch (e) {
        Alert.alert("Erro", "Não foi possível carregar a rota selecionada.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* topo */}
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

      {/* painel */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Histórico</Text>

        <View style={styles.card}>
          {loading || !route ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: COLORS.text }}>Carregando…</Text>
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={{ paddingBottom: insets.bottom + 100 }} // ⬅️ espaço extra no fim
              showsVerticalScrollIndicator={false}
            >
              <InfoRow label="Data" value={formatBR(route.dateISO)} />
              <InfoRow label="Hora de início" value={route.startTime} />
              <InfoRow label="Hora de fim" value={route.endTime} />

              <View style={{ marginTop: 8 }}>
                {route.addresses.map((addr, idx) => (
                  <AddressPill key={`addr_${idx}`} text={addr} />
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

function AddressPill({ text }: { text: string }) {
  return (
    <View style={styles.addressPill}>
      <FontAwesome5 name="map-marker-alt" size={14} color={COLORS.navy} />
      <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },
  topWrap: { height: "32%" },
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
    marginBottom: 10,
    fontFamily: "Raleway_400Regular",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    minHeight: 220,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
    fontFamily: "Raleway_400Regular",
  },
  valueText: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "Raleway_400Regular",
  },
  addressPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 10,
  },
  addressText: {
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "Raleway_400Regular",
    maxWidth: "92%",
  },
});

