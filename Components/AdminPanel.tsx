"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  isUserAdminClient,
  grantAdminPrivilegesClient,
  revokeAdminPrivilegesClient,
  getAllUsersClient,
  getAllPaymentRecordsClient,
} from "@/lib/supabase-db";
import type { User } from "@supabase/supabase-js";

interface UserRole {
  user_id: string;
  role: string;
  granted_by: string;
  granted_at: string;
  profiles: {
    email: string;
    full_name: string;
  } | null;
}

interface PaymentRecord {
  id: number;
  patient_id: string;
  user_id: string;
  full_name: string;
  total_price_php: number;
  payment_status: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
  };
}

export default function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserRole[]>([]);
  const [allRecords, setAllRecords] = useState<PaymentRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"users" | "records">("users");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const supabase = createClient();

  const loadUsers = useCallback(async () => {
    try {
      const userData = await getAllUsersClient(currentUser);
      // Transform the data to match our interface
      const transformedUsers = userData.map((user) => ({
        ...user,
        profiles: Array.isArray(user.profiles)
          ? user.profiles[0] || null
          : user.profiles,
      }));
      setUsers(transformedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Failed to load users");
    }
  }, [currentUser]);

  const loadAllRecords = useCallback(async () => {
    try {
      const records = await getAllPaymentRecordsClient(currentUser);
      setAllRecords(records);
    } catch (err) {
      console.error("Error loading records:", err);
      setError("Failed to load payment records");
    }
  }, [currentUser]);

  const checkAdminStatus = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user);
        console.log("AdminPanel - Current user:", user.id, user.email);
        const adminStatus = await isUserAdminClient(user.id, user);
        console.log("AdminPanel - Admin status:", adminStatus);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          loadUsers();
          loadAllRecords();
        }
      } else {
        console.log("AdminPanel - No user found");
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, [supabase, loadUsers, loadAllRecords]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  const handleGrantAdmin = async (userId: string) => {
    try {
      setError(null);
      await grantAdminPrivilegesClient(userId, currentUser);
      setSuccess("Admin privileges granted successfully");
      loadUsers();
    } catch (err) {
      console.error("Error granting admin privileges:", err);
      setError("Failed to grant admin privileges");
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    try {
      setError(null);
      await revokeAdminPrivilegesClient(userId, currentUser);
      setSuccess("Admin privileges revoked successfully");
      loadUsers();
    } catch (err) {
      console.error("Error revoking admin privileges:", err);
      setError("Failed to revoke admin privileges");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Access Denied
        </h3>
        <p className="text-gray-500">
          You don&apos;t have admin privileges to access this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Admin Panel
        </h2>

        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("users")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab("records")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "records"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All Payment Records
            </button>
          </nav>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              User Roles Management
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Granted At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.user_id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.profiles?.full_name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {user.profiles?.email || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.granted_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {user.role === "admin" ? (
                          <button
                            onClick={() => handleRevokeAdmin(user.user_id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Revoke Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGrantAdmin(user.user_id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Grant Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Records Tab */}
        {activeTab === "records" && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              All Payment Records
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {allRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        {record.full_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Patient ID: {record.patient_id}
                      </p>
                      <p className="text-sm text-gray-500">
                        User: {record.profiles?.email || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        ₱{record.total_price_php.toLocaleString()}
                      </p>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          record.payment_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : record.payment_status === "failed"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.payment_status}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Created: {new Date(record.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
