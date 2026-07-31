import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert
} from "react-native";
import { MaterialIcons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";
import { apiService } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { Transaction } from "../../types";

export const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Dynamic statistics
  const [totalSavedVal, setTotalSavedVal] = useState<number>(0);
  const [roundupCount, setRoundupCount] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Developer swipe card simulation inputs
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Coffee");
  const [logLoading, setLogLoading] = useState(false);
  const [roundupAlert, setRoundupAlert] = useState<{ amount: number; desc: string } | null>(null);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const stats = await apiService.getRoundupStats();
      setTotalSavedVal(stats.total_saved || 0);
      setRoundupCount(stats.roundup_count || 0);

      const txs = await apiService.getTransactions();
      setTransactions(txs);
    } catch (e: any) {
      console.warn("Failed to load home data:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogTransaction = async () => {
    if (!desc || !amount) {
      Alert.alert("Error", "Please enter store description and price.");
      return;
    }

    const priceNum = parseFloat(amount);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Error", "Please enter a valid swipe amount.");
      return;
    }

    setLogLoading(true);
    try {
      triggerHaptic();
      const res = await apiService.createTransaction({
        amount: priceNum,
        category: category,
        merchant: desc,
        type: "expense",
        description: desc,
      });

      if (res.roundup_applied) {
        const amt = res.roundup_amount;
        const explanation = res.ai_explanation;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setRoundupAlert({
          amount: Number(amt),
          desc: explanation
        });
      } else {
        Alert.alert("Swipe Logged", "Transaction logged! No roundup applied this time.");
      }

      setDesc("");
      setAmount("");
      loadData();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to simulate transaction.");
    } finally {
      setLogLoading(false);
    }
  };

  // Format amount to Indian standards (₹)
  const displayTotalSaved = totalSavedVal > 0 ? `₹${totalSavedVal.toLocaleString("en-IN")}` : "₹24,500";

  // Category Icon mappings for activities feed
  const getActIcon = (cat: string) => {
    const c = cat.toLowerCase();
    if (c.includes("coffee")) return "coffee";
    if (c.includes("shop") || c.includes("clot")) return "shopping-bag";
    if (c.includes("transport") || c.includes("uber") || c.includes("ride")) return "directions-car";
    return "account-balance-wallet";
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f7f9ff]">
      {/* TopAppBar */}
      <View className="flex-row justify-between items-center px-margin-mobile py-stack-md bg-white border-b border-slate-100">
        <View className="flex-row items-center space-x-3">
          <View className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuBVzhpTQx_KVMgHhXHa__NlWZzXwOMekHojiL8ImhcG-aCuPtZ0n_xnIvUI4qVliwpq0x7rWe97Q1Yp-RL6GE7dWcpmr4cjg5z-MPNZcC7RPQRiMvxFEXPhEPTvMBYGJpJ5rhjcxp6AJNohocomr8-YMo_u8ziPjSyL4MbW6a6gKXnviIbRuooLsNnrzAmEdy_tBoDYhvvuoXWS4Xy2j4cTP0avxMC2Q9hNIbEKaOeJZ_b9mpsyjL1I" }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-lg text-on-surface">
            Hi, Alex
          </Text>
        </View>
        <Pressable 
          onPress={() => {
            triggerHaptic();
            setShowDevPanel(!showDevPanel);
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100"
        >
          <MaterialIcons name="settings" size={20} color="#5c5f60" />
        </Pressable>
      </View>

      <ScrollView 
        className="flex-grow" 
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 150 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#005bbf" />
        }
      >
        {/* Developer Sandbox Panel (Collapsible tools) */}
        {showDevPanel && (
          <View className="mb-6 bg-slate-900 p-5 rounded-2xl border border-slate-700">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-bold text-sm">Developer Tools</Text>
              <Pressable onPress={logout}>
                <Text className="text-red-400 text-xs font-bold px-3 py-1 bg-red-950/20 border border-red-500/10 rounded-lg">Logout</Text>
              </Pressable>
            </View>

            <Text className="text-slate-400 text-xs mb-3">Simulate swipe / purchase transactions to trigger backend round-ups</Text>
            
            <View className="flex-row space-x-3 mb-3">
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="Store Name"
                placeholderTextColor="#64748b"
                className="flex-1 bg-slate-800 text-white px-3 py-2 rounded-xl text-xs"
              />
              <TextInput
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="Amount (₹)"
                placeholderTextColor="#64748b"
                className="w-24 bg-slate-800 text-white px-3 py-2 rounded-xl text-xs"
              />
            </View>

            <View className="flex-row space-x-2 mb-4">
              {["Coffee", "Shopping", "Transport"].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border ${category === cat ? "bg-primary/20 border-primary" : "bg-slate-800 border-slate-700"}`}
                >
                  <Text className={`text-[10px] ${category === cat ? "text-primary-container" : "text-slate-400"}`}>{cat}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              disabled={logLoading}
              onPress={handleLogTransaction}
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              className="bg-primary-container py-3 rounded-xl items-center"
            >
              {logLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white text-xs">Swipe Simulator Card</Text>
              )}
            </Pressable>
          </View>
        )}

        {/* AI Roundup Alert Banner */}
        {roundupAlert && (
          <View style={styles.alertCard} className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl mb-6 flex-row justify-between items-start">
            <View className="flex-1 space-y-1">
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-xs text-tertiary">
                🎉 Auto-savings activated!
              </Text>
              <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-2xl text-on-surface">
                +₹{roundupAlert.amount.toFixed(2)}
              </Text>
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-xs text-on-surface-variant italic leading-relaxed">
                "{roundupAlert.desc}"
              </Text>
            </View>
            <Pressable onPress={() => setRoundupAlert(null)} className="p-1">
              <MaterialIcons name="close" size={18} color="#5c5f60" />
            </Pressable>
          </View>
        )}

        {/* Hero Section: Total Saved */}
        <View style={styles.heroCard} className="bg-primary-container rounded-2xl p-6 mb-6 relative overflow-hidden">
          <View className="z-10">
            <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-white/90 uppercase tracking-widest mb-1">
              Total Saved
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-3xl text-white">
              {displayTotalSaved}
            </Text>
            <Pressable
              onPress={() => {
                triggerHaptic();
                navigation.navigate("RoundupTracker");
              }}
              style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
              className="mt-4 flex-row items-center space-x-1.5 bg-white/10 px-4 py-2 rounded-full border border-white/20 align-self-start"
            >
              <MaterialIcons name="trending-up" size={16} color="#ffffff" />
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-white">
                +₹1,240 this week
              </Text>
            </Pressable>
          </View>
          {/* Decorative background blur circle */}
          <View className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        </View>

        {/* Goals Section: Horizontal Scroll Rings */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-base text-on-surface">
              Your Goals
            </Text>
            <Pressable 
              onPress={() => {
                triggerHaptic();
                navigation.navigate("StudentHome", { screen: "Goals" });
              }}
            >
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-ob-primary font-bold">
                View All
              </Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
            {/* Laptop Goal */}
            <Pressable
              onPress={() => {
                triggerHaptic();
                navigation.navigate("StudentHome", { screen: "Goals" });
              }}
              style={({ pressed }) => [
                styles.ringCard,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              className="bg-white p-4 rounded-2xl items-center border border-outline-variant/30 mr-3 shadow-sm"
            >
              <View className="relative w-20 h-20 items-center justify-center">
                <Svg height="80" width="80">
                  <Circle cx="40" cy="40" fill="transparent" r="34" stroke="#f1f3f4" strokeWidth="5" />
                  <Circle cx="40" cy="40" fill="transparent" r="34" stroke="#1a73e8" strokeWidth="5" strokeDasharray="213.6" strokeDashoffset="64.1" strokeLinecap="round" rotation={-90} origin="40, 40" />
                </Svg>
                <View className="absolute">
                  <MaterialIcons name="laptop-mac" size={24} color="#1a73e8" />
                </View>
              </View>
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-on-surface mt-2 font-semibold">
                Laptop
              </Text>
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-secondary-container mt-0.5">
                70%
              </Text>
            </Pressable>

            {/* Trip Goal */}
            <Pressable
              onPress={() => {
                triggerHaptic();
                navigation.navigate("StudentHome", { screen: "Goals" });
              }}
              style={({ pressed }) => [
                styles.ringCard,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              className="bg-white p-4 rounded-2xl items-center border border-outline-variant/30 mr-3 shadow-sm"
            >
              <View className="relative w-20 h-20 items-center justify-center">
                <Svg height="80" width="80">
                  <Circle cx="40" cy="40" fill="transparent" r="34" stroke="#f1f3f4" strokeWidth="5" />
                  <Circle cx="40" cy="40" fill="transparent" r="34" stroke="#16893a" strokeWidth="5" strokeDasharray="213.6" strokeDashoffset="128.1" strokeLinecap="round" rotation={-90} origin="40, 40" />
                </Svg>
                <View className="absolute">
                  <MaterialIcons name="flight" size={24} color="#16893a" />
                </View>
              </View>
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-on-surface mt-2 font-semibold">
                Trip
              </Text>
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-secondary-container mt-0.5">
                40%
              </Text>
            </Pressable>

            {/* Fees Goal */}
            <Pressable
              onPress={() => {
                triggerHaptic();
                navigation.navigate("StudentHome", { screen: "Goals" });
              }}
              style={({ pressed }) => [
                styles.ringCard,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              className="bg-white p-4 rounded-2xl items-center border border-outline-variant/30 mr-3 shadow-sm"
            >
              <View className="relative w-20 h-20 items-center justify-center">
                <Svg height="80" width="80">
                  <Circle cx="40" cy="40" fill="transparent" r="34" stroke="#f1f3f4" strokeWidth="5" />
                  <Circle cx="40" cy="40" fill="transparent" r="34" stroke="#ba1a1a" strokeWidth="5" strokeDasharray="213.6" strokeDashoffset="180" strokeLinecap="round" rotation={-90} origin="40, 40" />
                </Svg>
                <View className="absolute">
                  <MaterialIcons name="school" size={24} color="#ba1a1a" />
                </View>
              </View>
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-on-surface mt-2 font-semibold">
                Fees
              </Text>
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-secondary-container mt-0.5">
                15%
              </Text>
            </Pressable>

            {/* Add New Goal */}
            <Pressable
              onPress={() => {
                triggerHaptic();
                navigation.navigate("GoalCreation");
              }}
              style={({ pressed }) => [
                styles.ringCard,
                { transform: [{ scale: pressed ? 0.95 : 1 }] }
              ]}
              className="bg-slate-50 border-2 border-dashed border-outline-variant items-center justify-center rounded-2xl p-4 mr-1"
            >
              <MaterialIcons name="add-circle" size={32} color="#727785" />
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-on-surface-variant mt-3 font-semibold text-center">
                Add New
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Recent Round-ups */}
        <View className="mb-6">
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-base text-on-surface mb-4 px-1">
            Recent Round-ups
          </Text>

          <View className="space-y-3">
            {transactions.length === 0 ? (
              // Static fallbacks matching mockup when database is fresh
              <>
                <View style={styles.itemCard} className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-outline-variant/30">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 items-center justify-center">
                      <MaterialIcons name="coffee" size={20} color="#1a73e8" />
                    </View>
                    <View>
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-on-surface">Starbucks</Text>
                      <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-secondary-container">Today, 9:41 AM</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-tertiary">+₹12.50</Text>
                    <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[9px] text-on-secondary-container">₹187.50 rounded</Text>
                  </View>
                </View>

                <View style={styles.itemCard} className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-outline-variant/30">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 items-center justify-center">
                      <MaterialIcons name="shopping-bag" size={20} color="#1a73e8" />
                    </View>
                    <View>
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-on-surface">Zudio Shopping</Text>
                      <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-secondary-container">Yesterday</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-tertiary">+₹4.00</Text>
                    <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[9px] text-on-secondary-container">₹796.00 rounded</Text>
                  </View>
                </View>

                <View style={styles.itemCard} className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-outline-variant/30">
                  <View className="flex-row items-center space-x-3">
                    <View className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 items-center justify-center">
                      <MaterialIcons name="directions-car" size={20} color="#1a73e8" />
                    </View>
                    <View>
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-on-surface">Uber Trip</Text>
                      <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-secondary-container">Jan 24, 6:30 PM</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-tertiary">+₹8.00</Text>
                    <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[9px] text-on-secondary-container">₹242.00 rounded</Text>
                  </View>
                </View>
              </>
            ) : (
              // Live transaction ledger round-up mapping
              transactions.slice(0, 3).map((t) => {
                const swipeAmt = Number(t.amount) || 0;
                const nextTen = Math.ceil(swipeAmt / 10) * 10;
                const calculatedRoundup = swipeAmt > 0 && nextTen > swipeAmt ? nextTen - swipeAmt : 0;
                const dateText = new Date(t.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric"
                });

                return (
                  <View key={t.trans_id} style={styles.itemCard} className="flex-row items-center justify-between p-4 bg-white rounded-2xl border border-outline-variant/30">
                    <View className="flex-row items-center space-x-3">
                      <View className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 items-center justify-center">
                        <MaterialIcons name={getActIcon(t.category)} size={20} color="#1a73e8" />
                      </View>
                      <View>
                        <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-on-surface">
                          {t.merchant || t.description}
                        </Text>
                        <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-secondary-container">
                          {t.category} • {dateText}
                        </Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-tertiary">
                        +₹{calculatedRoundup.toFixed(2)}
                      </Text>
                      <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[9px] text-on-secondary-container">
                        ₹{swipeAmt.toFixed(2)} rounded
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <Pressable
            onPress={() => {
              triggerHaptic();
              navigation.navigate("TransactionList");
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            className="w-full mt-4 py-3 bg-[#e3f2fd] rounded-xl items-center"
          >
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-primary text-xs font-bold">
              See Full History
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Floating AI Coach Button */}
      <Pressable
        onPress={() => {
          triggerHaptic();
          navigation.navigate("StudentHome", { screen: "Chat" });
        }}
        style={({ pressed }) => [
          styles.fab,
          { transform: [{ scale: pressed ? 0.95 : 1 }] }
        ]}
        className="fixed bg-primary shadow-lg rounded-full flex items-center justify-center"
      >
        <MaterialIcons name="smart-toy" size={28} color="#ffffff" />
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  alertCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  heroCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  ringCard: {
    width: 120,
    minHeight: 140,
  },
  itemCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1a73e8",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 99,
  }
});

export default HomeScreen;
