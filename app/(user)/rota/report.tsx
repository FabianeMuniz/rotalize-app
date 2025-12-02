// app/(user)/account/report.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
};

const formatBR = (d: Date) =>
  d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

const toISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function ReportScreen() {
  const today = useMemo(() => new Date(), []);
  const [start, setStart] = useState<Date>(new Date(2025, 4, 21)); // 21/05/2025
  const [end, setEnd] = useState<Date>(new Date(2025, 7, 21));   // 21/08/2025

  const [openWhich, setOpenWhich] = useState<null | "start" | "end">(null);
  const [tempDate, setTempDate] = useState<Date>(today);

  const [downloading, setDownloading] = useState(false);

  // abre o seletor para um dos campos
  const openPicker = (which: "start" | "end") => {
    setOpenWhich(which);
    setTempDate(which === "start" ? start : end);
  };

  // ANDROID: confirma/cancela no próprio diálogo
  const onChangeAndroid = (_: DateTimePickerEvent, selected?: Date) => {
    if (!openWhich) return;
    setOpenWhich(null);
    if (selected) {
      if (openWhich === "start") {
        setStart(selected);
        if (selected > end) setEnd(selected);
      } else {
        setEnd(selected < start ? start : selected);
      }
    }
  };

  // iOS: sheet com OK/Cancelar
  const confirmIOS = () => {
    if (!openWhich) return;
    if (openWhich === "start") {
      setStart(tempDate);
      if (tempDate > end) setEnd(tempDate);
    } else {
      setEnd(tempDate < start ? start : tempDate);
    }
    setOpenWhich(null);
  };
  const cancelIOS = () => {
    setOpenWhich(null);
    setTempDate(openWhich === "start" ? start : end);
  };

  const validateRange = () => {
    if (start > end) {
      Alert.alert("Atenção", "A data inicial não pode ser maior que a final.");
      return false;
    }
    // (opcional) limitar intervalo:
    // const maxDays = 186; // ~6 meses
    // const diff = (end.getTime() - start.getTime()) / 86400000;
    // if (diff > maxDays) {
    //   Alert.alert("Atenção", `Selecione um período de até ${maxDays} dias.`);
    //   return false;
    // }
    return true;
  };

  const onDownload = async () => {
    if (!validateRange()) return;

    try {
      setDownloading(true);

      // TODO: chame seu endpoint real; exemplo retornando CSV/PDF
      // const url = `${API_URL}/reports/history?start=${toISODate(start)}&end=${toISODate(end)}`;
      // const token = await SecureStore.getItemAsync("token");
      // const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }});
      // if (!res.ok) throw new Error("Falha ao gerar relatório");
      // const blob = await res.blob();

      // Para simplificar o exemplo, vamos gerar um CSV local
      const csv =
        "data;inicio;fim;duracao\n" +
        `${toISODate(start)};09:02:55;11:54:22;02:51:27\n` +
        `${toISODate(end)};08:10:11;12:44:03;04:33:52\n`;

      const fileUri = FileSystem.cacheDirectory! + `relatorio_${toISODate(start)}_${toISODate(end)}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

      // Compartilhar / abrir com outro app
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, { mimeType: "text/csv" });
      } else {
        Alert.alert("Relatório salvo", `Arquivo em: ${fileUri}`);
      }
    } catch (e) {
      Alert.alert("Erro", "Não foi possível baixar o relatório. Tente novamente.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* topo com mapa e voltar */}
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

      {/* painel */}
      <View style={styles.panel}>
        <Text style={styles.heading}>Relatório</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Selecione o período:</Text>

          {/* Data inicial */}
          <Pressable onPress={() => openPicker("start")} style={styles.inputPill}>
            <FontAwesome5 name="calendar-alt" size={16} color={COLORS.navy} />
            <Text style={styles.inputText}>{formatBR(start)}</Text>
          </Pressable>

          {/* Data final */}
          <Pressable onPress={() => openPicker("end")} style={styles.inputPill}>
            <FontAwesome5 name="calendar-alt" size={16} color={COLORS.navy} />
            <Text style={styles.inputText}>{formatBR(end)}</Text>
          </Pressable>

          {/* Botão baixar */}
          <Pressable
            onPress={onDownload}
            disabled={downloading}
            android_ripple={{ color: "rgba(255,255,255,0.15)" }}
            style={({ pressed }) => [
              styles.downloadBtn,
              (pressed || downloading) && { opacity: 0.9, transform: [{ scale: 0.99 }] },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Baixar relatório"
          >
            {downloading ? (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.downloadText}>GERANDO…</Text>
              </View>
            ) : (
              <Text style={styles.downloadText}>BAIXAR RELATÓRIO</Text>
            )}
          </Pressable>
        </View>

        {/* DatePickers */}
        {openWhich &&
          (Platform.OS === "android" ? (
            <DateTimePicker
              value={openWhich === "start" ? start : end}
              mode="date"
              display="default"
              maximumDate={new Date()}
              onChange={onChangeAndroid}
            />
          ) : (
            <View style={styles.iosSheet}>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_, d) => d && setTempDate(d)}
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
          ))}
      </View>
    </SafeAreaView>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "32%", backgroundColor: COLORS.greyBg },
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
    marginBottom: 10,
    fontFamily: "Raleway_400Regular",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  label: {
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 10,
    fontFamily: "Raleway_400Regular",
  },

  inputPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#cfcfd3",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "#bdbdc1",
    marginBottom: 12,
    // sombra
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  inputText: {
    marginLeft: 8,
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "Raleway_400Regular",
  },

  downloadBtn: {
    backgroundColor: COLORS.navy,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  downloadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    fontFamily: "Raleway_400Regular",
  },

  // iOS sheet do date picker
  iosSheet: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
  },
  sheetRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  sheetBtn: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtn: { backgroundColor: "#e6e6e6", borderWidth: 1, borderColor: "#cfcfcf" },
  okBtn: { backgroundColor: COLORS.navy },
  sheetBtnText: { color: "#fff", fontWeight: "800" },
});
