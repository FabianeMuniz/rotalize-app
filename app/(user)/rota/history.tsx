// app/(user)/rota/history.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { getRouteHistory } from "../../../src/services/route";

/* ===== Paleta ===== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
};

/* ===== Tipos ===== */
type HistoryRoute = {
  id: string;
  routeName: string;
  createdAt: string;  // ISO (ex.: 2025-10-24T05:43:21.307914Z)
  status: number | string;
};

/* ===== Helpers de data (força dd/MM/yyyy) ===== */
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const fmtOnlyDateDMY = (d?: Date | null) =>
  d ? `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}` : "—";

const fmtDateTimeDMY = (iso?: string) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const date = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
    const time = `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
    return `${date} ${time}`;
  } catch {
    return iso ?? "-";
  }
};

const statusLabel = (s: unknown) => {
  if (s === 2 || s === "Completed") return "Concluída";
  if (s === 1 || s === "InProgress") return "Em andamento";
  if (s === 0 || s === "Pending") return "Pendente";
  return String(s ?? "");
};

/* ===== Tela ===== */
export default function HistoryScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState<HistoryRoute[]>([]);

  // filtros
  const [q, setQ] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // pickers
  const [picker, setPicker] = useState<null | "start" | "end">(null);
  const [tempDate, setTempDate] = useState<Date>(new Date());

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRouteHistory(); // deve retornar { success, data }
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (err: any) {
      console.log("Erro ao carregar histórico:", err?.response?.data || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  }, [load]);

  // aplica filtros em memória
  const filtered = useMemo(() => {
    const qNorm = q.trim().toLowerCase();
    const startMs = startDate ? new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 0).getTime() : null;
    const endMs   = endDate   ? new Date(endDate.getFullYear(),   endDate.getMonth(),   endDate.getDate(),   23,59,59,999).getTime() : null;

    return items.filter((it) => {
      if (qNorm && !String(it.routeName || "").toLowerCase().includes(qNorm)) return false;
      const t = new Date(it.createdAt).getTime();
      if (startMs && t < startMs) return false;
      if (endMs && t > endMs) return false;
      return true;
    });
  }, [items, q, startDate, endDate]);

  const clearFilters = () => { setQ(""); setStartDate(null); setEndDate(null); };

  // pickers
  const openPicker = (which: "start" | "end") => {
    setTempDate((which === "start" ? startDate : endDate) ?? new Date());
    setPicker(which);
  };
  const closePicker = () => setPicker(null);

  const onChangeAndroid = (e: DateTimePickerEvent, selected?: Date) => {
    const which = picker;
    closePicker();
    if (e.type !== "set" || !selected || !which) return;
    if (which === "start") {
      setStartDate(selected);
      if (endDate && selected > endDate) setEndDate(selected);
    } else {
      setEndDate(selected);
      if (startDate && selected < startDate) setStartDate(selected);
    }
  };

  const confirmIOS = () => {
    if (!picker) return;
    if (picker === "start") {
      setStartDate(tempDate);
      if (endDate && tempDate > endDate) setEndDate(tempDate);
    } else {
      setEndDate(tempDate);
      if (startDate && tempDate < startDate) setStartDate(tempDate);
    }
    closePicker();
  };
  const cancelIOS = () => closePicker();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Topo com mapa + voltar */}
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
            <FontAwesome5 name="map-marker-alt" size={35} color={COLORS.navy} style={{ transform: [{ rotate: "90deg" }] }} />
          </Pressable>
        </ImageBackground>
      </View>

      {/* Painel */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Histórico de rotas</Text>
        <Text style={styles.subtitle}>Filtre por nome e período</Text>

        {/* Filtros */}
        <View style={styles.filtersCard}>
          <View style={styles.inputWrap}>
            <FontAwesome5 name="search" size={16} color={COLORS.navy} />
            <TextInput
              value={q}
              onChangeText={setQ}
              placeholder="Buscar por nome da rota…"
              placeholderTextColor="#5c5c5c"
              style={styles.input}
              returnKeyType="search"
            />
            {q ? (
              <Pressable onPress={() => setQ("")} hitSlop={8}>
                <FontAwesome5 name="times" size={14} color={COLORS.navy} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.filtersRow}>
            <Pressable onPress={() => openPicker("start")} style={styles.datePill}>
              <FontAwesome5 name="calendar-alt" size={14} color={COLORS.navy} />
              <Text style={styles.datePillText}>Início: {fmtOnlyDateDMY(startDate)}</Text>
            </Pressable>

            <Pressable onPress={() => openPicker("end")} style={styles.datePill}>
              <FontAwesome5 name="calendar-check" size={14} color={COLORS.navy} />
              <Text style={styles.datePillText}>Fim: {fmtOnlyDateDMY(endDate)}</Text>
            </Pressable>
          </View>

          <Pressable onPress={clearFilters} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>LIMPAR FILTROS</Text>
          </Pressable>
        </View>

        {/* Lista */}
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <View style={styles.card}>
            {loading ? (
              <View style={{ paddingVertical: 24, alignItems: "center" }}>
                <ActivityIndicator color={COLORS.navy} />
                <Text style={{ marginTop: 8, color: COLORS.subtext }}>Carregando…</Text>
              </View>
            ) : filtered.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>Nenhum resultado</Text>
                <Text style={styles.emptySub}>Ajuste os filtros para encontrar rotas.</Text>
              </View>
            ) : (
              filtered.map((it) => {
                // debug: ver exatamente o ISO que está vindo
                console.log("History item:", it.id, it.createdAt);
                return (
                  <Pressable
                    key={it.id}
                    onPress={() => router.push(`/(user)/rota/route-detail?id=${it.id}`)}
                    android_ripple={{ color: "rgba(0,0,0,0.06)" }}
                    style={styles.historyCard}
                    accessibilityRole="button"
                    accessibilityLabel={`Abrir detalhes da rota ${it.routeName}`}
                  >
                    <View style={styles.cardHeader}>
                      <FontAwesome5 name="route" size={14} color={COLORS.navy} />
                      <Text numberOfLines={1} style={styles.cardTitle}>{it.routeName}</Text>
                    </View>

                    <View style={styles.metaRow}>
                      <FontAwesome5 name="info-circle" size={12} color={COLORS.navy} />
                      <Text style={styles.metaText}>
                        Status: <Text style={{ fontWeight: "700" }}>{statusLabel(it.status)}</Text>
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <FontAwesome5 name="calendar-alt" size={12} color={COLORS.navy} />
                      {/* <<< Data SEM usar locale >>> */}
                      <Text style={styles.metaText}>Finalizada em {fmtDateTimeDMY(it.createdAt)}</Text>
                    </View>
                  </Pressable>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* Date pickers */}
      {picker && Platform.OS === "android" ? (
        <DateTimePicker
          value={picker === "start" ? (startDate ?? new Date()) : (endDate ?? new Date())}
          mode="date"
          onChange={onChangeAndroid}
          maximumDate={new Date()}
        />
      ) : null}

      {picker && Platform.OS === "ios" ? (
        <View style={styles.iosSheet}>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="spinner"
            onChange={(_, d) => d && setTempDate(d)}
            maximumDate={new Date()}
            style={{ backgroundColor: COLORS.white }}
          />
          <View style={styles.sheetRow}>
            <Pressable onPress={cancelIOS} style={[styles.sheetBtn, styles.cancelBtn]}>
              <Text style={[styles.sheetBtnText, { color: COLORS.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={confirmIOS} style={[styles.sheetBtn, styles.okBtn]}>
              <Text style={styles.sheetBtnText}>OK</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "25%", backgroundColor: COLORS.greyBg },
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
    fontSize: 18,
    color: COLORS.subtext,
    marginBottom: 12,
    fontFamily: "Raleway_400Regular",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 56,
  },

  filtersCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 6,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 10,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: COLORS.text },

  filtersRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  datePill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  datePillText: { color: COLORS.text, fontSize: 14 },

  clearBtn: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.navy,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtnText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  emptyBox: { alignItems: "center", paddingVertical: 24 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: "800", marginBottom: 6 },
  emptySub: { color: "#555" },

  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eaeaea",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  cardTitle: { flex: 1, color: COLORS.text, fontSize: 16, fontWeight: "800" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  metaText: { color: COLORS.text },

  iosSheet: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
  },
  sheetRow: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  sheetBtn: { paddingHorizontal: 16, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cancelBtn: { backgroundColor: "#e6e6e6", borderWidth: 1, borderColor: "#cfcfcf" },
  okBtn: { backgroundColor: COLORS.navy },
  sheetBtnText: { color: "#fff", fontWeight: "800" },
});
