import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getBillingDataForAI } from '@/lib/billing-data-service';
import { BillingRecord } from '@/lib/billing-analytics-real';

interface ChatMessage {
  role: string;
  content: string;
}

interface ChartSpecification {
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

interface ChartError {
  error: string;
  suggestions: string[];
}

interface Summary {
  totalRecords: number;
  totalPatients: number;
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  averageCharges: number;
  averageCoverage: number;
  oldestAdmissionDate: string | null;
  latestAdmissionDate: string | null;
  paymentStatusBreakdown: Record<string, number>;
  insuranceProviders: Record<string, number>;
  genderDistribution: Record<string, number>;
  serviceTypes: Record<string, number>;
  recentRecords: BillingRecord[];
}

interface Summary {
  totalRecords: number;
  totalPatients: number;
  totalRevenue: number;
  totalPaid: number;
  totalOutstanding: number;
  averageCharges: number;
  averageCoverage: number;
  oldestAdmissionDate: string | null;
  latestAdmissionDate: string | null;
  paymentStatusBreakdown: Record<string, number>;
  insuranceProviders: Record<string, number>;
  genderDistribution: Record<string, number>;
  serviceTypes: Record<string, number>;
  recentRecords: BillingRecord[];
}

// Chart detection keywords and patterns
const CHART_KEYWORDS = [
  'create', 'creat', 'generate', 'show', 'display', 'visualize', 'plot', 'draw',
  'chart', 'graph', 'pie', 'bar', 'line', 'donut', 'histogram', 'scatter',
  'trend', 'distribution', 'breakdown', 'analysis', 'analytics', 'visualization',
  'dashboard', 'report', 'summary', 'overview', 'statistics', 'stats',
  'comparison', 'compare', 'versus', 'vs', 'against', 'between'
];

const CHART_PHRASES = [
  'make a chart', 'create a graph', 'show me a', 'generate a chart',
  'visualize the', 'plot the', 'draw a', 'display a chart',
  'chart showing', 'graph of', 'breakdown of', 'analysis of',
  'distribution of', 'trend of', 'comparison of', 'statistics for'
];

function detectChartIntent(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim();
  
  // PRIORITY 1: If message starts with "create", always trigger chart generation
  if (lowerMessage.startsWith('create')) {
    return true;
  }
  
  // PRIORITY 2: Check for explicit chart phrases first (these are definitive)
  const hasChartPhrase = CHART_PHRASES.some(phrase => lowerMessage.includes(phrase));
  if (hasChartPhrase) return true;
  
  // PRIORITY 3: Check for explicit chart type mentions
  const explicitChartTypes = ['pie chart', 'bar chart', 'line chart', 'donut chart', 'graph', 'chart'];
  const hasExplicitChart = explicitChartTypes.some(type => lowerMessage.includes(type));
  if (hasExplicitChart) return true;
  
  // PRIORITY 4: Only check for ambiguous keywords if there's strong data visualization context
  const words = lowerMessage.split(/\s+/);
  const hasChartKeyword = CHART_KEYWORDS.some(keyword => 
    words.some(word => word.includes(keyword))
  );
  
  if (hasChartKeyword) {
    // Require BOTH chart keywords AND strong visualization context for ambiguous cases
    const dataTerms = ['data', 'revenue', 'patient', 'payment', 'insurance', 'billing', 'total', 'amount'];
    const visualizationTerms = ['by', 'per', 'breakdown', 'distribution', 'comparison', 'analysis'];
    
    const hasDataContext = dataTerms.some(term => lowerMessage.includes(term));
    const hasVisualizationContext = visualizationTerms.some(term => lowerMessage.includes(term));
    
    // Only trigger chart for ambiguous keywords if both data and visualization context present
    return hasDataContext && hasVisualizationContext;
  }
  
  return false;
}

// Generate chart specification using AI
async function generateChartSpecification(userQuery: string, billingDataSample: BillingRecord[]): Promise<ChartSpecification> {
  if (!genAI) {
    // Fallback to intelligent parsing if no AI available
    const fallbackResult = parseUserQueryFallback(userQuery);
    if ('error' in fallbackResult) {
      // Return a default chart spec when parsing fails
      return {
        chartType: "bar",
        title: "Data Analysis",
        dataField: "TotalCharges",
        aggregation: "sum",
        sortBy: "value",
        sortOrder: "desc",
        filters: {
          category: "PaymentStatus",
        },
        visualization: {
          size: "medium",
          showGrid: true,
          showTotal: true,
          orientation: "vertical",
          chartStyle: "standard",
        },
        insights: `Unable to parse your specific request: ${fallbackResult.error}. Showing default chart instead. ${fallbackResult.suggestions.join(' ')}`,
      };
    }
    return fallbackResult;
  }

  const prompt = `
You are an expert data visualization assistant. Analyze the user's request and generate a precise chart specification.

User Request: "${userQuery}"

Available Billing Data Fields:
- PatientID, PatientName, DateOfBirth, Gender, Address, PhoneNumber, Email
- InsuranceProvider, PolicyNumber, BillingNumber
- AdmissionDate, DischargeDate, ServiceDescription
- TotalCharges, InsuranceCoveragePercentage, AmountCoveredByInsurance
- AmountPaid, RunningBalance, PaymentStatus

Sample Data Context:
${JSON.stringify(billingDataSample.slice(0, 3))}

Generate a JSON response with the following structure:
{
  "chartType": "pie" | "line" | "bar",
  "title": "Descriptive chart title",
  "dataField": "Primary data field to analyze (e.g., TotalCharges, PatientID for counts)",
  "timeGrouping": "daily" | "weekly" | "monthly" | "quarterly" | "yearly" (only for time-based charts),
  "aggregation": "sum" | "count" | "average" | "max" | "min",
  "sortBy": "value" | "label",
  "sortOrder": "asc" | "desc",
  "limit": number (for top N items),
  "filters": {
    "category": "Field to group by (e.g., InsuranceProvider, ServiceDescription, PaymentStatus)",
    "dateRange": "Date filter if specified",
    "valueThreshold": "Minimum value threshold if specified"
  },
  "visualization": {
    "size": "small" | "medium" | "large",
    "colorScheme": "blue" | "green" | "red" | "purple" | "orange" | "professional" | "colorful" | "pastel",
    "showTrend": boolean,
    "showGrid": boolean,
    "showTotal": boolean,
    "showPercentages": boolean,
    "orientation": "horizontal" | "vertical",
    "chartStyle": "donut" | "standard"
  },
  "insights": "Brief explanation of what this chart will show"
}

Guidelines:
1. For revenue/financial queries, use TotalCharges field with sum aggregation
2. For patient counts, use PatientID field with count aggregation
3. For distributions, use pie charts with appropriate category grouping
4. For trends over time, use line charts with appropriate time grouping
5. For comparisons, use bar charts
6. Extract visual preferences (colors, size, style) from the user's language
7. Default to medium size and standard style unless specified
8. Provide meaningful chart titles and insights

Respond only with valid JSON, no additional text.`;

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024, // Reduced from default to save on quota
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText) {
      throw new Error("No response from Gemini API");
    }

    // Parse the JSON response from Gemini
    const cleanedText = generatedText.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error: unknown) {
    console.error("Failed to generate chart with AI:", {
      status: typeof error === 'object' && error !== null && 'status' in error ? (error as { status?: number }).status : undefined,
      message: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.name : 'Unknown'
    });
    
    // If it's a rate limit error, provide helpful feedback
    if (typeof error === 'object' && error !== null && 'status' in error && (error as { status?: number }).status === 429) {
      console.warn('Rate limit hit, falling back to intelligent parsing');
    }
    
    // Fall back to intelligent parsing
    const fallbackResult = parseUserQueryFallback(userQuery);
    if ('error' in fallbackResult) {
      // Return a default chart spec when parsing fails
      return {
        chartType: "bar",
        title: "Data Analysis",
        dataField: "TotalCharges",
        aggregation: "sum",
        sortBy: "value",
        sortOrder: "desc",
        filters: {
          category: "PaymentStatus",
        },
        visualization: {
          size: "medium",
          showGrid: true,
          showTotal: true,
          orientation: "vertical",
          chartStyle: "standard",
        },
        insights: `Chart generation failed: ${fallbackResult.error}. ${fallbackResult.suggestions.join(' ')}`,
      };
    }
    return fallbackResult;
  }
}

// Database field mapping for comprehensive chart generation
const DATABASE_FIELDS = {
  // Numeric fields that can be aggregated
  numeric: {
    'TotalCharges': { name: 'Total Charges', aggregations: ['sum', 'average', 'max', 'min'], description: 'revenue/billing amounts' },
    'InsuranceCoveragePercentage': { name: 'Insurance Coverage %', aggregations: ['average', 'max', 'min'], description: 'insurance coverage percentages' },
    'AmountCoveredByInsurance': { name: 'Insurance Coverage Amount', aggregations: ['sum', 'average', 'max', 'min'], description: 'insurance covered amounts' },
    'AmountPaid': { name: 'Amount Paid', aggregations: ['sum', 'average', 'max', 'min'], description: 'payment amounts' },
    'RunningBalance': { name: 'Outstanding Balance', aggregations: ['sum', 'average', 'max', 'min'], description: 'outstanding balances' },
    'PolicyNumber': { name: 'Policy Number', aggregations: ['count'], description: 'policy counts' },
    'PatientID': { name: 'Patient Count', aggregations: ['count'], description: 'patient counts' }
  } as const,
  // Categorical fields for grouping
  categorical: {
    'PaymentStatus': { name: 'Payment Status', values: ['Paid', 'Partially Paid', 'Unpaid'], description: 'payment status categories' },
    'ServiceDescription': { name: 'Service/Procedure', description: 'medical procedures and services' },
    'InsuranceProvider': { name: 'Insurance Provider', description: 'insurance companies' },
    'Gender': { name: 'Gender', values: ['Male', 'Female'], description: 'patient gender' },
    'BillingNumber': { name: 'Billing Number', description: 'billing reference numbers' }
  } as const,
  // Date fields for time-based analysis
  temporal: {
    'AdmissionDate': { name: 'Admission Date', description: 'hospital admission dates' },
    'DischargeDate': { name: 'Discharge Date', description: 'hospital discharge dates' },
    'DateOfBirth': { name: 'Date of Birth', description: 'patient birth dates' }
  } as const,
  // Text fields (limited chart utility)
  text: {
    'PatientName': { name: 'Patient Name', description: 'patient names' },
    'Address': { name: 'Address', description: 'patient addresses' },
    'PhoneNumber': { name: 'Phone Number', description: 'contact numbers' },
    'Email': { name: 'Email', description: 'email addresses' }
  } as const
} as const;

// Helper functions for type-safe field access
function getNumericField(field: string) {
  return DATABASE_FIELDS.numeric[field as keyof typeof DATABASE_FIELDS.numeric];
}

function getCategoricalField(field: string) {
  return DATABASE_FIELDS.categorical[field as keyof typeof DATABASE_FIELDS.categorical];
}

function getTemporalField(field: string) {
  return DATABASE_FIELDS.temporal[field as keyof typeof DATABASE_FIELDS.temporal];
}

function getTextField(field: string) {
  return DATABASE_FIELDS.text[field as keyof typeof DATABASE_FIELDS.text];
}

// Validate if a chart request is possible with available data
function validateChartRequest(dataField: string, category: string, aggregation: string): { valid: boolean; reason?: string; suggestion?: string } {
  // Check if data field exists and supports the aggregation
  const numericField = getNumericField(dataField);
  if (numericField) {
    const supportedAggregations = numericField.aggregations as readonly string[];
    if (!supportedAggregations.includes(aggregation)) {
      return {
        valid: false,
        reason: `${aggregation} aggregation is not supported for ${numericField.name}`,
        suggestion: `Try using: ${numericField.aggregations.join(', ')} aggregation instead`
      };
    }
  }

  // Check if category field exists
  if (category && !getCategoricalField(category) && !getTemporalField(category)) {
    return {
      valid: false,
      reason: `Cannot group by '${category}' - field not available for grouping`,
      suggestion: `Available grouping options: ${Object.keys(DATABASE_FIELDS.categorical).join(', ')}`
    };
  }

  // Check for text field usage (not suitable for charts)
  if (getTextField(dataField)) {
    return {
      valid: false,
      reason: `Cannot create charts with text field '${dataField}'`,
      suggestion: `Try using numeric fields: ${Object.keys(DATABASE_FIELDS.numeric).join(', ')}`
    };
  }

  // Check if both dataField and category are the same (usually not meaningful)
  if (dataField === category) {
    return {
      valid: false,
      reason: `Cannot group ${dataField} by itself`,
      suggestion: `Try grouping by a different field like PaymentStatus, ServiceDescription, or InsuranceProvider`
    };
  }

  return { valid: true };
}

// Enhanced fallback parsing function with comprehensive field mapping
function parseUserQueryFallback(userQuery: string): ChartSpecification | ChartError {
  const query = userQuery.toLowerCase();
  
  // Determine chart type with more sophisticated detection
  let chartType: "pie" | "line" | "bar" = "bar";
  if (query.includes("pie") || query.includes("donut") || query.includes("distribution") || query.includes("breakdown") || query.includes("proportion")) {
    chartType = "pie";
  } else if (query.includes("line") || query.includes("trend") || query.includes("over time") || query.includes("timeline") || query.includes("monthly") || query.includes("yearly")) {
    chartType = "line";
  } else if (query.includes("bar") || query.includes("comparison") || query.includes("compare") || query.includes("versus") || query.includes("vs")) {
    chartType = "bar";
  }
  
  // Enhanced data field detection
  let dataField = "TotalCharges";
  let aggregation: "sum" | "count" | "average" | "max" | "min" = "sum";
  
  // Revenue/Financial queries
  if (query.includes("revenue") || query.includes("total charges") || query.includes("billing") || query.includes("financial")) {
    dataField = "TotalCharges";
    aggregation = "sum";
  }
  // Payment amount queries
  else if (query.includes("payment") && (query.includes("amount") || query.includes("paid"))) {
    dataField = "AmountPaid";
    aggregation = "sum";
  }
  // Insurance coverage queries
  else if (query.includes("insurance") && (query.includes("coverage") || query.includes("covered"))) {
    if (query.includes("percentage") || query.includes("%")) {
      dataField = "InsuranceCoveragePercentage";
      aggregation = "average";
    } else {
      dataField = "AmountCoveredByInsurance";
      aggregation = "sum";
    }
  }
  // Outstanding/Balance queries
  else if (query.includes("outstanding") || query.includes("balance") || query.includes("owed")) {
    dataField = "RunningBalance";
    aggregation = "sum";
  }
  // Count/Patient queries
  else if (query.includes("patient") || query.includes("count") || query.includes("number of")) {
    dataField = "PatientID";
    aggregation = "count";
  }
  // Average queries
  else if (query.includes("average") || query.includes("mean")) {
    aggregation = "average";
    // Keep the dataField as determined above or default
  }
  // Maximum queries
  else if (query.includes("highest") || query.includes("maximum") || query.includes("max")) {
    aggregation = "max";
  }
  // Minimum queries
  else if (query.includes("lowest") || query.includes("minimum") || query.includes("min")) {
    aggregation = "min";
  }

  // Enhanced category detection
  let category = "PaymentStatus"; // Default category
  
  // Procedure/Service queries
  if (query.includes("procedure") || query.includes("service") || query.includes("treatment") || query.includes("medical service")) {
    category = "ServiceDescription";
  }
  // Insurance provider queries
  else if (query.includes("insurance provider") || query.includes("insurer") || query.includes("insurance company")) {
    category = "InsuranceProvider";
  }
  // Gender queries
  else if (query.includes("gender") || query.includes("male") || query.includes("female")) {
    category = "Gender";
  }
  // Payment status queries (default, but be explicit)
  else if (query.includes("payment status") || query.includes("paid") || query.includes("unpaid") || query.includes("outstanding")) {
    category = "PaymentStatus";
  }

  // Validate the chart request
  const validation = validateChartRequest(dataField, category, aggregation);
  if (!validation.valid) {
    return {
      error: validation.reason || "Invalid chart configuration",
      suggestions: [
        validation.suggestion || "Please refine your query",
        "Available data fields: " + Object.keys(DATABASE_FIELDS.numeric).join(", "),
        "Available grouping fields: " + Object.keys(DATABASE_FIELDS.categorical).join(", "),
        "Example queries: 'revenue by procedure', 'patient count by gender', 'average charges by insurance provider'"
      ]
    };
  }

  // Time grouping detection
  let timeGrouping: "daily" | "weekly" | "monthly" | "quarterly" | "yearly" = "monthly";
  if (query.includes("daily") || query.includes("day")) timeGrouping = "daily";
  else if (query.includes("weekly") || query.includes("week")) timeGrouping = "weekly";
  else if (query.includes("quarterly") || query.includes("quarter")) timeGrouping = "quarterly";
  else if (query.includes("yearly") || query.includes("year") || query.includes("annual")) timeGrouping = "yearly";
  
  // Visual preferences detection
  let size: "small" | "medium" | "large" = "medium";
  if (query.includes("large") || query.includes("big")) size = "large";
  else if (query.includes("small") || query.includes("compact")) size = "small";
  
  let colorScheme: string | undefined;
  if (query.includes("blue")) colorScheme = "blue";
  else if (query.includes("green")) colorScheme = "green";
  else if (query.includes("red")) colorScheme = "red";
  else if (query.includes("purple")) colorScheme = "purple";
  else if (query.includes("orange")) colorScheme = "orange";
  else if (query.includes("professional")) colorScheme = "professional";
  else if (query.includes("colorful")) colorScheme = "colorful";
  else if (query.includes("pastel")) colorScheme = "pastel";
  
  // Extract limit for top N queries
  const topMatch = query.match(/top (\d+)/);
  const firstMatch = query.match(/first (\d+)/);
  const lastMatch = query.match(/last (\d+)/);
  const limit = topMatch ? parseInt(topMatch[1]) : firstMatch ? parseInt(firstMatch[1]) : lastMatch ? parseInt(lastMatch[1]) : undefined;
  
  // Generate appropriate title
  const fieldName = getNumericField(dataField)?.name || getCategoricalField(dataField)?.name || dataField;
  const categoryName = getCategoricalField(category)?.name || getTemporalField(category)?.name || category;
  const title = `${fieldName} by ${categoryName}`;

  return {
    chartType,
    title,
    dataField,
    timeGrouping: chartType === "line" ? timeGrouping : undefined,
    aggregation,
    sortBy: "value",
    sortOrder: "desc",
    limit,
    filters: {
      category: chartType === "pie" || chartType === "bar" ? category : undefined,
    },
    visualization: {
      size,
      colorScheme,
      showTrend: query.includes("trend"),
      showGrid: !query.includes("clean") && !query.includes("minimal"),
      showTotal: query.includes("total") || aggregation === "sum",
      showPercentages: query.includes("percent") || chartType === "pie",
      orientation: query.includes("horizontal") ? "horizontal" : "vertical",
      chartStyle: query.includes("donut") ? "donut" : "standard",
    },
    insights: generateChartInsights(chartType, fieldName, categoryName, aggregation, category, query),
  };
}

// Generate detailed insights for charts
function generateChartInsights(chartType: string, fieldName: string, categoryName: string, aggregation: string, category: string, query: string): string {
  const aggregationText = aggregation === 'count' ? 'count' : aggregation;
  const baseInsight = `This ${chartType} chart displays ${fieldName.toLowerCase()} ${aggregationText} grouped by ${categoryName.toLowerCase()}`;
  
  // Add contextual insights based on the data fields
  let contextualInsight = "";
  
  if (category === "ServiceDescription") {
    contextualInsight = " This helps identify which medical procedures generate the most revenue or have the highest patient volume, useful for resource allocation and service optimization.";
  } else if (category === "PaymentStatus") {
    contextualInsight = " This reveals your payment collection efficiency and identifies outstanding amounts that need attention.";
  } else if (category === "InsuranceProvider") {
    contextualInsight = " This shows which insurance providers cover the most patients or contribute the most revenue, helping with contract negotiations.";
  } else if (category === "Gender") {
    contextualInsight = " This provides demographic insights into your patient population for targeted healthcare planning.";
  } else {
    contextualInsight = " This analysis helps you understand patterns in your healthcare billing data.";
  }
  
  // Add specific insights based on query terms
  if (query.includes("revenue") || query.includes("financial")) {
    contextualInsight += " Focus on the highest revenue categories to optimize your financial performance.";
  } else if (query.includes("patient")) {
    contextualInsight += " Understanding patient distribution helps with capacity planning and service delivery.";
  }
  
  return baseInsight + "." + contextualInsight;
}

// Handle chart generation requests
async function handleChartRequest(message: string, billingData: BillingRecord[], summary: Summary, chatHistory?: ChatMessage[]) {
  console.log('AI API: Processing chart request');
  
  try {
  // Generate chart specification
  const chartSpec = await generateChartSpecification(message, billingData);
  
  // Use the insights from the chart specification directly instead of making another API call
  let chartExplanation = chartSpec.insights;    // Only make an additional AI call if the insight is generic and we have API access
    const isGenericInsight = chartSpec.insights.includes('based on your request') || 
                             chartSpec.insights.includes('This chart shows') ||
                             chartSpec.insights.length < 50;
    
    if (genAI && isGenericInsight) {
      try {
        console.log('AI API: Generating enhanced chart explanation...');
        
        const totalRevenueFormatted = summary.totalRevenue.toLocaleString();
        
        const enhancedPrompt = `Briefly explain this ${chartSpec.chartType} chart in 1-2 sentences:
        
Title: ${chartSpec.title}
Data: ${chartSpec.dataField} (${chartSpec.aggregation})
Grouping: ${chartSpec.filters?.category || 'Default grouping'}
User Request: "${message}"

Context: Healthcare billing system with ${summary.totalRecords} records, $${totalRevenueFormatted} total revenue.

Be concise and focus on what insights this chart provides for healthcare billing analysis.`;

        const model = genAI.getGenerativeModel({ 
          model: "gemini-1.5-flash",
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 150, // Limit tokens to reduce API usage
          }
        });
        
        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        const aiExplanation = response.text();
        
        if (aiExplanation && aiExplanation.trim().length > 10) {
          chartExplanation = aiExplanation.trim();
        }
      } catch (explanationError: unknown) {
        console.warn('Failed to generate enhanced chart explanation:', {
          status: typeof explanationError === 'object' && explanationError !== null && 'status' in explanationError ? (explanationError as { status?: number }).status : undefined,
          message: explanationError instanceof Error ? explanationError.message : 'Unknown error',
          type: explanationError instanceof Error ? explanationError.name : 'Unknown'
        });
        
        // If it's a rate limit error, provide a better fallback
        if (typeof explanationError === 'object' && explanationError !== null && 'status' in explanationError && (explanationError as { status?: number }).status === 429) {
          chartExplanation = `This ${chartSpec.chartType} chart shows ${chartSpec.dataField.toLowerCase()} analysis. Due to high demand, I'm using a simplified explanation right now.`;
        }
      }
    }

    console.log('AI API: Successfully generated chart specification');

    return NextResponse.json({
      success: true,
      type: 'chart',
      chartSpec: chartSpec,
      response: chartExplanation,
      dataContext: {
        totalRecords: summary.totalRecords,
        totalPatients: summary.totalPatients,
        totalRevenue: summary.totalRevenue,
        totalOutstanding: summary.totalOutstanding,
        latestDate: summary.latestAdmissionDate
      }
    });

  } catch (error) {
    console.error('Chart generation error:', error);
    
    // Fallback to chart generation with basic spec
    const fallbackResult = parseUserQueryFallback(message);
    
    if ('error' in fallbackResult) {
      // Return error response when chart generation is impossible
      return NextResponse.json({
        success: false,
        type: 'error',
        error: fallbackResult.error,
        suggestions: fallbackResult.suggestions,
        response: `I'm unable to create that chart: ${fallbackResult.error}. Here are some alternatives you can try: ${fallbackResult.suggestions.join('; ')}`
      });
    }
    
    return NextResponse.json({
      success: true,
      type: 'chart',
      chartSpec: fallbackResult,
      response: `I've generated a ${fallbackResult.chartType} chart for your request. ${fallbackResult.insights}`,
      dataContext: {
        totalRecords: summary.totalRecords,
        totalPatients: summary.totalPatients,
        totalRevenue: summary.totalRevenue,
        totalOutstanding: summary.totalOutstanding,
        latestDate: summary.latestAdmissionDate
      }
    });
  }
}

// Handle normal chat requests
async function handleChatRequest(message: string, billingData: BillingRecord[], summary: Summary, chatHistory?: ChatMessage[]) {
  console.log('AI API: Processing normal chat request');
  
  // Prepare comprehensive context for AI with all billing data
  const totalRevenueFormatted = summary.totalRevenue.toLocaleString();
  const totalPaidFormatted = summary.totalPaid.toLocaleString();
  const totalOutstandingFormatted = summary.totalOutstanding.toLocaleString();
  const averageChargesFormatted = summary.averageCharges.toLocaleString();
  
  const dataContext = `HEALTHCARE BILLING SYSTEM DATA - COMPLETE DATASET

SUMMARY STATISTICS:
- Total Records: ${summary.totalRecords}
- Total Unique Patients: ${summary.totalPatients}
- Total Revenue: $${totalRevenueFormatted}
- Total Amount Paid: $${totalPaidFormatted}
- Total Outstanding: $${totalOutstandingFormatted}
- Average Charges per Record: $${averageChargesFormatted}
- Average Insurance Coverage: ${summary.averageCoverage}%
- Date Range: ${summary.oldestAdmissionDate} to ${summary.latestAdmissionDate}

PAYMENT STATUS BREAKDOWN:
${Object.entries(summary.paymentStatusBreakdown).map(([status, count]) => `- ${status}: ${count} records`).join('\n')}

INSURANCE PROVIDERS:
${Object.entries(summary.insuranceProviders).slice(0, 10).map(([provider, count]) => `- ${provider}: ${count} patients`).join('\n')}

GENDER DISTRIBUTION:
${Object.entries(summary.genderDistribution).map(([gender, count]) => `- ${gender}: ${count} patients`).join('\n')}

TOP SERVICE TYPES:
${Object.entries(summary.serviceTypes).slice(0, 10).map(([service, count]) => `- ${service}: ${count} records`).join('\n')}

SAMPLE RECENT RECORDS (Top 5):
${JSON.stringify(summary.recentRecords.slice(0, 5), null, 2)}

AVAILABLE DATA FIELDS:
${Object.keys(billingData[0] || {}).join(', ')}

You have access to ALL ${summary.totalRecords} records covering ${summary.totalPatients} patients. Use this comprehensive data to provide detailed insights about:
- Financial performance and revenue trends
- Patient demographics and service utilization
- Insurance claim patterns and coverage analysis
- Outstanding payment management
- Service type and billing code analysis
- Seasonal or temporal patterns in healthcare utilization`;

  // Include chat history if available for better context
  const conversationHistory = chatHistory && chatHistory.length > 0 
    ? `\n\nCONVERSATION HISTORY:\n${chatHistory.map((msg: ChatMessage) => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}\n`
    : '';

  const systemPrompt = `You are a healthcare billing and insurance AI assistant. You have access to billing data from a healthcare management system. Your role is to:

1. Help users understand their billing and insurance data
2. Answer questions about payments, claims, and outstanding amounts
3. Provide insights about healthcare costs and insurance coverage
4. Explain billing codes and medical procedures when relevant
5. Help identify trends in healthcare spending

Please be professional, accurate, and helpful. If you don't have enough information to answer a question completely, let the user know what additional information would be helpful.

${dataContext}${conversationHistory}

Current User Question: ${message}`;

  console.log('AI API: Sending request to Gemini...');

  // Get AI response using Gemini 1.5 Flash with error handling
  try {
    if (!genAI) {
      throw new Error('Google AI not initialized - missing API key');
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024, // Limit tokens to manage quota
      }
    });
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    if (!aiResponse) {
      throw new Error('Empty response from Gemini API');
    }

    console.log('AI API: Successfully generated response of length:', aiResponse.length);

    return NextResponse.json({
      success: true,
      type: 'chat',
      response: aiResponse,
      dataContext: {
        totalRecords: summary.totalRecords,
        totalPatients: summary.totalPatients,
        totalRevenue: summary.totalRevenue,
        totalOutstanding: summary.totalOutstanding,
        latestDate: summary.latestAdmissionDate
      }
    });
  } catch (geminiError: unknown) {
    console.error('Gemini API error:', {
      message: geminiError instanceof Error ? geminiError.message : 'Unknown error',
      name: geminiError instanceof Error ? geminiError.name : 'Unknown',
      status: typeof geminiError === 'object' && geminiError !== null && 'status' in geminiError ? (geminiError as { status?: number }).status : undefined,
      stack: geminiError instanceof Error ? geminiError.stack : undefined
    });
    
    // Provide specific error handling for rate limits
    if (typeof geminiError === 'object' && geminiError !== null && 'status' in geminiError && (geminiError as { status?: number }).status === 429) {
      return NextResponse.json({
        success: true,
        type: 'chat',
        response: `I'm experiencing high demand right now and need to slow down my responses. Here's what I can tell you about your billing data:

**Summary Statistics:**
- Total Records: ${summary.totalRecords.toLocaleString()}
- Total Patients: ${summary.totalPatients.toLocaleString()}
- Total Revenue: $${summary.totalRevenue.toLocaleString()}
- Outstanding Balance: $${summary.totalOutstanding.toLocaleString()}

**Quick Insights:**
- Average charge per record: $${summary.averageCharges.toLocaleString()}
- Average insurance coverage: ${summary.averageCoverage}%
- Data spans from ${summary.oldestAdmissionDate} to ${summary.latestAdmissionDate}

Please try asking your question again in a moment, or ask for a specific chart to visualize this data.`,
        dataContext: {
          totalRecords: summary.totalRecords,
          totalPatients: summary.totalPatients,
          totalRevenue: summary.totalRevenue,
          totalOutstanding: summary.totalOutstanding,
          latestDate: summary.latestAdmissionDate
        }
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate AI response', 
        details: geminiError instanceof Error ? geminiError.message : 'Unknown error from AI service'
      },
      { status: 500 }
    );
  }
}

// Force Node.js runtime for this route (important for Vercel)
export const runtime = 'nodejs';

// Validate environment variables with better error handling
const geminiApiKey = process.env.NEXT_GEMINI_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;

console.log('AI Route Initialization:', {
  hasGeminiKey: !!geminiApiKey,
  runtime: 'nodejs',
  timestamp: new Date().toISOString()
});

if (!geminiApiKey) {
  console.error('Missing Google AI API key. Please set NEXT_GEMINI_KEY or GOOGLE_AI_API_KEY environment variable.');
}

// Only initialize if API key is available
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export async function POST(request: NextRequest) {
  console.log('AI API: Request received at', new Date().toISOString());
  
  try {
    // Debug environment variables
    console.log('AI API: Environment check:', {
      hasGeminiKey: !!geminiApiKey,
      hasVercelUrl: !!process.env.VERCEL_URL,
      hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      nodeEnv: process.env.NODE_ENV,
      vercelUrl: process.env.VERCEL_URL ? `${process.env.VERCEL_URL.substring(0, 20)}...` : 'none'
    });

    const body = await request.json();
    console.log('AI API: Request body received:', {
      hasMessage: !!body.message,
      messageLength: body.message?.length || 0,
      hasChatHistory: !!body.chatHistory,
      chatHistoryLength: body.chatHistory?.length || 0
    });

    const { message, chatHistory } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Check if AI is properly configured
    if (!genAI) {
      console.error('Google AI not initialized - missing API key');
      
      // For chart requests, return an error since we can't generate charts without AI
      const isChartRequest = detectChartIntent(message);
      if (isChartRequest) {
        return NextResponse.json({
          success: false,
          type: 'error',
          error: 'AI service not configured for chart generation',
          suggestions: [
            'Chart generation requires AI service configuration',
            'Please contact your administrator to set up the AI service',
            'You can still ask general questions about your billing data'
          ],
          response: 'I\'m unable to generate charts right now because the AI service isn\'t configured. You can still ask me general questions about your billing data.'
        });
      }
      
      // For normal chat, provide a basic fallback response
      return NextResponse.json({
        success: true,
        type: 'chat',
        response: `I can help you with basic information about your billing system. While I can't provide AI-powered insights right now due to service configuration, I can tell you that your system contains billing and patient data. 

You can try these commands:
• **Type 'create pie chart'** - I'll try to generate a basic chart
• **Ask about specific data** - I'll do my best to help with available information

What would you like to know about your billing data?`,
        dataContext: {
          totalRecords: 0,
          totalPatients: 0,
          totalRevenue: 0,
          totalOutstanding: 0,
          latestDate: new Date().toISOString()
        }
      });
    }

    console.log('AI API: Received message:', message);
    console.log('AI API: Chat history length:', chatHistory?.length || 0);

    // Detect if user wants a chart or normal chat
    const isChartRequest = detectChartIntent(message);
    console.log('AI API: Chart intent detected:', isChartRequest, 'for message:', message.substring(0, 50));

    console.log('AI API: Fetching comprehensive billing data...');
    
    // Get billing data directly (no HTTP request needed)
    let billingResult;
    try {
      billingResult = await getBillingDataForAI();
    } catch (dataError) {
      console.error('Failed to fetch billing data:', dataError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch billing data for AI context', 
          details: dataError instanceof Error ? dataError.message : 'Database error'
        },
        { status: 500 }
      );
    }

    console.log('AI API: Billing data response:', {
      success: billingResult.success,
      hasData: !!billingResult.data,
      dataLength: billingResult.data?.length || 0,
      hasSummary: !!billingResult.summary
    });
    
    if (!billingResult.success || !billingResult.data) {
      console.error('No billing data available:', billingResult);
      return NextResponse.json({
        error: 'No billing data available in the system',
        details: 'The billing database appears to be empty or inaccessible'
      }, { status: 404 });
    }

    const billingData = billingResult.data;
    const summary = billingResult.summary;

    if (isChartRequest) {
      // Handle chart generation request
      return await handleChartRequest(message, billingData, summary, chatHistory);
    } else {
      // Handle normal chat request
      return await handleChatRequest(message, billingData, summary, chatHistory);
    }

  } catch (error: unknown) {
    console.error('AI API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
      type: typeof error
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to process AI request', 
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}