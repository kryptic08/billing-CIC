"use client";
import React, { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import { TooltipPortal } from "../TooltipPortal";

export interface PieChartData {
  label: string;
  value: number;
  color: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface PieChartProps {
  data: PieChartData[];
  title?: string;
  size?: number;
  animated?: boolean;
  showPercentages?: boolean;
  showValues?: boolean;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  innerRadius?: number;
  sortBy?: "value" | "label" | "none";
  sortOrder?: "asc" | "desc";
  maxSlices?: number;
  groupSmallSlices?: boolean;
  smallSliceThreshold?: number;
  onSliceClick?: (data: PieChartData, index: number) => void;
}

export const PieChart = React.memo(
  ({
    data,
    title,
    size = 200,
    animated = true,
    showPercentages = true,
    showValues = false,
    valueFormatter = (value) => value.toString(),
    labelFormatter = (label) => label,
    innerRadius = 0,
    sortBy = "none",
    sortOrder = "desc",
    maxSlices,
    groupSmallSlices = false,
    smallSliceThreshold = 5,
    onSliceClick,
  }: PieChartProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tooltipData, setTooltipData] = useState<{
      data: PieChartData;
      x: number;
      y: number;
    } | null>(null);

    // Process data with sorting and grouping
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

      // Group small slices if requested
      if (groupSmallSlices) {
        const total = result.reduce((sum, item) => sum + item.value, 0);
        const largeSlices = result.filter(
          (item) => (item.value / total) * 100 >= smallSliceThreshold
        );
        const smallSlices = result.filter(
          (item) => (item.value / total) * 100 < smallSliceThreshold
        );

        if (smallSlices.length > 1) {
          const otherSlice = {
            label: "Others",
            value: smallSlices.reduce((sum, item) => sum + item.value, 0),
            color: "#9CA3AF",
            metadata: { groupedItems: smallSlices.length },
          };
          result = [...largeSlices, otherSlice];
        }
      }

      // Limit slices if specified
      if (maxSlices && result.length > maxSlices) {
        const visible = result.slice(0, maxSlices - 1);
        const remaining = result.slice(maxSlices - 1);
        const otherSlice = {
          label: "Others",
          value: remaining.reduce((sum, item) => sum + item.value, 0),
          color: "#9CA3AF",
          metadata: { groupedItems: remaining.length },
        };
        result = [...visible, otherSlice];
      }

      return result;
    }, [
      data,
      sortBy,
      sortOrder,
      maxSlices,
      groupSmallSlices,
      smallSliceThreshold,
    ]);

    // Memoize expensive calculations
    const total = useMemo(
      () => processedData.reduce((sum, item) => sum + item.value, 0),
      [processedData]
    );

    // Memoize path creation function for donut charts
    const createPath = useCallback(
      (percentage: number, startAngle: number) => {
        const angle = (percentage / 100) * 360;
        const endAngle = startAngle + angle;
        const largeArcFlag = angle > 180 ? 1 : 0;
        const outerRadius = 40;
        const innerRadiusActual = (innerRadius / 100) * outerRadius;

        const x1 = 50 + outerRadius * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 50 + outerRadius * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 50 + outerRadius * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 50 + outerRadius * Math.sin((endAngle * Math.PI) / 180);

        if (innerRadiusActual > 0) {
          // Donut chart
          const x3 =
            50 + innerRadiusActual * Math.cos((endAngle * Math.PI) / 180);
          const y3 =
            50 + innerRadiusActual * Math.sin((endAngle * Math.PI) / 180);
          const x4 =
            50 + innerRadiusActual * Math.cos((startAngle * Math.PI) / 180);
          const y4 =
            50 + innerRadiusActual * Math.sin((startAngle * Math.PI) / 180);

          return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadiusActual} ${innerRadiusActual} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
        } else {
          // Regular pie chart
          return `M 50 50 L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
        }
      },
      [innerRadius]
    );

    let cumulativePercentage = 0;

    return (
      <div className="flex flex-col items-center space-y-3 sm:space-y-4 w-full">
        {title && (
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h3>
        )}

        <div className="relative flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4">
          <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className="transform -rotate-90 max-w-full h-auto"
          >
            <defs>
              <filter id="chartShadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="4"
                  floodOpacity="0.2"
                />
              </filter>
            </defs>
            {processedData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = (cumulativePercentage / 100) * 360;
              const path = createPath(percentage, startAngle);
              cumulativePercentage += percentage;

              return (
                <motion.path
                  key={index}
                  d={path}
                  fill={item.color}
                  initial={animated ? { opacity: 0, scale: 0 } : {}}
                  animate={{
                    opacity: hoveredIndex === index ? 0.9 : 1,
                    scale: hoveredIndex === index ? 1.05 : 1,
                  }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.8,
                    ease: "easeOut",
                  }}
                  className="transition-all cursor-pointer"
                  filter="url(#chartShadow)"
                  style={{
                    transformOrigin: "50% 50%",
                  }}
                  onMouseEnter={(e) => {
                    setHoveredIndex(index);
                    const svgRect = e.currentTarget
                      .closest("svg")
                      ?.getBoundingClientRect();
                    if (svgRect) {
                      // Calculate the center angle of this slice
                      const sliceStartAngle =
                        ((cumulativePercentage - percentage) / 100) * 360;
                      const sliceCenterAngle =
                        sliceStartAngle + ((percentage / 100) * 360) / 2;

                      // Convert angle to radians and calculate position on the pie
                      const angleInRadians =
                        ((sliceCenterAngle - 90) * Math.PI) / 180; // -90 to start from top
                      const radius = (svgRect.width / 2) * 0.6; // 60% of radius for better positioning

                      // Calculate tooltip position (using viewport coordinates since tooltip is fixed)
                      const centerX = svgRect.left + svgRect.width / 2;
                      const centerY = svgRect.top + svgRect.height / 2;
                      const tooltipX =
                        centerX + Math.cos(angleInRadians) * radius;
                      const tooltipY =
                        centerY + Math.sin(angleInRadians) * radius;

                      setTooltipData({
                        data: item,
                        x: tooltipX,
                        y: tooltipY - 10,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setTooltipData(null);
                  }}
                  onClick={() => onSliceClick?.(item, index)}
                />
              );
            })}
          </svg>
        </div>

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-full">
          {processedData.map((item, index) => (
            <motion.div
              key={index}
              initial={animated ? { opacity: 0, y: 10 } : {}}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className={`flex items-center space-x-2 px-2 sm:px-3 py-1 rounded-full bg-white dark:bg-gray-700 shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all cursor-pointer ${
                hoveredIndex === index ? "ring-2 ring-blue-500 shadow-lg" : ""
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onSliceClick?.(item, index)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {labelFormatter(item.label)}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-semibold">
                {showValues && `${valueFormatter(item.value)} `}
                {showPercentages &&
                  `(${((item.value / total) * 100).toFixed(1)}%)`}
              </span>
            </motion.div>
          ))}
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
                {showValues && `${valueFormatter(tooltipData.data.value)} `}
                {showPercentages &&
                  `(${((tooltipData.data.value / total) * 100).toFixed(1)}%)`}
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

PieChart.displayName = "PieChart";
