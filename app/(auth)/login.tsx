import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
import { Link, router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { API_PATHS, readEmailConfirmedFromToken } from "../../src/config/apiConfig";
import { AuthContext } from "../../src/contexts/AuthContext";
import { api } from "../../src/services/api";

import React, { useContext, useMemo, useState } from "react";
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

/* ===========================
   Paleta centralizada
   =========================== */
const GREY  = "#7a7a7a";
const YELLOW = "#FFCC00";
const INK   = "#0A0322";
const CARD  = "#848484";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signIn } = useContext(AuthContext);

  const isEmailLike = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const isFormValid = useMemo(() => {
    const idOk = email.trim().length > 0;
    const pwdOk = pwd.length >= 6;
    return idOk && pwdOk;
  }, [email, pwd]);

  function goToHomeByRole(role: string) {
    if (role === "admin")      return router.replace("/(admin)/tabs/home");
    if (role === "manager")    return router.replace("/(manager)/tabs/home");
    return router.replace("/(user)/tabs/home");
  }

  async function handleSubmit() {
    if (!isFormValid) {
      setError("Verifique o usuário/e-mail e a senha (mín. 6 caracteres).");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1) Login “prévio”: pega token + emailConfirmed (sem ainda tocar no AuthContext)
      const resp = await api.post(API_PATHS.login, {
        username: email.trim(),
        password: pwd,
      });

      // 🔎 veja no console o formato real que o backend retorna
      console.log("LOGIN response:", resp.data);

      // 🔧 ajuste os campos abaixo conforme seu backend
      const token: string | undefined =
        resp?.data?.data?.token ??
        resp?.data?.token ??
        resp?.data?.accessToken ??
        resp?.data?.jwt;

      if (!token || typeof token !== "string" || !token.includes(".")) {
        throw new Error("Token JWT não encontrado/ inválido na resposta de login.");
      }

      // Pode vir direto…
      let emailConfirmed: boolean | undefined =
        resp?.data?.data?.emailConfirmed ?? resp?.data?.emailConfirmed;

      // …ou podemos extrair do próprio JWT
      if (typeof emailConfirmed !== "boolean") {
        emailConfirmed = readEmailConfirmedFromToken(token);
      }

      // 2) Se NÃO confirmou, salva token temporário e vai para verificação
      if (!emailConfirmed) {
        await SecureStore.setItemAsync("pending_verify_token", token);
        router.replace({ pathname: "/(auth)/verify-code", params: { email: email.trim() } });
        return;
      }

      // 3) Confirmado: faz o login “oficial” pelo AuthContext
      //    (ele salva o token/role e configura o Authorization global)
      const role = await signIn(email.trim(), pwd);

      // 4) Roteia pela role
      goToHomeByRole(role);

    } catch (e: any) {
      const backendMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Falha ao entrar. Tente novamente.";
      setError(backendMsg);
      Alert.alert("Falha no login", backendMsg);
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
          <Text style={styles.subtitle}>Seja</Text>
          <Text style={styles.titleStrong}>Bem-vindo!</Text>

          <View style={styles.field}>
            <Fontisto name="email" size={25} color="#0A0322" />
            <TextInput
              placeholder="Usuário ou e-mail"
              placeholderTextColor="#0A0322"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType={isEmailLike(email) ? "email-address" : "default"}
              returnKeyType="next"
            />
          </View>

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
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <Pressable onPress={() => setShowPwd(v => !v)}>
              <Text style={styles.eye}>
                {showPwd
                  ? <Feather name="eye-off" size={24} color="#0A0322" />
                  : <Feather name="eye" size={24} color="#0A0322" />
                }
              </Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
            style={[styles.cta, (!isFormValid || loading) && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>{loading ? "ENTRANDO..." : "ENTRAR"}</Text>
          </Pressable>

          <Pressable onPress={() => router.push("/(auth)/forgot-password")} style={styles.forgotWrap}>
            <Text style={styles.forgotText}>ESQUECEU SUA SENHA?</Text>
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

/* ===========================
   Estilos
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
    fontFamily: "Raleway_400Regular",
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
    fontFamily: "Raleway_400Regular",
    marginLeft: 6,
  },
  eye: { marginLeft: 8, fontSize: 16 },

  error: {
    color: "#ffdede",
    marginTop: 4,
    marginBottom: 4,
    fontSize: 12,
  },

  cta: {
    height: 52,
    borderRadius: 14,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: {
    fontSize: 20,
    letterSpacing: 1,
    color: "#fff",
    fontWeight: "700",
    fontFamily: "Raleway_400Regular",
  },

  forgotWrap: { alignItems: "flex-end", marginTop: 15 },
  forgotText: {
    fontSize: 16,
    color: "#fff",
    letterSpacing: 0.6,
  },

  footerSection: { width: "100%", marginTop: 260, marginBottom: 8 },
  fullDivider: { height: 1, backgroundColor: "#fff", opacity: 0.9, alignSelf: "stretch" },
  footerWrap: { paddingTop: 40, paddingHorizontal: 24, alignItems: "center" },
  footerMuted: { color: "#dedede", letterSpacing: 0.6 },
  footerLink: { color: YELLOW, fontWeight: "800", letterSpacing: 0.6, fontFamily: "Raleway_400Regular" },
});
