import React from "react";
import { View, Text, ScrollView } from "react-native";
import { ChartWrapper } from "../../components/ChartWrapper";

export const TrendsScreen = () => {
  // Mock monthly savings growth indicators
  const monthlySavingsLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const monthlySavingsData = [120, 250, 480, 710, 1050, 1420]; // cumulative dollars saved

  // Mock savings category distributions
  const categoryLabels = ["Coffee", "Dining", "Books", "Cinema"];
  const categoryData = [450, 310, 180, 240];

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 }}>
      <View className="mb-6">
        <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Visual Analytics</Text>
        <Text className="text-slate-100 text-2xl font-black">Cohort Trends</Text>
      </View>

      {/* Line Chart */}
      <ChartWrapper
        title="Aggregate Savings Growth ($)"
        labels={monthlySavingsLabels}
        data={monthlySavingsData}
        type="line"
        suffix=""
      />

      {/* Bar Chart */}
      <ChartWrapper
        title="Micro-savings By Category ($)"
        labels={categoryLabels}
        data={categoryData}
        type="bar"
        suffix=""
      />

      <View className="h-10" />
    </ScrollView>
  );
};

export default TrendsScreen;
