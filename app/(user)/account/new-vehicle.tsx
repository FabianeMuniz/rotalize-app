import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    ImageBackground,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { createVehicle, VehicleCreateDTO, VehicleDTO } from "../../../src/services/vehicle";

const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
  subtext: "#0a0322",
};

export default function VehicleNewScreen() {
  // se um dia você passar params pra “editar”
  const { mode, id } = useLocalSearchParams<{ mode?: string; id?: string }>();

  const [model, setModel] = useState("");
  const [motor, setMotor] = useState("");
  const [estimatedConsumption, setEstimatedConsumption] = useState("");
  const [year, setYear] = useState("");

  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    // validações simples
    if (!model.trim() || !motor.trim() || !estimatedConsumption || !year) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }

    const body: VehicleCreateDTO = {
      model: model.trim(),
      motor: motor.trim(),
      estimatedConsumption: Number(estimatedConsumption),
      year: Number(year),
    };

    try {
      setSaving(true);

      if (mode === "edit" && id) {
        // ainda não há endpoint de editar → só um aviso por enquanto
        Alert.alert("Editar veículo", "Endpoint de edição ainda não disponível.");
        return;
      }

      const created: VehicleDTO = await createVehicle(body);

      // volta para a lista levando o veículo recém-criado (para a tela substituir os botões)
      router.replace({
        pathname: "./vehicle",
        params: { createdId: created.id },
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Não foi possível salvar o veículo.";
      Alert.alert("Erro", msg);
    } finally {
      setSaving(false);
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
            <FontAwesome5 name="map-marker-alt" size={35} color={COLORS.navy} style={{ transform: [{ rotate: "90deg" }] }} />
          </Pressable>
        </ImageBackground>
      </View>
      <View style={styles.panel}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.heading}>{mode === "edit" ? "Editar veículo" : "Cadastrar veículo"}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Modelo</Text>
          <TextInput style={styles.input} value={model} onChangeText={setModel} placeholder="Ex.: Fiat Mobi Like 1.0" />

          <Text style={styles.label}>Motor</Text>
          <TextInput style={styles.input} value={motor} onChangeText={setMotor} placeholder="Ex.: 1.0 Fire Flex – 3 cil." />

          <Text style={styles.label}>Consumo estimado (km/l)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={estimatedConsumption}
            onChangeText={setEstimatedConsumption}
            placeholder="Ex.: 14.5"
          />

          <Text style={styles.label}>Ano</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={year}
            onChangeText={setYear}
            placeholder="Ex.: 2022"
            maxLength={4}
          />

          <Pressable
            onPress={onSave}
            disabled={saving}
            style={[styles.btnPrimary, saving && { opacity: 0.7 }]}
          >
            <Text style={styles.btnPrimaryText}>{saving ? "Salvando…" : "Salvar"}</Text>
          </Pressable>
        </View>
      </ScrollView>
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
    position: "absolute", top: 25, left: 16, width: 36, height: 36,
    alignItems: "center", justifyContent: "center", zIndex: 10,
  },
  panel: {
    flex: 1, backgroundColor: COLORS.greyPanel, marginTop: -28,
    borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingTop: 18,
  },
  heading: { fontSize: 40, fontWeight: "800", color: COLORS.text, marginBottom: 8, marginTop: 10, textAlign: "center" },
  card: { backgroundColor: COLORS.card, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 26, marginBottom: 16 },
  fieldLabel: { color: COLORS.text, fontSize: 25, fontWeight: "800", marginBottom: 2 },
  valueText: { color: COLORS.text, fontSize: 16 },


  label: { fontWeight: "800", color: COLORS.text, marginTop: 10, marginBottom: 4, fontSize: 18 },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    fontSize: 16,
  },
  btnPrimary: {
    backgroundColor: COLORS.navy,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800", fontSize: 18 },
});
