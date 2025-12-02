// app/(user)/company.tsx
// app/(user)/account/company.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { EnterpriseDTO, getEnterpriseByUser } from "../../../src/services/enterprise";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
  subtext: "#0a0322",
};

/* ===== Tipagem para a UI (somente exibição) ===== */
type Company = {
  nome: string;
  cnpj: string;          // formatado 00.000.000/0000-00
  dataCadastro: string;  // DD/MM/AAAA
  status: string;        // "Ativo" | "Inativo"
};

/* ===== Helpers ===== */
const maskCNPJ = (raw?: string) => {
  const d = String(raw ?? "").replace(/\D/g, "").slice(0, 14);
  if (d.length !== 14) return raw ?? "";
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
};

const isoToBR = (iso?: string) => {
  if (!iso) return "";
  // se já vier DD/MM/AAAA, apenas retorna
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

/** Converte o DTO real para o modelo de exibição da tela */
const mapDtoToCompany = (e: EnterpriseDTO | null): Company | null => {
  if (!e) return null;
  return {
    nome: e.name ?? "",
    cnpj: maskCNPJ(e.registerNumber),
    dataCadastro: isoToBR(e.createdAt),
    status: typeof e.isActive === "boolean" ? (e.isActive ? "Ativo" : "Inativo") : "—",
  };
};

/* ===================== TELA ===================== */
export default function CompanyScreen() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      // O service retorna EnterpriseDTO | null
      const dto = await getEnterpriseByUser();
      setCompany(mapDtoToCompany(dto));
    } catch (e: any) {
      Alert.alert("Erro", e?.message ?? "Falha ao carregar a empresa.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* TOPO: mapa + pin voltar (rotacionado 90°) */}
      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../../../assets/images/map-bg.png")}
          defaultSource={require("../../../assets/images/map-bg.png")}
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
              color={COLORS.navy}
              style={{ transform: [{ rotate: "90deg" }] }}
            />
          </Pressable>
        </ImageBackground>
      </View>

      {/* PAINEL */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Empresa</Text>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.card}>
            {loading && (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator />
                <Text style={{ marginTop: 8, color: COLORS.subtext }}>Carregando dados…</Text>
              </View>
            )}

            {!loading && company && (
              <>
                <InfoRow label="Nome empresa" value={company.nome} />
                <InfoRow label="CNPJ" value={company.cnpj || "—"} />
                <InfoRow label="Data de cadastro" value={company.dataCadastro || "—"} />
                <InfoRow label="Status" value={company.status || "—"} />
              </>
            )}

            {!loading && !company && (
              <View>
                <Text style={styles.valueText}>Nenhuma empresa cadastrada.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* =============== BLOCO READ-ONLY (rótulo + valor) =============== */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "20%" },
  topBg: { flex: 1, width: "100%" },
  topBgImg: { opacity: 0.9 },

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

  panel: {
    flex: 1,
    backgroundColor: COLORS.greyPanel,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 18,
  },

  heading: {
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 26,
    marginBottom: 16,
  },

  fieldLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
    fontFamily: "Raleway_400Regular",
  },

  valueText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Raleway_400Regular",
  },

  cta: {
    marginTop: 16,
    backgroundColor: COLORS.navy,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  ctaText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 16,
  },
});
