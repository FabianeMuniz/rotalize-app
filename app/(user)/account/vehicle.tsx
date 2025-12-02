import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { activateVehicle, getMyVehicles, VehicleDTO } from "../../../src/services/vehicle";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
  subtext: "#0a0322",
  active: "#007b00",
  inactive: "#b00020",
};

export default function VehicleListScreen() {
  const [vehicles, setVehicles] = useState<VehicleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getMyVehicles();
      setVehicles(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("❌ Erro ao carregar veículos:", err);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onSelectVehicle = (vehicleId: string) => {
    router.push({ pathname: "./vehicle-detail", params: { id: vehicleId } });
  };

  const onCreateVehicle = () => {
    router.push("./new-vehicle");
  };

  const onActivate = async (vehicleId: string) => {
    try {
      setActivatingId(vehicleId);
      await activateVehicle(vehicleId);
      Alert.alert("Pronto", "Veículo ativado com sucesso.");
      // recarrega a lista para refletir o novo status
      await load();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Falha ao ativar o veículo.";
      Alert.alert("Erro", msg);
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
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

      <View style={styles.panel}>
        <Text style={styles.heading}>Meus Veículos</Text>

        {/* Botão de cadastrar (acima) */}
        {!loading && (
          <Pressable onPress={onCreateVehicle} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Cadastrar Veículo</Text>
          </Pressable>
        )}

        {loading ? (
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <ActivityIndicator />
            <Text style={{ marginTop: 8, color: COLORS.subtext }}>Carregando dados…</Text>
          </View>
        ) : vehicles.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 24 }}>
            <Text style={{ color: COLORS.subtext }}>Nenhum veículo encontrado.</Text>
          </View>
        ) : (
          <FlatList
            data={vehicles}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={({ item }) => (
              <View style={styles.vehicleCard}>
                <Pressable onPress={() => onSelectVehicle(item.id)} style={{ flex: 1 }}>
                  <Text style={styles.vehicleTitle}>
                    {item.model} ({item.year || "—"})
                  </Text>
                  <Text style={styles.vehicleSub}>Motor: {item.motor || "—"}</Text>
                  <Text style={styles.vehicleSub}>
                    Consumo:{" "}
                    {item.estimatedConsumption ? `${item.estimatedConsumption} km/l` : "—"}
                  </Text>
                  <Text
                    style={[
                      styles.vehicleStatus,
                      { color: item.isActive ? COLORS.active : COLORS.inactive },
                    ]}
                  >
                    {item.isActive ? "Ativo" : "Inativo"}
                  </Text>
                </Pressable>

                {/* Botão ATIVAR quando o veículo estiver inativo */}
                {!item.isActive && (
                  <Pressable
                    onPress={() => onActivate(item.id)}
                    disabled={activatingId === item.id}
                    style={[styles.btnSmall, activatingId === item.id && { opacity: 0.7 }]}
                  >
                    <Text style={styles.btnSmallText}>
                      {activatingId === item.id ? "Ativando…" : "Ativar veículo"}
                    </Text>
                  </Pressable>
                )}
              </View>
            )}
          />
        )}

        {/* Botão de cadastrar (abaixo) */}
        {!loading && (
          <Pressable onPress={onCreateVehicle} style={styles.btnPrimary}>
            <Text style={styles.btnPrimaryText}>Cadastrar Veículo</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },
  topWrap: { height: "20%" },
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
    textAlign: "center",
  },
  vehicleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  vehicleTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  vehicleSub: { color: COLORS.subtext, fontSize: 14, marginTop: 2 },
  vehicleStatus: { marginTop: 6, fontWeight: "bold" },

  btnPrimary: {
    backgroundColor: COLORS.navy,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  btnPrimaryText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  // botão pequeno "Ativar veículo"
  btnSmall: {
    marginTop: 10,
    backgroundColor: COLORS.navy,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSmallText: { color: COLORS.white, fontSize: 15, fontWeight: "800" },
});
