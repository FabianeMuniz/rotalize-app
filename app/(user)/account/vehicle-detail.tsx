import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { getVehicleById, updateVehicle, VehicleDTO } from "../../../src/services/vehicle";

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

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<VehicleDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const v = await getVehicleById(id);
      setVehicle(v);
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!vehicle) return;
    try {
      setSaving(true);
      await updateVehicle(vehicle);
      Alert.alert("Sucesso", "Veículo atualizado com sucesso!");
      router.back();
    } catch (err) {
      Alert.alert("Erro", "Não foi possível atualizar o veículo.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator style={{ marginTop: 40 }} />
      </SafeAreaView>
    );

  if (!vehicle)
    return (
      <SafeAreaView style={styles.safe}>
        <Text>Veículo não encontrado.</Text>
      </SafeAreaView>
    );

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
        <Text style={styles.title}>Editar Veículo</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Modelo</Text>
          <TextInput
            style={styles.input}
            value={vehicle.model}
            onChangeText={(t) => setVehicle({ ...vehicle, model: t })}
          />

          <Text style={styles.label}>Motor</Text>
          <TextInput
            style={styles.input}
            value={vehicle.motor}
            onChangeText={(t) => setVehicle({ ...vehicle, motor: t })}
          />

          <Text style={styles.label}>Consumo estimado (km/l)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(vehicle.estimatedConsumption)}
            onChangeText={(t) =>
              setVehicle({ ...vehicle, estimatedConsumption: Number(t) })
            }
          />

          <Text style={styles.label}>Ano</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={String(vehicle.year)}
            onChangeText={(t) => setVehicle({ ...vehicle, year: Number(t) })}
          />

          <Text style={styles.status}>
            Status: {vehicle.isActive ? "Ativo" : "Inativo"}
          </Text>

          <Pressable
            onPress={handleSave}
            style={[styles.btnPrimary, saving && { opacity: 0.7 }]}
            disabled={saving}
          >
            <Text style={styles.btnText}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.btnBack}>
            <Text style={styles.btnBackText}>Voltar</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

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
  title: { fontSize: 40, fontWeight: "800", color: "#0a0322", marginBottom: 16, textAlign: "center" },
  form: { gap: 10 },
  label: { color: "#0a0322", fontWeight: "700" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  status: { marginTop: 8, fontWeight: "700" },
  btnPrimary: {
    backgroundColor: "#0a0322",
    marginTop: 20,
    height: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 18 },
  btnBack: { marginTop: 10, alignItems: "center" },
  btnBackText: { color: "#0a0322", fontWeight: "700", fontSize: 18 },
});
