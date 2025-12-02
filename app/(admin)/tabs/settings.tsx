import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../../src/contexts/AuthContext";

const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#0a0322",
  white: "#fff",
};

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const confirmLogout = () =>
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() },
    ]);
  const [busy, setBusy] = useState<"logout" | "delete" | null>(null);

  const handleLogout = async () => {
    try {
      setBusy("logout");
      // TODO: chame seu endpoint de logout e limpe o token local (SecureStore/AsyncStorage)
      // await fetch(`${API_URL}/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` }});
      await SecureStore.deleteItemAsync("token");
      router.replace("../(auth)/sign-in");
    } catch (e) {
      Alert.alert("Erro", "Não foi possível sair. Tente novamente.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* topo com mapa */}
      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../../../assets/images/map-bg.png")}
          defaultSource={require("../../../assets/images/map-bg.png")}
          resizeMode="cover"
          style={styles.topBg}
          imageStyle={styles.topBgImg}
        />
      </View>

      {/* painel */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Configurações</Text>
        <Text style={styles.subtitle}>Gerencie sua conta</Text>

        <View style={styles.list}>
          <PillButton
            label={busy === "logout" ? "Saindo..." : "Sair da conta"}
            onPress={confirmLogout}
            disabled={!!busy}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function PillButton({
  label,
  onPress,
  disabled,
  kind = "primary",
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  kind?: "primary" | "secondary";
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: "rgba(255,255,255,0.15)" }}
      style={({ pressed }) => [
        styles.pill,
        kind === "secondary" && styles.pillSecondary,
        (pressed || disabled) && { transform: [{ scale: 0.98 }], opacity: 0.9 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[
          styles.pillText,
          kind === "secondary" && { color: COLORS.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "32%", backgroundColor: COLORS.greyBg },
  topBg: { flex: 1, width: "100%" },
  topBgImg: { opacity: 0.9 },

  panel: {
    flex: 1,
    backgroundColor: COLORS.greyPanel,
    marginTop: -18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  heading: {
    textAlign: "center",
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 0.5,
    marginBottom: 6,
    fontFamily: "Raleway_400Regular",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 25,
    color: COLORS.subtext,
    marginBottom: 28,
    fontFamily: "Raleway_400Regular",
  },

  list: {
    gap: 12,
    alignItems: "center",
  },

  pill: {
    backgroundColor: COLORS.navy,
    width: "92%",
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  pillSecondary: {
    backgroundColor: "#e6e6e6",
    borderWidth: 1,
    borderColor: "#cfcfcf",
  },
  pillText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.3,
    fontFamily: "Raleway_400Regular",
  },
});
