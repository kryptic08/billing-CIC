"use client";
import React from "react";
import { motion } from "motion/react";

interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

export function BarChart({
  data,
  title,
  height = 300,
  showValues = true,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6366F1",
  ];

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      {title && (
        <h3 className="text-base sm:text-lg font-semibold text-center text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}

      <div className="relative p-3 sm:p-4 w-full overflow-hidden">
        <div
          className="flex items-end justify-center space-x-1 sm:space-x-2"
          style={{ height }}
        >
          {data.map((item, index) => {
            const barHeight = (item.value / maxValue) * (height - 60);
            const color = item.color || colors[index % colors.length];

            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="relative flex flex-col items-center">
                  {showValues && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                      className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                    >
                      {item.value}
                    </motion.span>
                  )}

                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: barHeight }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.6,
                      ease: "easeOut",
                    }}
                    className="w-12 rounded-t-lg relative overflow-hidden"
                    style={{
                      backgroundColor: color,
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </motion.div>
                </div>

                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center max-w-16 break-words"
                >
                  {item.label}
                </motion.span>
              </div>
            );
          })}
        </div>

        {/* X-axis line */}
        <div className="absolute bottom-0 left-4 right-4 h-px bg-gray-300 dark:bg-gray-600" />
      </div>
    </div>
  );
}
