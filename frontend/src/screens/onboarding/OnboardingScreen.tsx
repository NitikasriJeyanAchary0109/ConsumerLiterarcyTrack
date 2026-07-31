import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, SafeAreaView, StyleSheet, Modal } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withDelay, 
  Easing 
} from "react-native-reanimated";
import { useAuth } from "../../hooks/useAuth";

export const OnboardingScreen = ({ navigation }: { navigation: any }) => {
  const { loginAsGuest } = useAuth();
  const [showChoiceModal, setShowChoiceModal] = useState(false);

  // Float animations for central illustration and badges
  const floatMain = useSharedValue(0);
  const floatBadge1 = useSharedValue(0);
  const floatBadge2 = useSharedValue(0);

  useEffect(() => {
    floatMain.value = withRepeat(
      withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    floatBadge1.value = withDelay(
      1000,
      withRepeat(
        withTiming(-8, { duration: 2800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
    floatBadge2.value = withDelay(
      2500,
      withRepeat(
        withTiming(-12, { duration: 3200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, []);

  const animStyleMain = useAnimatedStyle(() => ({
    transform: [{ translateY: floatMain.value }]
  }));

  const animStyleBadge1 = useAnimatedStyle(() => ({
    transform: [{ translateY: floatBadge1.value }]
  }));

  const animStyleBadge2 = useAnimatedStyle(() => ({
    transform: [{ translateY: floatBadge2.value }]
  }));

  const handleSkip = async () => {
    try {
      await loginAsGuest();
    } catch (err) {
      console.warn("Guest login failed:", err);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="w-full py-4 items-center justify-center border-b border-slate-100">
        <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-xl text-ob-primary">
          SpareChange AI
        </Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-5 max-w-md mx-auto w-full">
        {/* Illustration Canvas */}
        <View className="relative w-64 h-64 mb-8 flex items-center justify-center">
          <View className="absolute w-56 h-56 bg-surface-container-low rounded-full opacity-40 scale-110 blur-xl" />

          {/* Central Illustration */}
          <Animated.View style={[animStyleMain, styles.dropShadow]} className="z-10 w-full h-full justify-center items-center">
            <Image 
              source={require("../../../assets/illustrations/onboarding.png")}
              style={{ width: "90%", height: "90%", resizeMode: "contain" }}
            />
          </Animated.View>

          {/* Small Accent Badges */}
          <Animated.View 
            style={[animStyleBadge1, styles.customShadow]} 
            className="absolute top-4 right-2 bg-white p-3 rounded-2xl border border-outline-variant/30 z-20"
          >
            <MaterialIcons name="trending-up" size={24} color="#006d2a" />
          </Animated.View>

          <Animated.View 
            style={[animStyleBadge2, styles.customShadow]} 
            className="absolute bottom-8 left-0 bg-white p-3 rounded-2xl border border-outline-variant/30 z-20"
          >
            <MaterialIcons name="savings" size={24} color="#005bbf" />
          </Animated.View>
        </View>

        {/* Typography */}
        <View className="items-center mb-8 px-4">
          <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-2xl text-on-surface text-center mb-2">
            Welcome to SpareChange AI
          </Text>
          <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-base text-on-surface-variant text-center px-4">
            Let's build your financial future together.
          </Text>
        </View>

        {/* Actions */}
        <View className="w-full space-y-4 px-4">
          {/* Option A: Set a Goal First */}
          <Pressable 
            android_ripple={{ color: "rgba(255,255,255,0.2)" }}
            style={({ pressed }) => [
              styles.primaryBtn,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
            onPress={() => navigation.navigate("GoalCreation")}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-white text-base">
              Set a Goal First
            </Text>
          </Pressable>

          {/* Option B: Tell Us About Your Spending */}
          <Pressable 
            android_ripple={{ color: "rgba(0,91,191,0.1)" }}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
            ]}
            onPress={() => setShowChoiceModal(true)}
          >
            <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-ob-primary text-base">
              Tell Us About Your Spending
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Option C: Skip for now */}
      <View className="py-6 items-center">
        <Pressable 
          onPress={handleSkip}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          className="py-2 px-4"
        >
          <Text style={{ fontFamily: "WorkSans_500Medium" }} className="text-sm text-ob-secondary">
            Skip for now
          </Text>
        </Pressable>
      </View>

      {/* Choice Modal (Manual Entry vs CSV Upload) */}
      <Modal visible={showChoiceModal} transparent animationType="slide">
        <View style={styles.modalOverlay} className="flex-1 justify-end">
          <View className="bg-white rounded-t-3xl pt-2 pb-10 px-margin-mobile shadow-2xl">
            {/* Drag Handle */}
            <View className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

            <Text style={{ fontFamily: "PlusJakartaSans_700Bold" }} className="text-slate-800 text-lg font-bold mb-2 text-center">
              How would you like to link spending?
            </Text>
            <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-xs text-center mb-6">
              Pick the method that works best for you
            </Text>

            {/* Option 1: Manual entry */}
            <Pressable
              onPress={() => {
                setShowChoiceModal(false);
                navigation.navigate("SpendingSetup");
              }}
              style={({ pressed }) => [
                styles.choiceCard,
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-row items-center mb-4"
            >
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                <MaterialIcons name="edit" size={24} color="#005bbf" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-800 text-sm font-bold">
                  Manual Income Entry
                </Text>
                <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-[11px] mt-0.5">
                  Type your income and select recurring monthly expenses
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
            </Pressable>

            {/* Option 2: CSV Upload */}
            <Pressable
              onPress={() => {
                setShowChoiceModal(false);
                navigation.navigate("CSVUpload");
              }}
              style={({ pressed }) => [
                styles.choiceCard,
                { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }
              ]}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex-row items-center mb-6"
            >
              <View className="w-12 h-12 bg-emerald-50 rounded-xl items-center justify-center mr-4">
                <MaterialIcons name="cloud-upload" size={24} color="#006d2a" />
              </View>
              <View className="flex-1">
                <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-800 text-sm font-bold">
                  CSV Statement Upload
                </Text>
                <Text style={{ fontFamily: "WorkSans_400Regular" }} className="text-slate-500 text-[11px] mt-0.5">
                  Upload transaction logs to detect income and bills automatically
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
            </Pressable>

            {/* Cancel Button */}
            <Pressable
              onPress={() => setShowChoiceModal(false)}
              className="py-3.5 border border-slate-200 bg-white rounded-xl items-center"
            >
              <Text style={{ fontFamily: "PlusJakartaSans_600SemiBold" }} className="text-slate-600 text-sm font-bold">
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  dropShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  customShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryBtn: {
    width: "100%",
    height: 56,
    backgroundColor: "#1a73e8",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtn: {
    width: "100%",
    height: 56,
    borderWidth: 2,
    borderColor: "#c1c6d6",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  modalOverlay: {
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  choiceCard: {
    minHeight: 76,
  }
});

export default OnboardingScreen;
