import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/Button";

export const RegisterScreen = ({ navigation }: { navigation: any }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "educator">("student");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password, role);
      setSuccessMsg("Account registered successfully! Redirecting to login...");
      setTimeout(() => {
        navigation.navigate("Login");
      }, 2000);
    } catch (e: any) {
      setErrorMsg(e.message || "Registration failed. Try again.");
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
          <View className="mb-6 items-center">
            <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-3xl text-[#005bbf]">
              SpareChange AI
            </Text>
            <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-sm mt-2">
              Create your investment account
            </Text>
          </View>

          <View className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-xl font-bold mb-4 text-center">
              Register
            </Text>

            {errorMsg && (
              <View className="bg-red-50 border border-red-100 p-3.5 rounded-xl mb-4">
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-red-600 text-xs font-semibold text-center">
                  {errorMsg}
                </Text>
              </View>
            )}

            {successMsg && (
              <View className="bg-green-50 border border-green-100 p-3.5 rounded-xl mb-4">
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-green-600 text-xs font-semibold text-center">
                  {successMsg}
                </Text>
              </View>
            )}

            <View className="mb-4">
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Full Name
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Alex Morgan"
                placeholderTextColor="#94a3b8"
                style={{ fontFamily: "WorkSans_400Regular" }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:border-[#005bbf] focus:bg-white"
              />
            </View>

            <View className="mb-4">
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="alex@college.edu"
                placeholderTextColor="#94a3b8"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{ fontFamily: "WorkSans_400Regular" }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:border-[#005bbf] focus:bg-white"
              />
            </View>

            <View className="mb-4">
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Password
              </Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={{ fontFamily: "WorkSans_400Regular" }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-800 text-sm focus:border-[#005bbf] focus:bg-white"
              />
            </View>

            {/* Role selection */}
            <View className="mb-6">
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Choose Account Type
              </Text>
              <View className="flex-row gap-x-4">
                <TouchableOpacity
                  onPress={() => setRole("student")}
                  className={`flex-1 py-3 px-4 rounded-xl border flex-row justify-center ${
                    role === "student" ? "bg-blue-50 border-[#005bbf]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className={`text-xs ${role === "student" ? "text-[#005bbf]" : "text-slate-500"}`}>
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole("educator")}
                  className={`flex-1 py-3 px-4 rounded-xl border flex-row justify-center ${
                    role === "educator" ? "bg-blue-50 border-[#005bbf]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className={`text-xs ${role === "educator" ? "text-[#005bbf]" : "text-slate-500"}`}>
                    Educator
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              className="py-3.5 rounded-xl bg-[#005bbf] active:bg-[#004493] flex-row justify-center items-center"
            >
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white font-bold text-sm">
                {loading ? "Registering..." : "Register"}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mt-5">
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-400 text-xs">
                Already have an account?{" "}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-[#005bbf] text-xs font-bold">
                  Login
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
