// app/(manager)/tabs/home.tsx
import Feather from "@expo/vector-icons/Feather";
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
import RoleProtected from "../../../src/components/RoleProtected";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#45464E",
  white: "#fff",
};

/* ===================== TELA ===================== */
export default function HomeManagerScreen() {
  return (
    <RoleProtected allow={["manager"]}>
      {/* SafeAreaView evita conteúdo sob a status bar / notch */}
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" />

        {/* TOPO COM MAPA */}
        <View style={styles.topWrap}>
          <ImageBackground
            source={require("../../../assets/images/map-bg.png")}
            defaultSource={require("../../../assets/images/map-bg.png")}
            resizeMode="cover"
            style={styles.topBg}
            imageStyle={styles.topBgImg}
          />
        </View>

        {/* PAINEL */}
        <View style={styles.panel}>
          <Text style={styles.heading}>GERENCIAR</Text>
          <Text style={styles.subtitle}>Ações da sua empresa</Text>

          {/* Grade de opções */}
          <View style={styles.grid}>
            <Tile
              title="USUÁRIOS DA EMPRESA"
              icon={<FontAwesome5 name="users" size={40} color={COLORS.white} />}
              // TODO: ajuste para a sua rota real
              onPress={() => router.push("../account/user-list")}
            />

            <Tile
              title="VINCULAR USUÁRIO"
              icon={<Feather name="user-plus" size={40} color={COLORS.white} />}
              // TODO: ajuste para a sua rota real
              onPress={() => router.push("../account/user-vinculation")}
            />
          </View>
        </View>
      </SafeAreaView>
    </RoleProtected>
  );
}

/* ===================== TILE ===================== */
function Tile({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
      style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.98 }] }]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.tileIcon}>{icon}</View>
      <Text style={styles.tileText}>{title}</Text>
    </Pressable>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "32%", backgroundColor: COLORS.greyBg },
  topBg: { flex: 1, width: "100%" },
  topBgImg: { opacity: 0.9 },

  panel: {
    flex: 1,
    backgroundColor: COLORS.greyPanel,
    marginTop: -18,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  heading: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 10,
    fontFamily: "Raleway_400Regular",
  },

  subtitle: {
    textAlign: "center",
    fontSize: 25,
    color: COLORS.subtext,
    marginBottom: 35,
    fontFamily: "Raleway_400Regular",
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  tile: {
    backgroundColor: COLORS.navy,
    width: "48%",
    height: 130,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  tileIcon: { marginBottom: 10 },

  tileText: {
    color: COLORS.white,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
  },
});
