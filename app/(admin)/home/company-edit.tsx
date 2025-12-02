import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, ImageBackground, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, View, } from "react-native";
import { updateEnterprise } from "../../../src/services/enterprise";
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  card: "#D9D9D9",
  subtext: "#0a0322",
};

export default function EnterpriseEditScreen() {
  const { id, name: initialName = "", registerNumber: initialReg = "" } =
    useLocalSearchParams<{ id: string; name?: string; registerNumber?: string }>();

  const [name, setName] = useState(initialName);
  const [registerNumber, setRegisterNumber] = useState(initialReg);
  const [saving, setSaving] = useState(false);

  const canSave = id && name.trim().length > 0;

  const onSave = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      await updateEnterprise({ id, name: name.trim(), registerNumber: registerNumber.trim() || undefined });
      Alert.alert("Pronto", "Empresa atualizada.");
      router.back(); // volta para a lista
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Não foi possível salvar.";
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
      <View style={styles.panel}>
        <Text style={styles.heading}>Editar empresa</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome da empresa"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Registro (CNPJ)</Text>
        <TextInput
          style={styles.input}
          placeholder="00.000.000/0000-00"
          value={registerNumber}
          onChangeText={setRegisterNumber}
        />

        <Pressable
          onPress={onSave}
          disabled={!canSave || saving}
          style={[styles.btn, (!canSave || saving) && { opacity: 0.6 }]}
        >
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Salvar alterações</Text>}
        </Pressable>

        <Pressable onPress={() => router.back()} style={[styles.btn, styles.btnSecondary]}>
          <Text style={[styles.btnText, { color: COLORS.navy }]}>Cancelar</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label:{ color: COLORS.text, fontWeight:"700", marginTop: 12, marginBottom: 4 },
  input:{ backgroundColor:"#fff", borderColor:"#cfcfcf", borderWidth:1, borderRadius:12, height:46, paddingHorizontal:12, color: COLORS.text },
  btn:{ marginTop:20, height:50, borderRadius:14, backgroundColor: COLORS.navy, alignItems:"center", justifyContent:"center" },
  btnSecondary:{ backgroundColor:"#fff", borderWidth:1, borderColor:"#cfcfcf", marginTop:10 },
  btnText:{ color:"#fff", fontWeight:"800", fontSize:16 },

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

  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    flex: 1,
  },

  cardItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // <- espaço p/ ações
    gap: 10,
  },

  title: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  sub: { color: "#444", fontSize: 14 },

  rightSide: { alignItems: "flex-end", gap: 8 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, alignSelf: "flex-end" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  actions: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 6 },
  iconBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
