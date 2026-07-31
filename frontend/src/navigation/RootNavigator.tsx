import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../hooks/useAuth";

// Import Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Onboarding Screens
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import SpendingSetupScreen from "../screens/onboarding/SpendingSetupScreen";
import CSVUploadScreen from "../screens/onboarding/CSVUploadScreen";
import GoalCreationScreen from "../screens/onboarding/GoalCreationScreen";
import AnalysisScreen from "../screens/onboarding/AnalysisScreen";

// Student Screens
import HomeScreen from "../screens/student/HomeScreen";
import GoalsScreen from "../screens/student/GoalsScreen";
import CoachScreen from "../screens/student/CoachScreen";
import InsightsScreen from "../screens/student/InsightsScreen";
import TransactionListScreen from "../screens/student/TransactionListScreen";
import SubscriptionNegotiatorScreen from "../screens/student/SubscriptionNegotiatorScreen";
import RoundupTrackerScreen from "../screens/student/RoundupTrackerScreen";
import EmergencyWithdrawalScreen from "../screens/student/EmergencyWithdrawalScreen";
import InvestmentAdvisorScreen from "../screens/student/InvestmentAdvisorScreen";

// Educator Screens
import OverviewScreen from "../screens/educator/OverviewScreen";
import TrendsScreen from "../screens/educator/TrendsScreen";
import LiteracyScreen from "../screens/educator/LiteracyScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom theme option helper
const screenOptions = {
  headerStyle: {
    backgroundColor: "#1e293b", // card color
  },
  headerTintColor: "#f8fafc",   // text color
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
  tabBarActiveTintColor: "#6366f1",   // Indigo active
  tabBarInactiveTintColor: "#94a3b8", // Slate inactive
};

// ==========================================
// STUDENT NAVIGATION (Tabs)
// ==========================================
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
        options={{ title: "Coach Coach", tabBarLabel: "Coach", headerShown: false }} 
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen} 
        options={{ title: "Wellness insights", tabBarLabel: "Insights" }} 
      />
    </Tab.Navigator>
  );
}

// ==========================================
// STUDENT NAVIGATION STACK (Nests Tabs + Banking Screens)
// ==========================================
const StudentStackNavigator = createNativeStackNavigator();

function StudentStackScreen() {
  return (
    <StudentStackNavigator.Navigator>
      <StudentStackNavigator.Screen 
        name="StudentTabs" 
        component={StudentTabs} 
        options={{ headerShown: false }} 
      />
      <StudentStackNavigator.Screen 
        name="GoalCreation" 
        component={GoalCreationScreen} 
        options={{ headerShown: false }} 
      />
      <StudentStackNavigator.Screen 
        name="CSVUpload" 
        component={CSVUploadScreen} 
        options={{ headerShown: false }} 
      />
      <StudentStackNavigator.Screen 
        name="TransactionList" 
        component={TransactionListScreen} 
        options={{ 
          title: "Transactions",
          headerStyle: { backgroundColor: "#1e293b" },
          headerTintColor: "#f8fafc",
          headerTitleStyle: { fontWeight: "bold" }
        }} 
      />
      <StudentStackNavigator.Screen 
        name="SubscriptionNegotiator" 
        component={SubscriptionNegotiatorScreen} 
        options={{ headerShown: false }} 
      />
      <StudentStackNavigator.Screen 
        name="RoundupTracker" 
        component={RoundupTrackerScreen} 
        options={{ headerShown: false }} 
      />
      <StudentStackNavigator.Screen 
        name="EmergencyWithdrawal" 
        component={EmergencyWithdrawalScreen} 
        options={{ headerShown: false }} 
      />
      <StudentStackNavigator.Screen 
        name="InvestmentAdvisor" 
        component={InvestmentAdvisorScreen} 
        options={{ headerShown: false }} 
      />
    </StudentStackNavigator.Navigator>
  );
}

// ==========================================
// EDUCATOR NAVIGATION (Tabs)
// ==========================================
function EducatorTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen 
        name="Overview" 
        component={OverviewScreen} 
        options={{ title: "Overview Dashboard", tabBarLabel: "Overview" }} 
      />
      <Tab.Screen 
        name="Trends" 
        component={TrendsScreen} 
        options={{ title: "Cohort Trends", tabBarLabel: "Trends" }} 
      />
      <Tab.Screen 
        name="Literacy" 
        component={LiteracyScreen} 
        options={{ title: "Oversight Log", tabBarLabel: "Oversight" }} 
      />
    </Tab.Navigator>
  );
}

// ==========================================
// ROOT NAVIGATOR
// ==========================================
export const RootNavigator = () => {
  const { userToken, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
      {userToken === null ? (
        // Unauthenticated Flows
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="SpendingSetup" component={SpendingSetupScreen} />
          <Stack.Screen name="CSVUpload" component={CSVUploadScreen} />
          <Stack.Screen name="Analysis" component={AnalysisScreen} />
          <Stack.Screen name="GoalCreation" component={GoalCreationScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : userRole === "educator" ? (
        // Educator Flow
        <Stack.Screen name="EducatorHome" component={EducatorTabs} />
      ) : (
        // Student Flow
        <Stack.Screen name="StudentHome" component={StudentStackScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
