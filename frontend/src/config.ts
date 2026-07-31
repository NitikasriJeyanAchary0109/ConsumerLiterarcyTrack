// Load from Expo Public Environment variables or default to standard development configuration
// IMPORTANT: Replace the default IP with your laptop's local network IP when testing on physical devices.
export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.100:8000/api";

export const CONFIG = {
  API_URL,
  TIMEOUT_MS: 10000,
};
