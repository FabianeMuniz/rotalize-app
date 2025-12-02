import { jwtDecode } from "jwt-decode";

export type AnyJwt = Record<string, any>;

export function decodeJwt<T extends AnyJwt = AnyJwt>(token: string): T | null {
  try {
    return jwtDecode<T>(token);
  } catch (e) {
    console.log("decodeJwt error:", e);
    return null;
  }
}



