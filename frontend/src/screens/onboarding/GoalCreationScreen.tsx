import React, { useState } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  SafeAreaView, 
  StyleSheet, 
  Dimensions, 
  Image, 
  Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const { width } = Dimensions.get("window");

interface EmojiCategory {
  emoji: string;
  label: string;
}

const EMOJI_CATEGORIES: EmojiCategory[] = [
  { emoji: "🏠", label: "Home" },
  { emoji: "🚗", label: "Vehicle" },
  { emoji: "🎓", label: "Education" },
  { emoji: "✈️", label: "Travel" },
  { emoji: "💻", label: "Tech" },
  { emoji: "💍", label: "Wedding" },
  { emoji: "🚲", label: "Cycle" },
];

export const GoalCreationScreen = ({ navigation }: { navigation: any }) => {
  const { loginAsGuest } = useAuth();
  const [goalName, setGoalName] = useState("Home");
  const [currentAmount, setCurrentAmount] = useState("10000");
  const [selectedEmoji, setSelectedEmoji] = useState("🏠");
  
  // Custom calendar states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 11, 31)); // Default: Dec 31, 2026
  const [viewMonth, setViewMonth] = useState(11); // Dec (0-indexed)
  const [viewYear, setViewYear] = useState(2026);

  const MONTHS = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];
  const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const appendNum = (num: string) => {
    triggerHaptic();
    if (currentAmount === "0") {
      setCurrentAmount(num);
    } else if (currentAmount.length < 9) {
      setCurrentAmount(currentAmount + num);
    }
  };

  const deleteLast = () => {
    triggerHaptic();
    if (currentAmount.length > 1) {
      setCurrentAmount(currentAmount.slice(0, -1));
    } else {
      setCurrentAmount("0");
    }
  };

  const clearNum = () => {
    triggerHaptic();
    setCurrentAmount("0");
  };

  const addSuggestion = (val: number) => {
    triggerHaptic();
    const curr = parseInt(currentAmount) || 0;
    setCurrentAmount(Math.min(curr + val, 99999999).toString());
  };

  // Calendar days grid calculator
  const getCalendarDays = () => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push(i);
    }
    return days;
  };

  const prevMonth = () => {
    triggerHaptic();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    triggerHaptic();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleCreateGoal = async () => {
    triggerHaptic();
    const amountVal = parseFloat(currentAmount);
    if (amountVal <= 0) {
      Alert.alert("Error", "Please specify a valid target amount.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const formattedDead = selectedDate.toISOString();
      const finalGoalName = `${selectedEmoji} ${goalName}`;

      if (token && token !== "guest") {
        // Authenticated direct backend write
        await apiService.createGoal({
          goal_name: finalGoalName,
          target: amountVal,
          deadline: formattedDead
        });

        Alert.alert("Success", `Goal "${finalGoalName}" created successfully!`, [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        // Unauthenticated guest onboarding save & log in as guest
        await AsyncStorage.setItem("tempGoal", JSON.stringify({
          goal_name: finalGoalName,
          target: amountVal,
          deadline: formattedDead
        }));

        Alert.alert(
          "Goal Saved!",
          `Your dream goal "${finalGoalName}" has been configured. Entering your dashboard!`,
          [
            { 
              text: "Enter Dashboard", 
              onPress: async () => {
                try {
                  await loginAsGuest();
                } catch (err) {
                  console.warn("Guest login trigger error:", err);
                }
              } 
            }
          ]
        );
      }
    } catch (e: any) {
      console.warn("Create goal action failure:", e);
      Alert.alert("Error", e.message || "Failed to save goal. Please check server.");
    }
  };

  const formattedAmount = (parseInt(currentAmount) || 0).toLocaleString("en-IN");
  const targetDateStr = selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]">
      {/* Header */}
      <View className="flex-row justify-between items-center px-margin-mobile py-stack-md bg-white border-b border-slate-100">
        <View className="flex-row items-center space-x-3">
          <Pressable 
            onPress={() => {
              triggerHaptic();
              navigation.goBack();
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            className="p-1"
          >
            <MaterialIcons name="arrow-back" size={24} color="#181c20" />
          </Pressable>
          <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-lg text-slate-800">
            Goal Creator
          </Text>
        </View>
        <View className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
          <Image 
            source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC23zGGmCbATv51DSmMKFuim_BM6NhvTkTlW_Fj_vWpU9Hwm-SdXl6u63UvOMJEGTAKpl62pwmPFnflWBlPpcL9yDWKyCVWtjgzO9QfYUrSU0zJiT1Jh-bpeThmqt23470_vcq_1qZGOtxHp-_MtmxDQudb8JQyUdfbJS_GaJ14u3zDnT8FUNym6YiKYSwnYN-hpGV8YoixxbXzZ_LuX-rWDbFjXnm_sT_nVyiRPCtEfI1B-8UPnaEz" }}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
          />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 100 }}>
        {/* Banner */}
        <View className="items-center mb-5">
          <View className="flex-row items-center space-x-2 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 mb-3">
            <MaterialIcons name="auto-awesome" size={14} color="#005bbf" />
            <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-[10px] text-blue-700 uppercase tracking-widest">
              Dream Engine AI
            </Text>
          </View>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-2xl text-slate-900 text-center mb-1">
            Let's Set Your Dream Goal
          </Text>
          <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-xs text-slate-500 text-center px-4">
            Pick a card, type the amount, select the deadline, and let AI build the timeline.
          </Text>
        </View>

        {/* 1. Target Amount & Keypad Card (No scrolling required to access) */}
        <View style={styles.card} className="bg-white rounded-3xl border border-slate-100 p-5 mb-6">
          <View className="items-center mb-4">
            <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
              Target Amount
            </Text>
            <View className="flex-row items-baseline justify-center">
              <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-3xl text-blue-600 mr-1">
                ₹
              </Text>
              <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-4xl text-slate-800">
                {formattedAmount}
              </Text>
            </View>
          </View>

          {/* Quick Suggestion Chips */}
          <View className="flex-row justify-center space-x-2 mb-4">
            <Pressable
              onPress={() => addSuggestion(10000)}
              style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
              className="px-3.5 py-1.5 rounded-full border border-slate-100 bg-slate-50"
            >
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[11px] text-slate-600">
                +₹10,000
              </Text>
            </Pressable>
            <Pressable
              onPress={() => addSuggestion(50000)}
              style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
              className="px-3.5 py-1.5 rounded-full border border-slate-100 bg-slate-50"
            >
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[11px] text-slate-600">
                +₹50,000
              </Text>
            </Pressable>
            <Pressable
              onPress={() => addSuggestion(100000)}
              style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
              className="px-3.5 py-1.5 rounded-full border border-slate-100 bg-slate-50"
            >
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[11px] text-slate-600">
                +₹1,00,000
              </Text>
            </Pressable>
          </View>

          {/* Core Keypad (Moved up immediately below Amount) */}
          <View className="flex-row flex-wrap justify-between max-w-[280px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <Pressable
                key={num}
                onPress={() => appendNum(num)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                className="w-[80px] h-[46px] items-center justify-center mb-2.5 rounded-2xl bg-slate-50"
              >
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-lg text-slate-700">
                  {num}
                </Text>
              </Pressable>
            ))}
            <Pressable
              onPress={clearNum}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="w-[80px] h-[46px] items-center justify-center rounded-2xl bg-slate-50"
            >
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-sm text-red-500 font-bold">
                C
              </Text>
            </Pressable>
            <Pressable
              onPress={() => appendNum("0")}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="w-[80px] h-[46px] items-center justify-center rounded-2xl bg-slate-50"
            >
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-lg text-slate-700">
                0
              </Text>
            </Pressable>
            <Pressable
              onPress={deleteLast}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
              className="w-[80px] h-[46px] items-center justify-center rounded-2xl bg-slate-50"
            >
              <MaterialIcons name="backspace" size={18} color="#64748b" />
            </Pressable>
          </View>
        </View>

        {/* 2. Emoji categories (Set name directly, removing TextInput) */}
        <View className="mb-6">
          <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-[11px] text-slate-400 uppercase tracking-wider mb-3 text-center">
            What is your dream?
          </Text>
          <View className="flex-row flex-wrap gap-2.5 justify-center">
            {EMOJI_CATEGORIES.map((cat) => {
              const isActive = selectedEmoji === cat.emoji;
              return (
                <Pressable
                  key={cat.label}
                  onPress={() => {
                    triggerHaptic();
                    setSelectedEmoji(cat.emoji);
                    setGoalName(cat.label);
                  }}
                  style={[
                    styles.emojiCard,
                    isActive ? styles.emojiCardActive : null
                  ]}
                  className="bg-white border border-slate-100 items-center justify-center rounded-2xl shadow-sm"
                >
                  <Text className="text-xl mb-0.5">{cat.emoji}</Text>
                  <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-[10px] text-slate-500">
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* 3. Interactive Target Date (Calendar Picker replacing random cycler) */}
        <View style={styles.card} className="bg-white rounded-3xl border border-slate-100 p-5 mb-4">
          <View className="flex-row justify-between items-center pb-3 border-b border-slate-50 mb-3">
            <View>
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-[10px] text-slate-400 uppercase tracking-wider">
                Target Date
              </Text>
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-slate-800">
                {targetDateStr}
              </Text>
            </View>
            <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center">
              <MaterialIcons name="calendar-today" size={16} color="#005bbf" />
            </View>
          </View>
          
          {/* Calendar Controller */}
          <View className="flex-row justify-between items-center mb-3">
            <Pressable onPress={prevMonth} className="p-1 rounded-full bg-slate-50 border border-slate-100">
              <MaterialIcons name="chevron-left" size={20} color="#1e293b" />
            </Pressable>
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-xs text-slate-800">
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <Pressable onPress={nextMonth} className="p-1 rounded-full bg-slate-50 border border-slate-100">
              <MaterialIcons name="chevron-right" size={20} color="#1e293b" />
            </Pressable>
          </View>

          {/* Calendar Grid Weekdays */}
          <View className="flex-row justify-between mb-1.5">
            {WEEKDAYS.map((day, idx) => (
              <Text key={idx} style={{ fontFamily: "WorkSans_600SemiBold" }} className="w-[34px] text-center text-[10px] text-slate-400 font-bold">
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid Cells */}
          <View className="flex-row flex-wrap justify-between">
            {getCalendarDays().map((day, idx) => {
              if (day === null) {
                return <View key={`empty-${idx}`} className="w-[34px] h-[30px] mb-0.5" />;
              }
              const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === viewMonth && selectedDate.getFullYear() === viewYear;
              const isPast = new Date(viewYear, viewMonth, day) < new Date();
              return (
                <Pressable
                  key={`day-${day}`}
                  onPress={() => {
                    if (!isPast) {
                      triggerHaptic();
                      const newD = new Date(viewYear, viewMonth, day);
                      setSelectedDate(newD);
                    }
                  }}
                  className={`w-[34px] h-[30px] rounded-full items-center justify-center mb-0.5 ${
                    isSelected ? "bg-blue-600" : "bg-transparent"
                  }`}
                  style={{ opacity: isPast ? 0.2 : 1 }}
                >
                  <Text
                    style={{ fontFamily: "WorkSans_500Medium" }}
                    className={`text-xs ${isSelected ? "text-white font-bold" : "text-slate-700"}`}
                  >
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.fixedBottom} className="px-margin-mobile py-4 bg-white border-t border-slate-100">
        <Pressable
          android_ripple={{ color: "rgba(255,255,255,0.2)" }}
          style={({ pressed }) => [
            styles.createBtn,
            { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
          ]}
          onPress={handleCreateGoal}
        >
          <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white text-base mr-1">
            Create Dream Goal
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  emojiCard: {
    width: (width - 70) / 4,
    aspectRatio: 1.1,
  },
  emojiCardActive: {
    backgroundColor: "#e0e7ff",
    borderColor: "#4f46e5",
    borderWidth: 1.5,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  fixedBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  createBtn: {
    width: "100%",
    height: 52,
    backgroundColor: "#005bbf",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});

export default GoalCreationScreen;
