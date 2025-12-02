// app/(auth)/reset-password.tsx
import AntDesign from "@expo/vector-icons/AntDesign";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
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
import { resetPassword } from "../../src/services/password";

const GREY = "#7a7a7a";
const YELLOW = "#FFCC00";
const INK = "#0A0322";
const CARD = "#848484";

export default function ResetPassword() {
  const [token, setToken] = useState("");
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFormValid = useMemo(() => {
    if (!token.trim()) return false;
    if (pwd.length < 6) return false;
    if (pwd !== pwd2) return false;
    return true;
  }, [token, pwd, pwd2]);

  async function handleSubmit() {
    if (!isFormValid) {
      setError("Preencha o token e a nova senha (mín. 6) e confirme.");
      return;
    }
    setError(null);

    try {
      setLoading(true);
      await resetPassword(token.trim(), pwd);
      Alert.alert("Tudo certo!", "Senha redefinida. Faça login.");
      router.replace("/(auth)/login");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Erro ao redefinir a senha.";
      setError(msg);
      Alert.alert("Falha", msg);
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
          <Text style={styles.subtitle}>Redefinir</Text>
          <Text style={styles.titleStrong}>Senha</Text>

          {/* Token do e-mail */}
          <View style={styles.field}>
            <AntDesign name="key" size={22} color={INK} />
            <TextInput
              placeholder="Token recebido por e-mail"
              placeholderTextColor={INK}
              value={token}
              onChangeText={setToken}
              style={styles.input}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {/* Nova senha */}
          <View style={styles.field}>
            <AntDesign name="lock1" size={22} color={INK} />
            <TextInput
              placeholder="Nova senha (mín. 6)"
              placeholderTextColor={INK}
              value={pwd}
              onChangeText={setPwd}
              style={styles.input}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              returnKeyType="next"
            />
            <Pressable onPress={() => setShowPwd((v) => !v)}>
              <Text style={styles.eye}>
                {showPwd ? (
                  <Feather name="eye-off" size={22} color={INK} />
                ) : (
                  <Feather name="eye" size={22} color={INK} />
                )}
              </Text>
            </Pressable>
          </View>

          {/* Confirmar senha */}
          <View style={styles.field}>
            <AntDesign name="lock1" size={22} color={INK} />
            <TextInput
              placeholder="Confirmar nova senha"
              placeholderTextColor={INK}
              value={pwd2}
              onChangeText={setPwd2}
              style={styles.input}
              secureTextEntry={!showPwd2}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <Pressable onPress={() => setShowPwd2((v) => !v)}>
              <Text style={styles.eye}>
                {showPwd2 ? (
                  <Feather name="eye-off" size={22} color={INK} />
                ) : (
                  <Feather name="eye" size={22} color={INK} />
                )}
              </Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={handleSubmit}
            disabled={!isFormValid || loading}
            style={[styles.cta, (!isFormValid || loading) && styles.ctaDisabled]}
          >
            <Text style={styles.ctaText}>
              {loading ? "ENVIANDO..." : "REDEFINIR"}
            </Text>
          </Pressable>

          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={{ color: "#fff" }}>Voltar para o login</Text>
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
  subtitle: { fontSize: 32, color: "#fff", marginBottom: -6, fontWeight: "300" },
  titleStrong: { fontSize: 40, fontWeight: "800", color: YELLOW, marginBottom: 18 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#D9D9D9",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 12,
  },
  input: { flex: 1, color: INK, fontSize: 18, marginLeft: 8 },
  eye: { marginLeft: 8, fontSize: 16 },
  error: { color: "#ffdede", marginTop: 4, marginBottom: 4, fontSize: 12 },
  cta: {
    height: 52,
    borderRadius: 14,
    backgroundColor: INK,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 18, letterSpacing: 1, color: "#fff", fontWeight: "700" },
});
