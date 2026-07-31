import React from "react";
import { View, Text } from "react-native";

interface ChatBubbleProps {
  sender: "user" | "ai";
  message: string;
  timestamp?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ sender, message, timestamp }) => {
  const isUser = sender === "user";
  
  return (
    <View className={`flex-row ${isUser ? "justify-end" : "justify-start"} my-1.5 px-2`}>
      <View 
        className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
          isUser 
            ? "bg-indigo-600 rounded-tr-none text-white" 
            : "bg-slate-700 rounded-tl-none border border-slate-600"
        }`}
      >
        <Text className={`text-sm leading-relaxed ${isUser ? "text-white" : "text-slate-100"}`}>
          {message}
        </Text>
        
        {timestamp && (
          <Text className={`text-[10px] text-right mt-1 ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
            {timestamp}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ChatBubble;
