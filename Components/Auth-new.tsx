"use client";
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { CloudMoon, HomeIcon } from "lucide-react";

export default function Auth() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (authError) setAuthError("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setAuthError("Please fill in all required fields");
      return false;
    }

    if (isSignUp) {
      if (!formData.fullName.trim()) {
        setAuthError("Full name is required");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setAuthError("Passwords do not match");
        return false;
      }
      if (formData.password.length < 6) {
        setAuthError("Password must be at least 6 characters");
        return false;
      }
    }

    return true;
  };

  const resendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
        options: {
          emailRedirectTo: `${
            process.env.NEXT_PUBLIC_SITE_URL ||
            (typeof window !== "undefined"
              ? window.location.origin
              : "http://localhost:3000")
          }/auth/callback`,
        },
      });

      if (error) {
        console.error("Resend error:", error);
        setAuthError("Failed to resend verification email. Please try again.");
      } else {
        setAuthError("");
        // Show success message briefly
        const successMsg = "Verification email sent! Check your inbox.";
        setAuthError("");
        // You could add a success state here if needed
        console.log(successMsg);
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setAuthError("Failed to resend verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const openEmailProvider = () => {
    const email = userEmail || formData.email;
    const domain = email.split("@")[1]?.toLowerCase();

    let emailUrl = "https://mail.google.com"; // Default to Gmail

    // Detect email provider and open appropriate webmail
    if (domain) {
      switch (domain) {
        case "gmail.com":
        case "googlemail.com":
          emailUrl = "https://mail.google.com";
          break;
        case "outlook.com":
        case "hotmail.com":
        case "live.com":
        case "msn.com":
          emailUrl = "https://outlook.live.com";
          break;
        case "yahoo.com":
        case "ymail.com":
        case "rocketmail.com":
          emailUrl = "https://mail.yahoo.com";
          break;
        case "icloud.com":
        case "me.com":
        case "mac.com":
          emailUrl = "https://www.icloud.com/mail";
          break;
        case "aol.com":
          emailUrl = "https://mail.aol.com";
          break;
        default:
          // For other providers, try to construct a webmail URL
          emailUrl = `https://mail.${domain}`;
          break;
      }
    }

    window.open(emailUrl, "_blank");
  };

  const checkEmailVerification = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email_confirmed_at) {
        router.push("/");
      } else {
        setAuthError(
          "Email not verified yet. Please check your email and click the verification link."
        );
      }
    } catch (error) {
      console.error("Error checking email verification:", error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthError("");

    try {
      if (isSignUp) {
        // Get the current site URL for email verification redirects
        const siteUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          (typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000");

        console.log("Signup attempt with site URL:", siteUrl);

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName.trim(),
            },
            emailRedirectTo: `${siteUrl}/auth/callback`,
          },
        });

        console.log("Signup response:", { data, error });

        if (error) {
          console.error("Supabase signup error:", error);
          throw error;
        }

        if (data?.user) {
          console.log("User created:", data.user);
          console.log("Email confirmed at:", data.user.email_confirmed_at);

          // Always show verification screen for new signups, regardless of confirmation status
          // This is because Supabase might not immediately show email_confirmed_at as null
          setUserEmail(formData.email);
          setShowEmailVerification(true);

          // Show success message
          console.log("Email verification screen shown for:", formData.email);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error("Supabase signin error:", error);
          throw error;
        }

        if (data?.user) {
          router.push("/"); // Redirect to homepage on successful login
        }
      }
    } catch (error: unknown) {
      console.error("Auth error details:", error);
      // Provide more detailed error messages
      let errorMessage =
        error instanceof Error ? error.message : "An error occurred";

      if (
        error instanceof Error &&
        error.message?.includes("Invalid login credentials")
      ) {
        errorMessage =
          "Invalid email or password. Please check your credentials and try again.";
      } else if (
        error instanceof Error &&
        error.message?.includes("Email not confirmed")
      ) {
        errorMessage =
          "Please check your email and click the confirmation link before signing in.";
      } else if (
        error instanceof Error &&
        error.message?.includes("User already registered")
      ) {
        errorMessage =
          "An account with this email already exists. Please sign in instead.";
      } else if (
        error &&
        typeof error === "object" &&
        "status" in error &&
        error.status === 500
      ) {
        errorMessage =
          "Database error: Please ensure the database is properly set up with all required tables and triggers. Check the console for more details.";
      } else if (
        error instanceof Error &&
        (error.message?.includes("Database error") ||
          error.message?.includes("trigger"))
      ) {
        errorMessage =
          "Database setup issue detected. Please run the complete database schema to fix missing tables.";
      }

      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError("");
    setShowEmailVerification(false);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    });
  };

  // Email Verification Screen
  if (showEmailVerification) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br  p-4">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-gray-800/20 p-8 shadow-2xl backdrop-blur-sm border border-gray-700/50">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 flex items-center justify-center">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white">Check Your Email</h2>
            <p className="text-gray-300">
              We&apos;ve sent a verification link to
            </p>
            <p className="text-blue-400 font-medium break-all">{userEmail}</p>
            <div className="text-sm text-gray-400 bg-gray-700/50 p-3 rounded-lg">
              <p className="mb-2">
                📧 <strong>Email sent!</strong>
              </p>
              <p>
                Check your inbox and spam folder. The verification link will be
                valid for 1 hour.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Email Provider Button */}
            <button
              onClick={openEmailProvider}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.887.732-1.636 1.636-1.636h1.818L12 10.545l8.545-6.724h1.819c.904 0 1.636.749 1.636 1.636z" />
              </svg>
              Open Email
            </button>

            {/* Check Verification Button */}
            <button
              onClick={checkEmailVerification}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              I&apos;ve verified my email
            </button>

            {/* Resend Email Button */}
            <button
              onClick={resendVerificationEmail}
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-transparent hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Resend verification email"}
            </button>

            {/* Error Message */}
            {authError && (
              <div className="rounded-lg bg-red-900/20 p-4 border border-red-800">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-400">{authError}</p>
                </div>
              </div>
            )}

            {/* Back to Sign In */}
            <div className="text-center">
              <button
                onClick={toggleMode}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="w-full max-w-[90vw] space-y-1 rounded-2xl bg-gray-800/20 p-8 shadow-2xl backdrop-blur-sm border border-gray-700/50 md:max-w-lg lg:max-w-2xl">
        {/* Header */}
        <button
          className="flex flex-row text-left mb-4 space-y-2"
          onClick={() => (window.location.href = "/")}
        >
          <HomeIcon className="h-8 w-8 text-gray-100 mr-4 my-4" />
          <span className="text-gray-100">
            Go to homepage <br /> Cloud Inc. Co
          </span>
        </button>
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-500 flex items-center justify-center">
            <CloudMoon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-gray-400">
            {isSignUp
              ? "Join us to manage your healthcare records"
              : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          {/* Full Name Field - Only for Sign Up */}
          {isSignUp && (
            <div className="space-y-2">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-300"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required={isSignUp}
                  className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-colors"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-colors"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-colors"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange}
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* Confirm Password Field - Only for Sign Up */}
          {isSignUp && (
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required={isSignUp}
                  className="block w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 pl-10 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white transition-colors"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          )}

          {/* Error Message */}
          {authError && (
            <div className="rounded-lg bg-red-900/20 p-4 border border-red-800">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-red-400 mr-2 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-400">{authError}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </div>
            ) : (
              <span className="flex items-center">
                {isSignUp ? "Create Account" : "Sign In"}
                <svg
                  className="ml-2 -mr-1 w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            )}
          </button>

          {/* Toggle Mode */}
          <div className="text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isSignUp
                ? "Already have an account? Sign In"
                : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
}
