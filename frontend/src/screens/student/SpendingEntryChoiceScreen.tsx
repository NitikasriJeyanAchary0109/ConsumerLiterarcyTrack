import React from "react";
import { Pressable, SafeAreaView, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

function OptionCard({ icon, title, detail, onPress }: { icon: keyof typeof MaterialIcons.glyphMap; title: string; detail: string; onPress: () => void }) {
  return <Pressable onPress={onPress} className="mb-4 flex-row items-center rounded-3xl border border-outline-variant bg-white p-5">
    <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-teal-50"><MaterialIcons name={icon} size={27} color="#0f766e" /></View>
    <View className="flex-1"><Text className="font-jakarta-bold text-base text-on-surface">{title}</Text><Text className="mt-1 font-worksans text-sm leading-5 text-on-surface-variant">{detail}</Text></View>
    <MaterialIcons name="chevron-right" size={24} color="#727785" />
  </Pressable>;
}

export default function SpendingEntryChoiceScreen({ navigation }: { navigation: any }) {
  return <SafeAreaView className="flex-1 bg-surface">
    <View className="flex-row items-center border-b border-surface-container-high bg-white px-margin-mobile py-stack-md"><Pressable onPress={() => navigation.goBack()} className="mr-4"><MaterialIcons name="arrow-back" size={24} color="#181c20" /></Pressable><Text className="font-jakarta-semibold text-lg text-ob-primary">Your spending</Text></View>
    <View className="flex-1 px-margin-mobile pt-stack-xl"><Text className="font-jakarta-bold text-2xl text-on-surface">Tell us about spending</Text><Text className="mt-2 mb-stack-xl font-worksans text-base text-on-surface-variant">Choose the quickest way to give your plan a starting point.</Text>
      <OptionCard icon="edit" title="Manual entry" detail="Add monthly income and the recurring costs you already know." onPress={() => navigation.navigate("ManualIncomeExpense")} />
      <OptionCard icon="upload-file" title="Upload CSV" detail="Upload a transaction history and we’ll use the existing importer." onPress={() => navigation.navigate("CSVUpload")} />
    </View>
  </SafeAreaView>;
}
