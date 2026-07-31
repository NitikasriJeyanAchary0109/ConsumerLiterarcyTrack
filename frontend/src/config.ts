const rawApiUrl = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
export const API_URL = rawApiUrl.endsWith("/api") ? rawApiUrl : `${rawApiUrl}/api`;

export const CONFIG = {
  API_URL,
  TIMEOUT_MS: 10000,
};
