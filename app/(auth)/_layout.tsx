// app/(auth)/_layout.tsx
import { Redirect, Stack, useSegments } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../../src/contexts/AuthContext";

export default function AuthLayout() {
  const { loading, token } = useAuth();
  const segments = useSegments();      // ex.: ["(auth)", "reset-password"]
  const group = segments[0];           // "(auth)"
  const screen = segments[segments.length - 1]; // "reset-password", "forgot-password", etc.

  // telas que devem ser acessíveis mesmo logado:
  const allowWhileLogged = new Set(["forgot-password", "reset-password", "new-password"]);

  if (loading) {
    return (
      <View style={{ flex:1, alignItems:"center", justifyContent:"center", backgroundColor:"#fff" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Se está logado e está no grupo (auth), só permite as telas whitelisted
  if (token && group === "(auth)" && !allowWhileLogged.has(screen)) {
    return <Redirect href="/(user)/tabs/home" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
