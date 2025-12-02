// app/(user)/tabs/home.tsx
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import React from "react";
import {
  GestureResponderEvent,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import RoleProtected from "../../../src/components/RoleProtected";

type TileProps = {
  title: string; // continua string
  icon: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
};

// Paleta centralizada
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#45464E",
  white: "#fff",
};

export default function HomeUserScreen() {
  return (
    <RoleProtected allow={["user"]}>
      {/* SafeAreaView evita que conteúdo fique sob a status bar / notch */}
      <SafeAreaView style={styles.safe}>
        {/* Deixa os ícones/textos da status bar escuros (fundo claro) */}
        <StatusBar barStyle="dark-content" />

        {/* ===== TOPO COM MAPA ===== */}
        <View style={styles.topWrap}>
          <ImageBackground
            // Atenção ao caminho relativo: partindo de app/(user)/tabs/home.tsx
            source={require("../../../assets/images/map-bg.png")}
            defaultSource={require("../../../assets/images/map-bg.png")}
            resizeMode="cover"
            style={styles.topBg}
            imageStyle={styles.topBgImg}
          />
        </View>

        {/* ===== PAINEL PRINCIPAL (cartão cinza com as opções) ===== */}
        <View style={styles.panel}>
          {/* Título central grandão */}
          <Text style={styles.heading}>INÍCIO</Text>
          {/* Subtítulo alinhado à esquerda */}
          <Text style={styles.subtitle}>Selecione a opção que desejar</Text>

          {/* Grade 2x2 de botões (tiles) */}
          <View style={styles.grid}>
            <Tile
              title="NOVA ROTA"
              icon={<FontAwesome5 name="map-marker-alt" size={40} color={COLORS.white} />}
              onPress={() => router.push("../rota/route-new")}
            />
            <Tile
              title="ROTA EM ANDAMENTO"
              icon={<Feather name="map" size={40} color={COLORS.white} />}
              onPress={() => router.push("../rota/route-progress")}
            />
            <Tile
              title="HISTÓRICO"
              icon={<Feather name="rotate-ccw" size={40} color={COLORS.white} />}
              onPress={() => router.push("../rota/history")}
            />
            <Tile
              title="VEÍCULO"
              icon={<Feather name="truck" size={40} color={COLORS.white} />}
              onPress={() => router.push("../account/vehicle")}
            />
          </View>
        </View>
      </SafeAreaView>
    </RoleProtected>
  );
}

/** Tile = botão quadrado com ícone + texto */
function Tile({ title, icon, onPress }: TileProps) {
  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
      style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.98 }] }]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.tileIcon}>{icon}</View>
      {/* ✅ título SEMPRE dentro de <Text> (Correção 1) */}
      <Text style={styles.tileText} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

// ===== ESTILOS =====
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
    textAlign: "left",
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
    fontSize: 19,
    fontWeight: "800",
  },
});
