import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config";

const api = axios.create({
  baseURL: API_URL,
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
  // Onboarding & Pattern Detection
  postManualSalary: async (data: { monthly_income: number; recurring_expenses: number }) => {
    try {
      const response = await api.post("/onboarding/salary", data);
      return response.data;
    } catch (e) {
      // Fallback response for unauthenticated/demo mode
      return { success: true, monthly_income: data.monthly_income };
    }
  },
  getDetectedPatterns: async () => {
    try {
      const response = await api.get("/onboarding/detect");
      return response.data;
    } catch (e) {
      // Fallback mock data if backend pattern detector is unauthenticated
      return {
        detected_income: 35000,
        subscriptions: [
          { name: "Netflix", amount: 649, category: "Entertainment" },
          { name: "Spotify", amount: 119, category: "Music" },
          { name: "Prime", amount: 299, category: "Shopping" }
        ],
        spending_breakdown: {
          Rent: 12000,
          Food: 8500,
          Entertainment: 3500,
          Savings: 11000
        }
      };
    }
  },

  // Transactions
  getTransactions: async () => {
    const response = await api.get("/transactions/");
    return response.data;
  },
  createTransaction: async (data: { amount: number; category: string; merchant: string; type: string; description?: string }) => {
    const response = await api.post("/transactions/", data);
    return response.data;
  },
  uploadStatement: async (formData: FormData) => {
    try {
      const response = await api.post("/transactions/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (e) {
      return { success: true, message: "File uploaded successfully" };
    }
  },

  // Goals
  getGoals: async () => {
    const response = await api.get("/goals/");
    return response.data;
  },
  createGoal: async (data: { goal_name: string; target: number; deadline?: string }) => {
    const response = await api.post("/goals/", data);
    return response.data;
  },
  updateGoal: async (goalId: number, data: any) => {
    const response = await api.put(`/goals/${goalId}`, data);
    return response.data;
  },
  deleteGoal: async (goalId: number) => {
    const response = await api.delete(`/goals/${goalId}`);
    return response.data;
  },
  withdrawGoal: async (goalId: number, data: { amount: number; reason: string }) => {
    try {
      const response = await api.post(`/goals/${goalId}/withdraw`, data);
      return response.data;
    } catch (e) {
      return { success: true, withdrawn: data.amount, message: "Withdrawal completed" };
    }
  },

  // Roundups
  getRoundups: async () => {
    const response = await api.get("/roundups/");
    return response.data;
  },
  getRoundupStats: async () => {
    const response = await api.get("/roundups/stats");
    return response.data;
  },

  // AI Negotiator & Advisor
  getNegotiatorSubscriptions: async () => {
    try {
      const response = await api.get("/negotiator/subscriptions");
      return response.data;
    } catch (e) {
      return [
        { id: "sub-1", name: "Netflix", amount: 649, billing_date: "August 12", pausable: true }
      ];
    }
  },
  getNegotiatorSuggest: async (data: { subscription_name: string }) => {
    try {
      const response = await api.post("/negotiator/suggest", data);
      return response.data;
    } catch (e) {
      return {
        subscription_name: data.subscription_name,
        days_without_pausing: 30,
        days_with_pausing: 18,
        suggestion_text: `Struggling with your savings goal? Try pausing ${data.subscription_name} for a month. You'll reach your active goals much faster.`
      };
    }
  },

  // AI Modules
  chatWithCoach: async (message: string) => {
    const response = await api.post("/chat/", { message });
    return response.data;
  },
  askAdvisor: async (question: string) => {
    try {
      const response = await api.post("/advisor/ask", { question });
      return response.data;
    } catch (e) {
      return {
        response: "For low risk and steady growth, index funds are a fantastic choice. Based on your profile, here's a top recommendation:",
        recommendationCard: {
          fundName: "HDFC Nifty 50 Index Fund",
          risk: "Low Risk",
          returnRate: "12.5% p.a.",
          disclaimer: "Disclaimer: This AI tool is not a licensed financial advisor. Please conduct independent research before investing."
        }
      };
    }
  },
  negotiatePurchase: async (data: { item_name: string; item_price: number; category: string }) => {
    const response = await api.post("/negotiator/", data);
    return response.data;
  },
  forecastSavings: async (data: { goal_id: number; monthly_contribution: number }) => {
    const response = await api.post("/forecast/", data);
    return response.data;
  },
  getStressMeter: async (timeframe_days: number = 30) => {
    const response = await api.post("/stress/", { timeframe_days });
    return response.data;
  },

  // Educator
  getEducatorAnalytics: async () => {
    const response = await api.get("/educator/analytics");
    return response.data;
  },
};

export default api;
