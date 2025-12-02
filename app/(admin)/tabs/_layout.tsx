// app/(user)/tabs/_layout.tsx
import { Feather, Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
    const insets = useSafeAreaInsets(); // pega áreas seguras do dispositivo
  return (
    <Tabs
      initialRouteName="home" // abre na Home
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0a0322",
        tabBarInactiveTintColor: "#fff",
        tabBarStyle: { 
            backgroundColor: "#848484", 
            height: 64 + insets.bottom, 
            paddingTop: 8, 
            paddingBottom: insets.bottom > 0 ? insets.bottom : 10, // garante espaço extra},
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: "600" }, // texto mais legível
      }}
    >
      {/* 1) INÍCIO*/}
      <Tabs.Screen
        name="home"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={30} color={color} />,
        }}
      />

      {/* 2) CONFIGURAÇÃO*/}
      <Tabs.Screen
        name="settings"
        options={{
          title: "Configuração",
          tabBarIcon: ({ color, size }) => <Feather name="settings" size={28} color={color} />,
        }}
      />


    </Tabs>
    
  );
}
