// app/(admin)/supervisor-vinculation.tsx
import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { getAllEnterprises, type EnterpriseDTO } from "../../../src/services/enterprise";
import { setUserAsManager } from "../../../src/services/manager";
import { getAllUsers, type UserDTO } from "../../../src/services/users";

/* ===================== PALETA ===================== */
const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  white: "#fff",
  card: "#D9D9D9",
  subtext: "#0a0322",
  badgeGreen: "#119955",
  badgeGrey: "#8f8f8f",
  border: "#e7e7e7",
};

export default function SupervisorVinculationScreen() {
  // listas "cruas"
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [enterprises, setEnterprises] = useState<EnterpriseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // campos/seleções
  const [userQuery, setUserQuery] = useState("");
  const [enterpriseQuery, setEnterpriseQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [selectedEnterprise, setSelectedEnterprise] = useState<EnterpriseDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* ===================== LOAD ===================== */
  const load = useCallback(async () => {
    try {
      setLoading(true);
      // 1) usuários (vamos filtrar localmente os que não são Manager)
      const listUsers = await getAllUsers();
      setUsers(Array.isArray(listUsers) ? listUsers : []);

      // 2) empresas
      const listEnt = await getAllEnterprises();
      setEnterprises(Array.isArray(listEnt) ? listEnt : []);
    } catch (err: any) {
      console.log("load vinculation err:", err?.message);
      Alert.alert("Erro", "Não foi possível carregar usuários/empresas.");
      setUsers([]);
      setEnterprises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await load();
    } finally {
      setRefreshing(false);
    }
  }, [load]);

  /* ===================== FILTROS ===================== */
  // mostra só quem NÃO é manager
  const notManagers = useMemo(
    () => users.filter(u => (u.role ?? "").toLowerCase() !== "manager"),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const term = userQuery.trim().toLowerCase();
    if (!term) return notManagers;
    return notManagers.filter(u =>
      (u.name ?? "").toLowerCase().includes(term) ||
      (u.email ?? "").toLowerCase().includes(term)
    );
  }, [notManagers, userQuery]);

  const filteredEnterprises = useMemo(() => {
    const term = enterpriseQuery.trim().toLowerCase();
    if (!term) return enterprises;
    return enterprises.filter(e =>
      (e.name ?? "").toLowerCase().includes(term) ||
      (e.registerNumber ?? "").toLowerCase().includes(term)
    );
  }, [enterprises, enterpriseQuery]);

  /* ===================== AÇÕES ===================== */
  const confirm = async () => {
    if (!selectedUser?.id || !selectedEnterprise?.id) {
      Alert.alert("Campos obrigatórios", "Selecione um usuário e uma empresa.");
      return;
    }
    try {
      setSubmitting(true);
      await setUserAsManager(selectedUser.id, selectedEnterprise.id);
      Alert.alert("Sucesso", "Supervisor vinculado com sucesso!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      console.log("set-as-manager error:", err?.response?.data || err?.message);
      Alert.alert("Erro", "Não foi possível vincular o supervisor.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================== UI ===================== */
  const renderUserItem = ({ item }: { item: UserDTO }) => (
    <Pressable
      onPress={() => { setSelectedUser(item); setUserQuery(item.name || item.email || ""); }}
      style={styles.optionRow}
    >
      <Feather name="user" size={16} color={COLORS.text} />
      <View style={{ marginLeft: 8, flex: 1 }}>
        <Text style={styles.optionTitle} numberOfLines={1}>{item.name || "—"}</Text>
        {!!item.email && <Text style={styles.optionSub} numberOfLines={1}>{item.email}</Text>}
      </View>
      {(item.role ?? "").toLowerCase() === "manager" ? (
        <View style={[styles.badge, { backgroundColor: COLORS.badgeGrey }]}><Text style={styles.badgeText}>Manager</Text></View>
      ) : null}
    </Pressable>
  );

  const renderEnterpriseItem = ({ item }: { item: EnterpriseDTO }) => (
    <Pressable
      onPress={() => { setSelectedEnterprise(item); setEnterpriseQuery(item.name ?? ""); }}
      style={styles.optionRow}
    >
      <Feather name="briefcase" size={16} color={COLORS.text} />
      <View style={{ marginLeft: 8, flex: 1 }}>
        <Text style={styles.optionTitle} numberOfLines={1}>{item.name ?? "—"}</Text>
        {!!item.registerNumber && <Text style={styles.optionSub} numberOfLines={1}>{item.registerNumber}</Text>}
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      {/* topo com imagem */}
      <View style={styles.topWrap}>
        <ImageBackground
          source={require("../../../assets/images/map-bg.png")}
          defaultSource={require("../../../assets/images/map-bg.png")}
          resizeMode="cover"
          style={styles.topBg}
          imageStyle={styles.topBgImg}
        >
          <Pressable onPress={() => router.back()} style={styles.backPin} hitSlop={10}>
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
        <Text style={styles.heading}>Vincular supervisor</Text>

        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
        <View style={styles.card}>
          {/* ===== Campo Usuário (auto-complete) ===== */}
          <Text style={styles.label}>Usuário</Text>
          <View style={styles.inputRow}>
            <Feather name="user" size={18} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Digite para buscar (nome ou e-mail)"
              placeholderTextColor="#888"
              value={userQuery}
              onChangeText={(t) => { setUserQuery(t); setSelectedUser(null); }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {!!selectedUser && (
              <Pressable
                onPress={() => { setSelectedUser(null); setUserQuery(""); }}
                hitSlop={10}
              >
                <Feather name="x-circle" size={18} color="#666" />
              </Pressable>
            )}
          </View>

          {/* Sugestões de usuários */}
          {!selectedUser && (
            <View style={styles.dropdown}>
              {loading ? (
                <View style={styles.dropdownLoading}><ActivityIndicator /></View>
              ) : filteredUsers.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum usuário elegível.</Text>
              ) : (
                <ScrollView
                  style={{ maxHeight: 220 }}
                  keyboardShouldPersistTaps="handled"
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {filteredUsers.map((item) => (
                    <Pressable
                      key={String(item.id)}
                      onPress={() => { setSelectedUser(item); setUserQuery(item.name || item.email || ""); }}
                      style={[styles.optionRow, { marginBottom: 6 }]}
                    >
                      <Feather name="user" size={16} color={COLORS.text} />
                      <View style={{ marginLeft: 8, flex: 1 }}>
                        <Text style={styles.optionTitle} numberOfLines={1}>{item.name || "—"}</Text>
                        {!!item.email && <Text style={styles.optionSub} numberOfLines={1}>{item.email}</Text>}
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          )}


          {/* ===== Campo Empresa (auto-complete) ===== */}
          <Text style={[styles.label, { marginTop: 16 }]}>Empresa</Text>
          <View style={styles.inputRow}>
            <Feather name="briefcase" size={18} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Digite para buscar (nome/razão, fantasia ou CNPJ)"
              placeholderTextColor="#888"
              value={enterpriseQuery}
              onChangeText={(t) => { setEnterpriseQuery(t); setSelectedEnterprise(null); }}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            {!!selectedEnterprise && (
              <Pressable
                onPress={() => { setSelectedEnterprise(null); setEnterpriseQuery(""); }}
                hitSlop={10}
              >
                <Feather name="x-circle" size={18} color="#666" />
              </Pressable>
            )}
          </View>

          {/* Sugestões de empresas (SEM FlatList) */}
        {!selectedEnterprise && (
          <View style={styles.dropdown}>
            {loading ? (
              <View style={styles.dropdownLoading}><ActivityIndicator /></View>
            ) : filteredEnterprises.length === 0 ? (
              <Text style={styles.emptyText}>Nenhuma empresa encontrada.</Text>
            ) : (
              <ScrollView
                style={{ maxHeight: 220 }}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {filteredEnterprises.map((item) => (
                  <Pressable
                    key={String(item.id)}
                    onPress={() => { setSelectedEnterprise(item); setEnterpriseQuery(item.name ?? ""); }}
                    style={[styles.optionRow, { marginBottom: 6 }]}
                  >
                    <Feather name="briefcase" size={16} color={COLORS.text} />
                    <View style={{ marginLeft: 8, flex: 1 }}>
                      <Text style={styles.optionTitle} numberOfLines={1}>{item.name ?? "—"}</Text>
                      {!!item.registerNumber && <Text style={styles.optionSub} numberOfLines={1}>{item.registerNumber}</Text>}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        )}


          {/* Botão confirmar */}
          <Pressable
            disabled={!selectedUser || !selectedEnterprise || submitting}
            onPress={confirm}
            style={[
              styles.confirmBtn,
              (!selectedUser || !selectedEnterprise || submitting) && { opacity: 0.6 },
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="user-check" size={16} color="#fff" />
                <Text style={styles.confirmText}>Confirmar vínculo</Text>
              </>
            )}
          </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.greyBg },

  topWrap: { height: "18%" },
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
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
    textAlign: "center",
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 56,
    flex: 1,
  },

  label: { color: COLORS.text, fontWeight: "800", marginBottom: 6 },
  inputRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 16 },

  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
    padding: 8,
  },
  dropdownLoading: { paddingVertical: 16, alignItems: "center" },

  optionRow: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  optionTitle: { color: COLORS.text, fontWeight: "700" },
  optionSub: { color: "#666", fontSize: 12 },

  badge: { paddingVertical: 2, paddingHorizontal: 8, borderRadius: 999, marginLeft: 8 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  confirmBtn: {
    marginTop: 16,
    backgroundColor: COLORS.navy,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  confirmText: { color: "#fff", fontWeight: "800" },
  emptyText: { color: COLORS.subtext, fontSize: 14, textAlign: "center", paddingVertical: 8 },
});
