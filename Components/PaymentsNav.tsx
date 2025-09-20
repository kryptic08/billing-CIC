"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import {
  isUserAdminClient,
  grantAdminPrivilegesClient,
} from "@/lib/supabase-db";
import type { User } from "@supabase/supabase-js";

const PaymentsNav = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const checkUserStatus = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        console.log("Current user:", user.id, user.email);
        const adminStatus = await isUserAdminClient(user.id, user);
        console.log("Admin status:", adminStatus);
        setIsAdmin(adminStatus);
      }
    } catch (error) {
      console.error("Error checking user status:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    checkUserStatus();
  }, [checkUserStatus]);

  const handleGrantAdmin = async () => {
    if (!user) return;

    try {
      console.log("Granting admin privileges to:", user.id);
      await grantAdminPrivilegesClient(user.id, user);
      console.log("Admin privileges granted successfully");
      // Re-check admin status
      const adminStatus = await isUserAdminClient(user.id, user);
      console.log("New admin status:", adminStatus);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error("Error granting admin privileges:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/payments";
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/payments" className="text-xl font-bold text-gray-900">
              AI Nako Payments
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              href="/payments"
              className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Payments
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="bg-purple-600 text-white hover:bg-purple-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Admin Panel
              </Link>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.email}</span>
                {!isAdmin && (
                  <button
                    onClick={handleGrantAdmin}
                    className="bg-yellow-600 text-white hover:bg-yellow-700 px-3 py-1 rounded-md text-xs font-medium"
                  >
                    Make Admin
                  </button>
                )}
                <button
                  onClick={handleSignOut}
                  className="bg-red-600 text-white hover:bg-red-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/payments"
                className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PaymentsNav;
