"use client";

import React from "react";
import { motion } from "motion/react";
import { TextShimmer } from "./TextShimmer";
import { User } from "@supabase/supabase-js";
import LaserFlow from "./LaserFlow";
import TextInput from "./TextInput";
import ErrorBoundary from "./ErrorBoundary";
import { CloudLightningIcon } from "lucide-react";
import Image from "next/image";

export function HeroSectionOne({ user }: { user: User | null }) {
  const [showAIModal, setShowAIModal] = React.useState(false);
  // Extract first name from user metadata or email
  const getFirstName = (user: User | null) => {
    if (!user) return null;

    // Try to get from user metadata first
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name;
    if (fullName) {
      return fullName.split(" ")[0];
    }

    // Fallback to email prefix
    return user.email?.split("@")[0] || "User";
  };

  const firstName = getFirstName(user);

  // Split heading into lines for better mobile display
  const getHeadingLines = () => {
    if (user) {
      return [`Welcome Back,`, `${firstName}!`];
    }
    // For non-authenticated users, split into meaningful chunks
    return [`Cloud Inc. Co`, `Billing and Insurance`];
  };

  const headingLines = getHeadingLines();

  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Enhanced Background Gradients - positioned higher and extending to image container */}
      <div className="absolute inset-x-0 top-0 h-[120vh] pointer-events-none overflow-hidden">
        <div className="relative h-full w-full transform -translate-y-19">
          <LaserFlow />
        </div>
        {/* Additional laser flow overlay that extends to bottom */}
      </div>

      {/* Background gradient layers */}
      <div className="absolute inset-0 -z-10">
        <div className="gradient-bg background-base" />
        <div className="gradient-bg1 background-base" />
        <div className="gradient-top background-base" />

        {/* Improved animated background elements */}
        <div className="absolute top-1/4 left-1/6 w-32 h-32 sm:w-64 sm:h-64 lg:w-96 lg:h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-1/4 right-1/6 w-28 h-28 sm:w-56 sm:h-56 lg:w-80 lg:h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>

      {/* Decorative Border Elements with improved mobile spacing */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500/20 via-blue-500/40 to-transparent">
        <div className="absolute top-1/4 h-16 sm:h-32 lg:h-40 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent" />
      </div>
      <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-purple-500/20 via-purple-500/40 to-transparent">
        <div className="absolute top-1/4 h-16 sm:h-32 lg:h-40 w-px bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
      </div>
      {/* Main content container with improved mobile-first design */}
      <div className="relative z-10 flex min-h-screen flex-col px-4 py-[10vh] sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto w-full max-w-7xl flex-1 flex flex-col justify-center space-y-6 sm:space-y-8 lg:space-y-12">
          {/* Enhanced heading with proper line breaks for mobile */}
          <div className="text-center space-y-2 sm:space-y-4">
            <h1 className="mx-auto max-w-5xl font-extrabold leading-[0.9] sm:leading-tight text-slate-700 dark:text-slate-200">
              {headingLines.map((line, lineIndex) => (
                <div key={lineIndex} className="block">
                  {line.split(" ").map((word, wordIndex) => (
                    <motion.span
                      key={`${lineIndex}-${wordIndex}`}
                      initial={{ opacity: 0, filter: "blur(4px)", y: 20 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: (lineIndex * 2 + wordIndex) * 0.1,
                        ease: "easeOut",
                      }}
                      className="mr-2 inline-block bg-gradient-to-r from-gray-100 to-gray-200 bg-clip-text text-transparent text-5xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl sm:mr-3 lg:mr-4"
                    >
                      {word}
                    </motion.span>
                  ))}
                </div>
              ))}
            </h1>

            {/* Subtitle for better context */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.2 }}
              className="mx-auto max-w-2xl text-sm sm:text-base lg:text-lg text-yellow-500 dark:text-yellow-500 font-medium"
            >
              {user
                ? "Manage your healthcare billing and insurance with ease"
                : "Streamline your healthcare billing and insurance management"}
            </motion.p>
          </div>

          {/* Enhanced button section with improved mobile layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 1.4 }}
            className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:gap-6"
          >
            {user ? (
              <>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="group relative w-full max-w-xs transform overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/40 to-blue-600/40 backdrop-blur-md border border-white/20 px-6 py-6 sm:py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 sm:w-auto sm:px-8 lg:px-10"
                >
                  <span className="relative z-10 text-sm sm:text-base">
                    Ask AI
                    <CloudLightningIcon className="inline-block ml-2 h-5 w-5 text-white" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>

                <button
                  onClick={() => (window.location.href = "/analytics")}
                  className="group relative w-full max-w-xs transform overflow-hidden rounded-2xl border-2 border-gray-300/30 bg-white/5 backdrop-blur-md px-6 py-6 sm:py-4  font-semibold text-gray-700 transition-all duration-300 hover:scale-105 hover:border-blue-400/50 hover:shadow-xl dark:border-gray-600/30 dark:bg-green-500/60 dark:text-gray-200 sm:w-auto sm:px-8 lg:px-10"
                >
                  <span className="relative z-10 text-sm sm:text-base">
                    <TextShimmer
                      duration={2}
                      spread={4}
                      className="text-purple-900/60"
                    >
                      Analytics Dashboard
                    </TextShimmer>
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="group relative w-full max-w-xs transform overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500/40 to-blue-600/40 backdrop-blur-md border border-white/20 px-6 py-6 sm:py-4 font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25 sm:w-auto sm:px-8 lg:px-10"
                >
                  <span className="relative z-10 text-sm sm:text-base">
                    Login!
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </button>

                <button
                  onClick={() => (window.location.href = "/support")}
                  className="group relative w-full max-w-xs transform overflow-hidden rounded-2xl border-2 border-gray-300/30 bg-white/5 backdrop-blur-md px-6 font-semibold text-gray-700 py-6 sm:py-4 transition-all duration-300 hover:scale-105 hover:border-blue-400/50 hover:shadow-xl dark:border-gray-600/30 dark:bg-yellow-600/60 dark:text-gray-200 sm:w-auto sm:px-8 lg:px-10"
                >
                  <span className="relative z-10 text-sm  sm:text-base">
                    <TextShimmer duration={10} spread={10}>
                      Contact Support
                    </TextShimmer>
                  </span>
                </button>
              </>
            )}
          </motion.div>

          {/* Enhanced Image Section with laser flow integration - Always shows image */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.6 }}
            className="relative mx-auto w-full max-w-6xl flex-1 flex items-end pb-[13vh] sm:pb-12"
          >
            <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200/20 bg-white/5 p-2 shadow-2xl backdrop-blur-md dark:border-gray-700/20 dark:bg-gray-900/10 sm:rounded-3xl sm:p-3 lg:p-4">
              {/* Enhanced inner gradient overlay that connects with laser flow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/15 via-transparent to-purple-50/15 dark:from-blue-900/15 dark:to-purple-900/15 sm:rounded-3xl" />

              {/* Enhanced laser flow edge glow effect */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/15 via-purple-500/8 to-blue-500/15 blur-sm opacity-60 sm:rounded-3xl" />

              {/* Always show image - Analytics are for the /admin page */}
              <div className="relative z-10 overflow-hidden rounded-xl border border-gray-300/20 dark:border-gray-700/20 sm:rounded-2xl">
                <div className="relative group">
                  <Image
                    src="/background/CloudInCo.png"
                    width={1600}
                    height={900}
                    alt="Healthcare management dashboard preview"
                    className="aspect-[16/9] scale-150 h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Enhanced gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 via-transparent to-purple-500/15" />

                  {/* Enhanced laser flow connection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none" />

                  {/* Optional content overlay for non-authenticated users */}
                  {!user && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="text-center text-white">
                        <h3 className="text-lg sm:text-4xl font-bold mb-2">
                          Get Started Today
                        </h3>
                        <p className="text-sm sm:text-base opacity-90">
                          <button
                            className="underline font-semibold text-yellow-300"
                            onClick={() => (window.location.href = "/login")}
                          >
                            Login
                          </button>{" "}
                          to access your dashboard
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* AI Modal */}
      <ErrorBoundary
        fallback={
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-red-800 font-semibold">AI Chat Error</h3>
              <p className="text-red-600 text-sm mt-2">
                Unable to load AI chat component
              </p>
              <button
                onClick={() => setShowAIModal(false)}
                className="mt-3 px-3 py-1 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        }
      >
        <TextInput isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
      </ErrorBoundary>
    </section>
  );
}
