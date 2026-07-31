import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/Button";
import { API_URL } from "../../config";

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, loginWithToken } = useAuth();

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      parseAndLoginFromUrl(event.url);
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    
    Linking.getInitialURL().then((url) => {
      if (url) parseAndLoginFromUrl(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const parseAndLoginFromUrl = (url: string) => {
    try {
      const parsed = Linking.parse(url);
      const token = parsed.queryParams?.token as string;
      const role = parsed.queryParams?.role as "student" | "educator";

      if (token && role) {
        loginWithToken(token, role);
        WebBrowser.dismissBrowser();
      }
    } catch (e) {
      console.error("Deep link parsing failed", e);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setErrorMsg(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (e: any) {
      setErrorMsg(e.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL("oauth");
      const authUrl = `${API_URL}/auth/google/login`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
      if (result.type === "success" && result.url) {
        parseAndLoginFromUrl(result.url);
      }
    } catch (e: any) {
      Alert.alert("Google Login Error", e.message || "Could not complete Google OAuth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}>
          <View className="mb-8 items-center">
            <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-3xl text-[#005bbf]">
              SpareChange AI
            </Text>
            <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-sm mt-2 text-center">
              Micro-savings automation for college students & educators
            </Text>
          </View>

          <View className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-xl font-bold mb-6 text-center">
              Welcome Back
            </Text>

            {errorMsg && (
              <View className="bg-red-50 border border-red-100 p-3.5 rounded-xl mb-4">
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-red-600 text-xs font-semibold text-center">
                  {errorMsg}
                </Text>
              </View>
            )}

            <View className="mb-4">
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="email@college.edu"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ fontFamily: "WorkSans_400Regular" }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:border-[#005bbf] focus:bg-white"
              />
            </View>

            <View className="mb-6">
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={{ fontFamily: "WorkSans_400Regular" }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:border-[#005bbf] focus:bg-white"
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className="py-3.5 rounded-xl bg-[#005bbf] active:bg-[#004493] flex-row justify-center items-center"
            >
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white font-bold text-sm">
                {loading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-slate-100" />
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-slate-400 text-xs px-3">
                OR
              </Text>
              <View className="flex-1 h-[1px] bg-slate-100" />
            </View>

            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              className="py-3.5 px-6 rounded-xl border border-slate-200 bg-white active:bg-slate-50 flex-row justify-center items-center my-2"
            >
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-700 font-bold text-sm">
                Continue with Google
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-5">
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-400 text-xs">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-[#005bbf] text-xs font-bold">
                  Register Now
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
