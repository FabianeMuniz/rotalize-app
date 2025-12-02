import Feather from "@expo/vector-icons/Feather";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ImageBackground,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  deleteEnterprise,
  getAllEnterprises,
  type EnterpriseDTO,
} from "../../../src/services/enterprise";

const COLORS = {
  navy: "#0a0322",
  greyBg: "#D9D9D9",
  greyPanel: "#D9D9D9",
  text: "#0a0322",
  card: "#D9D9D9",
  subtext: "#0a0322",
};

export default function EnterpriseListScreen() {
  const [items, setItems] = useState<EnterpriseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const list = await getAllEnterprises();
      setItems(list);
    } catch (err: any) {
      Alert.alert(
        "Erro ao carregar empresas",
        `Status: ${err?.response?.status ?? "?"}\nURL: ${
          err?.config?.baseURL
        }${err?.config?.url}`
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return items;
    return items.filter(
      (e) =>
        e.name?.toLowerCase().includes(term) ||
        e.registerNumber?.toLowerCase().includes(term) || // <- era cnpj
        e.email?.toLowerCase().includes(term)
    );
  }, [items, q]);

  const onEdit = (it: EnterpriseDTO) => {
    router.push({
      pathname: "/(admin)/home/company-edit", // sua rota
      params: {
        id: it.id,
        name: it.name ?? "",
        registerNumber: it.registerNumber ?? "",
      },
    });
  };

  const onDelete = (it: EnterpriseDTO) => {
    Alert.alert(
      "Excluir empresa",
      `Tem certeza que deseja excluir "${it.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              setBusyId(it.id);
              await deleteEnterprise(it.id);
              Alert.alert("Pronto", "Empresa excluída.");
              await load();
            } catch (e: any) {
              const msg =
                e?.response?.data?.message ||
                e?.response?.data?.error ||
                e?.message ||
                "Falha ao excluir a empresa.";
              Alert.alert("Erro", msg);
            } finally {
              setBusyId(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: EnterpriseDTO }) => (
    <View style={styles.cardItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name || "—"}
        </Text>
        {!!item.registerNumber && (
          <Text style={styles.sub} numberOfLines={1}>
            {item.registerNumber}
          </Text>
        )}
        {!!item.email && (
          <Text style={styles.sub} numberOfLines={1}>
            {item.email}
          </Text>
        )}
      </View>

      <View style={styles.rightSide}>
        <View
          style={[
            styles.badge,
            { backgroundColor: item.isActive === false ? "#8f8f8f" : "#119955" },
          ]}
        >
          <Text style={styles.badgeText}>
            {item.isActive === false ? "Inativa" : "Ativa"}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={() => onEdit(item)}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Feather name="edit-2" size={18} color={COLORS.navy} />
          </Pressable>
          <Pressable
            onPress={() => onDelete(item)}
            style={[styles.iconBtn, busyId === item.id && { opacity: 0.5 }]}
            disabled={busyId === item.id}
            hitSlop={8}
          >
            <Feather name="trash-2" size={18} color="#b00020" />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

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
        <Text style={styles.heading}>Empresas</Text>

        <View style={styles.searchWrap}>
          <TextInput
            placeholder="Busque por nome, CNPJ ou e-mail"
            placeholderTextColor="#666"
            value={q}
            onChangeText={setQ}
            style={styles.searchInput}
            returnKeyType="search"
          />
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop: 8, color: COLORS.subtext }}>
                Carregando…
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <Text
              style={{ color: COLORS.subtext, textAlign: "center", paddingVertical: 12 }}
            >
              Nenhuma empresa encontrado.
            </Text>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(it) => String(it.id)}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
              contentContainerStyle={{ paddingVertical: 4 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
            />
          )}
        </View>
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
    fontSize: 40,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 10,
    textAlign: "center",
  },

  searchWrap: { marginBottom: 12 },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#cfcfcf",
    fontSize: 16,
    color: COLORS.text,
  },

  listCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
    flex: 1,
  },

  cardItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e7e7e7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // <- espaço p/ ações
    gap: 10,
  },

  title: { color: COLORS.text, fontSize: 18, fontWeight: "800" },
  sub: { color: "#444", fontSize: 14 },

  rightSide: { alignItems: "flex-end", gap: 8 },
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, alignSelf: "flex-end" },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "800" },

  actions: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 6 },
  iconBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e7e7e7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
