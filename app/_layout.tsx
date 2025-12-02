import { Raleway_400Regular, Raleway_700Bold, useFonts } from "@expo-google-fonts/raleway";
import { Slot, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";

function Gate() {
  const segments = useSegments(); // ["(user)","..."] ou ["(auth)","..."]
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === "(auth)";

    if (!token && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (token && inAuthGroup) {
      router.replace("/(user)/tabs/home"); 
    }
  }, [segments, token, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }
  return <Slot />;
}
export default function RootLayout() {
  // carrega as fontes primeiro
  const [fontsLoaded] = useFonts({
    Raleway_400Regular,
    Raleway_700Bold,
  });

  // se ainda não carregou, mostra o loader
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // quando carregou, retorna o app com o provider de auth + safe-area + rotas
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <Gate />
      </SafeAreaProvider>
    </AuthProvider>
  );
}


