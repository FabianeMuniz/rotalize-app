import { Link, router } from "expo-router";
import React from "react";
import { Image, ImageBackground, Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

/**
 * Tela inicial inspirada no mockup enviado.
 *
 * Estrutura:
 * - SafeAreaView: garante que a tela respeite a área segura (topo/notch)
 * - Topo com imagem de mapa (ImageBackground)
 * - Cartão inferior cinza com bordas arredondadas, que contém a logo, textos e botões
 * - Botão "Entrar" leva para a rota /explore
 * - Link "Cadastre-se" leva para a rota /sign-up
 */

export default function Home() {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Barra de status em branco no iOS/Android */}
      <StatusBar barStyle="light-content" />

      {/* Bloco superior que ocupa 40% da tela. Aqui usamos uma imagem de mapa como fundo */}
      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../assets/images/map-bg.png")} // imagem de mapa
          defaultSource={require("../assets/images/map-bg.png")}
          resizeMode="cover"
          style={styles.topBg}
          imageStyle={styles.topBgImg}
        >
          {/* vazio: é só o fundo de mapa */}
        </ImageBackground>
      </View>

      {/* Bloco inferior cinza que "sobe" sobre o mapa */}
      <View style={styles.bottomCard}>
        {/* Logo circular sobreposta (pino de localização) */}
        <View style={styles.logoBadgeShadow}>
          <View style={styles.logoBadge}>
            <Image source={require("../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        {/* Conteúdo: textos, botão e link */}
        <View style={styles.content}>
          {/* Texto "Vamos" */}
          <Text style={styles.hi}>Vamos</Text>

          {/* Texto principal em destaque: "começar!" */}
          <Text style={styles.titleRow}>
            <Text style={styles.titleStrong}>começar!</Text>
          </Text>

          {/* Botão principal que leva para a rota /auth */}
          <Pressable style={styles.cta} onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.ctaText}>ENTRAR</Text>
          </Pressable>
        </View>

        {/* Rodapé com link de cadastro */}
          <View style={styles.footerWrap}>
            <Text style={styles.footer}>NÃO TEM UMA CONTA?</Text>
            <Link asChild href="/(auth)/sign-up">
              <Pressable>
                <Text style={styles.footerLink}>CADASTRE-SE</Text>
              </Pressable>
            </Link>
          </View>
      </View>
    </SafeAreaView>
  );
}

/**
 * Estilos da tela
 */
const GREY = "#7a7a7a";
const YELLOW = "#FFCC00";
const INK = "#0A0322";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: GREY },

  // Topo com fundo de mapa
  topWrap: { height: "50%", backgroundColor: "#dfe4ea" },
  topBg: { flex: 1 },
  topBgImg: { opacity: 0.85 },

  // Cartão inferior cinza que cobre o restante da tela
  bottomCard: {
    position: "absolute",
    top: "20%", // começa 30% a partir do topo
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#848484",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 72, // espaço para a logo sobreposta
    alignItems: "center",
  },

  // Área circular onde fica a logo (com sombra)
  logoBadgeShadow: {
    position: "absolute",
    top: -82, // metade para cima
    alignSelf: "center",
    width: 152,
    height: 152,
    borderRadius: 76,
    backgroundColor: "#00000022",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  logoBadge: {
    flex: 1,
    borderRadius: 76,
    backgroundColor: "#848484",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 205, height: 205 },

  // Conteúdo centralizado
  content: { width: "86%", alignItems: "center" },

  // Texto "Vamos"
  hi: { fontSize: 48,
     color: "#fff", 
     marginTop: 90, 
     fontWeight: "300", 
     fontFamily: "Raleway_400Regular",
    marginBottom: -20},

  // Espaço para o texto principal
  titleRow: { marginTop: 4, marginBottom: 20 },

  // Texto em amarelo forte "começar!"
  titleStrong: { 
    fontSize: 54, 
    fontWeight: "800", 
    color: "#FFCC00", 
    letterSpacing: 0.2, 
    fontFamily: "Raleway_400Bold",
    
  },

  // Botão "ENTRAR"
  cta: {
    width: "70%",
    height: 52,
    borderRadius: 14,
    backgroundColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 50,
  },
  ctaText: { fontSize: 23, letterSpacing: 1.2, color: INK, fontWeight: "700", fontFamily: "Raleway_400Regular" },

  // Rodapé com "NÃO TEM UMA CONTA? CADASTRE-SE"
  footerWrap: { flexDirection: "column", 
  alignItems: "center",
  marginTop: 165,
  width: "100%", //adicona o comprimento da linha
  borderTopWidth: 1,      // adiciona a linha
  borderTopColor: "#ccc", // cor da linha (pode ajustar)
  paddingTop: 45,
  justifyContent: "center", },
  footer: { color: "#eaeaea", letterSpacing: 0.6 },
  footerLink: { color: "#FFCC00", fontWeight: "800", letterSpacing: 0.6, fontFamily: "Raleway_400Regular" },
});


