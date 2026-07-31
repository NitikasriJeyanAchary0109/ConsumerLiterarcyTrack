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
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 justify-center">
          <View className="mb-6 items-center">
            <Text className="text-3xl font-black text-indigo-400">SpareChange AI</Text>
            <Text className="text-slate-400 text-sm mt-2">Create your investment account</Text>
          </View>

          <View className="bg-slate-800 border border-slate-700/50 p-6 rounded-3xl shadow-xl">
            <Text className="text-slate-100 text-xl font-bold mb-4 text-center">Register</Text>

            {errorMsg && (
              <View className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl mb-4">
                <Text className="text-red-400 text-xs font-semibold text-center">{errorMsg}</Text>
              </View>
            )}

            {successMsg && (
              <View className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl mb-4">
                <Text className="text-emerald-400 text-xs font-semibold text-center">{successMsg}</Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Alex Morgan"
                placeholderTextColor="#64748B"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 text-sm focus:border-indigo-500"
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="alex@college.edu"
                placeholderTextColor="#64748B"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 text-sm focus:border-indigo-500"
              />
            </View>

            <View className="mb-4">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                placeholderTextColor="#64748B"
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3.5 text-slate-100 text-sm focus:border-indigo-500"
              />
            </View>

            {/* Role selection */}
            <View className="mb-6">
              <Text className="text-slate-300 text-xs font-semibold uppercase tracking-wider mb-3">Choose Account Type</Text>
              <View className="flex-row gap-x-4">
                <TouchableOpacity
                  onPress={() => setRole("student")}
                  className={`flex-1 py-3 px-4 rounded-xl border flex-row justify-center ${
                    role === "student" ? "bg-indigo-600/20 border-indigo-500" : "bg-slate-900 border-slate-700"
                  }`}
                >
                  <Text className={`font-bold text-xs ${role === "student" ? "text-indigo-400" : "text-slate-400"}`}>
                    Student
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setRole("educator")}
                  className={`flex-1 py-3 px-4 rounded-xl border flex-row justify-center ${
                    role === "educator" ? "bg-indigo-600/20 border-indigo-500" : "bg-slate-900 border-slate-700"
                  }`}
                >
                  <Text className={`font-bold text-xs ${role === "educator" ? "text-indigo-400" : "text-slate-400"}`}>
                    Educator
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Button title="Register" onPress={handleRegister} loading={loading} variant="primary" />

            <View className="flex-row justify-center items-center mt-5">
              <Text className="text-slate-400 text-xs">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text className="text-indigo-400 text-xs font-bold">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
