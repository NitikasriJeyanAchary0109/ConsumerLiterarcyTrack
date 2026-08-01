import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Transaction } from "../types";
import { CategoryBadge } from "./CategoryBadge";

interface TransactionRowProps {
  transaction: Transaction;
  onPress: () => void;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, onPress }) => {
  // Format Date to a clean user-facing format (e.g. Jul 31, 2026)
  const formattedDate = new Date(transaction.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  // Check if credit (income) or debit (spend)
  // UPI statements usually define transaction type or have positive/negative amounts.
  const isCredit = transaction.type === "credit" || Number(transaction.amount) > 0;
  const displayAmount = Math.abs(Number(transaction.amount)).toFixed(2);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-white border border-outline-variant rounded-xl p-4 my-1.5 flex-row justify-between items-center"
    >
      <View className="flex-1 mr-4">
        {/* Description / Merchant */}
        <Text className="text-on-surface text-sm font-semibold mb-1" numberOfLines={1}>
          {transaction.merchant || transaction.description}
        </Text>
        
        <View className="flex-row items-center space-x-2">
          {/* Category badge */}
          <CategoryBadge category={transaction.category} />
          
          <Text className="text-on-surface-variant text-[10px] ml-2">
            {formattedDate}
          </Text>
        </View>
      </View>
      
      {/* Transaction Amount */}
      <View className="items-end">
        <Text 
          className={`text-sm font-extrabold ${
            isCredit ? "text-tertiary" : "text-ob-error"
          }`}
        >
          {isCredit ? "+" : "-"}${displayAmount}
        </Text>
        <Text className="text-on-surface-variant text-[9px] uppercase font-bold mt-0.5">
          {transaction.type || "debit"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default TransactionRow;
