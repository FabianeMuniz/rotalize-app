import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { createEnterprise } from "../../../src/services/enterprise";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
  subtext: "#0a0322",
};

/* ====== utils de CNPJ ====== */
const onlyDigits = (s: string) => (s || "").replace(/\D/g, "");
const maskCNPJ = (raw: string) => {
  const d = onlyDigits(raw).slice(0, 14);
  if (!d) return "";
  let out = "";
  if (d.length <= 2) out = d;
  else if (d.length <= 5) out = `${d.slice(0, 2)}.${d.slice(2)}`;
  else if (d.length <= 8) out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  else if (d.length <= 12)
    out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  else
    out = `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
  return out;
};
const isValidCnpjLen = (raw: string) => onlyDigits(raw).length === 14;

/* ===================== TELA: Cadastrar Empresa ===================== */
export default function CompanyNewScreen() {
  const [name, setName] = useState("");
  const [cnpjMasked, setCnpjMasked] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(
    () => name.trim().length > 2 && isValidCnpjLen(cnpjMasked),
    [name, cnpjMasked]
  );

  const onChangeCnpj = (txt: string) => setCnpjMasked(maskCNPJ(txt));

  const onSubmit = async () => {
    if (!canSave) {
      Alert.alert("Dados inválidos", "Preencha o nome e um CNPJ válido (14 dígitos).");
      return;
    }

    try {
      setSaving(true);
      await createEnterprise({
        name: name.trim(),
        registerNumber: onlyDigits(cnpjMasked), // backend recebe só dígitos
      });
      Alert.alert("Sucesso", "Empresa cadastrada com sucesso!");
      // volte para a lista e force reload
      router.replace("/(admin)/home/company-list");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Não foi possível cadastrar a empresa.";
      Alert.alert("Erro", msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Topo com mapa e botão voltar */}
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

      {/* Painel com formulário */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <View style={styles.panel}>
          <Text style={styles.heading}>Cadastrar empresa</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Nome da empresa</Text>
            <TextInput
              placeholder="Ex.: Mercado Livre"
              placeholderTextColor="#666"
              style={styles.input}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>CNPJ</Text>
            <TextInput
              placeholder="00.000.000/0000-00"
              placeholderTextColor="#666"
              value={cnpjMasked}
              onChangeText={onChangeCnpj}
              keyboardType="number-pad"
              style={styles.input}
              maxLength={18} // máscara inclui pontuação
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />

            <Pressable
              onPress={onSubmit}
              disabled={!canSave || saving}
              style={[styles.btn, (!canSave || saving) && { opacity: 0.6 }]}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Cadastrar</Text>
              )}
            </Pressable>

            <Pressable onPress={() => router.back()} style={[styles.btn, styles.btnSecondary]}>
              <Text style={[styles.btnText, { color: COLORS.navy }]}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  label: { color: COLORS.text, fontSize: 16, fontWeight: "700", marginBottom: 4 },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    color: COLORS.text,
    fontSize: 16,
  },

  btn: {
    marginTop: 16,
    height: 50,
    borderRadius: 14,
    backgroundColor: COLORS.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#cfcfcf" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
