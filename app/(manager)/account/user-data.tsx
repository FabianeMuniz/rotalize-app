// app/(manager)/account/profile.tsx
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { API_PATHS } from "../../../src/config/apiConfig";
import { api } from "../../../src/services/api";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  subtext: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
  danger: "#c1121f",
};

/* ===================== HELPERS ===================== */
const isEmail = (s: string) => /\S+@\S+\.\S+/.test(s);
const onlyDigits = (s: string) => s.replace(/\D/g, "");
const maskCPF = (v: string) => {
  const d = onlyDigits(v).slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  let out = p1;
  if (p2) out += "." + p2;
  if (p3) out += "." + p3;
  if (p4) out += "-" + p4;
  return out;
};
const formatDateBR = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
const toStatusText = (val: any) => {
  if (typeof val === "boolean") return val ? "Ativo" : "Inativo";
  if (typeof val === "number") return val === 1 ? "Ativo" : "Inativo";
  if (typeof val === "string") {
    const v = val.toLowerCase();
    if (["active", "ativo", "1", "true"].includes(v)) return "Ativo";
    if (["inactive", "inativo", "0", "false"].includes(v)) return "Inativo";
  }
  return "Ativo";
};

/* ===================== TIPO UI ===================== */
type User = {
  nomeCompleto: string;
  username: string;
  cpf: string;
  email: string;
  dataCadastro: string;
  status: string;
};

/* ===================== TELA ===================== */
export default function ProfileScreen() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<User>({
    nomeCompleto: "",
    username: "",
    cpf: "",
    email: "",
    dataCadastro: "",
    status: "",
  });
  const [initial, setInitial] = useState<User | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --------- LOAD USER (GET /User) ----------
  async function loadUser() {
    try {
      setLoading(true);
      const res = await api.get(API_PATHS.userMe);
      const raw = (res.data?.data ?? res.data) as any;
      const u = Array.isArray(raw) ? raw[0] : raw;

      const mapped: User = {
        nomeCompleto: u?.name ?? "",
        username: u?.username ?? "",
        cpf: maskCPF(String(u?.registerNumber ?? "")),
        email: u?.email ?? "",
        dataCadastro: formatDateBR(u?.createdAt ?? u?.created_at ?? ""),
        status: toStatusText(u?.status ?? u?.isActive),
      };

      setForm(mapped);
      setInitial(mapped);
    } catch (e: any) {
      console.warn("LOAD_USER_ERROR", e?.response?.status, e?.response?.data);
      Alert.alert("Erro", "Não foi possível carregar seus dados.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  const readonly = !editMode;

  // Validação mínima (o backend só aceita atualizar name)
  const validate = useMemo(
  () => () => {
    const e: Record<string, string> = {};
    if (!form.nomeCompleto.trim()) e.nomeCompleto = "Informe o nome completo";

    // agora email é OBRIGATÓRIO
    if (!form.email.trim()) {
      e.email = "Informe o e-mail";
    } else if (!isEmail(form.email)) {
      e.email = "E-mail inválido";
    }

    if (form.cpf && onlyDigits(form.cpf).length !== 11) e.cpf = "CPF deve ter 11 dígitos";
    setErrors(e);
    return Object.keys(e).length === 0;
  },
  [form]
);

  // --------- SAVE (PUT /User/own) ----------
  const onSave = async () => {
  // usa o presente ou cai pro inicial
  const emailToSend = (form.email ?? "").trim() || (initial?.email ?? "");

  // valida usando o emailToSend
  const e: Record<string,string> = {};
  if (!form.nomeCompleto.trim()) e.nomeCompleto = "Informe o nome completo";
  if (!emailToSend) e.email = "Informe o e-mail";
  else if (!isEmail(emailToSend)) e.email = "E-mail inválido";
  setErrors(e);
  if (Object.keys(e).length > 0) return;

  try {
    setSaving(true);
    await api.put(API_PATHS.userUpdateOwn, {
      name: form.nomeCompleto.trim(),
      email: emailToSend,
    });
    setInitial({ ...form, email: emailToSend }); // mantém baseline consistente
    setEditMode(false);
    Alert.alert("Sucesso", "Dados atualizados.");
  } catch (err: any) {
    console.warn("UPDATE_USER_ERROR", err?.response?.status, err?.response?.data);
    const be = err?.response?.data?.errors;
    if (be?.Email?.[0]) setErrors((s) => ({ ...s, email: be.Email[0] }));
    if (be?.Name?.[0]) setErrors((s) => ({ ...s, nomeCompleto: be.Name[0] }));
    Alert.alert("Erro",
      err?.response?.data?.title || err?.response?.data?.message || "Não foi possível salvar.");
  } finally {
    setSaving(false);
  }
};

  const onCancel = () => {
    if (initial) setForm(initial);
    setErrors({});
    setEditMode(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* Topo com mapa e voltar */}
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

      <View style={styles.panel}>
        <Text style={styles.heading}>Dados usuário</Text>

        {loading ? (
          <Text style={{ textAlign: "center", marginTop: 12 }}>Carregando…</Text>
        ) : (
          <>
            <View style={styles.card}>
              <Field
                label="Nome completo"
                value={form.nomeCompleto}
                onChangeText={(t) => setForm((s) => ({ ...s, nomeCompleto: t }))}
                editable={!readonly}
                error={errors.nomeCompleto}
                autoCapitalize="words"
              />

              <Field
                label="Nome de usuário"
                value={form.username}
                onChangeText={(t) => setForm((s) => ({ ...s, username: t }))}
                editable={false /* somente leitura */}
                autoCapitalize="none"
              />

              <Field
                label="CPF"
                value={form.cpf}
                onChangeText={(t) => setForm((s) => ({ ...s, cpf: maskCPF(t) }))}
                keyboardType="number-pad"
                editable={false /* somente leitura, backend não atualiza */}
                error={errors.cpf}
              />

              <Field
                label="E-mail"
                value={form.email}
                onChangeText={(t) => setForm((s) => ({ ...s, email: t }))}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!readonly}
                error={errors.email}
              />

              <Field label="Data de cadastro" value={form.dataCadastro} editable={false} />

              <Field
                label="Status"
                value={form.status}
                editable={false /* somente leitura */}
              />
            </View>

            {!editMode ? (
              <Pressable
                onPress={() => setEditMode(true)}
                style={styles.primaryBtn}
                accessibilityRole="button"
                accessibilityLabel="Editar dados do usuário"
              >
                <Text style={styles.primaryBtnText}>Editar</Text>
              </Pressable>
            ) : (
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={onCancel}
                  style={styles.secondaryBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Cancelar edição"
                >
                  <Text style={styles.secondaryBtnText}>Cancelar</Text>
                </Pressable>

                <Pressable
                  onPress={onSave}
                  disabled={saving}
                  style={[styles.primaryBtn, styles.saveBtn, saving && { opacity: 0.6 }]}
                  accessibilityRole="button"
                  accessibilityLabel="Salvar alterações"
                >
                  <Text style={styles.primaryBtnText}>{saving ? "Salvando…" : "Salvar"}</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

/* ===================== FIELD ===================== */
function Field({
  label,
  value,
  onChangeText,
  editable = true,
  keyboardType,
  error,
  autoCapitalize,
}: {
  label: string;
  value: string;
  onChangeText?: (t: string) => void;
  editable?: boolean;
  keyboardType?: any;
  error?: string;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={[
          styles.input,
          editable ? styles.inputEditable : styles.inputReadonly,
          !!error && styles.inputError,
        ]}
        placeholderTextColor="#9aa"
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },
  topWrap: { height: "15%" },
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
    fontSize: 35,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Raleway_400Regular",
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 26,
    marginBottom: 16,
  },
  field: { marginBottom: 12 },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 4,
    fontFamily: "Raleway_400Regular",
  },
  input: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 18,
    color: COLORS.text,
    borderWidth: 1,
    fontFamily: "Raleway_400Regular",
  },
  inputReadonly: { backgroundColor: "transparent", borderColor: "transparent" },
  inputEditable: { backgroundColor: COLORS.white, borderColor: "#ccc" },
  inputError: { borderColor: COLORS.danger },
  errorText: { marginTop: 4, color: COLORS.danger, fontSize: 12 },
  primaryBtn: {
    backgroundColor: COLORS.navy,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "stretch",
    fontFamily: "Raleway_400Regular",
  },
  saveBtn: { flex: 1, marginLeft: 12 },
  primaryBtnText: { color: COLORS.white, fontSize: 20, fontWeight: "800", letterSpacing: 0.3, fontFamily: "Raleway_400Regular" },
  actionsRow: { flexDirection: "row", marginTop: 8 },
  secondaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#cfd2d8",
  },
  secondaryBtnText: { color: COLORS.text, fontSize: 15, fontWeight: "700" },
});

