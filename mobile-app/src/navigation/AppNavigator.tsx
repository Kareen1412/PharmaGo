import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

import { useAuth } from "../contexts/AuthContext";

import LoginScreen from "../screens/LoginScreen";
import SignupScreen from "../screens/SignupScreen";
import HomeScreen from "../screens/HomeScreen";
import CreateMedicineRequestScreen from "../screens/CreateMedRequestScreen";
import MedRequestsScreen from "../screens/MedRequestsScreen";
import MedRequestDetailsScreen from "../screens/MedRequestDetailsScreen";
import ReservationDetailsScreen from "../screens/ReservationDetailsScreen";
import QuestionsScreen from "../screens/QuestionsScreen";
import AskQuestionScreen from "../screens/AskQuestionScreen";
import QuestionDetailsScreen from "../screens/QuestionDetailsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RecentActivityScreen from "../screens/RecentActivityScreen";

import type { MedicineRequest } from "../../../shared/types/medRequest";
import type { MedicineReservation } from "../../../shared/types/reservedMedRequest";
import type { PharmaQuestion } from "../../../shared/types/question";

import PharmacyListScreen from "../screens/PharmacyListScreen";
import PharmacyDetailsScreen from "../screens/PharmacyDetailsScreen";
import type { Pharmacy } from "../../../shared/types/pharmacy";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  CreateMedicineRequest: undefined;
 MedRequests:
  | {
      initialTab?: "active" | "reserved";
    }
  | undefined;
  MedRequestDetails: {
    request: MedicineRequest;
  };
  ReservationDetails: {
    reservation: MedicineReservation;
  };
  Questions: undefined;
  AskQuestion: undefined;
  QuestionDetails: {
    question: PharmaQuestion;
  };
  Profile: undefined;
  RecentActivity: undefined;

  PharmacyList: undefined;
PharmacyDetails: {
  pharmacy: Pharmacy;
};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {firebaseUser ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen
              name="CreateMedicineRequest"
              component={CreateMedicineRequestScreen}
            />
            <Stack.Screen name="MedRequests" component={MedRequestsScreen} />
            <Stack.Screen
              name="MedRequestDetails"
              component={MedRequestDetailsScreen}
            />
            <Stack.Screen name="Questions" component={QuestionsScreen} />
            <Stack.Screen name="AskQuestion" component={AskQuestionScreen} />
            <Stack.Screen
              name="QuestionDetails"
              component={QuestionDetailsScreen}
            />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen
              name="ReservationDetails"
              component={ReservationDetailsScreen}
            />
            <Stack.Screen
              name="RecentActivity"
              component={RecentActivityScreen}
            />
            <Stack.Screen name="PharmacyList" component={PharmacyListScreen} />
<Stack.Screen name="PharmacyDetails" component={PharmacyDetailsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}