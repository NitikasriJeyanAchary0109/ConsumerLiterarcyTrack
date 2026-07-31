import React, { ReactNode } from "react";
import { View } from "react-native";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <View className={`bg-slate-800 border border-slate-700/80 rounded-2xl p-5 shadow-lg my-2 ${className}`}>
      {children}
    </View>
  );
};

export default Card;
