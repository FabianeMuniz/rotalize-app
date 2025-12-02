import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from "expo-router";
import RoleProtected from "../../../src/components/RoleProtected";

import React from "react";
// Componentes RN e utilitários de UI
import {
  ImageBackground, // container que desenha uma imagem de fundo
  Pressable, // botão com feedback nativo (ripple no Android)
  SafeAreaView, // respeita notch/status bar no iOS
  StatusBar, // controla a barra de status (clara/escura)
  StyleSheet, // cria estilos performáticos
  Text,
  View
} from "react-native";

// Paleta centralizada para manter consistência de cores
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#45464E",
  white: "#fff",
};

// Componente principal da tela "Home" do usuário
export default function HomeUserScreen() {
  return (
    <RoleProtected allow={["admin"]}>
    <SafeAreaView style={styles.safe}>
      {/* Deixa os ícones/textos da status bar escuros (fundo claro) */}
      <StatusBar barStyle="dark-content" />

      {/* ===== TOPO COM MAPA ===== */}
      <View style={styles.topWrap}>
        <ImageBackground
          // Atenção ao caminho relativo: partindo de app/(user)/tabs/home.tsx
          source={require("../../../assets/images/map-bg.png")}
          defaultSource={require("../../../assets/images/map-bg.png")} // fallback no iOS
          resizeMode="cover"  // cobre toda a área mantendo proporção
          style={styles.topBg} // estilo do container
          imageStyle={styles.topBgImg} // estilo aplicado à IMAGEM (ex.: opacidade)
        />
      </View>

      {/* ===== PAINEL PRINCIPAL (cartão cinza com as opções) ===== */}
      <View style={styles.panel}>
        {/* Título central grandão */}
        <Text style={styles.heading}>INÍCIO ADMIN</Text>
        {/* Subtítulo alinhado à esquerda */}
        <Text style={styles.subtitle}>Selecione a opção que desejar</Text>

        {/* Grade 2x2 de botões (tiles) */}
        <View style={styles.grid}>
          <Tile
            title="CLIENTES"
            icon={<FontAwesome5 name="user-friends" size={40} color={COLORS.white} />}
            // router.push navega para uma clientes
            onPress={() => router.push("../home/customer-list")}
          />
          <Tile
            title="EMPRESAS"
            icon={<MaterialCommunityIcons name="office-building" size={50} color={COLORS.white} />}
            onPress={() => router.push("../home/company-list")}
          />
          <Tile
            title="CADASTRAR EMPRESA"
            icon={<MaterialCommunityIcons name="domain-plus" size={45} color={COLORS.white} />}
            onPress={() => router.push("../home/new-company")}
          />
          <Tile
            title="VINCULAR SUPERVISOR"
            icon={<Feather name="user-check" size={40} color={COLORS.white} />}
            onPress={() => router.push("../home/manager-vinculation")}
          />

        </View>
      </View>
    </SafeAreaView>
    </RoleProtected>
  );
}

// Componente “Tile” = botão quadrado com ícone + texto
function Tile({
  title,
  icon,
  onPress,
}:  {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      // Ripple no Android; no iOS mantém o "pressed" por estilo
      android_ripple={{ color: "rgba(255,255,255,0.15)", borderless: false }}
      // Efeito leve de scale quando pressionado (iOS/Android)
      style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.98 }] }]}
      // Acessibilidade
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.tileIcon}>{icon}</View>
      <Text style={styles.tileText}>{title}</Text>
    </Pressable>
  );
}

// ===== ESTILOS =====
const styles = StyleSheet.create({
  // fundo geral da tela
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  // altura do topo com mapa (~1/3 da tela)
  topWrap: { height: "32%", backgroundColor: COLORS.greyBg },
  // ImageBackground ocupa todo o container
  topBg: { flex: 1, width: "100%" },
  // opacidade aplicada à imagem (não ao container)
  topBgImg: { opacity: 0.9 },

  // cartão cinza com cantos arredondados por cima do mapa
  panel: {
    flex: 1,
    backgroundColor: COLORS.greyPanel,
    marginTop: -18, // leve sobreposição com o mapa
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  // título "INÍCIO" do painel
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

  // subtítulo
  subtitle: {
    textAlign: "left",
    fontSize: 25,
    color: COLORS.subtext,
    marginBottom: 35,
    fontFamily: "Raleway_400Regular",
  },

  // grid 2x2: usa wrap + space-between; gap ajuda no RN 0.73+
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },

  // cada tile (botão quadrado)
  tile: {
    backgroundColor: COLORS.navy,
    width: "48%",             // 2 por linha com espaço entre eles
    height: 130,           // <-- altura fixa para todos ficarem iguais
    borderRadius: 16,
    alignItems: "center",  // centraliza conteúdo
    justifyContent: "center",
    marginBottom: 16,      // espaço entre linhas
    // sombra (iOS) + elevation (Android)
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  // container do ícone centralizado
  tileIcon: { marginBottom: 10 },

  // texto do botão
  tileText: {
    color: COLORS.white,
    textAlign: "center",
    fontSize: 19,
    fontWeight: "800"
  },
});
