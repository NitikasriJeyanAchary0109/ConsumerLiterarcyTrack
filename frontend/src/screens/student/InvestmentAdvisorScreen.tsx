import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  investmentCard?: {
    fundName: string;
    risk: string;
    returnRate: string;
  };
}

const INITIAL_CHAT: ChatMessage[] = [
  {
    id: "c-1",
    sender: "user",
    text: "I have ₹5,000 extra this month. Where should I start investing with low risk?",
    time: "4:30 PM"
  },
  {
    id: "c-2",
    sender: "ai",
    text: "That's a great start! For low risk and steady growth, index funds are a fantastic choice. Based on your profile, here's a top recommendation:",
    time: "4:31 PM",
    investmentCard: {
      fundName: "HDFC Nifty 50 Index Fund",
      risk: "Low Risk",
      returnRate: "12.5% p.a."
    }
  }
];

export const InvestmentAdvisorScreen = ({ navigation }: { navigation: any }) => {
  const [chatList, setChatList] = useState<ChatMessage[]>(INITIAL_CHAT);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSendMsg = (text: string) => {
    if (!text.trim()) return;
    triggerHaptic();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatList((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      let replyText = "Index funds track a market index. The HDFC Nifty 50 index fund is highly diversified across the 50 largest Indian companies, minimizing singular corporate risk.";
      if (text.toLowerCase().includes("how do index funds work")) {
        replyText = "Index funds pool money to purchase shares matching a specific index, like the Nifty 50. Since they track the market passively, they have very low management costs.";
      } else if (text.toLowerCase().includes("nifty 50")) {
        replyText = "Nifty 50 represents the weighted average of the top 50 blue-chip companies listed on the National Stock Exchange of India, spanning multiple sectors.";
      } else if (text.toLowerCase().includes("other low-risk")) {
        replyText = "Other secure options include Debt Mutual Funds, Government Treasury Bonds, and High-Yield Savings Accounts (FNDs) yielding 6-8% yearly.";
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatList((prev) => [...prev, aiMsg]);
    }, 1800);
  };

  const handleInvest = (fund: string) => {
    triggerHaptic();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Investment Initialized",
      `Would you like to allocate ₹5,000 into the ${fund} directly from your SpareChange savings balance?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm Buy", onPress: () => Alert.alert("Success", `Allocated ₹5,000 to ${fund}!`) }
      ]
    );
  };

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chatList, isTyping]);

  return (
    <SafeAreaView className="flex-1 bg-[#f7f9ff]">
      {/* Header Bar */}
      <View className="flex-row justify-between items-center px-margin-mobile py-stack-md bg-white border-b border-slate-100">
        <View className="flex-row items-center space-x-3">
          <Pressable 
            onPress={() => {
              triggerHaptic();
              navigation.goBack();
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
            className="p-1"
          >
            <MaterialIcons name="arrow-back" size={24} color="#181c20" />
          </Pressable>
          <View className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRiNsBsxuF-y74aQn1qcU6x9NRjKbrgRUfQLKGmGlur39gJlmLWfDUuLfOhlE6Uoj9CQIPSyN856-Bvw1FSeHV1OfqslQeKRauRSLk6OKk6KyX-HLFEjFu9wd7y7niYgZwcXHv4X_NcrPX8i54lp_NImfHGRXEh2PyU86bGyDnfoubidFueQy6u2vYBmdeCl9e2CAC7xc-NSdk2ERSjVgLKINma9k5gMyZQlyC6bO2ph22SkosPon7" }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-base text-on-surface">
            SpareChange AI
          </Text>
        </View>
        <Pressable 
          onPress={triggerHaptic}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          className="p-1"
        >
          <MaterialIcons name="settings" size={20} color="#5c5f60" />
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Chat Stream scroll view */}
        <ScrollView 
          ref={scrollRef}
          className="flex-1 px-margin-mobile"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 150 }}
        >
          {chatList.map((c) => {
            const isAI = c.sender === "ai";
            return (
              <View 
                key={c.id} 
                className={`flex-col mb-5 ${isAI ? "items-start" : "items-end"}`}
              >
                {/* Text bubble */}
                <View 
                  style={[
                    styles.bubble,
                    isAI ? styles.bubbleAI : styles.bubbleUser
                  ]}
                  className="p-4 rounded-2xl max-w-[85%]"
                >
                  <Text 
                    style={{ fontFamily: "WorkSans_400Regular" }} 
                    className={`text-sm leading-relaxed ${isAI ? "text-on-surface" : "text-white"}`}
                  >
                    {c.text}
                  </Text>
                </View>

                {/* Investment structured pick card */}
                {c.investmentCard && (
                  <View 
                    style={styles.card} 
                    className="bg-white border border-outline-variant/30 rounded-2xl p-4 w-[85%] mt-2 flex-col space-y-3"
                  >
                    <View className="flex-row justify-between items-start">
                      <View className="flex-1">
                        <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-ob-secondary uppercase tracking-wider">
                          Top Pick
                        </Text>
                        <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-on-surface">
                          {c.investmentCard.fundName}
                        </Text>
                      </View>
                      <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[9px] text-tertiary uppercase font-bold">
                          {c.investmentCard.risk}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-end justify-between border-t border-slate-100 pt-3">
                      <View>
                        <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-surface-variant">
                          Expected Return
                        </Text>
                        <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-base text-tertiary">
                          {c.investmentCard.returnRate}
                        </Text>
                      </View>
                      
                      <Pressable
                        onPress={() => handleInvest(c.investmentCard!.fundName)}
                        style={({ pressed }) => [
                          styles.investBtn,
                          { opacity: pressed ? 0.8 : 1 }
                        ]}
                        className="bg-primary rounded-full px-4 py-2"
                      >
                        <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-white">
                          Invest Now
                        </Text>
                      </Pressable>
                    </View>

                    <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[9px] text-on-surface-variant/70 leading-4">
                      Disclaimer: Market risks apply. Past performance is not an indicator of future results.
                    </Text>
                  </View>
                )}

                <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[9px] text-on-surface-variant mt-1 px-1">
                  {c.time}
                </Text>
              </View>
            );
          })}

          {isTyping && (
            <View className="flex-row items-center space-x-1.5 ml-2 mt-1">
              <View className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
              <View className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ marginHorizontal: 2 }} />
              <View className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
            </View>
          )}
        </ScrollView>

        {/* Input Bar & Actions (Floating bottom panel) */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-margin-mobile">
          {/* Quick Action Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row pb-3">
            {[
              "How do index funds work?",
              "What is Nifty 50?",
              "Other low-risk options?"
            ].map((chip) => (
              <Pressable
                key={chip}
                onPress={() => handleSendMsg(chip)}
                style={({ pressed }) => [{ transform: [{ scale: pressed ? 0.95 : 1 }] }]}
                className="px-4 py-2 border border-outline-variant bg-slate-50/50 rounded-full mr-2"
              >
                <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-xs text-on-surface-variant">
                  {chip}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Input Bar */}
          <View className="flex-row items-center space-x-3">
            <View className="flex-1 flex-row items-center bg-slate-100 rounded-full px-4 border border-slate-200/50">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask about stocks, funds, or savings..."
                placeholderTextColor="#727785"
                style={{ fontFamily: "WorkSans_400Regular", flex: 1, paddingVertical: 10 }}
                className="text-sm text-on-surface"
              />
            </View>
            
            <Pressable
              onPress={() => handleSendMsg(inputText)}
              disabled={!inputText.trim()}
              style={[
                styles.sendBtn,
                { backgroundColor: inputText.trim() ? "#005bbf" : "#adc7ff" }
              ]}
              className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
            >
              <MaterialIcons name="send" size={18} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bubble: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  bubbleAI: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e8eaed",
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: "#1a73e8",
    borderBottomRightRadius: 4,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  investBtn: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  sendBtn: {
    alignItems: "center",
    justifyContent: "center",
  }
});

export default InvestmentAdvisorScreen;
