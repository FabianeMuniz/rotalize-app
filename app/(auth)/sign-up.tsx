// app/(auth)/sign-up.tsx
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Fontisto from '@expo/vector-icons/Fontisto';
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

import { API_PATHS } from "../../src/config/apiConfig";
import { api } from "../../src/services/api";

const GREY = "#7a7a7a";
const YELLOW = "#F2C94C";
const INK = "#0A0322";
const CARD = "#848484";

/** helpers de CPF */
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const formatCPF = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  let out = p1;
  if (p2) out += `.${p2}`;
  if (p3) out += `.${p3}`;
  if (p4) out += `-${p4}`;
  return out;
};

export default function SignUp() {
  // ordem pedida
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState(""); // exibimos formatado
  const [username, setUsername] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");

  // email continua (a API pede)
  const [email, setEmail] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEmailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const isFormValid = useMemo(() => {
    const cpfDigits = onlyDigits(cpf);
    if (!name.trim()) return false;
    if (cpfDigits.length !== 11) return false;     // CPF obrigatório (11 dígitos)
    if (!username.trim()) return false;            // username obrigatório
    if (pwd.length < 6) return false;
    if (pwd !== pwd2) return false;
    if (!isEmailValid(email)) return false;        // email continua requerido pela API
    return true;
  }, [name, cpf, username, pwd, pwd2, email]);

  async function handleSubmit() {
    if (!isFormValid) {
      setError("Verifique os campos do formulário.");
      return;
    }
    setError(null);

    try {
      setLoading(true);

      // envia registerNumber = CPF (apenas dígitos), e SEM enterpriseId
      const payload = {
        username: username.trim(),
        name: name.trim(),
        registerNumber: onlyDigits(cpf),
        password: pwd,
        email: email.trim(),
      };

      const { status } = await api.post(API_PATHS.createUser, payload);

      if (status >= 200 && status < 300) {
        Alert.alert("Sucesso", "Usuário cadastrado! Faça login para entrar.");
        router.replace("/(auth)/login");
        return;
      }

      Alert.alert("Falha no cadastro", "Não foi possível cadastrar o usuário.");
    } catch (e: any) {
      console.log("SIGNUP ERROR ->", {
        message: e?.message,
        url: e?.config?.baseURL + e?.config?.url,
        method: e?.config?.method,
        data: e?.config?.data,
        status: e?.response?.status,
        resp: e?.response?.data,
      });

      const backendMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Erro ao cadastrar. Tente novamente.";
      setError(backendMsg);
      Alert.alert("Falha no cadastro", backendMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />

      {/* topo com mapa */}
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
            <FontAwesome5 name="map-marker-alt" size={35} color="#0a0322" style={{ transform: [{ rotate: "90deg" }] }} />
          </Pressable>
        </ImageBackground>
      </View>

      {/* card */}
      <View style={styles.bottomCard}>
        <View style={styles.logoBadgeShadow}>
          <View style={styles.logoBadge}>
            <Image source={require("../../assets/images/logo.png")} style={styles.logo} resizeMode="contain" />
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>Novo</Text>
          <Text style={styles.titleStrong}>Cadastro</Text>

          {/* 1) Nome completo */}
          <View style={styles.field}>
            <FontAwesome name="user" size={22} color="#0A0322"/>
            <TextInput
              placeholder="Nome completo"
              placeholderTextColor="#0A0322"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* 2) CPF (registerNumber) */}
          <View style={styles.field}>
            <FontAwesome name="id-badge" size={22} color="#0A0322"/>
            <TextInput
              placeholder="CPF"
              placeholderTextColor="#0A0322"
              value={cpf}
              onChangeText={(v) => setCpf(formatCPF(v))}
              style={styles.input}
              keyboardType="number-pad"
              maxLength={14} // 000.000.000-00
              returnKeyType="next"
            />
          </View>

          {/* 3) Nome de usuário (username) */}
          <View style={styles.field}>
            <FontAwesome name="user-circle-o" size={25} color="#0A0322"/>
            <TextInput
              placeholder="Nome de usuário"
              placeholderTextColor="#0A0322"
              value={username}
              onChangeText={setUsername}
              style={styles.input}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>
          {/* 4) E-mail */}
          <View style={styles.field}>
            <Fontisto name="email" size={25} color="#0A0322" />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor="#0A0322"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>
          
          {/* 5) Senha */}
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
            <Pressable onPress={() => setShowPwd((v) => !v)}>
              <Text style={styles.eye}>
                {showPwd ? <Feather name="eye-off" size={24} color="#0A0322" /> : <Feather name="eye" size={24} color="#0A0322" />}
              </Text>
            </Pressable>
          </View>

          {/* 6) Confirmar senha */}
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
              returnKeyType="next"
            />
            <Pressable onPress={() => setShowPwd2((v) => !v)}>
              <Text style={styles.eye}>
                {showPwd2 ? <Feather name="eye-off" size={24} color="black" /> : <Feather name="eye" size={24} color="black" />}
              </Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
            style={[styles.cta, (!isFormValid || loading) && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>{loading ? "CADASTRANDO..." : "CADASTRAR"}</Text>
          </Pressable>
        </View>

        <View style={styles.footerSection}>
          <View style={styles.fullDivider} />
          <View style={styles.footerWrap}>
            <Text style={styles.footerMuted}>JÁ TEM UMA CONTA?</Text>
            <Link asChild href="/(auth)/login">
              <Pressable>
                <Text style={styles.footerLink}> ENTRE AQUI!</Text>
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
  backPin: { position: "absolute", top: 25, left: 16, width: 36, height: 36, alignItems: "center", justifyContent: "center", zIndex: 10 },
  bottomCard: { position: "absolute", top: "12%", left: 0, right: 0, bottom: 0, backgroundColor: CARD, borderTopLeftRadius: 36, borderTopRightRadius: 36, paddingTop: 86, alignItems: "center" },
  logoBadgeShadow: { position: "absolute", top: -76, alignSelf: "center", width: 152, height: 152, borderRadius: 76, backgroundColor: "#00000022", shadowColor: "#000", shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  logoBadge: { flex: 1, borderRadius: 76, backgroundColor: CARD, alignItems: "center", justifyContent: "center" },
  logo: { width: 205, height: 205 },
  content: { width: "86%" },
  subtitle: { fontSize: 35, color: "#fff", marginBottom: -10, fontWeight: "300", fontFamily: "Raleway_400Regular" },
  titleStrong: { fontSize: 45, fontWeight: "800", color: "#FFCC00", marginBottom: 18, fontFamily: "Raleway_400Bold" },
  field: { flexDirection: "row", alignItems: "center", backgroundColor: "#D9D9D9", borderRadius: 12, paddingHorizontal: 12, height: 46, marginBottom: 12 },
  input: { flex: 1, color: INK, fontSize: 20, fontFamily: "Raleway_400Regular", marginLeft: 6 },
  eye: { marginLeft: 8, fontSize: 16 },
  error: { color: "#ffdede", marginTop: 4, marginBottom: 4, fontSize: 12 },
  cta: { height: 52, borderRadius: 14, backgroundColor: INK, alignItems: "center", justifyContent: "center", marginTop: 8 },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 20, letterSpacing: 1, color: "#fff", fontWeight: "700", fontFamily: "Raleway_400Regular" },
  footerSection: { width: "100%", marginTop: 185, marginBottom: 8 },
  fullDivider: { height: 1, backgroundColor: "#fff", opacity: 0.9, alignSelf: "stretch" },
  footerWrap: { paddingTop: 30, paddingHorizontal: 24, alignItems: "center" },
  footerMuted: { color: "#dedede", letterSpacing: 0.6 },
  footerLink: { color: YELLOW, fontWeight: "800", letterSpacing: 0.6, fontFamily: "Raleway_400Regular" },
});
