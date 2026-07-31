import React, { ReactNode } from "react";
import { View, StyleSheet } from "react-native";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <View style={styles.card} className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm my-2 ${className}`}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  }
});

export default Card;
