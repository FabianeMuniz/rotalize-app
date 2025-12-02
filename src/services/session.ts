// src/services/session.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const K_TOKEN = "auth.token";
const K_USERID = "auth.userId";

export async function saveAuth(token: string, userId: string) {
  await AsyncStorage.multiSet([[K_TOKEN, token], [K_USERID, userId]]);
}
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(K_TOKEN);
}
export async function getUserId(): Promise<string | null> {
  return AsyncStorage.getItem(K_USERID);
}
export async function clearAuth() {
  await AsyncStorage.multiRemove([K_TOKEN, K_USERID]);
}
