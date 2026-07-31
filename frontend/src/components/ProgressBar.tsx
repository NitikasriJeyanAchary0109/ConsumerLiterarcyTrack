import React from "react";
import { View, Text } from "react-native";

interface ProgressBarProps {
  value: number;
  target: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, target, label }) => {
  const percentage = target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0;
  
  return (
    <View className="my-2.5">
      <View className="flex-row justify-between items-center mb-1">
        {label && <Text className="text-slate-300 text-sm font-medium">{label}</Text>}
        <Text className="text-emerald-400 text-xs font-semibold">{percentage}%</Text>
      </View>
      
      {/* Outer track */}
      <View className="w-full h-3.5 bg-slate-700/60 rounded-full overflow-hidden">
        {/* Fill */}
        <View 
          className="h-full bg-emerald-500 rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </View>
      
      <View className="flex-row justify-between items-center mt-1">
        <Text className="text-slate-400 text-xs font-medium">${value.toFixed(2)} saved</Text>
        <Text className="text-slate-400 text-xs font-medium">Target: ${target.toFixed(2)}</Text>
      </View>
    </View>
  );
};

export default ProgressBar;
