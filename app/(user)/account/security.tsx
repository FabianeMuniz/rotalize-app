// app/(user)/security/index.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
};

/* ===================== TELA ===================== */
export default function SecurityScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* TOPO: mapa + pin voltar */}
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

      {/* PAINEL COM O BOTÃO */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Segurança</Text>

        <Pressable
          onPress={() => { console.log("abrir reset"); router.push("/(user)/account/forgot-password"); }}
          style={styles.primaryBtn}
        >
          <Text style={styles.primaryBtnText}>RESETAR SENHA</Text>
        </Pressable>
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
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: "center"
  },

  heading: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 40,
    marginTop: 18,
    fontFamily: "Raleway_400Regular",
    letterSpacing: 0.5,
    textAlign: "center",
    width: "100%"
  },

  primaryBtn: {
    backgroundColor: COLORS.navy,
    height: 52,
    width: "80%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  primaryBtnText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
