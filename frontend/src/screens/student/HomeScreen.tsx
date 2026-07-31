import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  Alert, 
  ActivityIndicator, 
  Pressable, 
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Image,
  Modal
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAuth } from "../../hooks/useAuth";
import { apiService } from "../../services/api";
import { Transaction, Goal } from "../../types";

export const HomeScreen = ({ navigation }: { navigation: any }) => {
  const { logout, userToken } = useAuth();
  const isFocused = useIsFocused();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dashboard state
  const [totalSaved, setTotalSaved] = useState<number>(0);
  const [roundupCount, setRoundupCount] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);

  // Simulation form state
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Coffee");
  const [logLoading, setLogLoading] = useState(false);

  // Roundup trigger popup state
  const [roundupAlert, setRoundupAlert] = useState<{ amount: number; desc: string } | null>(null);

  // Negotiator bottom sheet modal state
  const [showNegotiator, setShowNegotiator] = useState(false);
  const [hasCheckedSubscription, setHasCheckedSubscription] = useState(false);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const stats = await apiService.getRoundupStats();
      setTotalSaved(Number(stats.total_saved) || 0);
      setRoundupCount(stats.roundup_transactions_count || 0);

      const txs = await apiService.getTransactions();
      setTransactions(txs.slice(0, 3)); 

      const gls = await apiService.getGoals();
      setGoals(gls.slice(0, 2)); // Show top 2 goals preview
    } catch (e: any) {
      console.warn("Failed to load dashboard data:", e.message);
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

  // Contextual check for pausable subscription on screen focus
  useEffect(() => {
    if (isFocused && !hasCheckedSubscription && userToken !== "guest") {
      // Simulate/trigger bottom sheet suggestion
      const timer = setTimeout(() => {
        setShowNegotiator(true);
        setHasCheckedSubscription(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isFocused]);

  const handleLogTransaction = async () => {
    if (!desc || !amount) {
      Alert.alert("Error", "Please provide a store name and amount.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }

    setLogLoading(true);
    try {
      const response = await apiService.createTransaction({
        description: desc,
        amount: numericAmount,
        category: category,
        merchant: desc,
        type: "debit"
      });

      if (response.roundup_applied && response.roundup_details?.success) {
        const amt = response.roundup_details.roundup_amount;
        const explanation = response.roundup_details.explanation;
        
        setRoundupAlert({
          amount: Number(amt),
          desc: explanation
        });
      } else {
        Alert.alert("Success", "Transaction logged! No roundup applied this time.");
      }

      setDesc("");
      setAmount("");
      loadData();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to log transaction.");
    } finally {
      setLogLoading(false);
    }
  };

  // Mock data for preview state if empty
  const mockGoalPreview = [
    { goal_name: "🏠 Home Rent", target: 8000, saved: 2500 },
    { goal_name: "✈️ Travel Trip", target: 15000, saved: 6000 },
  ];

  const goalsToRender = goals.length > 0 ? goals : mockGoalPreview;

  return (
    <SafeAreaView className="flex-1 bg-[#f7f9ff]">
      {/* Header Banner */}
      <View className="flex-row justify-between items-center px-margin-mobile py-stack-md bg-white border-b border-slate-100">
        <View className="flex-row items-center space-x-3">
          <View className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCr4f6j5TOnM6olaPKu21SzVM04BxNin0s7kvSA3Ll-cqO_hDom2VXB_5UngwMBAe7ES_8DiG4VYhKq-nXLZckYLKtzeUTOmAdam-gLDnbvKtKqQjzkQ0hVHZqycl3XGwhY22pRFKbhg53AipNsBO-9Y7agi0FwrC5ZEhrEuRvocfrbjapAxiRJ0TZi5je1E4JN_zNUQz6y6iqMlrGiVjWX7f1MIQrUufMDUHSMjxIK5v1c4Xmb1ISO" }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-lg text-ob-primary">
            SpareChange AI
          </Text>
        </View>
        <Pressable 
          onPress={() => {
            triggerHaptic();
            navigation.navigate("Profile");
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100"
        >
          <MaterialIcons name="person" size={20} color="#181c20" />
        </Pressable>
      </View>

      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#005bbf" />
        }
      >
        {/* Total Auto-Saved & Trigger stats */}
        <View className="flex-row space-x-4 mb-6">
          <View style={styles.card} className="flex-grow bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between">
            <View>
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Total Saved
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color="#005bbf" />
              ) : (
                <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-2xl text-emerald-600 font-extrabold">
                  ₹{totalSaved.toLocaleString("en-IN")}
                </Text>
              )}
            </View>
            <View className="bg-emerald-50 w-10 h-10 rounded-full items-center justify-center border border-emerald-100">
              <MaterialIcons name="savings" size={20} color="#16893a" />
            </View>
          </View>

          <View style={styles.card} className="flex-grow bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-row items-center justify-between">
            <View>
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                Savings Triggers
              </Text>
              {loading ? (
                <ActivityIndicator size="small" color="#005bbf" />
              ) : (
                <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-2xl text-slate-800 font-extrabold">
                  {roundupCount}
                </Text>
              )}
            </View>
            <View className="bg-blue-50 w-10 h-10 rounded-full items-center justify-center border border-blue-100">
              <MaterialIcons name="auto-awesome" size={20} color="#005bbf" />
            </View>
          </View>
        </View>

        {/* AI Roundup Alert Banner */}
        {roundupAlert && (
          <View className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6 flex-row space-x-3 items-start shadow-sm">
            <MaterialIcons name="check-circle" size={24} color="#16893a" className="mt-0.5" />
            <View className="flex-1">
              <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-[#16893a] text-sm font-bold">
                Micro-savings automated!
              </Text>
              <Text style={{ fontFamily: "PlusJakartaSans_800ExtraBold" }} className="text-slate-800 text-xl font-extrabold mt-1">
                +₹{roundupAlert.amount.toFixed(2)}
              </Text>
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-xs mt-1 italic">
                "{roundupAlert.desc}"
              </Text>
            </View>
            <Pressable onPress={() => setRoundupAlert(null)}>
              <MaterialIcons name="close" size={20} color="#94a3b8" />
            </Pressable>
          </View>
        )}

        {/* Goals Preview Section */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-base font-bold">
              Goals Preview
            </Text>
            <Pressable onPress={() => navigation.navigate("Goals")}>
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-[#005bbf] text-xs font-bold">
                View All
              </Text>
            </Pressable>
          </View>

          <View className="space-y-3">
            {goalsToRender.map((g, idx) => {
              const target = Number(g.target) || 1;
              const saved = Number(g.saved) || 0;
              const percent = Math.round((saved / target) * 100);
              return (
                <View key={idx} style={styles.card} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-800 text-sm font-bold">
                      {g.goal_name}
                    </Text>
                    <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-slate-400 text-xs">
                      ₹{saved.toLocaleString("en-IN")} of ₹{target.toLocaleString("en-IN")}
                    </Text>
                  </View>
                  <View className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <View style={{ width: `${percent}%` }} className="h-full bg-blue-600 rounded-full" />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Sim Card Swipe Panel */}
        <View style={styles.card} className="bg-white border border-slate-100 rounded-3xl p-5 mb-6 shadow-sm">
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-base font-bold mb-4">
            Simulate Card Purchase
          </Text>
          
          <View className="flex-row space-x-3 mb-4">
            <View className="flex-1">
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-[10px] uppercase tracking-wider mb-2 ml-1">
                Merchant / Store
              </Text>
              <TextInput
                value={desc}
                onChangeText={setDesc}
                placeholder="e.g. Starbucks"
                placeholderTextColor="#94a3b8"
                style={{ fontFamily: "WorkSans_400Regular" }}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:border-[#005bbf]"
              />
            </View>

            <View className="w-1/3">
              <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-[10px] uppercase tracking-wider mb-2 ml-1">
                Amount (₹)
              </Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="e.g. 185"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
                style={{ fontFamily: "WorkSans_400Regular" }}
                className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 text-sm focus:border-[#005bbf]"
              />
            </View>
          </View>

          <View className="mb-6">
            <Text style={{ fontFamily: "WorkSans_600SemiBold" }} className="text-slate-400 text-[10px] uppercase tracking-wider mb-2 ml-1">
              Category
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {["Coffee", "Dining", "Textbooks", "Entertainment"].map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => { triggerHaptic(); setCategory(cat); }}
                  className={`py-2 px-4 rounded-xl border ${
                    category === cat ? "bg-blue-50 border-[#005bbf]" : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <Text style={{ fontFamily: "WorkSans_500Medium" }} className={`text-xs ${category === cat ? "text-[#005bbf] font-bold" : "text-slate-500"}`}>
                    {cat}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            onPress={handleLogTransaction}
            disabled={logLoading}
            className="py-3.5 rounded-xl bg-[#005bbf] active:bg-[#004493] flex-row justify-center items-center"
          >
            {logLoading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white text-sm font-bold">
                Swipe Card & Round-Up
              </Text>
            )}
          </Pressable>
        </View>

        {/* Recent Transactions List */}
        <View style={styles.card} className="bg-white border border-slate-100 rounded-3xl p-5 mb-8 shadow-sm">
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-base font-bold mb-4">
            Recent Purchases
          </Text>
          {loading && transactions.length === 0 ? (
            <ActivityIndicator size="small" color="#005bbf" />
          ) : transactions.length === 0 ? (
            <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-400 text-xs italic text-center py-4">
              No recent transactions. Swipe your card above!
            </Text>
          ) : (
            transactions.map((t) => {
              const date = new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              return (
                <View key={t.trans_id} className="flex-row justify-between items-center py-3 border-b border-slate-50 last:border-b-0">
                  <View>
                    <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-800 text-sm font-bold">
                      {t.merchant || t.description}
                    </Text>
                    <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-400 text-[10px] mt-0.5">
                      {t.category} • {date}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-600 text-sm font-bold">
                    -₹{Number(Math.abs(t.amount)).toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* AI Suggestion Bottom Sheet Modal */}
      <Modal visible={showNegotiator} transparent animationType="slide">
        <View style={styles.modalOverlay} className="flex-1 justify-end">
          <View style={styles.sheet} className="bg-white rounded-t-3xl pt-2 pb-10 px-margin-mobile">
            {/* Drag Handle */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

            {/* Header */}
            <View className="flex-row items-center space-x-4 mb-6">
              <View className="w-14 h-14 bg-black rounded-2xl items-center justify-center shadow-md p-2">
                <Image 
                  source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuACQfKpwZO8RAqE1VLCIJiLVKgwJf2oRf94_rrHNSwC3XvInNrniWhDA_SxpsdtUGKsF3EJ8nM527_KaeJgY4qxG0LHeOktye1pnWE2QTSWK2s8O-AxcwWpsozhJTy0iSS_34j1_91NXBNgOYRv1jVMuJ7ys9-GUx4DosHmJ5ngX9BfcGfdwFhYW2WQh81L29pNUdCKLKW1bdM4y9EeTWzCqLps7RzgUTcj2fXMlyQssbq7yBZ-dVVJ" }}
                  style={{ width: "100%", height: "100%", resizeMode: "contain" }}
                />
              </View>
              <View>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-lg text-slate-800 font-bold">
                  Netflix Subscription
                </Text>
                <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-sm text-slate-500">
                  ₹649/mo billed on August 12
                </Text>
              </View>
            </View>

            {/* AI Insight Box */}
            <View className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
              <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-sm text-blue-900 leading-relaxed">
                "Struggling with your Laptop goal? Try pausing Netflix for a month. You'll reach your active goals much faster."
              </Text>
            </View>

            {/* Comparison info */}
            <View className="flex-row space-x-3 mb-8">
              <View className="flex-1 p-4 rounded-xl bg-blue-50/50 border border-blue-100/50 relative">
                <View className="absolute -top-2.5 right-2 bg-[#006d2a] px-2 py-0.5 rounded-full">
                  <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[8px] text-white uppercase font-bold">
                    Suggested
                  </Text>
                </View>
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-blue-600 uppercase mb-1">
                  Pause Subscription
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-blue-900 leading-snug font-bold">
                  Goal in 18 days
                </Text>
              </View>

              <View className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-slate-400 uppercase mb-1">
                  Keep Subscription
                </Text>
                <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-slate-650 leading-snug font-bold">
                  Goal in 30 days
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="space-y-3">
              <Pressable
                onPress={() => {
                  triggerHaptic();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setShowNegotiator(false);
                  Alert.alert(
                    "Subscription Paused",
                    "SpareChange AI has scheduled a pause for your Netflix subscription. Your Laptop goal is now estimated in 18 days!"
                  );
                }}
                className="w-full h-12 rounded-full bg-[#005bbf] items-center justify-center"
              >
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white text-sm font-bold">
                  Pause Subscription
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  triggerHaptic();
                  setShowNegotiator(false);
                }}
                className="w-full py-3 items-center justify-center"
              >
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-slate-500 text-sm font-semibold">
                  Not Now
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  }
});

export default HomeScreen;
