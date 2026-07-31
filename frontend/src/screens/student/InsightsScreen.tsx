import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { apiService } from "../../services/api";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { Goal } from "../../types";

export const InsightsScreen = () => {
  // Goal state for Dream Engine selection
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(false);

  // 1. Stress Meter States
  const [stressLoading, setStressLoading] = useState(false);
  const [stressReport, setStressReport] = useState<string | null>(null);

  // 2. Negotiator States
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemCategory, setItemCategory] = useState("Gadgets");
  const [negLoading, setNegLoading] = useState(false);
  const [negReport, setNegReport] = useState<string | null>(null);

  // 3. Dream Engine States
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [monthlyContrib, setMonthlyContrib] = useState("");
  const [forecastLoading, setForecastLoading] = useState(false);
  const [forecastReport, setForecastReport] = useState<string | null>(null);

  const fetchGoals = async () => {
    try {
      setLoadingGoals(true);
      const res = await apiService.getGoals();
      setGoals(res);
      if (res.length > 0) {
        setSelectedGoalId(res[0].goal_id);
      }
    } catch (e: any) {
      console.warn("Goals load failed for insights selector:", e.message);
    } finally {
      setLoadingGoals(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  // Handlers
  const handleStressAnalysis = async () => {
    setStressLoading(true);
    setStressReport(null);
    try {
      const response = await apiService.getStressMeter(30);
      setStressReport(response.ai_summary);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to analyze cash flow stress.");
    } finally {
      setStressLoading(false);
    }
  };

  const handleNegotiate = async () => {
    if (!itemName || !itemPrice) {
      Alert.alert("Error", "Please fill in item details.");
      return;
    }

    const priceNum = parseFloat(itemPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert("Error", "Invalid item price.");
      return;
    }

    setNegLoading(true);
    setNegReport(null);
    try {
      const response = await apiService.negotiatePurchase({
        item_name: itemName,
        item_price: priceNum,
        category: itemCategory,
      });
      setNegReport(response.response);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Negotiation request failed.");
    } finally {
      setNegLoading(false);
    }
  };

  const handleForecast = async () => {
    if (!selectedGoalId) {
      Alert.alert("Error", "Configure at least one active goal first.");
      return;
    }
    if (!monthlyContrib) {
      Alert.alert("Error", "Enter a monthly contribution.");
      return;
    }

    const contribNum = parseFloat(monthlyContrib);
    if (isNaN(contribNum) || contribNum < 0) {
      Alert.alert("Error", "Invalid monthly contribution.");
      return;
    }

    setForecastLoading(true);
    setForecastReport(null);
    try {
      const response = await apiService.forecastSavings({
        goal_id: selectedGoalId,
        monthly_contribution: contribNum,
      });
      setForecastReport(response.response);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Dream Engine simulation failed.");
    } finally {
      setForecastLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-900 px-4 pt-4 pb-12">
      <View className="mb-6">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">AI Modules</Text>
        <Text className="text-slate-100 text-2xl font-black">Financial Insights</Text>
      </View>

      {/* 1. Stress Wellness Meter */}
      <Card className="mb-6">
        <Text className="text-slate-100 text-lg font-bold mb-2">Wellness Meter</Text>
        <Text className="text-slate-400 text-xs mb-4">
          Analyzes your transaction logs to assess cash flow volatility.
        </Text>

        {stressReport && (
          <View className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl mb-4">
            <Text className="text-slate-200 text-sm italic">"{stressReport}"</Text>
          </View>
        )}

        <Button
          title="Run Stress Analysis"
          onPress={handleStressAnalysis}
          loading={stressLoading}
          variant="primary"
          className="py-2.5"
        />
      </Card>

      {/* 2. Purchase Negotiator */}
      <Card className="mb-6">
        <Text className="text-slate-100 text-lg font-bold mb-2">Purchase Negotiator</Text>
        <Text className="text-slate-400 text-xs mb-4">
          Impulse buy check? Put it up to a reality check before you check out.
        </Text>

        <View className="flex-row gap-x-3 mb-3">
          <View className="flex-1">
            <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Item / Service Name</Text>
            <TextInput
              value={itemName}
              onChangeText={setItemName}
              placeholder="e.g. Mechanical Keyboard"
              placeholderTextColor="#64748B"
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs"
            />
          </View>
          <View className="w-1/3">
            <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Price ($)</Text>
            <TextInput
              value={itemPrice}
              onChangeText={setItemPrice}
              placeholder="120.00"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-3.5 py-2 text-xs"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-slate-400 text-[10px] uppercase font-bold mb-2">Category</Text>
          <View className="flex-row gap-x-2">
            {["Gadgets", "Clothing", "Fast Food", "Concerts"].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setItemCategory(cat)}
                className={`py-1.5 px-3 rounded-lg border ${
                  itemCategory === cat ? "bg-indigo-600/20 border-indigo-500" : "bg-slate-900 border-slate-700"
                }`}
              >
                <Text className={`text-[10px] font-semibold ${itemCategory === cat ? "text-indigo-400" : "text-slate-400"}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {negReport && (
          <View className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl mb-4">
            <Text className="text-slate-200 text-sm italic">"{negReport}"</Text>
          </View>
        )}

        <Button
          title="Should I Buy This?"
          onPress={handleNegotiate}
          loading={negLoading}
          variant="secondary"
          className="py-2.5"
        />
      </Card>

      {/* 3. Dream Engine (Forecast) */}
      <Card className="mb-12">
        <Text className="text-slate-100 text-lg font-bold mb-2">Dream Engine</Text>
        <Text className="text-slate-400 text-xs mb-4">
          Predicts savings schedules mapping round-ups alongside manual contributions.
        </Text>

        {loadingGoals ? (
          <ActivityIndicator color="#4F46E5" size="small" />
        ) : goals.length === 0 ? (
          <Text className="text-slate-400 text-xs italic text-center py-2 mb-2">
            Configure an active goal in the Goals tab first.
          </Text>
        ) : (
          <View className="mb-4">
            <Text className="text-slate-400 text-[10px] uppercase font-bold mb-2">Select Savings Goal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-x-2 mb-3">
              {goals.map((g) => (
                <TouchableOpacity
                  key={g.goal_id}
                  onPress={() => setSelectedGoalId(g.goal_id)}
                  className={`py-2 px-3 rounded-lg border ${
                    selectedGoalId === g.goal_id ? "bg-emerald-600/25 border-emerald-500" : "bg-slate-900 border-slate-700"
                  }`}
                >
                  <Text className={`text-xs font-semibold ${selectedGoalId === g.goal_id ? "text-emerald-400" : "text-slate-400"}`}>
                    {g.goal_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Monthly Contribution ($)</Text>
            <TextInput
              value={monthlyContrib}
              onChangeText={setMonthlyContrib}
              placeholder="e.g. 50.00"
              placeholderTextColor="#64748B"
              keyboardType="decimal-pad"
              className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-xs mb-4"
            />

            {forecastReport && (
              <View className="bg-slate-900 border border-slate-700/80 p-4 rounded-xl mb-4">
                <Text className="text-slate-200 text-sm italic">"{forecastReport}"</Text>
              </View>
            )}

            <Button
              title="Simulate Savings Roadmap"
              onPress={handleForecast}
              loading={forecastLoading}
              variant="primary"
              className="py-2.5"
            />
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

export default InsightsScreen;
