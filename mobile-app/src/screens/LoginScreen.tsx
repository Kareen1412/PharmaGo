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
import { loginUser, resetUserPassword } from "../services/userAuthService";
import { getAuthErrorMessage } from "../utils/authErrors";
import { authStyles, colors } from "../styles/authStyles";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const { width } = useWindowDimensions();

const cardWidth = width >= 768 ? width * 0.7 : "100%";

  const handleLogin = async () => {
    Keyboard.dismiss();
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await loginUser(cleanEmail, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
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

  const handleForgotPassword = async () => {
    setError("");
    setMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email first to reset your password.");
      return;
    }

    setResetLoading(true);

    try {
      await resetUserPassword(cleanEmail);
      setMessage("Password reset email sent. Please check your inbox.");
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setResetLoading(false);
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
        <View
          style={[
            authStyles.card,
            { width: cardWidth, alignSelf: "center" },
          ]}
        >
          <Text style={authStyles.title}>Sign In</Text>

          {error ? (
            <View style={authStyles.errorBox}>
              <Text style={authStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          {message ? (
            <View style={authStyles.successBox}>
              <Text style={authStyles.successText}>{message}</Text>
            </View>
          ) : null}

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
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
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
            style={authStyles.linkButtonLeft}
            onPress={handleForgotPassword}
            disabled={resetLoading}
          >
            <Text style={authStyles.linkText}>
              {resetLoading ? "Sending..." : "Forgot password?"}
            </Text>
          </Pressable>

          <Pressable
            style={[
              authStyles.primaryButton,
              loading && authStyles.primaryButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={authStyles.primaryButtonText}>Login</Text>
            )}
          </Pressable>

          <Pressable
            style={authStyles.secondaryButton}
            onPress={() => clearFocusBeforeNavigate("Signup")}
          >
            <Text style={authStyles.secondaryButtonText}>
              Don’t have an account?{" "}
              <Text style={authStyles.secondaryButtonLink}>
                Create one
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
     </Pressable>
  </KeyboardAvoidingView>
);
}