import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_URL } from "../config";
import { TokenResponse } from "../types";

interface AuthContextType {
  userToken: string | null;
  userRole: "student" | "educator" | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role: "student" | "educator") => Promise<void>;
  loginWithToken: (token: string, role: "student" | "educator") => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"student" | "educator" | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if token exists in storage on app start
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        const role = await AsyncStorage.getItem("userRole") as "student" | "educator" | null;
        
        if (token && role) {
          setUserToken(token);
          setUserRole(role);
        }
      } catch (e) {
        console.error("Failed to load auth credentials from storage", e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post<TokenResponse>(`${API_URL}/auth/login/json`, {
        email,
        password,
      });

      const { access_token, role } = response.data;

      await AsyncStorage.setItem("userToken", access_token);
      await AsyncStorage.setItem("userRole", role);

      setUserToken(access_token);
      setUserRole(role);
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || "Authentication login failed.";
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, role: "student" | "educator") => {
    try {
      setIsLoading(true);
      await axios.post(`${API_URL}/auth/register`, {
        full_name: fullName,
        email,
        password,
        role,
      });
    } catch (error: any) {
      const errMsg = error.response?.data?.detail || "Registration failed.";
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithToken = async (token: string, role: "student" | "educator") => {
    try {
      setIsLoading(true);
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userRole", role);
      setUserToken(token);
      setUserRole(role);
    } catch (e) {
      console.error("Failed to store credentials during OAuth login", e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userRole");
      setUserToken(null);
      setUserRole(null);
    } catch (e) {
      console.error("Failed to clear credentials during logout", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ userToken, userRole, isLoading, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
