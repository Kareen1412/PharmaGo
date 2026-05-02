export function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: string }).code)
      : "";

  const message =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message?: string }).message)
      : "";

  if (code.includes("auth/invalid-email")) {
    return "Please enter a valid email address.";
  }

  if (code.includes("auth/missing-password")) {
    return "Please enter your password.";
  }

  if (
    code.includes("auth/invalid-credential") ||
    code.includes("auth/wrong-password") ||
    code.includes("auth/user-not-found")
  ) {
    return "Invalid email or password.";
  }

  if (code.includes("auth/email-already-in-use")) {
    return "This email is already registered. Try logging in instead.";
  }

  if (code.includes("auth/weak-password")) {
    return "Password is too weak. Use at least 8 characters with uppercase, lowercase, and a number.";
  }

  if (code.includes("auth/too-many-requests")) {
    return "Too many attempts. Please wait a bit and try again.";
  }

  if (message) {
    return message;
  }

  return "Something went wrong. Please try again.";
}