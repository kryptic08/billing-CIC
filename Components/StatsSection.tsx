"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  CreditCard,
} from "lucide-react";

interface BillingSummary {
  totalRecords: number;
  totalPatients: number;
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  averageCharges: number;
  averageCoverage: number;
  latestAdmissionDate: string;
  oldestAdmissionDate: string;
  paymentStatusBreakdown: Record<string, number>;
  insuranceProviders: Record<string, number>;
  genderDistribution: Record<string, number>;
  serviceTypes: Record<string, number>;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  subtitle?: string;
  trend?: string;
  color: string;
  delay: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  color,
  delay,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className=" rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <span className="text-green-500 text-sm font-medium flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" />
          {trend}
        </span>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium">
        {title}
      </h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {subtitle && (
        <p className="text-gray-500 dark:text-gray-400 text-xs">{subtitle}</p>
      )}
    </div>
  </motion.div>
);

const StatsSection: React.FC = () => {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      try {
        const response = await fetch("/api/billing/data");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setSummary(data.summary);
        } else {
          throw new Error(data.error || "Failed to fetch billing data");
        }
      } catch (err) {
        console.error("Error fetching billing data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full space-y-6">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading statistics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="text-center">
            <Activity className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
              Error Loading Statistics
            </h3>
            <p className="text-red-600 dark:text-red-400">
              {error || "Unable to load billing statistics"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Get top 5 insurance providers
  const topInsuranceProviders = Object.entries(summary.insuranceProviders)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const collectionRate =
    summary.totalRevenue > 0
      ? (summary.totalPaid / summary.totalRevenue) * 100
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="w-full space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Healthcare Statistics
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of patient data, financial metrics, and insurance analytics
          </p>
        </motion.div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Patients"
            value={summary.totalPatients}
            icon={Users}
            subtitle={`${summary.totalRecords} total records`}
            color="bg-blue-500"
            delay={0.1}
          />

          <StatsCard
            title="Total Revenue"
            value={`$${summary.totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            subtitle="Gross billing amount"
            color="bg-green-500"
            delay={0.2}
          />

          <StatsCard
            title="Average Charges"
            value={`$${summary.averageCharges.toLocaleString()}`}
            icon={TrendingUp}
            subtitle="Per patient record"
            color="bg-purple-500"
            delay={0.3}
          />

          <StatsCard
            title="Collection Rate"
            value={`${collectionRate.toFixed(1)}%`}
            icon={CreditCard}
            subtitle={`$${summary.totalOutstanding.toLocaleString()} outstanding`}
            color="bg-orange-500"
            delay={0.4}
          />
        </div>

        {/* Insurance Providers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className=" rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg"
        >
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-lg bg-blue-500 mr-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Insurance Providers
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Top providers by patient count
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {topInsuranceProviders.map(([provider, count], index) => {
              const percentage = (count / summary.totalPatients) * 100;
              return (
                <motion.div
                  key={provider}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {provider}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {count} patients ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                        className="bg-blue-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {Object.keys(summary.insuranceProviders).length > 5 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
              className="text-center text-gray-500 dark:text-gray-400 text-sm mt-4"
            >
              + {Object.keys(summary.insuranceProviders).length - 5} more
              providers
            </motion.p>
          )}
        </motion.div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Average Coverage"
            value={`${summary.averageCoverage.toFixed(1)}%`}
            icon={Activity}
            subtitle="Insurance coverage rate"
            color="bg-teal-500"
            delay={0.6}
          />

          <StatsCard
            title="Service Types"
            value={Object.keys(summary.serviceTypes).length}
            icon={Activity}
            subtitle="Different services offered"
            color="bg-indigo-500"
            delay={0.7}
          />

          <StatsCard
            title="Data Range"
            value={new Date(summary.latestAdmissionDate).getFullYear()}
            icon={TrendingUp}
            subtitle={`Since ${new Date(
              summary.oldestAdmissionDate
            ).getFullYear()}`}
            color="bg-rose-500"
            delay={0.8}
          />
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
