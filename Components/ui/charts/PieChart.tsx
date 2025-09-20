"use client";
import React from "react";
import { motion } from "motion/react";

interface PieChartData {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  title?: string;
  size?: number;
}

export function PieChart({ data, title, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const createPath = (percentage: number, startAngle: number) => {
    const angle = (percentage / 100) * 360;
    const endAngle = startAngle + angle;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
    const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
    const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
    const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);

    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full">
      {title && (
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}

      <div className="relative flex flex-col items-center">
        <svg
          width={size}
          height={size}
          viewBox="0 0 100 100"
          className="transform -rotate-90 max-w-full h-auto"
        >
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const path = createPath(percentage, startAngle);
            cumulativePercentage += percentage;

            return (
              <motion.path
                key={index}
                d={path}
                fill={item.color}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
                style={{
                  filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
                }}
              />
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-full">
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {item.label}
            </span>
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
