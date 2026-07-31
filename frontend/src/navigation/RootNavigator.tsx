import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../hooks/useAuth";

// Import Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Student Screens
import HomeScreen from "../screens/student/HomeScreen";
import GoalsScreen from "../screens/student/GoalsScreen";
import CoachScreen from "../screens/student/CoachScreen";
import InsightsScreen from "../screens/student/InsightsScreen";

// Educator Screens
import OverviewScreen from "../screens/educator/OverviewScreen";
import TrendsScreen from "../screens/educator/TrendsScreen";
import LiteracyScreen from "../screens/educator/LiteracyScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: "#1e293b",
  },
  headerTintColor: "#f8fafc",
  headerTitleStyle: {
    fontWeight: "bold" as const,
  },
  tabBarStyle: {
    backgroundColor: "#1e293b",
    borderTopColor: "#334155",
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
  tabBarActiveTintColor: "#6366f1",
  tabBarInactiveTintColor: "#94a3b8",
};

// ==========================
// STUDENT TABS
// ==========================
function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home Swipes", tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: "My Savings Goals", tabBarLabel: "Goals" }}
      />
      <Tab.Screen
        name="Coach"
        component={CoachScreen}
        options={{
          title: "Coach",
          tabBarLabel: "Coach",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          title: "Wellness Insights",
          tabBarLabel: "Insights",
        }}
      />
    </Tab.Navigator>
  );
}

// ==========================
// EDUCATOR TABS
// ==========================
function EducatorTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Overview"
        component={OverviewScreen}
        options={{
          title: "Overview Dashboard",
          tabBarLabel: "Overview",
        }}
      />
      <Tab.Screen
        name="Trends"
        component={TrendsScreen}
        options={{
          title: "Cohort Trends",
          tabBarLabel: "Trends",
        }}
      />
      <Tab.Screen
        name="Literacy"
        component={LiteracyScreen}
        options={{
          title: "Oversight Log",
          tabBarLabel: "Oversight",
        }}
      />
    </Tab.Navigator>
  );
}

// ==========================
// ROOT NAVIGATOR
// ==========================
export const RootNavigator = () => {
  const { userToken, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0f172a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userToken === null ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : userRole === "educator" ? (
        <Stack.Screen
          name="EducatorHome"
          component={EducatorTabs}
        />
      ) : (
        <Stack.Screen
          name="StudentHome"
          component={StudentTabs}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;