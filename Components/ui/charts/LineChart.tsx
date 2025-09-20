"use client";
import React from "react";
import { motion } from "motion/react";

interface LineChartData {
  label: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  title?: string;
  width?: number;
  height?: number;
  color?: string;
  showPoints?: boolean;
  showGrid?: boolean;
}

export function LineChart({
  data,
  title,
  width = 400,
  height = 250,
  color = "#3B82F6",
  showPoints = true,
  showGrid = true,
}: LineChartProps) {
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  const maxValue = Math.max(...data.map((item) => item.value));
  const minValue = Math.min(...data.map((item) => item.value));
  const valueRange = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y =
      padding + (1 - (item.value - minValue) / valueRange) * chartHeight;
    return { x, y, ...item };
  });

  const pathData = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="space-y-3 sm:space-y-4 w-full">
      {title && (
        <h3 className="text-base sm:text-lg font-semibold text-center text-gray-800 dark:text-gray-200">
          {title}
        </h3>
      )}

      <div className="relative w-full overflow-hidden">
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="max-w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid lines */}
          {showGrid && (
            <g className="opacity-20">
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const y = padding + ratio * chartHeight;
                return (
                  <line
                    key={`h-${index}`}
                    x1={padding}
                    y1={y}
                    x2={width - padding}
                    y2={y}
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Vertical grid lines */}
              {data.map((_, index) => {
                const x = padding + (index / (data.length - 1)) * chartWidth;
                return (
                  <line
                    key={`v-${index}`}
                    x1={x}
                    y1={padding}
                    x2={x}
                    y2={height - padding}
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                );
              })}
            </g>
          )}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: color, stopOpacity: 0.3 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: color, stopOpacity: 0 }}
              />
            </linearGradient>
          </defs>

          {/* Area under the line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            d={`${pathData} L ${points[points.length - 1]} ${
              height - padding
            } L ${padding} ${height - padding} Z`}
            fill="url(#lineGradient)"
          />

          {/* Main line */}
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            d={pathData}
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
            }}
          />

          {/* Data points */}
          {showPoints &&
            points.map((point, index) => (
              <motion.circle
                key={index}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                cx={point.x}
                cy={point.y}
                r="5"
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="hover:scale-125 transition-transform cursor-pointer"
                style={{
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                }}
              />
            ))}

          {/* X-axis labels */}
          {data.map((item, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            return (
              <motion.text
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.8 }}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {item.label}
              </motion.text>
            );
          })}

          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * chartHeight;
            const value = Math.round(maxValue - ratio * valueRange);
            return (
              <motion.text
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                x={20}
                y={y + 4}
                textAnchor="end"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {value}
              </motion.text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
