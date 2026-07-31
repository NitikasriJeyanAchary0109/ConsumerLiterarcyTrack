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

  // Listen for incoming deep link URLs (in case redirect isn't handled by WebBrowser)
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      parseAndLoginFromUrl(event.url);
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);
    
    // Check if app was opened from a deep link initially
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
      // Call Google Login redirect URL from backend
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
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 justify-center">
          <View className="mb-8 items-center">
            <Text className="text-3xl font-black text-indigo-400">SpareChange AI</Text>
            <Text className="text-slate-400 text-sm mt-2 text-center">
              Micro-savings automation for college students & educators
            </Text>
          </View>

          <View className="bg-slate-800 border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <Text className="text-slate-100 text-xl font-bold mb-6 text-center">Welcome Back</Text>

            {errorMsg && (
              <View className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl mb-4">
                <Text className="text-red-400 text-xs font-semibold text-center">{errorMsg}</Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="email@college.edu"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 text-sm focus:border-indigo-500"
              />
            </View>

            <View className="mb-6">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#64748B"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 text-sm focus:border-indigo-500"
              />
            </View>

            <Button title="Login" onPress={handleLogin} loading={loading} variant="primary" />

            <View className="flex-row items-center my-4">
              <View className="flex-1 h-[1px] bg-slate-700" />
              <Text className="text-slate-400 text-xs px-3">OR</Text>
              <View className="flex-1 h-[1px] bg-slate-700" />
            </View>

            {/* Google Login Button */}
            <TouchableOpacity
              onPress={handleGoogleLogin}
              disabled={loading}
              className="py-3.5 px-6 rounded-xl border border-slate-600 bg-slate-900 active:bg-slate-700/30 flex-row justify-center items-center my-2"
            >
              <Text className="text-slate-200 font-bold text-sm">Continue with Google</Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-5">
              <Text className="text-slate-400 text-xs">Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text className="text-indigo-400 text-xs font-bold">Register Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
