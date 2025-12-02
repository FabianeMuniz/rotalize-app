// app/(auth)/forgot-password.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
import { Link, router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Alert,
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
import { requestPasswordReset } from "../../src/services/password";

/* ===========================
   Paleta centralizada
   =========================== */
const GREY = "#7a7a7a";
const YELLOW = "#FFCC00";
const INK = "#0A0322";
const CARD = "#848484";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmailValid = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const isFormValid = useMemo(() => isEmailValid(email), [email]);

  async function handleSubmit() {
    if (!isFormValid) {
      setError("Digite um e-mail válido.");
      return;
    }
    setError(null);

    try {
      setLoading(true);
      await requestPasswordReset(email.trim());
      setSent(true);
      Alert.alert(
        "Email enviado",
        "Se existir uma conta, você receberá um e-mail com as instruções."
      );
      // opcional: levar direto para a tela de redefinição
      // router.push("/(auth)/reset-password");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Não foi possível enviar o e-mail de recuperação.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../../assets/images/map-bg.png")}
          defaultSource={require("../../assets/images/map-bg.png")}
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
              color="#0a0322"
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </Pressable>
        </ImageBackground>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.logoBadgeShadow}>
          <View style={styles.logoBadge}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.helperText}>
            Esqueceu sua senha?{"\n"}
            Informe seu e-mail e enviaremos um token para redefinir sua senha.
          </Text>

          <View style={styles.field}>
            <Fontisto name="email" size={25} color={INK} />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor={INK}
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {sent ? (
            <Text style={styles.success}>
              Se existir uma conta, enviaremos as instruções por e-mail.
            </Text>
          ) : null}

          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
            style={[styles.cta, (!isFormValid || loading) && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>
              {loading ? "ENVIANDO..." : "ENVIAR"}
            </Text>
          </Pressable>

          {/* Atalho: já tenho o token */}
          <View style={{ alignItems: "center", marginTop: 14 }}>
            <Link href="/(auth)/reset-password" asChild>
              <Pressable>
                <Text style={{ color: "#fff" }}>
                  Já tenho o token — redefinir senha
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

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
  helperText: {
    fontSize: 22,
    lineHeight: 26,
    color: "#fff",
    marginTop: 40,
    marginBottom: 26,
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
  input: { flex: 1, color: INK, fontSize: 20, marginLeft: 6 },
  error: { color: "#ffdede", marginTop: 4, marginBottom: 4, fontSize: 12 },
  success: { color: "#d2ffd2", marginTop: 4, marginBottom: 4, fontSize: 12 },
  cta: {
    height: 52,
    borderRadius: 14,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 20, letterSpacing: 1, color: "#fff", fontWeight: "700" },
  footerSection: { width: "100%", marginTop: 320, marginBottom: 8 },
  fullDivider: { height: 1, backgroundColor: "#fff", opacity: 0.9, alignSelf: "stretch" },
  footerWrap: { paddingTop: 40, paddingHorizontal: 24, alignItems: "center" },
  footerMuted: { color: "#dedede", letterSpacing: 0.6 },
  footerLink: { color: YELLOW, fontWeight: "800", letterSpacing: 0.6 },
});
