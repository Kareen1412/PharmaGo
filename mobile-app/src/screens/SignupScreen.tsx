import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { signUpUser } from "../services/userAuthService";
import { getAuthErrorMessage } from "../utils/authErrors";
import { authStyles, colors } from "../styles/authStyles";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const { width } = useWindowDimensions();

const cardWidth = width >= 768 ? width * 0.7 : "100%";

  const isPasswordValid = (value: string) => {
    const hasMinLength = value.length >= 8;
    const hasUppercase = /[A-Z]/.test(value);
    const hasLowercase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);

    return hasMinLength && hasUppercase && hasLowercase && hasNumber;
  };

  const clearFocusBeforeNavigate = (screen: "Login" | "Signup") => {
  Keyboard.dismiss();

  if (Platform.OS === "web") {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();
  }

  setTimeout(() => {
    navigation.navigate(screen);
  }, 0);
};

  const handleSignup = async () => {
    Keyboard.dismiss();
    setError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!isPasswordValid(password)) {
      setError(
        "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number."
      );
      return;
    }

    setLoading(true);

    try {
      await signUpUser(cleanName, cleanEmail, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
  <KeyboardAvoidingView
    style={authStyles.page}
    behavior={Platform.OS === "ios" ? "padding" : "height"}
    keyboardVerticalOffset={0}
  >
    <View style={authStyles.topBar}>
          <Image
            source={require("../assets/images/logo.png")}
            style={authStyles.logoImage}
            resizeMode="contain"
          />
          <Text style={authStyles.brandTitle}>PharmaGo</Text>
        </View>

    <Pressable
    style={{ flex: 1 }}
    onPress={Platform.OS === "web" ? undefined : Keyboard.dismiss}
  >
    <ScrollView
      contentContainerStyle={authStyles.scrollContent}
      keyboardShouldPersistTaps="always"
      showsVerticalScrollIndicator={false}
    >
        

        <View style={[authStyles.card, { width: cardWidth, alignSelf: "center" }]}>
          <Text style={authStyles.title}>Create Account</Text>

          {error ? (
            <View style={authStyles.errorBox}>
              <Text style={authStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={authStyles.fieldGroup}>
            <Text style={authStyles.label}>Name</Text>
            <TextInput
              placeholder="Enter your name"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              style={authStyles.input}
            />
          </View>

          <View style={authStyles.fieldGroup}>
            <Text style={authStyles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={authStyles.input}
            />
          </View>

          <View style={authStyles.fieldGroup}>
            <Text style={authStyles.label}>Password</Text>

            <View style={authStyles.passwordRow}>
              <TextInput
                placeholder="Create password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="new-password"
                style={authStyles.passwordInput}
              />

              <Pressable
                style={authStyles.iconButton}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={colors.primaryDark}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            style={[
              authStyles.primaryButton,
              loading && authStyles.primaryButtonDisabled,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={authStyles.primaryButtonText}>Create account</Text>
            )}
          </Pressable>

          <Pressable
            style={authStyles.secondaryButton}
            onPress={() => clearFocusBeforeNavigate("Login")}
          >
            <Text style={authStyles.secondaryButtonText}>
              Already have an account?{" "}
              <Text style={authStyles.secondaryButtonLink}>Sign in</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Pressable>
  </KeyboardAvoidingView>
);
}