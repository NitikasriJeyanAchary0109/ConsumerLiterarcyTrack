import React, { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, SafeAreaView } from "react-native";
import { apiService } from "../../services/api";
import { TransactionRow } from "../../components/TransactionRow";
import { CategoryBadge } from "../../components/CategoryBadge";
import { Card } from "../../components/Card";
import { Transaction } from "../../types";

export const TransactionListScreen = ({ navigation }: { navigation: any }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal detail sheet states
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await apiService.getTransactions();
      setTransactions(res);
    } catch (e: any) {
      console.warn("Failed to load transaction list:", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await apiService.getTransactions();
      setTransactions(res);
    } catch (e: any) {
      console.warn("Failed to refresh transactions:", e.message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter logic
  const filteredTransactions = transactions.filter((t) => {
    // 1. Filter by category
    let matchesCategory = true;
    if (selectedCategory !== "All") {
      const cat = t.category.toLowerCase();
      const sel = selectedCategory.toLowerCase();
      
      // Match normalized category patterns
      if (sel === "food") {
        matchesCategory = cat.includes("food") || cat.includes("dining") || cat.includes("zomato") || cat.includes("swiggy");
      } else if (sel === "bills") {
        matchesCategory = cat.includes("bill") || cat.includes("rent") || cat.includes("tuition") || cat.includes("subscription");
      } else if (sel === "shopping") {
        matchesCategory = cat.includes("shop") || cat.includes("gadget") || cat.includes("clothing") || cat.includes("ecommerce");
      } else if (sel === "transport") {
        matchesCategory = cat.includes("transport") || cat.includes("cab") || cat.includes("uber") || cat.includes("travel");
      } else if (sel === "other") {
        matchesCategory = !["food", "dining", "zomato", "swiggy", "bill", "rent", "tuition", "subscription", "shop", "gadget", "clothing", "ecommerce", "transport", "cab", "uber", "travel", "salary", "savings", "income", "refund"].some(kw => cat.includes(kw));
      }
    }

    // 2. Filter by search text
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || 
      (t.merchant && t.merchant.toLowerCase().includes(query)) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.category && t.category.toLowerCase().includes(query));

    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      {/* Top Header Controls */}
      <View className="px-4 py-3 border-b border-slate-800 flex-row justify-between items-center bg-slate-900">
        <View>
          <Text className="text-slate-100 text-lg font-bold">Transaction History</Text>
          <Text className="text-slate-400 text-xs font-semibold">Verify auto-saving swipes</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("CSVUpload")}
          className="bg-indigo-600 active:bg-indigo-700 py-2 px-3.5 rounded-xl flex-row items-center"
        >
          <Text className="text-white text-xs font-extrabold">Link Statement</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Options */}
      {transactions.length > 0 && (
        <View className="bg-slate-900 py-3 px-4 border-b border-slate-800">
          {/* Search Box */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search merchants, descriptions..."
            placeholderTextColor="#64748B"
            className="bg-slate-800 text-slate-100 px-4 py-2.5 rounded-xl text-xs border border-slate-700/60 mb-3"
          />

          {/* Category Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-x-2">
            {["All", "Food", "Shopping", "Bills", "Transport", "Other"].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                className={`py-1.5 px-3 rounded-lg border ${
                  selectedCategory === cat ? "bg-indigo-600/20 border-indigo-500" : "bg-slate-800 border-slate-700"
                }`}
              >
                <Text className={`text-[10px] font-bold ${selectedCategory === cat ? "text-indigo-400" : "text-slate-400"}`}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Transactions List */}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#4F46E5" />
        }
      >
        {loading && transactions.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : transactions.length === 0 ? (
          /* Empty State Fallback Screen */
          <View className="flex-grow justify-center items-center py-10 px-4">
            <Card className="items-center py-8 w-full">
              <Text className="text-slate-400 text-5xl mb-4">🏦</Text>
              <Text className="text-slate-100 text-lg font-black mb-2 text-center">No Transactions Found</Text>
              <Text className="text-slate-400 text-xs text-center leading-relaxed mb-6 px-4">
                You haven't linked a UPI statement or uploaded bank history yet. Select an option to start tracking.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("CSVUpload")}
                className="bg-indigo-600 active:bg-indigo-700 py-3.5 px-6 rounded-xl w-full flex-row justify-center"
              >
                <Text className="text-white font-extrabold text-sm">Connect Your Bank</Text>
              </TouchableOpacity>
            </Card>
          </View>
        ) : filteredTransactions.length === 0 ? (
          /* Search Empty State */
          <View className="flex-grow justify-center items-center py-20">
            <Text className="text-slate-500 text-sm italic">No transactions match your search/filters.</Text>
          </View>
        ) : (
          filteredTransactions.map((item) => (
            <TransactionRow
              key={item.trans_id}
              transaction={item}
              onPress={() => setSelectedTransaction(item)}
            />
          ))
        )}
      </ScrollView>

      {/* Bottom Sheet Detail Modal */}
      {selectedTransaction && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={selectedTransaction !== null}
          onRequestClose={() => setSelectedTransaction(null)}
        >
          {/* Overlay backdrop */}
          <View className="flex-1 bg-black/60 justify-end">
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={() => setSelectedTransaction(null)} 
              className="flex-grow" 
            />
            
            {/* Sheet contents */}
            <View className="bg-slate-800 border-t border-slate-700 rounded-t-3xl p-6 shadow-2xl">
              <View className="w-12 h-1.5 bg-slate-600 rounded-full self-center mb-6" />

              <View className="flex-row justify-between items-start mb-5">
                <View className="flex-1 mr-3">
                  <Text className="text-slate-100 text-lg font-bold mb-1">
                    {selectedTransaction.merchant || selectedTransaction.description}
                  </Text>
                  <CategoryBadge category={selectedTransaction.category} />
                </View>
                
                <Text 
                  className={`text-xl font-black ${
                    selectedTransaction.type === "credit" || Number(selectedTransaction.amount) > 0
                      ? "text-emerald-400"
                      : "text-red-400"
                  }`}
                >
                  {selectedTransaction.type === "credit" || Number(selectedTransaction.amount) > 0 ? "+" : "-"}$
                  {Math.abs(Number(selectedTransaction.amount)).toFixed(2)}
                </Text>
              </View>

              <View className="bg-slate-900 border border-slate-700/60 p-4 rounded-2xl mb-6">
                <View className="flex-row justify-between py-2 border-b border-slate-800">
                  <Text className="text-slate-400 text-xs">Transaction ID</Text>
                  <Text className="text-slate-300 text-xs font-semibold">#{selectedTransaction.trans_id}</Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-slate-800">
                  <Text className="text-slate-400 text-xs">Date & Time</Text>
                  <Text className="text-slate-300 text-xs font-semibold">
                    {new Date(selectedTransaction.date).toLocaleString()}
                  </Text>
                </View>

                <View className="flex-row justify-between py-2 border-b border-slate-800">
                  <Text className="text-slate-400 text-xs">Transaction Type</Text>
                  <Text className="text-slate-300 text-xs font-semibold uppercase">{selectedTransaction.type}</Text>
                </View>

                <View className="flex-row justify-between py-2">
                  <Text className="text-slate-400 text-xs">Description</Text>
                  <Text className="text-slate-300 text-xs font-semibold max-w-[60%] text-right">
                    {selectedTransaction.description || "N/A"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedTransaction(null)}
                className="bg-slate-700 active:bg-slate-600 py-3.5 rounded-xl flex-row justify-center"
              >
                <Text className="text-white font-extrabold text-sm">Close Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default TransactionListScreen;
