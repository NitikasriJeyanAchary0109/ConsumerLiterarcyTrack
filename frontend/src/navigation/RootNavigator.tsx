import React from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useAuth } from "../hooks/useAuth";

// Authentication Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// Onboarding Screens
import OnboardingScreen from "../screens/onboarding/OnboardingScreen";
import SpendingChoiceScreen from "../screens/onboarding/SpendingChoiceScreen";
import SpendingSetupScreen from "../screens/onboarding/SpendingSetupScreen";
import CSVUploadScreen from "../screens/onboarding/CSVUploadScreen";
import GoalCreationScreen from "../screens/onboarding/GoalCreationScreen";
import AnalysisScreen from "../screens/onboarding/AnalysisScreen";

// Student Screens
import HomeScreen from "../screens/student/HomeScreen";
import GoalsScreen from "../screens/student/GoalsScreen";
import GoalDetailScreen from "../screens/student/GoalDetailScreen";
import ChatScreen from "../screens/student/ChatScreen";
import InsightsScreen from "../screens/student/InsightsScreen";
import SubscriptionNegotiatorScreen from "../screens/student/SubscriptionNegotiatorScreen";
import RoundupTrackerScreen from "../screens/student/RoundupTrackerScreen";
import EmergencyWithdrawalScreen from "../screens/student/EmergencyWithdrawalScreen";
import ProfileScreen from "../screens/student/ProfileScreen";
import NotificationsScreen from "../screens/student/NotificationsScreen";
import BudgetsScreen from "../screens/student/BudgetsScreen";

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
// STUDENT TABS (5 Bottom Tabs)
// ==========================
function StudentTabs() {
  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: "Home", tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: "Goals", tabBarLabel: "Goals" }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ title: "Insights", tabBarLabel: "Insights" }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          title: "AI Chat",
          tabBarLabel: "Chat",
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// ==========================
// STUDENT STACK (Nests Tabs + Details Screens)
// ==========================
const StudentStackNavigator = createNativeStackNavigator();

function StudentStackScreen() {
  return (
    <StudentStackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <StudentStackNavigator.Screen 
        name="StudentTabs" 
        component={StudentTabs} 
      />
      <StudentStackNavigator.Screen 
        name="GoalDetail" 
        component={GoalDetailScreen} 
      />
      <StudentStackNavigator.Screen 
        name="GoalCreation" 
        component={GoalCreationScreen} 
      />
      <StudentStackNavigator.Screen 
        name="CSVUpload" 
        component={CSVUploadScreen} 
      />
      <StudentStackNavigator.Screen 
        name="SubscriptionNegotiator" 
        component={SubscriptionNegotiatorScreen} 
      />
      <StudentStackNavigator.Screen 
        name="RoundupTracker" 
        component={RoundupTrackerScreen} 
      />
      <StudentStackNavigator.Screen 
        name="EmergencyWithdrawal" 
        component={EmergencyWithdrawalScreen} 
      />
      <StudentStackNavigator.Screen 
        name="Notifications" 
        component={NotificationsScreen} 
      />
      <StudentStackNavigator.Screen 
        name="Budgets" 
        component={BudgetsScreen} 
      />
    </StudentStackNavigator.Navigator>
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
  const { userToken, userRole, isLoading, hasCompletedOnboarding } = useAuth();

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

  // Set initial unauthenticated route dynamically: returning users land on Login
  const initialRoute = hasCompletedOnboarding ? "Login" : "Onboarding";

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
      {userToken === null ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="SpendingChoice" component={SpendingChoiceScreen} />
          <Stack.Screen name="SpendingSetup" component={SpendingSetupScreen} />
          <Stack.Screen name="CSVUpload" component={CSVUploadScreen} />
          <Stack.Screen name="Analysis" component={AnalysisScreen} />
          <Stack.Screen name="GoalCreation" component={GoalCreationScreen} />
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
          component={StudentStackScreen}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;