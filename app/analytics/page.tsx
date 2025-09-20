"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "motion/react";
import AnalyticsDashboard from "@/Components/AnalyticsDashboard";
import Nav from "@/Components/Nav";
import TextInput from "@/Components/TextInput";
import { CloudLightningIcon } from "lucide-react";
import React from "react";
import type { User } from "@supabase/supabase-js";

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const [showAIModal, setShowAIModal] = React.useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
          return;
        }

        setUser(user);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen ">
      <Nav />
      <div className="py-20">
        <div className="mt-20 px-4 sm:px-6 lg:px-8  text-center">
          <h1 className="text-4xl font-bold text-white py-2">
            Analytics Dashboard
          </h1>
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
        </div>
      </div>
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <AnalyticsDashboard />
      </motion.div>

      {/* AI Modal */}
      <TextInput isOpen={showAIModal} onClose={() => setShowAIModal(false)} />
    </div>
  );
}
