import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TextInput, Alert, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { apiService } from "../../services/api";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ProgressBar } from "../../components/ProgressBar";
import { Goal } from "../../types";

export const GoalsScreen = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New goal input states
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const res = await apiService.getGoals();
      setGoals(res);
    } catch (e: any) {
      console.warn("Failed to load goals:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGoals();
    setRefreshing(false);
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleCreateGoal = async () => {
    if (!title || !target) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const numericTarget = parseFloat(target);
    if (isNaN(numericTarget) || numericTarget <= 0) {
      Alert.alert("Error", "Please enter a valid positive target amount.");
      return;
    }

    setCreateLoading(true);
    try {
      await apiService.createGoal({
        goal_name: title,
        target: numericTarget,
      });
      Alert.alert("Success", "New savings target established!");
      
      // Reset form
      setTitle("");
      setTarget("");
      
      // Reload list
      loadGoals();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to create savings goal.");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-900 px-4 pt-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
      }
    >
      <View className="mb-6">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Automated Savings</Text>
        <Text className="text-slate-100 text-2xl font-black">Active Goals</Text>
      </View>

      {/* Create a Goal */}
      <Card className="mb-6">
        <Text className="text-slate-100 text-lg font-bold mb-4">Set up a new savings bucket</Text>
        
        <View className="mb-3">
          <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Goal Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Spring Break flight or Emergency buffer"
            placeholderTextColor="#64748B"
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-xs"
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider mb-1">Target Amount ($)</Text>
          <TextInput
            value={target}
            onChangeText={setTarget}
            placeholder="e.g. 500.00"
            placeholderTextColor="#64748B"
            keyboardType="decimal-pad"
            className="bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-3 text-xs"
          />
        </View>

        <Button 
          title="Create Savings Goal" 
          onPress={handleCreateGoal} 
          loading={createLoading} 
          variant="primary"
          className="py-3"
        />
      </Card>

      {/* Goal Listing */}
      <View className="mb-10">
        <Text className="text-slate-200 text-lg font-bold mb-4">Your Buckets</Text>
        
        {loading && goals.length === 0 ? (
          <ActivityIndicator size="small" color="#4F46E5" />
        ) : goals.length === 0 ? (
          <Card className="items-center py-6">
            <Text className="text-slate-400 text-xs italic text-center">
              No savings buckets configured. Add one above to activate automated transaction round-ups!
            </Text>
          </Card>
        ) : (
          goals.map((g) => (
            <Card key={g.goal_id} className="mb-4">
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-100 text-base font-bold">{g.goal_name}</Text>
                <View className="bg-emerald-500/10 py-1 px-2.5 rounded-full border border-emerald-500/20">
                  <Text className="text-emerald-400 text-[10px] uppercase font-bold">active</Text>
                </View>
              </View>

              <ProgressBar value={Number(g.saved)} target={Number(g.target)} />
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default GoalsScreen;
