import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL.endsWith("/") ? API_URL : `${API_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request Interceptor: Inject JWT token from storage into outgoing requests
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Failed to fetch token for API interceptor", e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle auth errors (e.g. 401 Unauthorized) globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized API call detected, logging out...");
      try {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("userRole");
      } catch (e) {
        console.error("Storage clear failure in response interceptor", e);
      }
    }
    return Promise.reject(error);
  }
);

// API call methods
export const apiService = {
  // Transactions
  getTransactions: async () => {
    const response = await api.get("transactions/");
    return response.data;
  },
  createTransaction: async (data: { amount: number; category: string; merchant: string; type: string; description?: string }) => {
    const response = await api.post("transactions/", data);
    return response.data;
  },
  uploadStatement: async (formData: FormData) => {
    const response = await api.post("transactions/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Goals
  getGoals: async () => {
    const response = await api.get("goals/");
    return response.data;
  },
  createGoal: async (data: { goal_name: string; target: number; deadline?: string }) => {
    const response = await api.post("goals/", data);
    return response.data;
  },
  updateGoal: async (goalId: number, data: any) => {
    const response = await api.put(`goals/${goalId}`, data);
    return response.data;
  },
  deleteGoal: async (goalId: number) => {
    const response = await api.delete(`goals/${goalId}`);
    return response.data;
  },

  // Roundups
  getRoundups: async () => {
    const response = await api.get("roundups/");
    return response.data;
  },
  getRoundupStats: async () => {
    const response = await api.get("roundups/stats");
    return response.data;
  },

  // AI Modules
  chatWithCoach: async (message: string) => {
    const response = await api.post("chat/", { message });
    return response.data;
  },
  negotiatePurchase: async (data: { item_name: string; item_price: number; category: string }) => {
    const response = await api.post("negotiator/", data);
    return response.data;
  },
  forecastSavings: async (data: { goal_id: number; monthly_contribution: number }) => {
    const response = await api.post("forecast/", data);
    return response.data;
  },
  getStressMeter: async (timeframe_days: number = 30) => {
    const response = await api.post("stress/", { timeframe_days });
    return response.data;
  },

  // Educator
  getEducatorAnalytics: async () => {
    const response = await api.get("educator/analytics");
    return response.data;
  },
};

export default api;
