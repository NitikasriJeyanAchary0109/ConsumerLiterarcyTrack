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
  Dimensions
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay
} from "react-native-reanimated";

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  time: string;
  card?: {
    title: string;
    saved: number;
    target: number;
    quote: string;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "m-1",
    sender: "ai",
    text: "Hi Alex! 👋 I've been looking at your transactions. You saved ₹1,245 in spare change this week just by rounding up your purchases. That's 15% more than last week!",
    time: "9:41 AM"
  },
  {
    id: "m-2",
    sender: "user",
    text: "That's awesome! How close am I to my New Laptop goal?",
    time: "9:42 AM"
  },
  {
    id: "m-3",
    sender: "ai",
    text: "You're currently at 68% of your ₹50,000 goal. Based on your current savings rate, you'll reach it by October 12th.",
    time: "9:43 AM",
    card: {
      title: "New Laptop",
      saved: 34000,
      target: 50000,
      quote: "Keep the momentum! Skipping one ₹150 latte a week gets you there 2 weeks earlier."
    }
  }
];

export const CoachScreen = ({ navigation }: { navigation: any }) => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    triggerHaptic();

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    
    // Simulate AI response typing trigger
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      let replyText = "I can definitely help with that! Let's optimize your savings rule to reach your goal faster.";
      if (text.toLowerCase().includes("how am i doing")) {
        replyText = "Excellent! You're saving an average of ₹140 per week. You are in the top 10% of campus savers.";
      } else if (text.toLowerCase().includes("tips")) {
        replyText = "Consider setting up a weekend boost multiplier of 2x on roundups. It's a low-impact way to save an extra ₹300 a month!";
      } else if (text.toLowerCase().includes("coffee")) {
        replyText = "You spent ₹620 on coffee this week. Pausing one Starbucks order would push ₹120 directly to your Laptop goal.";
      }

      const aiReply: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: "ai",
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 2000);
  };

  // Scroll bottom helper
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isTyping]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Top App Bar */}
      <View className="flex-row justify-between items-center px-margin-mobile py-stack-md border-b border-slate-100 bg-[#f7f9ff]">
        <View className="flex-row items-center space-x-3">
          <View className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAl5Bsd2eJcZMTQGyELcNvmtDIjn8qTArYN-rTiGarrJK-QFNcIdqxsm6-sgc3QS96AgFJF0PfxmsCJifIfzF-3eJFskeKv4zmuPsiN6xbUE-AmmLaPau6OkFs_YZVbvPfmVsIhYiZXsii6OaAexE539lm_xLP0VEwy0mloK6bvsNTzZB0Rdf6fv0v3z_F211x6OMw4LCKY4zMt_aHNmuadnC6Pl5HaQjRGnO2_zKWeUXskQ2r06t6a" }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
          <View className="flex-col">
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-base text-on-surface leading-none">
              SpareChange AI
            </Text>
            <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-tertiary mt-0.5">
              Online
            </Text>
          </View>
        </View>
        <Pressable 
          onPress={triggerHaptic}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 border border-slate-100"
        >
          <MaterialIcons name="settings" size={20} color="#181c20" />
        </Pressable>
      </View>

      {/* Main Chat Canvas */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-margin-mobile"
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 150 }}
        >
          {/* Day Label */}
          <View className="items-center my-4">
            <View className="bg-slate-100 px-3.5 py-1 rounded-full border border-slate-200/30">
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-on-surface-variant uppercase font-semibold">
                Today
              </Text>
            </View>
          </View>

          {/* Messages */}
          {messages.map((m) => {
            const isAI = m.sender === "ai";
            return (
              <View 
                key={m.id} 
                className={`flex-col mb-5 ${isAI ? "items-start" : "items-end"}`}
              >
                {/* Text Bubble */}
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
                    {m.text}
                  </Text>
                </View>

                {/* Inline Card for Goal Info */}
                {m.card && (
                  <View 
                    style={styles.card} 
                    className="bg-white border border-outline-variant/30 p-4 rounded-2xl shadow-sm w-[85%] mt-2"
                  >
                    <View className="flex-row justify-between items-center mb-3">
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-on-surface">
                        {m.card.title}
                      </Text>
                      <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-xs text-ob-primary">
                        ₹{m.card.saved.toLocaleString("en-IN")} / ₹{m.card.target.toLocaleString("en-IN")}
                      </Text>
                    </View>
                    
                    <View className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <View 
                        style={{ width: `${Math.round((m.card.saved / m.card.target) * 100)}%` }}
                        className="h-full bg-primary rounded-full"
                      />
                    </View>
                    
                    <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-surface-variant italic mt-3 leading-relaxed">
                      "{m.card.quote}"
                    </Text>
                  </View>
                )}

                {/* Timestamp */}
                <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[9px] text-on-surface-variant mt-1 px-1">
                  {m.time}
                </Text>
              </View>
            );
          })}

          {/* Typing Indicator */}
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
              "How am I doing?",
              "Savings tips",
              "Analyze my coffee spending"
            ].map((chip) => (
              <Pressable
                key={chip}
                onPress={() => handleSend(chip)}
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
            <View className="flex-1 flex-row items-center bg-slate-100 rounded-full px-4 py-1 border border-slate-200/50">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Ask anything..."
                placeholderTextColor="#727785"
                style={{ fontFamily: "WorkSans_400Regular", flex: 1, paddingVertical: 10 }}
                className="text-sm text-on-surface"
              />
              <Pressable 
                onPress={triggerHaptic}
                className="p-1"
              >
                <MaterialIcons name="attach-file" size={20} color="#5c5f60" />
              </Pressable>
            </View>
            
            <Pressable
              onPress={() => handleSend(inputText)}
              disabled={!inputText.trim()}
              style={[
                styles.sendBtn,
                { backgroundColor: inputText.trim() ? "#005bbf" : "#adc7ff" }
              ]}
              className="w-12 h-12 rounded-full items-center justify-center shadow-sm"
            >
              <MaterialIcons name="send" size={20} color="#ffffff" />
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
    backgroundColor: "#e1e3e4",
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
  sendBtn: {
    alignItems: "center",
    justifyContent: "center",
  }
});

export default CoachScreen;
