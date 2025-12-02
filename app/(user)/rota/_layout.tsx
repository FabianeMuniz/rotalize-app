// app/(user)/_layout.tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import { Slot, router, usePathname } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  navy: "#0a0322",
  barBg: "#848484",
  label: "#0a0322",
  labelInactive: "#fff",
  white: "#fff",
};

export default function UserLayout() {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1 }}>
      {/* Tela atual */}
      <Slot />

      {/* Menu inferior custom */}
      <BottomBar bottomInset={insets.bottom} />
    </View>
  );
}

function BottomBar({ bottomInset }: { bottomInset: number }) {
  const pathname = usePathname();

  const isHome = pathname.startsWith("/(user)/tabs/home");
  const isAccount = pathname.startsWith("/(user)/tabs/account");
  const isSettings = pathname.startsWith("/(user)/tabs/settings");

  return (
    <View
      style={[
        styles.bar,
        {
          paddingBottom: Math.max(bottomInset, 10),
          height: 64 + bottomInset,
            paddingTop: 8
        },
        
      ]}
    >
      <TabButton
        active={isHome}
        label="Início"
        icon={({ color, size }) => <Ionicons name="home-outline" size={30} color={color} />}
        onPress={() => router.push("/tabs/home")}
      />
      <TabButton
        active={isAccount}
        label="Conta"
        icon={({ color, size }) => <Feather name="user" size={30} color={color} />}
        onPress={() => router.push("/tabs/account")}
      />
      <TabButton
        active={isSettings}
        label="Configuração"
        icon={({ color, size }) => <Feather name="settings" size={28} color={color} />}
        onPress={() => router.push("/tabs/settings")}
      />
    </View>
  );
}

function TabButton({
  active,
  label,
  icon,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: ({ color, size }: { color: string; size: number }) => React.ReactNode;
  onPress: () => void;
}) {
  const color = active ? COLORS.label : COLORS.labelInactive;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}>
      {icon({ color, size: 28 })}
      <Text style={[styles.label, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.barBg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    borderTopWidth: 0,
    // sombra
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  btn: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 96, // deixa os botões “grandões” pra uso em campo
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.label,
  },
});
