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
import type { MedicineRequest } from "../../../shared/types/medRequest";

export type RootStackParamList = {
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  CreateMedicineRequest: undefined;
  MedRequests: undefined;
  MedRequestDetails: {
    request: MedicineRequest;
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
            <Stack.Screen name="MedRequestDetails" component={MedRequestDetailsScreen} />
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