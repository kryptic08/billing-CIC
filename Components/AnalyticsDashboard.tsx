"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PieChart, LineChart } from "@/Components/ui/charts";

interface BillingRecord {
  PatientID: number;
  PatientName: string;
  DateOfBirth: string;
  Gender: string;
  Address: string;
  PhoneNumber: string;
  Email: string;
  InsuranceProvider: string;
  PolicyNumber: number;
  BillingNumber: string;
  AdmissionDate: string;
  DischargeDate: string;
  ServiceDescription: string;
  TotalCharges: number;
  InsuranceCoveragePercentage: number;
  AmountCoveredByInsurance: number;
  AmountPaid: number;
  RunningBalance: number;
  PaymentStatus: string;
}

interface AnalyticsData {
  paymentStatusData: Array<{ label: string; value: number; color: string }>;
  insuranceProvidersData: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  monthlyRevenueData: Array<{ label: string; value: number }>;
  genderDistributionData: Array<{
    label: string;
    value: number;
    color: string;
  }>;
  averageCharges: number;
  totalRevenue: number;
  pendingAmount: number;
  totalPatients: number;
}

export function AnalyticsDashboard() {
  const [billingData, setBillingData] = useState<BillingRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch billing data from API route
        const billingResponse = await fetch("/api/billing/data");
        const billingResult = await billingResponse.json();

        if (!billingResponse.ok) {
          throw new Error(
            billingResult.error || "Failed to fetch billing data"
          );
        }

        // Fetch analytics data from API route
        const analyticsResponse = await fetch("/api/billing/analytics");
        const analyticsResult = await analyticsResponse.json();

        if (!analyticsResponse.ok) {
          throw new Error(
            analyticsResult.error || "Failed to fetch analytics data"
          );
        }

        setBillingData(billingResult.data || []);
        setAnalytics(analyticsResult.analytics);
        console.log("Successfully fetched data:", {
          billingRecords: billingResult.data?.length || 0,
          analytics: analyticsResult.analytics,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-400 text-lg mb-2">Error Loading Data</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-400 text-lg">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white">
                ${analytics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-white">
                {analytics.totalPatients.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">
                Average Charges
              </p>
              <p className="text-2xl font-bold text-white">
                ${analytics.averageCharges.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-sm border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">
                Pending Amount
              </p>
              <p className="text-2xl font-bold text-white">
                ${analytics.pendingAmount.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Payment Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <PieChart
            data={analytics.paymentStatusData}
            title="Payment Status Distribution"
            size={200}
          />
        </motion.div>

        {/* Insurance Providers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <PieChart
            data={analytics.insuranceProvidersData}
            title="Insurance Providers"
            size={200}
          />
        </motion.div>

        {/* Gender Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
        >
          <PieChart
            data={analytics.genderDistributionData}
            title="Patient Gender Distribution"
            size={200}
          />
        </motion.div>
      </div>

      {/* Monthly Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
      >
        <LineChart
          data={analytics.monthlyRevenueData}
          title="Monthly Revenue Trend"
          width={800}
          height={300}
          color="#3B82F6"
          showGrid={true}
        />
      </motion.div>

      {/* Recent Records Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          Recent Billing Records
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium">
                  Patient
                </th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">
                  Service
                </th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">
                  Total Charges
                </th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">
                  Insurance
                </th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {billingData.slice(0, 10).map((record) => (
                <tr
                  key={record.PatientID}
                  className="border-b border-gray-700/50 hover:bg-gray-700/20"
                >
                  <td className="py-3 px-4 text-white">{record.PatientName}</td>
                  <td className="py-3 px-4 text-gray-300">
                    {record.ServiceDescription}
                  </td>
                  <td className="py-3 px-4 text-white">
                    ${record.TotalCharges?.toLocaleString() || 0}
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    {record.InsuranceProvider}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.PaymentStatus === "Paid"
                          ? "bg-green-500/20 text-green-400"
                          : record.PaymentStatus === "Pending"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {record.PaymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-white">
                    ${record.RunningBalance?.toLocaleString() || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

export default AnalyticsDashboard;
