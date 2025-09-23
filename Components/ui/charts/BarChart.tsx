"use client";
import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { TooltipPortal } from "../TooltipPortal";

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface BarChartProps {
  data: BarChartData[];
  title?: string;
  height?: number;
  showValues?: boolean;
  animated?: boolean;
  sortBy?: "value" | "label" | "none";
  sortOrder?: "asc" | "desc";
  maxBars?: number;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  colorScheme?: string[];
  showTotal?: boolean;
  onBarClick?: (data: BarChartData, index: number) => void;
}

export const BarChart = React.memo(
  ({
    data,
    title,
    height = 300,
    showValues = true,
    animated = true,
    sortBy = "none",
    sortOrder = "desc",
    maxBars,
    valueFormatter = (value) => value.toString(),
    labelFormatter = (label) => label,
    colorScheme,
    showTotal = false,
    onBarClick,
  }: BarChartProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tooltipData, setTooltipData] = useState<{
      data: BarChartData;
      x: number;
      y: number;
    } | null>(null);

    // Process and sort data
    const processedData = useMemo(() => {
      let result = [...data];

      // Sort data if requested
      if (sortBy !== "none") {
        result.sort((a, b) => {
          let comparison = 0;
          if (sortBy === "value") {
            comparison = a.value - b.value;
          } else if (sortBy === "label") {
            comparison = a.label.localeCompare(b.label);
          }
          return sortOrder === "asc" ? comparison : -comparison;
        });
      }

      // Limit number of bars if specified
      if (maxBars && result.length > maxBars) {
        result = result.slice(0, maxBars);
      }

      return result;
    }, [data, sortBy, sortOrder, maxBars]);

    // Calculate total for percentage calculations
    const total = useMemo(
      () => processedData.reduce((sum, item) => sum + item.value, 0),
      [processedData]
    );

    // Memoize expensive calculations
    const maxValue = useMemo(
      () => Math.max(...processedData.map((item) => item.value)),
      [processedData]
    );

    const colors = useMemo(
      () =>
        colorScheme || [
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
        ],
      [colorScheme]
    );

    return (
      <div className="space-y-3 sm:space-y-4 w-full">
        {title && (
          <h3 className="text-base sm:text-lg font-semibold text-center text-gray-800 dark:text-gray-200">
            {title}
          </h3>
        )}

        <div className="relative p-3 sm:p-4 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
          {showTotal && (
            <div className="text-center mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total: {valueFormatter(total)}
              </span>
            </div>
          )}

          <div
            className="flex items-end justify-center space-x-1 sm:space-x-2"
            style={{ height }}
          >
            {processedData.map((item, index) => {
              const barHeight = (item.value / maxValue) * (height - 60);
              const color = item.color || colors[index % colors.length];

              return (
                <div
                  key={index}
                  className="flex flex-col items-center space-y-2"
                >
                  <div className="relative flex flex-col items-center">
                    {showValues && (
                      <motion.span
                        initial={animated ? { opacity: 0, y: -10 } : {}}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.5 }}
                        className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1"
                      >
                        {valueFormatter(item.value)}
                      </motion.span>
                    )}

                    <motion.div
                      initial={animated ? { height: 0 } : { height: barHeight }}
                      animate={{ height: barHeight }}
                      transition={{
                        delay: index * 0.1,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className="w-12 rounded-t-lg relative overflow-hidden cursor-pointer transition-all duration-200"
                      style={{
                        backgroundColor: color,
                        boxShadow:
                          hoveredIndex === index
                            ? "0 8px 20px rgba(0,0,0,0.25)"
                            : "0 4px 12px rgba(0,0,0,0.15)",
                        transform:
                          hoveredIndex === index ? "scale(1.05)" : "scale(1)",
                      }}
                      onMouseEnter={(e) => {
                        setHoveredIndex(index);
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltipData({
                          data: item,
                          x: rect.left + rect.width / 2,
                          y: rect.top - 10,
                        });
                      }}
                      onMouseLeave={() => {
                        setHoveredIndex(null);
                        setTooltipData(null);
                      }}
                      onClick={() => onBarClick?.(item, index)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                    </motion.div>
                  </div>

                  <motion.span
                    initial={animated ? { opacity: 0 } : {}}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center max-w-16 break-words"
                  >
                    {labelFormatter(item.label)}
                  </motion.span>
                </div>
              );
            })}
          </div>

          {/* X-axis line */}
          <div className="absolute bottom-4 left-8 right-8 h-px bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-600 to-transparent" />
        </div>

        {/* Tooltip using Portal */}
        <TooltipPortal
          isVisible={!!tooltipData}
          x={tooltipData?.x || 0}
          y={tooltipData?.y || 0}
        >
          {tooltipData && (
            <div className="flex flex-col items-center">
              <span className="font-semibold">
                {labelFormatter(tooltipData.data.label)}
              </span>
              <span className="text-blue-300">
                {valueFormatter(tooltipData.data.value)}
              </span>
              {tooltipData.data.metadata && (
                <div className="text-xs text-gray-300 mt-1">
                  {Object.entries(tooltipData.data.metadata).map(
                    ([key, value]) => (
                      <div key={key}>
                        {key}: {String(value)}
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </TooltipPortal>
      </div>
    );
  }
);

BarChart.displayName = "BarChart";
