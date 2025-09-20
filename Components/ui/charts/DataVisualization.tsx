"use client";
import React from "react";
import { PieChart } from "./PieChart";
import { BarChart } from "./BarChart";
import { LineChart } from "./LineChart";

// Sample data for demonstration
const samplePieData = [
  { label: "Consultations", value: 45, color: "#3B82F6" },
  { label: "Treatments", value: 30, color: "#10B981" },
  { label: "Follow-ups", value: 15, color: "#F59E0B" },
  { label: "Emergency", value: 10, color: "#EF4444" },
];

const sampleBarData = [
  { label: "Jan", value: 120 },
  { label: "Feb", value: 150 },
  { label: "Mar", value: 180 },
  { label: "Apr", value: 200 },
  { label: "May", value: 175 },
  { label: "Jun", value: 220 },
];

const sampleLineData = [
  { label: "Week 1", value: 10 },
  { label: "Week 2", value: 25 },
  { label: "Week 3", value: 15 },
  { label: "Week 4", value: 35 },
  { label: "Week 5", value: 28 },
  { label: "Week 6", value: 42 },
];

export function DataVisualization() {
  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 sm:space-y-8 p-3 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Healthcare Analytics Dashboard
        </h2>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 px-2">
          Comprehensive data visualization for patient records and payment
          analytics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <PieChart
            data={samplePieData}
            title="Service Distribution"
            size={180}
          />
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <BarChart
            data={sampleBarData}
            title="Monthly Patients"
            height={200}
          />
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 sm:col-span-1 lg:col-span-2 xl:col-span-1">
          <LineChart
            data={sampleLineData}
            title="Weekly Revenue Trend"
            width={280}
            height={200}
            color="#8B5CF6"
          />
        </div>
      </div>

      {/* Additional charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Another Bar Chart with different styling */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <BarChart
            data={[
              { label: "Pending", value: 12, color: "#F59E0B" },
              { label: "Completed", value: 45, color: "#10B981" },
              { label: "Failed", value: 3, color: "#EF4444" },
            ]}
            title="Payment Status"
            height={180}
          />
        </div>

        {/* Another Line Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <LineChart
            data={[
              { label: "Q1", value: 150 },
              { label: "Q2", value: 200 },
              { label: "Q3", value: 180 },
              { label: "Q4", value: 250 },
            ]}
            title="Quarterly Growth"
            width={280}
            height={180}
            color="#06B6D4"
            showGrid={false}
          />
        </div>
      </div>
    </div>
  );
}
