import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  Alert,
  ActivityIndicator
} from "react-native";
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { apiService } from "../../services/api";

export const InsightsScreen = ({ navigation }: { navigation: any }) => {
  const [activeSegment, setActiveSegment] = useState<"spending" | "roundups" | "wellness">("spending");
  const [loading, setLoading] = useState(false);
  const [stressSummary, setStressSummary] = useState<string | null>(null);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleRunStressMeter = async () => {
    triggerHaptic();
    setLoading(true);
    setStressSummary(null);
    try {
      const response = await apiService.getStressMeter(30);
      setStressSummary(response.ai_summary);
      Alert.alert(
        "Stress Analysis Complete",
        response.ai_summary || "No cash flow anomalies detected in the last 30 days."
      );
    } catch (e: any) {
      Alert.alert("Analysis Failed", e.message || "Failed to contact AI stress scanner.");
    } finally {
      setLoading(false);
    }
  };

  const subscriptions = [
    { name: "Netflix", icon: "play", color: "#e50914", provider: "fa" },
    { name: "Spotify", icon: "spotify", color: "#1db954", provider: "mci" },
    { name: "Apple", icon: "apple", color: "#555555", provider: "fa" },
    { name: "YouTube", icon: "youtube-play", color: "#ff0000", provider: "fa" },
    { name: "Prime", icon: "amazon", color: "#00a8e1", provider: "fa" },
  ];

  const recentRoundups = [
    { id: "ru-1", title: "Campus Coffee Shop", amount: 26.00, roundup: 4.00, time: "Today, 10:24 AM" },
    { id: "ru-2", title: "College Bookstore", amount: 725.00, roundup: 75.00, time: "Yesterday, 3:15 PM" },
    { id: "ru-3", title: "Downtown Diner", amount: 188.00, roundup: 12.00, time: "July 30, 8:40 PM" },
    { id: "ru-4", title: "Campus Grocery", amount: 445.50, roundup: 4.50, time: "July 28, 1:12 PM" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#f7f9ff]">
      {/* Top App Bar */}
      <View className="flex-row justify-between items-center px-margin-mobile py-stack-md bg-white border-b border-slate-100">
        <View className="flex-row items-center space-x-3">
          <View className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTq3IY7xhV3aWDPgRwaxHD_oWLUlqJZeh_dgSAaRl9LT4Wx5jYETm1gOlx3SHUMh4mRl0BdLwxw6rFOlrx2rwcgmPCh-IY6JMbPXmHtprrjV8_bjgrB7tqKPCLhpMe86efjCbDKiPwruo_2qkvIBE6NsGGjq8-sKib0D0lahPSoeYRe9YSC9lkJeomNXRKZau3b4mhPFuLa5HCrNdk4ZBzVIzq1G6V239Ce_UKPuZcxnvdG_iAHAUb" }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-lg text-ob-primary">
            Financial Insights
          </Text>
        </View>
      </View>

      <ScrollView className="flex-grow" contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 60 }}>
        {/* Segmented Control */}
        <View className="flex-row bg-slate-100 rounded-full p-1 mb-6">
          <Pressable
            onPress={() => { triggerHaptic(); setActiveSegment("spending"); }}
            className={`flex-1 py-2 rounded-full items-center ${activeSegment === "spending" ? "bg-white shadow-sm" : ""}`}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className={`text-xs ${activeSegment === "spending" ? "text-[#005bbf] font-bold" : "text-slate-500"}`}>
              Spending
            </Text>
          </Pressable>
          <Pressable
            onPress={() => { triggerHaptic(); setActiveSegment("roundups"); }}
            className={`flex-1 py-2 rounded-full items-center ${activeSegment === "roundups" ? "bg-white shadow-sm" : ""}`}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className={`text-xs ${activeSegment === "roundups" ? "text-[#005bbf] font-bold" : "text-slate-500"}`}>
              Round-ups
            </Text>
          </Pressable>
          <Pressable
            onPress={() => { triggerHaptic(); setActiveSegment("wellness"); }}
            className={`flex-1 py-2 rounded-full items-center ${activeSegment === "wellness" ? "bg-white shadow-sm" : ""}`}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className={`text-xs ${activeSegment === "wellness" ? "text-[#005bbf] font-bold" : "text-slate-500"}`}>
              Wellness
            </Text>
          </Pressable>
        </View>

        {/* Conditional Sub-views rendering */}
        {activeSegment === "spending" && (
          <View className="space-y-6">
            {/* Spending Donut Chart Card */}
            <View style={styles.card} className="bg-white border border-outline-variant/30 rounded-3xl p-5 items-center">
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-base mb-4 w-full">
                Monthly Spending Breakdown
              </Text>
              
              <View className="relative w-44 h-44 items-center justify-center">
                <Svg width="100%" height="100%" viewBox="0 0 36 36" style={{ transform: [{ rotate: "-90deg" }] }}>
                  {/* Fun (Gray - 20%) */}
                  <Circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#94a3b8" strokeWidth="3.5" strokeDasharray="20 80" strokeDashoffset="-80" />
                  {/* Food (Red - 25%) */}
                  <Circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#ba1a1a" strokeWidth="3.5" strokeDasharray="25 75" strokeDashoffset="-55" />
                  {/* Rent (Blue - 30%) */}
                  <Circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#adc7ff" strokeWidth="3.5" strokeDasharray="30 70" strokeDashoffset="-25" />
                  {/* Savings (Green - 25%) */}
                  <Circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#16893a" strokeWidth="3.5" strokeDasharray="25 75" strokeDashoffset="0" />
                </Svg>
                <View className="absolute items-center">
                  <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-400 uppercase">Spent</Text>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-lg text-slate-800">₹33,750</Text>
                </View>
              </View>

              <View className="w-full mt-6 space-y-3.5">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3.5">
                    <View className="w-3 h-3 rounded-full bg-[#16893a]" />
                    <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-slate-700 text-sm">Savings (25%)</Text>
                  </View>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-sm">₹11,250</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3.5">
                    <View className="w-3 h-3 rounded-full bg-[#adc7ff]" />
                    <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-slate-700 text-sm">Rent & Tuition (30%)</Text>
                  </View>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-sm">₹13,500</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3.5">
                    <View className="w-3 h-3 rounded-full bg-[#ba1a1a]" />
                    <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-slate-700 text-sm">Food (25%)</Text>
                  </View>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-sm">₹11,250</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center space-x-3.5">
                    <View className="w-3 h-3 rounded-full bg-[#94a3b8]" />
                    <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-slate-700 text-sm">Entertainment & Fun (20%)</Text>
                  </View>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-sm">₹9,000</Text>
                </View>
              </View>
            </View>

            {/* Subscriptions Horizontal Scroll Card */}
            <View style={styles.card} className="bg-white border border-outline-variant/30 rounded-3xl p-5">
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-base mb-4">
                Active Subscriptions
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                {subscriptions.map((sub, idx) => (
                  <View key={sub.name} className={`flex-col items-center mr-4 ${idx === subscriptions.length - 1 ? "mr-0" : ""}`}>
                    <View style={styles.subIconWrapper} className="w-14 h-14 rounded-full bg-slate-50 border border-slate-100 items-center justify-center shadow-sm">
                      {sub.provider === "fa" ? (
                        <FontAwesome name={sub.icon as any} size={22} color={sub.color} />
                      ) : (
                        <MaterialCommunityIcons name={sub.icon as any} size={22} color={sub.color} />
                      )}
                    </View>
                    <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-600 mt-2">{sub.name}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        )}

        {activeSegment === "roundups" && (
          <View className="space-y-6">
            {/* Chart Card */}
            <View style={styles.card} className="bg-white border border-outline-variant/30 rounded-3xl p-5">
              <View className="flex-row justify-between items-start mb-4">
                <View>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-base">Savings Over Time</Text>
                  <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-400 text-xs mt-0.5">Weekly performance trend</Text>
                </View>
                <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 flex-row items-center">
                  <MaterialIcons name="trending-up" size={14} color="#16893a" />
                  <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[9px] text-[#16893a] uppercase font-bold ml-0.5">+12%</Text>
                </View>
              </View>

              <View style={styles.chartWrapper} className="relative w-full h-44 justify-end mt-2">
                <Svg width="100%" height="100%" viewBox="0 0 400 150" preserveAspectRatio="none">
                  <Defs>
                    <LinearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                      <Stop offset="0%" stopColor="#005bbf" stopOpacity="0.15" />
                      <Stop offset="100%" stopColor="#005bbf" stopOpacity="0.0" />
                    </LinearGradient>
                  </Defs>
                  <Path d="M0 150 L0 120 C50 110, 80 130, 120 100 C160 70, 200 80, 250 40 C300 10, 350 20, 400 5 L400 150 Z" fill="url(#chartGradient)" />
                  <Path d="M0 120 C50 110, 80 130, 120 100 C160 70, 200 80, 250 40 C300 10, 350 20, 400 5" fill="none" stroke="#005bbf" strokeWidth="3" />
                  <Circle cx="120" cy="100" r="4.5" fill="#005bbf" />
                  <Circle cx="250" cy="40" r="4.5" fill="#005bbf" />
                  <Circle cx="400" cy="5" r="4.5" fill="#005bbf" />
                </Svg>
              </View>

              <View className="flex-row justify-between mt-2.5 px-1">
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-400 font-bold">Mon</Text>
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-400 font-bold">Wed</Text>
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-400 font-bold">Fri</Text>
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-400 font-bold">Sun</Text>
              </View>
            </View>

            {/* Roundup History List */}
            <View style={styles.card} className="bg-white border border-outline-variant/30 rounded-3xl p-5">
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-base mb-4">
                Round-up History
              </Text>
              <View className="space-y-4">
                {recentRoundups.map((item) => (
                  <View key={item.id} className="flex-row justify-between items-center py-2.5 border-b border-slate-50 last:border-b-0">
                    <View>
                      <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-800 text-sm font-bold">
                        {item.title}
                      </Text>
                      <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-400 text-[10px] mt-0.5">
                        Purchase: ₹{item.amount.toFixed(2)} • {item.time}
                      </Text>
                    </View>
                    <View className="bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1 items-center justify-center">
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-[#16893a] text-xs font-bold">
                        +₹{item.roundup.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {activeSegment === "wellness" && (
          <View className="space-y-6">
            {/* Gauges Side-by-Side */}
            <View className="flex-row space-x-4">
              {/* Score card */}
              <View style={styles.gaugeCard} className="flex-1 bg-white border border-outline-variant/30 rounded-3xl p-4 items-center">
                <View style={styles.gaugeContainer} className="mb-2 items-center justify-center">
                  <Svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: [{ rotate: "-180deg" }] }}>
                    <Path d="M 20 50 A 30 30 0 0 1 80 50" fill="none" stroke="#F1F3F4" strokeWidth="8" />
                    <Path d="M 20 50 A 30 30 0 0 1 80 50" fill="none" stroke="#005bbf" strokeWidth="8" strokeLinecap="round" strokeDasharray="94 94" strokeDashoffset="14" />
                  </Svg>
                  <View className="absolute bottom-1">
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-lg text-[#005bbf] font-bold">85</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-800 text-xs font-bold uppercase tracking-wider text-center">Wellness Score</Text>
                <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-[10px] text-center mt-2 leading-4">
                  Excellent! You are in the top 10% of campus savers.
                </Text>
              </View>

              {/* Regret Meter card */}
              <View style={styles.gaugeCard} className="flex-1 bg-white border border-outline-variant/30 rounded-3xl p-4 items-center">
                <View style={styles.gaugeContainer} className="mb-2 items-center justify-center">
                  <Svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: [{ rotate: "-180deg" }] }}>
                    <Path d="M 20 50 A 30 30 0 0 1 80 50" fill="none" stroke="#F1F3F4" strokeWidth="8" />
                    <Path d="M 20 50 A 30 30 0 0 1 80 50" fill="none" stroke="#ba1a1a" strokeWidth="8" strokeLinecap="round" strokeDasharray="94 94" strokeDashoffset="75" />
                  </Svg>
                  <View className="absolute bottom-1">
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-lg text-red-600 font-bold">20</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-800 text-xs font-bold uppercase tracking-wider text-center">Regret Meter</Text>
                <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-[10px] text-center mt-2 leading-4">
                  Low. Your subscription spending is well controlled.
                </Text>
              </View>
            </View>

            {/* AI Stress Meter action card */}
            <View style={styles.card} className="bg-white border border-outline-variant/30 rounded-3xl p-5 items-center">
              <MaterialIcons name="security" size={32} color="#005bbf" className="mb-2" />
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-base mb-1">
                AI Cash Flow Stress Scanner
              </Text>
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-xs text-center mb-5 px-3">
                Scan your recent bank transactions for overdraft risks and subscription price increases.
              </Text>

              {stressSummary && (
                <View className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                  <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-blue-800 text-xs leading-relaxed">
                    {stressSummary}
                  </Text>
                </View>
              )}

              <Pressable
                onPress={handleRunStressMeter}
                disabled={loading}
                className="py-3 px-6 rounded-full bg-[#005bbf] active:bg-[#004493] flex-row items-center justify-center"
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons name="auto-awesome" size={18} color="#ffffff" className="mr-1.5" />
                    <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white text-xs font-bold">
                      Scan Cash Flow Stress
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  gaugeCard: {
    minHeight: 160,
  },
  gaugeContainer: {
    width: 100,
    height: 50,
    overflow: "hidden",
  },
  chartWrapper: {
    overflow: "hidden",
  },
  subIconWrapper: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  }
});

export default InsightsScreen;
