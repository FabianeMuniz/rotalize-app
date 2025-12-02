// src/components/RoleProtected.tsx
import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import type { UserRole } from "../config/apiConfig";
import { AuthContext } from "../contexts/AuthContext";

export default function RoleProtected({
  allow,
  children,
}: {
  allow: UserRole[];   // ex.: ["admin"]
  children: React.ReactNode;
}) {
  const { token, role, loading } = React.useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!token) return <Redirect href="/(auth)/login" />;

  if (!allow.includes(role)) {
    // Sem permissão: manda pra home do papel atual (ou pro login se desconhecido)
    if (role === "admin")      return <Redirect href="/(admin)/tabs/home" />;
    if (role === "manager") return <Redirect href="/(manager)/tabs/home" />;
    if (role === "user")       return <Redirect href="/(user)/tabs/home" />;
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}
