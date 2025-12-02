// app/(auth)/verify-code.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { Link, router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
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

import * as SecureStore from "expo-secure-store";
import { resendVerificationCode, verifyEmailCode } from "../../src/services/auth";

const GREY = "#7a7a7a";
const YELLOW = "#FFCC00";
const INK = "#0A0322";
const CARD = "#848484";

const CELL_SIZE = 46;

export default function VerifyCode() {
  // Email recebido do login: /verify-code?email=...
  const { email = "" } = useLocalSearchParams<{ email?: string }>();

  // dígitos do código
  const [cells, setCells] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);

  // logando
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // refs para auto-foco
  const refs = Array.from({ length: 6 }, () => useRef<TextInput>(null));

  const code = useMemo(() => cells.join(""), [cells]);
  const isValid = useMemo(() => /^\d{6}$/.test(code), [code]);

  function handleChange(text: string, idx: number) {
    const onlyDigits = text.replace(/\D/g, "");
    if (idx === 0 && onlyDigits.length === 6) {
      const arr = onlyDigits.split("").slice(0, 6);
      setCells(arr);
      refs[5].current?.focus();
      return;
    }
    const next = [...cells];
    next[idx] = onlyDigits.slice(-1) || "";
    setCells(next);
    if (onlyDigits.length > 0 && idx < 5) refs[idx + 1].current?.focus();
  }

  function handleKeyPress(e: any, idx: number) {
    if (e.nativeEvent.key === "Backspace" && cells[idx] === "" && idx > 0) {
      refs[idx - 1].current?.focus();
      const next = [...cells];
      next[idx - 1] = "";
      setCells(next);
    }
  }

  // envia { email, code } para a API validar
  async function handleSubmit() {
  if (!isValid) { setError("Digite o código de 6 dígitos."); return; }
  setError(null);
  try {
    setLoading(true);
    const res = await verifyEmailCode(code); // 👈 só o código
    if (res.status >= 200 && res.status < 300) {
      // limpeza do token temporário
      await SecureStore.deleteItemAsync("pending_verify_token");
      Alert.alert("Tudo certo!", "E-mail verificado. Agora faça login.");
      router.replace("/(auth)/login");
      return;
    }
    Alert.alert("Não foi possível validar o código.");
  } catch (e: any) {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      "Erro ao validar o código.";
    setError(msg);
    Alert.alert("Falha na verificação", msg);
  } finally {
    setLoading(false);
  }
}


  // Reenviar código
  async function handleResend() {
    try {
      setResending(true);
      await resendVerificationCode(String(email));
      Alert.alert("Pronto!", "Enviamos um novo código para seu e-mail.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Não foi possível reenviar o código.";
      Alert.alert("Ops!", msg);
    } finally {
      setResending(false);
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
            {email
              ? `Enviamos um código para:\n${email}`
              : "Insira o código enviado no seu e-mail"}
          </Text>

          <View style={styles.codeRow}>
            {cells.map((value, idx) => (
              <React.Fragment key={idx}>
                {idx === 3 && <Text style={styles.hyphen}>-</Text>}
                <TextInput
                  ref={refs[idx]}
                  value={value}
                  onChangeText={(t) => handleChange(t, idx)}
                  onKeyPress={(e) => handleKeyPress(e, idx)}
                  style={styles.codeCell}
                  keyboardType="number-pad"
                  returnKeyType={idx === 5 ? "done" : "next"}
                  maxLength={1}
                  autoCorrect={false}
                  autoCapitalize="none"
                  textAlign="center"
                  inputMode="numeric"
                />
              </React.Fragment>
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || loading}
            style={[styles.cta, (!isValid || loading) && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>
              {loading ? "VALIDANDO..." : "ENVIAR"}
            </Text>
          </Pressable>

          {/* Reenviar */}
          <Pressable
            onPress={handleResend}
            disabled={!email || resending}
            style={{ marginTop: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#fff" }}>
              {resending ? "Reenviando..." : "Não recebeu? Reenviar código"}
            </Text>
          </Pressable>
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
    marginBottom: 18,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  hyphen: { fontSize: 30, color: "#ECECEC", marginHorizontal: 6 },
  codeCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 12,
    backgroundColor: "#D9D9D9",
    color: INK,
    fontSize: 22,
  },
  error: { color: "#ffdede", marginTop: 2, marginBottom: 4, fontSize: 12 },
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
  footerSection: { width: "100%", marginTop: 260, marginBottom: 10 },
  fullDivider: { height: 1, backgroundColor: "#fff", opacity: 0.9, alignSelf: "stretch" },
  footerWrap: { paddingTop: 35, paddingHorizontal: 24, alignItems: "center" },
  footerMuted: { color: "#dedede", letterSpacing: 0.6 },
  footerLink: { color: YELLOW, fontWeight: "800", letterSpacing: 0.6 },
});
