// app/(user)/tabs/account.tsx
import { router } from "expo-router";
import React from "react";
import { ImageBackground, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#0a0322",
  white: "#fff",
};

export default function AccountScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      {/* topo com mapa */}
      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../../../assets/images/map-bg.png")}
          defaultSource={require("../../../assets/images/map-bg.png")}
          resizeMode="cover"
          style={styles.topBg}
          imageStyle={styles.topBgImg}
        />
      </View>

      {/* painel */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Conta</Text>
        <Text style={styles.subtitle}>Selecione a opção que desejar</Text>

        <View style={styles.list}>
          <PillButton
            label="Dados do usuário"
            onPress={() => router.push("../account/user-data")}
          />
          <PillButton
            label="Empresa"
            onPress={() => router.push("../account/company")}
          />
          <PillButton
            label="Segurança"
            onPress={() => router.push("../account/security")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function PillButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.15)" }}
      style={({ pressed }) => [styles.pill, pressed && { transform: [{ scale: 0.98 }] }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.pillText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "32%", backgroundColor: COLORS.greyBg },
  topBg: { flex: 1, width: "100%" },
  topBgImg: { opacity: 0.9 },

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
    fontSize: 25,
    color: COLORS.subtext,
    marginBottom: 28,
    fontFamily: "Raleway_400Regular",
  },

  list: {
    gap: 12,
    alignItems: "center",
  },

  pill: {
    backgroundColor: COLORS.navy,
    width: "92%",
    height: 56,              // toque confortável para campo
    borderRadius: 16,        // pílula
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pillText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontFamily: "Raleway_400Regular",
  },
});
