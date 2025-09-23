"use client";

import React, { useMemo } from "react";
import { PieChart, PieChartData } from "./PieChart";
import { BarChart, BarChartData } from "./BarChart";
import { LineChart, LineChartData } from "./LineChart";

// Enhanced Chart Specification interface that matches our AI output
export interface ChartSpecification {
  chartType: "pie" | "line" | "bar";
  title: string;
  dataField: string;
  timeGrouping?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  aggregation: "sum" | "count" | "average" | "max" | "min";
  sortBy?: "value" | "label";
  sortOrder?: "asc" | "desc";
  limit?: number;
  filters?: {
    category?: string;
    dateRange?: string;
    valueThreshold?: number;
  };
  visualization: {
    size: "small" | "medium" | "large";
    colorScheme?: string;
    showTrend?: boolean;
    showGrid?: boolean;
    showTotal?: boolean;
    showPercentages?: boolean;
    orientation?: "horizontal" | "vertical";
    chartStyle?: "donut" | "standard";
  };
  insights: string;
}

export interface DynamicChartProps {
  specification: ChartSpecification;
  rawData: Record<string, unknown>[];
  onChartClick?: (data: any, index: number) => void;
}

// Color schemes for different chart types
const COLOR_SCHEMES = {
  blue: ["#3B82F6", "#1E40AF", "#60A5FA", "#93C5FD", "#DBEAFE"],
  green: ["#10B981", "#059669", "#34D399", "#6EE7B7", "#A7F3D0"],
  red: ["#EF4444", "#DC2626", "#F87171", "#FCA5A5", "#FED7D7"],
  purple: ["#8B5CF6", "#7C3AED", "#A78BFA", "#C4B5FD", "#E9D5FF"],
  orange: ["#F59E0B", "#D97706", "#FBBF24", "#FCD34D", "#FEF3C7"],
  professional: ["#1E40AF", "#3B82F6", "#60A5FA", "#93C5FD", "#DBEAFE"],
  colorful: [
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
  pastel: [
    "#93C5FD",
    "#6EE7B7",
    "#FCD34D",
    "#FCA5A5",
    "#C4B5FD",
    "#7DD3FC",
    "#BEF264",
    "#FDBA74",
    "#F9A8D4",
    "#A5B4FC",
  ],
};

// Data aggregation utilities
const aggregateData = (
  data: Record<string, unknown>[],
  dataField: string,
  aggregation: ChartSpecification["aggregation"],
  groupBy?: string
): Record<string, number> => {
  if (!groupBy) {
    // Single value aggregation
    const values = data
      .map((record) => record[dataField])
      .filter((val) => val !== null && val !== undefined && !isNaN(Number(val)))
      .map((val) => Number(val));

    switch (aggregation) {
      case "sum":
        return { total: values.reduce((a, b) => a + b, 0) };
      case "count":
        return { total: values.length };
      case "average":
        return {
          total: values.reduce((a, b) => a + b, 0) / values.length || 0,
        };
      case "max":
        return { total: Math.max(...values, 0) };
      case "min":
        return { total: Math.min(...values, 0) };
      default:
        return { total: 0 };
    }
  }

  // Group-by aggregation
  const grouped = data.reduce((acc: Record<string, number[]>, record) => {
    const groupValue = String(record[groupBy] || "Unknown");
    const dataValue = record[dataField];

    if (!acc[groupValue]) acc[groupValue] = [];

    if (
      dataValue !== null &&
      dataValue !== undefined &&
      !isNaN(Number(dataValue))
    ) {
      acc[groupValue].push(Number(dataValue));
    }

    return acc;
  }, {});

  return Object.entries(grouped).reduce(
    (result: Record<string, number>, [key, values]) => {
      switch (aggregation) {
        case "sum":
          result[key] = values.reduce((a, b) => a + b, 0);
          break;
        case "count":
          result[key] = values.length;
          break;
        case "average":
          result[key] =
            values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : 0;
          break;
        case "max":
          result[key] = values.length > 0 ? Math.max(...values) : 0;
          break;
        case "min":
          result[key] = values.length > 0 ? Math.min(...values) : 0;
          break;
        default:
          result[key] = 0;
      }
      return result;
    },
    {}
  );
};

// Time-series data aggregation
const aggregateTimeSeriesData = (
  data: Record<string, unknown>[],
  dataField: string,
  aggregation: ChartSpecification["aggregation"],
  timeGrouping: ChartSpecification["timeGrouping"] = "monthly",
  dateField: string = "AdmissionDate"
): Record<string, number> => {
  const timeGroups = data.reduce((acc: Record<string, number[]>, record) => {
    const dateValue = record[dateField];
    if (!dateValue) return acc;

    const date = new Date(String(dateValue));
    if (isNaN(date.getTime())) return acc;

    let timeKey: string;
    switch (timeGrouping) {
      case "daily":
        timeKey = date.toISOString().split("T")[0];
        break;
      case "weekly":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        timeKey = weekStart.toISOString().split("T")[0];
        break;
      case "monthly":
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
        break;
      case "quarterly":
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        timeKey = `${date.getFullYear()}-Q${quarter}`;
        break;
      case "yearly":
        timeKey = String(date.getFullYear());
        break;
      default:
        timeKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
    }

    const dataValue = record[dataField];
    if (!acc[timeKey]) acc[timeKey] = [];

    if (
      dataValue !== null &&
      dataValue !== undefined &&
      !isNaN(Number(dataValue))
    ) {
      acc[timeKey].push(Number(dataValue));
    }

    return acc;
  }, {});

  return Object.entries(timeGroups).reduce(
    (result: Record<string, number>, [key, values]) => {
      switch (aggregation) {
        case "sum":
          result[key] = values.reduce((a, b) => a + b, 0);
          break;
        case "count":
          result[key] = values.length;
          break;
        case "average":
          result[key] =
            values.length > 0
              ? values.reduce((a, b) => a + b, 0) / values.length
              : 0;
          break;
        case "max":
          result[key] = values.length > 0 ? Math.max(...values) : 0;
          break;
        case "min":
          result[key] = values.length > 0 ? Math.min(...values) : 0;
          break;
        default:
          result[key] = 0;
      }
      return result;
    },
    {}
  );
};

// Format labels based on data type
const formatLabel = (
  label: string,
  type: "time" | "category" | "value"
): string => {
  if (type === "time") {
    // Handle different time formats
    if (label.includes("-Q")) {
      return label; // Keep quarters as-is
    } else if (label.length === 4) {
      return label; // Year
    } else if (label.length === 7) {
      // YYYY-MM format
      const [year, month] = label.split("-");
      return new Date(Number(year), Number(month) - 1).toLocaleDateString(
        "en-US",
        {
          month: "short",
          year: "2-digit",
        }
      );
    } else if (label.length === 10) {
      // YYYY-MM-DD format
      return new Date(label).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  // Truncate long labels for better display
  return label.length > 20 ? label.substring(0, 20) + "..." : label;
};

// Value formatter
const formatValue = (value: number, dataField: string): string => {
  if (
    dataField.toLowerCase().includes("charge") ||
    dataField.toLowerCase().includes("amount") ||
    dataField.toLowerCase().includes("revenue") ||
    dataField.toLowerCase().includes("cost")
  ) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (
    dataField.toLowerCase().includes("percentage") ||
    dataField.toLowerCase().includes("percent")
  ) {
    return `${value.toFixed(1)}%`;
  }

  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }

  return value.toFixed(2);
};

export const DynamicChartRenderer: React.FC<DynamicChartProps> = ({
  specification,
  rawData,
  onChartClick,
}) => {
  const { processedData, pieProps, lineProps, barProps } = useMemo(() => {
    const {
      chartType,
      dataField,
      aggregation,
      filters,
      sortBy,
      sortOrder,
      limit,
      timeGrouping,
      visualization,
    } = specification;

    // Apply filters first
    let filteredData = rawData;
    if (filters?.dateRange) {
      // Apply date range filter if needed
      const [startDate, endDate] = filters.dateRange.split(",");
      if (startDate && endDate) {
        filteredData = rawData.filter((record) => {
          const recordDate = new Date(
            String(record.AdmissionDate || record.DischargeDate || "")
          );
          return (
            recordDate >= new Date(startDate) && recordDate <= new Date(endDate)
          );
        });
      }
    }

    if (filters?.valueThreshold) {
      filteredData = filteredData.filter((record) => {
        const value = Number(record[dataField]);
        return !isNaN(value) && value >= (filters.valueThreshold || 0);
      });
    }

    // Get colors
    const colors =
      COLOR_SCHEMES[visualization.colorScheme as keyof typeof COLOR_SCHEMES] ||
      COLOR_SCHEMES.colorful;

    // Process data based on chart type
    if (chartType === "line" && timeGrouping) {
      // Time series data
      const aggregatedData = aggregateTimeSeriesData(
        filteredData,
        dataField,
        aggregation,
        timeGrouping
      );

      const entries = Object.entries(aggregatedData).sort(([a], [b]) =>
        a.localeCompare(b)
      ); // Sort by time

      const lineData: LineChartData[] = entries.map(([timeKey, value]) => ({
        label: formatLabel(timeKey, "time"),
        value: value,
        metadata: { originalKey: timeKey, field: dataField },
      }));

      if (limit && lineData.length > limit) {
        lineData.splice(0, lineData.length - limit); // Keep most recent
      }

      return {
        processedData: lineData,
        pieProps: undefined,
        lineProps: {
          title: specification.title,
          color: colors[0],
          showGrid: visualization.showGrid !== false,
          showTrend: visualization.showTrend === true,
          fillArea: true,
          valueFormatter: (value: number) => formatValue(value, dataField),
          labelFormatter: (label: string) => label,
          width:
            visualization.size === "large"
              ? 900
              : visualization.size === "small"
              ? 600
              : 750,
          height: visualization.size === "large" ? 350 : 300,
          onPointClick: onChartClick,
        },
        barProps: undefined,
      };
    } else {
      // Category-based data (pie/bar charts)
      const groupBy = filters?.category || "PaymentStatus";
      const aggregatedData = aggregateData(
        filteredData,
        dataField,
        aggregation,
        groupBy
      );

      let entries = Object.entries(aggregatedData);

      // Sort data
      if (sortBy === "value") {
        entries.sort(([, a], [, b]) => (sortOrder === "asc" ? a - b : b - a));
      } else if (sortBy === "label") {
        entries.sort(([a], [b]) =>
          sortOrder === "asc" ? a.localeCompare(b) : b.localeCompare(a)
        );
      }

      // Apply limit
      if (limit && entries.length > limit) {
        const visible = entries.slice(0, limit - 1);
        const remaining = entries.slice(limit - 1);
        const otherValue = remaining.reduce((sum, [, value]) => sum + value, 0);

        if (otherValue > 0) {
          visible.push(["Others", otherValue]);
        }
        entries = visible;
      }

      if (chartType === "pie") {
        const pieData: PieChartData[] = entries.map(
          ([category, value], index) => ({
            label: formatLabel(category, "category"),
            value: value,
            color: colors[index % colors.length],
            metadata: { originalCategory: category, field: dataField },
          })
        );

        return {
          processedData: pieData,
          pieProps: {
            title: specification.title,
            size:
              visualization.size === "large"
                ? 250
                : visualization.size === "small"
                ? 150
                : 200,
            showPercentages: visualization.showPercentages !== false,
            showValues: true,
            valueFormatter: (value: number) => formatValue(value, dataField),
            labelFormatter: (label: string) => label,
            innerRadius: visualization.chartStyle === "donut" ? 40 : 0,
            sortBy: (sortBy === "value"
              ? "value"
              : sortBy === "label"
              ? "label"
              : "none") as "value" | "label" | "none",
            sortOrder: sortOrder || "desc",
            onSliceClick: onChartClick,
          },
          lineProps: undefined,
          barProps: undefined,
        };
      } else {
        // Bar chart
        const barData: BarChartData[] = entries.map(
          ([category, value], index) => ({
            label: formatLabel(category, "category"),
            value: value,
            color: colors[index % colors.length],
            metadata: { originalCategory: category, field: dataField },
          })
        );

        return {
          processedData: barData,
          pieProps: undefined,
          lineProps: undefined,
          barProps: {
            title: specification.title,
            height: visualization.size === "large" ? 350 : 300,
            showValues: true,
            sortBy: (sortBy === "label" ? "label" : "value") as
              | "value"
              | "label"
              | "none",
            sortOrder: sortOrder || "desc",
            showTotal: visualization.showTotal === true,
            valueFormatter: (value: number) => formatValue(value, dataField),
            labelFormatter: (label: string) => label,
            colorScheme: colors,
            onBarClick: onChartClick,
          },
        };
      }
    }
  }, [specification, rawData, onChartClick]);

  // Render appropriate chart component
  switch (specification.chartType) {
    case "pie":
      return pieProps ? (
        <div className="w-full">
          <PieChart data={processedData as PieChartData[]} {...pieProps} />
          {specification.insights && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Insights:</strong> {specification.insights}
              </p>
            </div>
          )}
        </div>
      ) : null;

    case "line":
      return lineProps ? (
        <div className="w-full">
          <LineChart data={processedData as LineChartData[]} {...lineProps} />
          {specification.insights && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                📈 <strong>Insights:</strong> {specification.insights}
              </p>
            </div>
          )}
        </div>
      ) : null;

    case "bar":
      return barProps ? (
        <div className="w-full">
          <BarChart data={processedData as BarChartData[]} {...barProps} />
          {specification.insights && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-800 dark:text-purple-200">
                📊 <strong>Insights:</strong> {specification.insights}
              </p>
            </div>
          )}
        </div>
      ) : null;

    default:
      return (
        <div className="w-full p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-800 dark:text-red-200">
            ❌ Unsupported chart type: {specification.chartType}
          </p>
        </div>
      );
  }
};

export default DynamicChartRenderer;
