import React, { useState } from "react";
import { 
  View, 
  Text, 
  Pressable, 
  SafeAreaView, 
  StyleSheet, 
  Image, 
  Alert 
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export const SubscriptionNegotiatorScreen = ({ navigation }: { navigation: any }) => {
  const [selectedOption, setSelectedOption] = useState<"pause" | "keep">("pause");

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConfirm = () => {
    triggerHaptic();
    if (selectedOption === "pause") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        "Subscription Paused",
        "SpareChange AI has scheduled a pause for your Netflix subscription. Your 'Euro-Summer Trip' target is now estimated in 18 days!",
        [{ text: "Awesome", onPress: () => navigation.goBack() }]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} className="flex-1">
      {/* Background Underlay (translucent dark sheet) */}
      <View style={StyleSheet.absoluteFillObject} className="bg-slate-900/60" />

      {/* Main Bottom Sheet Canvas */}
      <View style={styles.sheet} className="bg-white rounded-t-3xl pt-2 pb-10 px-margin-mobile">
        {/* Drag Handle indicator */}
        <View className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

        {/* Header Info */}
        <View className="flex-row items-center space-x-4 mb-6">
          <View className="w-14 h-14 bg-black rounded-2xl items-center justify-center shadow-md p-2">
            <Image 
              source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuACQfKpwZO8RAqE1VLCIJiLVKgwJf2oRf94_rrHNSwC3XvInNrniWhDA_SxpsdtUGKsF3EJ8nM527_KaeJgY4qxG0LHeOktye1pnWE2QTSWK2s8O-AxcwWpsozhJTy0iSS_34j1_91NXBNgOYRv1jVMuJ7ys9-GUx4DosHmJ5ngX9BfcGfdwFhYW2WQh81L29pNUdCKLKW1bdM4y9EeTWzCqLps7RzgUTcj2fXMlyQssbq7yBZ-dVVJ" }}
              style={{ width: "100%", height: "100%", resizeMode: "contain" }}
            />
          </View>
          <View>
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-lg text-on-surface">
              Netflix Subscription
            </Text>
            <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-sm text-on-surface-variant">
              $15.99 billed on June 12
            </Text>
          </View>
        </View>

        {/* AI Insight Box */}
        <View className="bg-primary-fixed/30 p-4 rounded-xl mb-6 border border-primary-fixed">
          <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-sm text-on-primary-fixed leading-relaxed">
            "Struggling with your goal? Try pausing <Text style={{ fontFamily: "WorkSans_500Medium" }} className="font-bold">Netflix</Text> for a month. You'll reach your Euro-Summer trip much faster."
          </Text>
        </View>

        {/* Side-by-Side Comparison Options */}
        <View className="flex-row space-x-3 mb-8">
          {/* Pause Suggestion option */}
          <Pressable
            onPress={() => {
              triggerHaptic();
              setSelectedOption("pause");
            }}
            style={[
              styles.optionCard,
              selectedOption === "pause" ? styles.optionCardActive : null
            ]}
            className="flex-1 p-4 rounded-xl bg-[#e3f2fd] border border-primary/20 relative"
          >
            {/* Suggested badge pill */}
            <View className="absolute -top-2.5 right-2 bg-[#006d2a] px-2.5 py-0.5 rounded-full">
              <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[8px] text-white uppercase font-bold">
                Suggested
              </Text>
            </View>
            <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-primary uppercase mb-1">
              Pause
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-primary-container leading-snug">
              Goal in 18 days
            </Text>
          </Pressable>

          {/* Keep option */}
          <Pressable
            onPress={() => {
              triggerHaptic();
              setSelectedOption("keep");
            }}
            style={[
              styles.optionCard,
              selectedOption === "keep" ? styles.optionCardActive : null
            ]}
            className="flex-1 p-4 rounded-xl bg-slate-50 border border-slate-200"
          >
            <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-[10px] text-on-surface-variant uppercase mb-1">
              Keep
            </Text>
            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-sm text-on-surface-variant leading-snug">
              Goal in 30 days
            </Text>
          </Pressable>
        </View>

        {/* Confirm Action Button */}
        <View className="space-y-3">
          <Pressable
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={({ pressed }) => [
              styles.confirmBtn,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
            onPress={handleConfirm}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white text-base">
              {selectedOption === "pause" ? "Pause Subscription" : "Keep Subscription"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              triggerHaptic();
              navigation.goBack();
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            className="w-full py-3 items-center justify-center"
          >
            <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-sm text-ob-secondary font-semibold">
              Not Now
            </Text>
          </Pressable>
        </View>

        {/* AI Assurance Message */}
        <View className="flex-row items-center justify-center space-x-1 mt-4">
          <MaterialIcons name="auto-awesome" size={14} color="#5c5f60" />
          <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-[10px] text-on-surface-variant">
            SpareChange AI handles the cancellation flow for you.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "flex-end",
  },
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 24,
  },
  optionCard: {
    minHeight: 80,
  },
  optionCardActive: {
    borderWidth: 2,
    borderColor: "#005bbf",
  },
  confirmBtn: {
    width: "100%",
    height: 52,
    backgroundColor: "#005bbf",
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  }
});

export default SubscriptionNegotiatorScreen;
