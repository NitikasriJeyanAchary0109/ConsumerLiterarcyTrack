import React from "react";
import { TouchableOpacity, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  className = "",
}) => {
  let buttonStyle = "py-3.5 px-6 rounded-xl flex-row justify-center items-center my-2 ";
  let textStyle = "font-bold text-base ";

  if (variant === "primary") {
    buttonStyle += disabled ? "bg-indigo-400" : "bg-indigo-600 active:bg-indigo-700";
    textStyle += "text-white";
  } else if (variant === "secondary") {
    buttonStyle += disabled ? "bg-emerald-400" : "bg-emerald-600 active:bg-emerald-700";
    textStyle += "text-white";
  } else if (variant === "outline") {
    buttonStyle += "border border-indigo-600 bg-transparent active:bg-indigo-50/10";
    textStyle += "text-indigo-400";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${buttonStyle} ${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#4F46E5" : "#FFF"} size="small" />
      ) : (
        <Text className={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
