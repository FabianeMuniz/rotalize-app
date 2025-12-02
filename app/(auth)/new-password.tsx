// Arquivo: app/(auth)/new-password.tsx
// Tela "Nova senha" após validação do código por e-mail

import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

/* ===========================
   Paleta centralizada (mesma do resto)
   =========================== */
const GREY  = "#7a7a7a";
const YELLOW = "#FFCC00";
const INK   = "#0A0322";
const CARD  = "#848484";

export default function NewPassword() {
  /* ===========================
     Params vindos da tela anterior (opcional)
     - Ex.: /new-password?email=a@b.com&code=123456
     =========================== */
  const { email, code } = useLocalSearchParams<{ email?: string; code?: string }>();

  /* ===========================
     Estado do formulário
     =========================== */
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false); // feedback simples de sucesso

  /* ===========================
     Validações
     =========================== */
  // regra básica: >= 6 caracteres (ajuste se quiser mais forte)
  const strongEnough = (v: string) => v.length >= 6;
  const isFormValid = useMemo(() => strongEnough(pwd) && pwd === pwd2, [pwd, pwd2]);

  /* ===========================
     Submissão
     =========================== */
  async function handleSubmit() {
    if (!isFormValid) {
      setError("A senha deve ter pelo menos 6 caracteres e as duas devem ser iguais.");
      return;
    }
    setError(null);

    // TODO: chamar sua API para trocar a senha usando (email, code, newPassword)
    // await resetPassword({ email, code, newPassword: pwd });

    setOk(true);

    // Após sucesso, leve o usuário ao Login
    setTimeout(() => {
      router.replace("/(auth)/login");
    }, 900);
  }

  /* ===========================
     Render
     =========================== */
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* TOPO: mapa de fundo */}
      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../../assets/images/map-bg.png")}
          defaultSource={require("../../assets/images/map-bg.png")}
          resizeMode="cover"
          style={styles.topBg}
          imageStyle={styles.topBgImg}
        >
          {/* PIN voltar (rotacionado 90°) */}
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
              color="#0a0322"
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </Pressable>
        </ImageBackground>
      </View>

      {/* CARD INFERIOR */}
      <View style={styles.bottomCard}>
        {/* LOGO redonda sobreposta */}
        <View style={styles.logoBadgeShadow}>
          <View style={styles.logoBadge}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Conteúdo central */}
        <View style={styles.content}>
          {/* Títulos: "Nova" + "Senha" (com destaque) */}
          <View style={{ marginBottom: 12 }}>
            <Text style={styles.subtitle}>Nova</Text>
            <Text style={styles.titleStrong}>Senha</Text>
          </View>

          {/* Campo: Senha */}
          <View style={styles.field}>
            <AntDesign name="lock1" size={25} color="#0A0322" />
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#0A0322"
              value={pwd}
              onChangeText={setPwd}
              style={styles.input}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              returnKeyType="next"
            />
            <Pressable onPress={() => setShowPwd(v => !v)}>
              <Text style={styles.eye}>
                {showPwd ? <Feather name="eye-off" size={24} color="#0A0322" /> : <Feather name="eye" size={24} color="#0A0322" />}
              </Text>
            </Pressable>
          </View>

          {/* Campo: Confirmar senha */}
          <View style={styles.field}>
            <AntDesign name="lock1" size={25} color="#0A0322" />
            <TextInput
              placeholder="Confirme sua senha"
              placeholderTextColor="#0A0322"
              value={pwd2}
              onChangeText={setPwd2}
              style={styles.input}
              secureTextEntry={!showPwd2}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <Pressable onPress={() => setShowPwd2(v => !v)}>
              <Text style={styles.eye}>
                {showPwd2 ? <Feather name="eye-off" size={24} color="#0A0322" /> : <Feather name="eye" size={24} color="#0A0322" />}
              </Text>
            </Pressable>
          </View>

          {/* Mensagens de erro/sucesso (opcionais) */}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {ok ? <Text style={styles.success}>Senha alterada com sucesso! Redirecionando…</Text> : null}

          {/* CTA: TROCAR SENHA */}
          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid}
            style={[styles.cta, !isFormValid && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>TROCAR SENHA</Text>
          </Pressable>
        </View>

        {/* Rodapé: link para Login */}
        <View style={styles.footerSection}>
          <View style={styles.fullDivider} />
          <View style={styles.footerWrap}>
            <Text style={styles.footerMuted}>NÃO TEM UMA CONTA?</Text>
                <Link asChild href="/(auth)/sign-up">
                    <Pressable>
                        <Text style={styles.footerLink}> CADASTRE-SE</Text>
                    </Pressable>
                </Link>
            </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ===========================
   Estilos (iguais aos outros)
   =========================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: GREY },

  topWrap: { height: "32%", backgroundColor: "#dfe4ea" },
  topBg: { flex: 1 },
  topBgImg: { opacity: 0.85 },

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

  bottomCard: {
    position: "absolute",
    top: "12%",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 86,
    alignItems: "center",
  },

  logoBadgeShadow: {
    position: "absolute",
    top: -76,
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
    backgroundColor: CARD,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 205, height: 205 },

  content: { width: "86%" },

  // Títulos "Nova" + "Senha" (com 'Senha' em amarelo)
  subtitle: {
    fontSize: 35,
    color: "#fff",
    marginBottom: -10,
    fontWeight: "300",
    fontFamily: "Raleway_400Regular",
  },
  titleStrong: {
    fontSize: 45,
    fontWeight: "800",
    color: "#FFCC00",
    marginBottom: 18,
    fontFamily: "Raleway_400Bold",
  },

  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: INK,
    fontSize: 20,
    marginLeft: 6,
    fontFamily: "Raleway_400Regular",
  },
  eye: { marginLeft: 8, fontSize: 16 },

  error: { color: "#ffdede", marginTop: 4, marginBottom: 4, fontSize: 12 },
  success:{ color: "#d2ffd2", marginTop: 4, marginBottom: 4, fontSize: 12 },

  cta: {
    height: 52,
    borderRadius: 14,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: {
    fontSize: 18,
    letterSpacing: 1,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Raleway_400Regular",
  },

  footerSection: {
    width: "100%",
    marginTop: 290,
    marginBottom: 8,
  },
  fullDivider: {
    height: 1,
    backgroundColor: "#fff",
    opacity: 0.9,
    alignSelf: "stretch",
  },
  footerWrap: {
    paddingTop: 30,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  footerMuted: { color: "#dedede", letterSpacing: 0.6 },
  footerLink: {
    color: YELLOW,
    fontWeight: "800",
    letterSpacing: 0.6,
  },
});
