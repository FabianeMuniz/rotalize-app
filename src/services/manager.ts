// src/services/manager.ts
import { API_PATHS } from "../config/apiConfig";
import { api } from "./api";

export type ManagerUserDTO = {
  id: string | number;
  name: string;
  email?: string;
  role?: string;       // ex.: "User", "Driver"
  isActive?: boolean;  // geralmente true aqui (active-users)
  createdAt?: string;
};

export async function getManagerActiveUsers(): Promise<ManagerUserDTO[]> {
  const { data } = await api.get(API_PATHS.managerActiveUsers);
  // alguns backends embrulham em { success, data }
  const list = Array.isArray(data) ? data : data?.data;
  return (Array.isArray(list) ? list : []) as ManagerUserDTO[];
}

/** Usuários sem empresa vinculada */
export async function getUsersWithoutEnterprise(): Promise<ManagerUserDTO[]> {
  const { data } = await api.get(API_PATHS.managerUsersWithoutEnterprise);
  const list = Array.isArray(data) ? data : data?.data;
  return (Array.isArray(list) ? list : []) as ManagerUserDTO[];
}


/** Vincula usuário como manager de uma empresa */
export async function setUserAsManager(userId: string, newEnterpriseId: string): Promise<void> {
  const url = API_PATHS?.setAsManager ?? "/User/set-as-manager";
  await api.put(url, null, { params: { userId, newEnterpriseId } });
}