import React, { useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../../hooks/useAuth";
import { apiService } from "../../services/api";

export default function CreateGoalScreen({ navigation }: { navigation: any }) {
  const { completeOnboarding } = useAuth();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);

  const createGoal = async () => {
    const amount = Number(target.replace(/,/g, ""));
    if (!name.trim() || !Number.isFinite(amount) || amount <= 0) {
      Alert.alert("Add a goal", "Enter a name and target amount greater than zero.");
      return;
    }
    setSaving(true);
    try {
      await apiService.createGoal({ goal_name: name.trim(), target: amount });
      await completeOnboarding();
    } catch (error: any) {
      Alert.alert("Could not create goal", error?.response?.data?.detail || "Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return <SafeAreaView className="flex-1 bg-surface">
    <View className="flex-row items-center border-b border-surface-container-high bg-white px-margin-mobile py-stack-md"><Pressable onPress={() => navigation.goBack()} className="mr-4"><MaterialIcons name="arrow-back" size={24} color="#181c20" /></Pressable><Text className="font-jakarta-semibold text-lg text-ob-primary">New goal</Text></View>
    <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 32, paddingBottom: 40 }}><View className="items-center"><View className="h-12 w-12 items-center justify-center rounded-full bg-primary-fixed"><MaterialIcons name="auto-awesome" size={22} color="#005bbf" /></View><Text className="mt-4 font-jakarta-bold text-2xl text-on-surface">What are we saving for?</Text><Text className="mt-2 text-center font-worksans text-base text-on-surface-variant">Set a clear target and make every spare rupee count.</Text></View>
      <View className="mt-stack-xl"><Text className="mb-2 font-worksans-medium text-xs uppercase tracking-wider text-on-surface-variant">Goal name</Text><TextInput value={name} onChangeText={setName} placeholder="e.g. Europe trip" placeholderTextColor="#727785" className="rounded-2xl border border-outline-variant bg-white px-4 py-4 font-worksans text-base text-on-surface" /></View>
      <View className="mt-5"><Text className="mb-2 font-worksans-medium text-xs uppercase tracking-wider text-on-surface-variant">Target amount</Text><View className="flex-row items-center rounded-2xl border border-outline-variant bg-white px-4"><Text className="font-jakarta-bold text-2xl text-ob-primary">₹</Text><TextInput value={target} onChangeText={(value) => setTarget(value.replace(/[^0-9]/g, ""))} keyboardType="number-pad" placeholder="0" placeholderTextColor="#727785" className="flex-1 px-2 py-4 font-jakarta-bold text-2xl text-on-surface" /></View></View>
      <View className="mt-stack-xl rounded-3xl bg-primary-fixed p-5"><Text className="font-jakarta-semibold text-base text-on-primary-fixed">A small start is still a start.</Text><Text className="mt-1 font-worksans text-sm leading-5 text-on-primary-fixed-variant">You can adjust your goal anytime from the Goals tab.</Text></View>
      <Pressable disabled={saving} onPress={createGoal} className={`mt-stack-xl h-14 items-center justify-center rounded-full ${saving ? "bg-primary-fixed-dim" : "bg-primary-container"}`}><Text className="font-jakarta-semibold text-base text-white">{saving ? "Creating…" : "Create Goal"}</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}
