import React from "react";
import { View, Text } from "react-native";

interface CategoryBadgeProps {
  category: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  const normalizedCategory = category.toLowerCase().trim();

  let badgeColorClasses = "bg-slate-500/10 text-slate-400 border-slate-500/20";
  let displayCategory = category;

  if (normalizedCategory.includes("food") || normalizedCategory.includes("dining") || normalizedCategory.includes("zomato") || normalizedCategory.includes("swiggy")) {
    badgeColorClasses = "bg-orange-500/10 text-orange-400 border-orange-500/20";
    displayCategory = "Food & Dining";
  } else if (normalizedCategory.includes("bill") || normalizedCategory.includes("rent") || normalizedCategory.includes("tuition") || normalizedCategory.includes("subscription")) {
    badgeColorClasses = "bg-red-500/10 text-red-400 border-red-500/20";
    displayCategory = "Bills & Rent";
  } else if (normalizedCategory.includes("shop") || normalizedCategory.includes("gadget") || normalizedCategory.includes("clothing") || normalizedCategory.includes("ecommerce")) {
    badgeColorClasses = "bg-purple-500/10 text-purple-400 border-purple-500/20";
    displayCategory = "Shopping";
  } else if (normalizedCategory.includes("transport") || normalizedCategory.includes("cab") || normalizedCategory.includes("uber") || normalizedCategory.includes("travel")) {
    badgeColorClasses = "bg-blue-500/10 text-blue-400 border-blue-500/20";
    displayCategory = "Transport";
  } else if (normalizedCategory.includes("salary") || normalizedCategory.includes("savings") || normalizedCategory.includes("income") || normalizedCategory.includes("refund")) {
    badgeColorClasses = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    displayCategory = "Income & Savings";
  } else {
    // Check if category is one of the standard chips
    if (category.toLowerCase() === "other") {
      badgeColorClasses = "bg-slate-500/10 text-slate-400 border-slate-500/20";
      displayCategory = "Other";
    }
  }

  return (
    <View className={`px-2 py-0.5 rounded-md border ${badgeColorClasses.split(" ")[0]} ${badgeColorClasses.split(" ")[2]} flex-row items-center self-start`}>
      <Text className={`text-[10px] font-bold tracking-wide uppercase ${badgeColorClasses.split(" ")[1]}`}>
        {displayCategory}
      </Text>
    </View>
  );
};

export default CategoryBadge;
