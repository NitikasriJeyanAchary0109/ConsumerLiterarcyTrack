import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart, BarChart } from "react-native-chart-kit";

interface ChartWrapperProps {
  title: string;
  labels: string[];
  data: number[];
  type?: "line" | "bar";
  suffix?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  labels,
  data,
  type = "line",
  suffix = "",
}) => {
  const screenWidth = Dimensions.get("window").width - 40; // accounted padding
  
  const chartData = {
    labels: labels.length > 0 ? labels : ["Jan", "Feb", "Mar"],
    datasets: [
      {
        data: data.length > 0 ? data : [0, 0, 0],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`, // Savings Emerald
        strokeWidth: 3
      }
    ]
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`, // Slate 400
    labelColor: (opacity = 1) => `rgba(248, 250, 252, ${opacity})`, // Slate 50
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: "5",
      strokeWidth: "2",
      stroke: "#10b981"
    }
  };

  return (
    <View className="my-2.5 bg-white border border-outline-variant rounded-2xl p-4 shadow-sm">
      <Text className="text-on-surface text-base font-bold mb-3">{title}</Text>
      
      <View className="items-center justify-center">
        {type === "line" ? (
          <LineChart
            data={chartData}
            width={screenWidth}
            height={200}
            yAxisSuffix={suffix}
            chartConfig={chartConfig}
            bezier
            style={{
              marginVertical: 8,
              borderRadius: 12
            }}
          />
        ) : (
          <BarChart
            data={chartData}
            width={screenWidth}
            height={200}
            yAxisLabel=""
            yAxisSuffix={suffix}
            chartConfig={chartConfig}
            style={{
              marginVertical: 8,
              borderRadius: 12
            }}
          />
        )}
      </View>
    </View>
  );
};

export default ChartWrapper;
