import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Card } from "./Card";

interface UploadCardProps {
  title: string;
  description: string;
  buttonText: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  accentColor?: string; // e.g. '#6366f1' or '#10b981'
  children?: ReactNode;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  title,
  description,
  buttonText,
  onPress,
  loading = false,
  disabled = false,
  accentColor = "#6366f1",
  children,
}) => {
  return (
    <Card className="my-3 border border-slate-700/60 p-6">
      <View className="flex-row items-center mb-3">
        {/* Colorful accent indicator dot */}
        <View 
          className="w-3 h-3 rounded-full mr-3" 
          style={{ backgroundColor: accentColor }}
        />
        <Text className="text-slate-100 text-lg font-bold">{title}</Text>
      </View>
      
      <Text className="text-slate-400 text-xs leading-relaxed mb-4">
        {description}
      </Text>

      {/* Renders children elements (e.g. selected file info) if provided */}
      {children && <View className="mb-4">{children}</View>}
      
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        className="w-full py-3.5 px-6 rounded-xl flex-row justify-center items-center"
        style={{
          backgroundColor: disabled || loading ? `${accentColor}70` : accentColor,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <Text className="text-white font-extrabold text-sm">{buttonText}</Text>
        )}
      </TouchableOpacity>
    </Card>
  );
};

export default UploadCard;
