"use client";
import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { TooltipPortal } from "../TooltipPortal";

export interface LineChartData {
  label: string;
  value: number;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface LineChartProps {
  data: LineChartData[];
  title?: string;
  width?: number;
  height?: number;
  color?: string;
  showPoints?: boolean;
  showGrid?: boolean;
  animated?: boolean;
  valueFormatter?: (value: number) => string;
  labelFormatter?: (label: string) => string;
  showTrend?: boolean;
  fillArea?: boolean;
  multiple?: boolean;
  datasets?: { data: LineChartData[]; color: string; label: string }[];
  onPointClick?: (data: LineChartData, index: number) => void;
}

export const LineChart = React.memo(
  ({
    data,
    title,
    width = 400,
    height = 250,
    color = "#3B82F6",
    showPoints = true,
    showGrid = true,
    animated = true,
    valueFormatter = (value) => value.toString(),
    labelFormatter = (label) => label,
    showTrend = false,
    fillArea = true,
    multiple = false,
    datasets,
    onPointClick,
  }: LineChartProps) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [tooltipData, setTooltipData] = useState<{
      data: LineChartData;
      x: number;
      y: number;
    } | null>(null);

    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Handle multiple datasets or single dataset
    const chartData =
      multiple && datasets
        ? datasets
        : [{ data, color, label: title || "Data" }];

    // Calculate combined min/max for multiple datasets
    const allValues = chartData.flatMap((dataset) =>
      dataset.data.map((item) => item.value)
    );
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues);
    const valueRange = maxValue - minValue || 1;

    // Calculate trend line if requested
    const trendLine = useMemo(() => {
      if (!showTrend || !data.length) return null;

      const n = data.length;
      const sumX = data.reduce((sum, _, i) => sum + i, 0);
      const sumY = data.reduce((sum, item) => sum + item.value, 0);
      const sumXY = data.reduce((sum, item, i) => sum + i * item.value, 0);
      const sumXX = data.reduce((sum, _, i) => sum + i * i, 0);

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return { slope, intercept };
    }, [data, showTrend]);

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

        <div className="relative w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4">
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
                      strokeDasharray="2,2"
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
                      strokeDasharray="2,2"
                    />
                  );
                })}
              </g>
            )}

            {/* Gradient definition */}
            <defs>
              <linearGradient
                id={`lineGradient-${color}`}
                x1="0%"
                y1="0%"
                x2="0%"
                y2="100%"
              >
                <stop
                  offset="0%"
                  style={{ stopColor: color, stopOpacity: 0.4 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: color, stopOpacity: 0.05 }}
                />
              </linearGradient>
              <filter id="dropShadow">
                <feDropShadow
                  dx="0"
                  dy="2"
                  stdDeviation="3"
                  floodOpacity="0.3"
                />
              </filter>
            </defs>

            {/* Area under the line */}
            {fillArea && (
              <motion.path
                initial={animated ? { pathLength: 0, opacity: 0 } : {}}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                d={`${pathData} L ${points[points.length - 1].x} ${
                  height - padding
                } L ${padding} ${height - padding} Z`}
                fill={`url(#lineGradient-${color})`}
              />
            )}

            {/* Trend line */}
            {trendLine && (
              <line
                x1={padding}
                y1={
                  padding +
                  (1 - (trendLine.intercept - minValue) / valueRange) *
                    chartHeight
                }
                x2={width - padding}
                y2={
                  padding +
                  (1 -
                    (trendLine.slope * (data.length - 1) +
                      trendLine.intercept -
                      minValue) /
                      valueRange) *
                    chartHeight
                }
                stroke="#FF6B6B"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.7"
              />
            )}

            {/* Main line */}
            <motion.path
              initial={animated ? { pathLength: 0 } : {}}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
              d={pathData}
              stroke={color}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#dropShadow)"
            />

            {/* Data points */}
            {showPoints &&
              points.map((point, index) => (
                <motion.circle
                  key={index}
                  initial={animated ? { scale: 0, opacity: 0 } : {}}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5, duration: 0.3 }}
                  cx={point.x}
                  cy={point.y}
                  r={hoveredIndex === index ? "8" : "6"}
                  fill={hoveredIndex === index ? "#fff" : color}
                  stroke={color}
                  strokeWidth="3"
                  className="transition-all cursor-pointer"
                  filter="url(#dropShadow)"
                  onMouseEnter={(e) => {
                    setHoveredIndex(index);
                    const svgRect = e.currentTarget
                      .closest("svg")
                      ?.getBoundingClientRect();
                    if (svgRect) {
                      setTooltipData({
                        data: { label: point.label, value: point.value },
                        x: svgRect.left + (point.x / width) * svgRect.width,
                        y:
                          svgRect.top +
                          (point.y / height) * svgRect.height -
                          10,
                      });
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredIndex(null);
                    setTooltipData(null);
                  }}
                  onClick={() =>
                    onPointClick?.(
                      { label: point.label, value: point.value },
                      index
                    )
                  }
                />
              ))}

            {/* X-axis labels */}
            {data.map((item, index) => {
              const x = padding + (index / (data.length - 1)) * chartWidth;
              return (
                <motion.text
                  key={index}
                  initial={animated ? { opacity: 0, y: 10 } : {}}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.8 }}
                  x={x}
                  y={height - 10}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 dark:fill-gray-400 font-medium"
                >
                  {labelFormatter(item.label)}
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
                  initial={animated ? { opacity: 0, x: -10 } : {}}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 }}
                  x={20}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-600 dark:fill-gray-400 font-medium"
                >
                  {valueFormatter(value)}
                </motion.text>
              );
            })}
          </svg>
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

LineChart.displayName = "LineChart";
