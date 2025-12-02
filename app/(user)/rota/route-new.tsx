// app/(user)/rota/route-new.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { processRoutePoints } from "../../../src/services/route";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
};

/* ===================== TIPOS ===================== */
type Place = { label: string; lat: number; lon: number };
type NominatimItem = { display_name: string; lat: string; lon: string };

type Stop = {
  id: string;
  query: string;
  place?: Place;
};

const TABBAR_H = 64;

const sanitizeAddress = (s: string) =>
  String(s ?? "")
    .replace(/\r?\n/g, " ") // remove quebras de linha
    .replace(/\s{2,}/g, " ") // colapsa espaços
    .replace(/\s*,\s*,/g, ", ") // evita vírgulas duplicadas
    .trim()
    .slice(0, 500); // evita strings gigantes (ajuste se quiser);

/* type-guard para garantir que place está definido */
const isPlace = (x: Stop["place"]): x is Place => !!x;

/* ===================== HELPERS ===================== */
const newId = () => Math.random().toString(36).slice(2, 9);
const formatLatLon = (n: number) => n.toFixed(6);

/* ===================== TELA ===================== */
export default function NewRouteScreen() {
  const insets = useSafeAreaInsets();

  // pontos digitados/autocompletados
  const [stops, setStops] = useState<Stop[]>([
    { id: newId(), query: "" },
    { id: newId(), query: "" },
  ]);

  // nome da rota e ponto inicial
  const [routeName, setRouteName] = useState<string>("");
  const [initialIndex, setInitialIndex] = useState<number>(0);

  // loading do submit
  const [submitting, setSubmitting] = useState<boolean>(false);

  // somente os pontos válidos (com coordenadas)
  const points = useMemo<Place[]>(
    () => stops.map((s) => s.place).filter(isPlace),
    [stops]
  );

  /* ===== Mutadores ===== */
  const addStop = (index?: number) => {
    setStops((arr) => {
      const next: Stop = { id: newId(), query: "" };
      if (index == null) return [...arr, next];
      const copy = [...arr];
      copy.splice(index + 1, 0, next);
      return copy;
    });
  };

  const removeStop = (id: string) => {
    setStops((arr) => (arr.length <= 1 ? arr : arr.filter((s) => s.id !== id)));
    // se remover, reacomoda o índice do ponto inicial
    setInitialIndex((prev) =>
      Math.max(0, Math.min(prev, Math.max(0, stops.length - 2)))
    );
  };

  const updateQuery = (id: string, t: string) => {
    setStops((arr) =>
      arr.map((s) => (s.id === id ? { ...s, query: t, place: undefined } : s))
    );
  };

  const setPlace = (id: string, item: Place) => {
    setStops((arr) =>
      arr.map((s) => (s.id === id ? { ...s, query: item.label, place: item } : s))
    );
  };

  const canGenerate =
    stops.length >= 2 && points.length >= 2 && routeName.trim().length >= 3;

  const onGenerate = async () => {
    if (!canGenerate) {
      Alert.alert(
        "Atenção",
        "Informe um nome para a rota e selecione ao menos dois pontos."
      );
      return;
    }
    try {
      setSubmitting(true);

      // payload conforme Swagger: /RoutePoint/process-route-points
      const payload = {
        routeName: routeName.trim(),
        routePoints: points.map((p: Place, idx: number) => ({
          latitude: p.lat,
          longitude: p.lon,
          address: sanitizeAddress(p.label),
          isInitialPoint: idx === initialIndex,
        })),
      };

      const res = await processRoutePoints(payload);

      if (!res?.success) {
        Alert.alert("Erro", res?.message || "Não foi possível criar a rota.");
        return;
      }

      // sucesso -> ir para lista de rotas ativas
      router.replace("/(user)/rota/route-progress");
    } catch (err: any) {
      const status = err?.response?.status;
      const server =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (Array.isArray(err?.response?.data?.errors)
          ? err.response.data.errors.join("; ")
          : null);

      console.log("process-route-points error:", {
        status,
        data: err?.response?.data,
      });

      Alert.alert(
        "Erro",
        server
          ? `Servidor respondeu ${status ?? ""}: ${server}`
          : "Falha ao comunicar com o servidor."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        {/* TOPO: imagem fixa */}
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
          <Text style={styles.heading}>Nova Rota</Text>
          <Text style={styles.subtitle}>
            Selecione os endereços e marque o ponto inicial
          </Text>

          {/* CONTEÚDO ROLÁVEL (tudo aqui dentro rola) */}
          <ScrollView
            style={{ flex: 1 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 140 + TABBAR_H,
            }}
          >
            {/* Nome da rota */}
            <View style={styles.card}>
              <View style={styles.inputWrap}>
                <FontAwesome5 name="route" size={16} color={COLORS.navy} />
                <TextInput
                  value={routeName}
                  onChangeText={setRouteName}
                  placeholder="Nome da rota"
                  placeholderTextColor="#5c5c5c"
                  style={styles.input}
                  autoCapitalize="sentences"
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Pontos e seletor do ponto inicial */}
            <View style={styles.card}>
              {stops.map((s: Stop, idx: number) => (
                <StopInput
                  key={s.id}
                  index={idx}
                  value={s.query}
                  onChangeText={(t: string) => updateQuery(s.id, t)}
                  onRemove={() => removeStop(s.id)}
                  onAddAfter={() => addStop(idx)}
                  onSelectPlace={(pl: Place) => setPlace(s.id, pl)}
                />
              ))}

              {/* Seletor do ponto inicial */}
              {points.length >= 1 && (
                <View style={{ marginTop: 8 }}>
                  <Text
                    style={{
                      fontWeight: "700",
                      color: COLORS.text,
                      marginBottom: 6,
                    }}
                  >
                    Ponto inicial
                  </Text>
                  {points.map((p: Place, idx: number) => (
                    <Pressable
                      key={`${p.lat}_${p.lon}_${idx}`}
                      onPress={() => setInitialIndex(idx)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 8,
                      }}
                    >
                      <FontAwesome5
                        name={initialIndex === idx ? "dot-circle" : "circle"}
                        size={16}
                        color={COLORS.navy}
                      />
                      <Text
                        style={{ marginLeft: 8, flex: 1, color: COLORS.text }}
                        numberOfLines={1}
                      >
                        {p.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Adicionar novo ponto (final) */}
              <Pressable
                onPress={() => addStop()}
                android_ripple={{ color: "rgba(255,255,255,0.15)" }}
                style={({ pressed }) => [
                  styles.addBtn,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Adicionar ponto"
              >
                <Text style={styles.addBtnText}>+ ADICIONAR PONTO</Text>
              </Pressable>
            </View>
          </ScrollView>

          {/* FOOTER FIXO (fora do ScrollView) */}
          <View
            style={[
              styles.footer,
              {
                // empurra o footer para cima da TabBar
                bottom: Math.max(insets.bottom, 0) + TABBAR_H + 8,
                paddingBottom: Math.max(insets.bottom, 8),
              },
            ]}
          >
            <Pressable
              onPress={onGenerate}
              disabled={!canGenerate || submitting}
              android_ripple={{ color: "rgba(255,255,255,0.15)" }}
              style={[
                styles.primaryBtn,
                { marginTop: 0 },
                (!canGenerate || submitting) && { opacity: 0.7 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Criar rota"
            >
              {submitting ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <ActivityIndicator color="#fff" />
                  <Text style={styles.primaryBtnText}>ENVIANDO…</Text>
                </View>
              ) : (
                <Text style={styles.primaryBtnText}>CRIAR ROTA</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ===================== CONFIG NOMINATIM (BR / PARANÁ) ===================== */
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const DEFAULT_COUNTRY_CODES = "br"; // só Brasil
const DEFAULT_STATE_SUFFIX = ", Paraná, Brasil"; // estado padrão para melhorar a busca

/* ===================== INPUT + AUTOCOMPLETE (Nominatim) ===================== */
function StopInput({
  index,
  value,
  onChangeText,
  onRemove,
  onAddAfter,
  onSelectPlace,
}: {
  index: number;
  value: string;
  onChangeText: (t: string) => void;
  onRemove: () => void;
  onAddAfter: () => void;
  onSelectPlace: (p: Place) => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<NominatimItem[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // busca no Nominatim com debounce, focando BR/PR
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!value || value.trim().length < 3) {
      setResults([]);
      return;
    }

    timer.current = setTimeout(async () => {
      try {
        setLoading(true);

        // se o usuário já escreveu PR / Paraná / Brasil, não precisa forçar de novo
        const hasRegion = /paraná|pr\b|brasil/i.test(value);
        const queryWithRegion = hasRegion
          ? value
          : `${value} ${DEFAULT_STATE_SUFFIX}`;

        const url =
          `${NOMINATIM_BASE}?format=json` +
          `&addressdetails=1` +
          `&limit=5` +
          `&countrycodes=${DEFAULT_COUNTRY_CODES}` +
          `&q=${encodeURIComponent(queryWithRegion)}`;

        const res = await fetch(url, {
          headers: {
            "User-Agent": "RotalizeApp/1.0 (contato: seu-email@dominio.com)",
            Accept: "application/json",
          },
        });
        const json: NominatimItem[] = await res.json();
        setResults(json);
      } catch {
        // silencioso
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  return (
    <View style={{ marginBottom: 12 }}>
      <View style={styles.inputWrap}>
        <FontAwesome5 name="map-marker-alt" size={16} color={COLORS.navy} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={`Insira o endereço do ponto ${index + 1}…`}
          placeholderTextColor="#5c5c5c"
          style={styles.input}
          autoCapitalize="sentences"
          returnKeyType="done"
        />
        {/* + abaixo */}
        <Pressable
          onPress={onAddAfter}
          hitSlop={10}
          accessibilityLabel="Adicionar novo ponto"
        >
          <FontAwesome5 name="plus" size={14} color={COLORS.navy} />
        </Pressable>
        <View style={{ width: 8 }} />
        {/* remover */}
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityLabel="Remover ponto"
        >
          <FontAwesome5 name="minus" size={14} color={COLORS.navy} />
        </Pressable>
      </View>

      {/* sugestões */}
      {loading && value.trim().length >= 3 ? (
        <Text style={styles.suggestionHint}>Buscando…</Text>
      ) : results.length > 0 ? (
        <View style={styles.suggestionsBox}>
          <ScrollView nestedScrollEnabled style={{ maxHeight: 220 }}>
            {results.map((r: NominatimItem, i: number) => (
              <Pressable
                key={`${r.lat}_${r.lon}_${i}`}
                onPress={() =>
                  onSelectPlace({
                    label: r.display_name,
                    lat: parseFloat(r.lat),
                    lon: parseFloat(r.lon),
                  })
                }
                style={({ pressed }) => [
                  styles.suggestionItem,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text numberOfLines={2} style={styles.suggestionText}>
                  {r.display_name}
                </Text>
                <Text style={styles.suggestionSub}>
                  ({formatLatLon(parseFloat(r.lat))},{" "}
                  {formatLatLon(parseFloat(r.lon))})
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : value.trim().length >= 3 ? (
        <Text style={styles.suggestionHint}>Nenhum resultado</Text>
      ) : null}
    </View>
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
    paddingBottom: 84 + TABBAR_H, // espaço para o footer fixo
    position: "relative", // para o footer absoluto ancorar aqui
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
    fontSize: 20,
    color: COLORS.subtext,
    marginBottom: 12,
    fontFamily: "Raleway_400Regular",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    fontSize: 16,
    color: COLORS.text,
  },

  suggestionsBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginTop: 6,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  suggestionText: { color: COLORS.text, fontSize: 14 },
  suggestionSub: { color: "#667", fontSize: 12, marginTop: 2 },
  suggestionHint: { color: "#667", fontSize: 12, marginTop: 6, marginLeft: 6 },

  addBtn: {
    backgroundColor: "#e6e6e6",
    borderWidth: 1,
    borderColor: "#cfcfcf",
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 8,
  },
  addBtnText: {
    color: COLORS.text,
    fontWeight: "800",
    letterSpacing: 0.2,
  },

  primaryBtn: {
    backgroundColor: COLORS.navy,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 8, // será sobrescrito pelo inline acima
    backgroundColor: "transparent",
    zIndex: 100, // garante que fique por cima
    elevation: 6,
  },
});
