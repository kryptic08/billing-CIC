export { PieChart } from './PieChart';
export { BarChart } from './BarChart';
export { LineChart } from './LineChart';
export { DataVisualization } from './DataVisualization';
export { DynamicChartRenderer } from './DynamicChartRenderer';

// Export chart interfaces
export type { PieChartData, PieChartProps } from './PieChart';
export type { BarChartData, BarChartProps } from './BarChart';
export type { LineChartData, LineChartProps } from './LineChart';
export type { ChartSpecification, DynamicChartProps } from './DynamicChartRenderer';

// A generic chart specification for AI-driven charts (keep for backwards compatibility)
export interface ChartSpec {
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