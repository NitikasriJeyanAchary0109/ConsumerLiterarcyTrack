import React, { useState, useRef } from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from "react-native";
import { apiService } from "../../services/api";
import { ChatBubble } from "../../components/ChatBubble";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  time: string;
}

export const CoachScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hey! I'm your SpareChange AI Financial Coach. Ask me anything about budgeting, saving, or understanding your card swipes!",
      time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setInput("");
    
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userText,
      time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await apiService.chatWithCoach(userText);
      
      const aiMsg: Message = {
        id: response.insight_id.toString(),
        sender: "ai",
        text: response.content,
        time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: `Error connecting to coach: ${e.message || "Please check backend / Ollama status."}`,
        time: new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        className="flex-1"
      >
        {/* Header */}
        <View className="px-4 py-3.5 border-b border-slate-800">
          <Text className="text-slate-100 text-lg font-bold">AI Coach</Text>
          <Text className="text-slate-400 text-xs font-semibold">Locally-run Llama3 Assistant</Text>
        </View>

        {/* Scroll Thread */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1, paddingVertical: 10 }}
          className="flex-1 px-2"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((m) => (
            <ChatBubble key={m.id} sender={m.sender} message={m.text} timestamp={m.time} />
          ))}

          {loading && (
            <View className="flex-row justify-start items-center p-4">
              <ActivityIndicator color="#4F46E5" size="small" />
              <Text className="text-slate-400 text-xs italic ml-2.5">Coach is thinking...</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom Input Area */}
        <View className="flex-row items-center p-3 border-t border-slate-800 bg-slate-900">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="How can I save $50 this month?"
            placeholderTextColor="#64748B"
            autoCorrect={true}
            className="flex-1 bg-slate-800 border border-slate-700/60 text-slate-100 text-sm rounded-xl px-4 py-3 mr-3"
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={loading}
            className="bg-indigo-600 active:bg-indigo-700 rounded-xl p-3.5 justify-center items-center"
          >
            <Text className="text-white font-bold text-sm">Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CoachScreen;
