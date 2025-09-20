import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ChatMessage {
  role: string;
  content: string;
}

// Force Node.js runtime for this route (important for Vercel)
export const runtime = 'nodejs';

// Validate environment variables with better error handling
const geminiApiKey = process.env.NEXT_GEMINI_KEY || process.env.GOOGLE_AI_API_KEY;

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

    // Check if AI is properly configured
    if (!genAI) {
      console.error('Google AI not initialized - missing API key');
      return NextResponse.json(
        { 
          error: 'AI service is not properly configured', 
          details: 'Missing Google AI API key in environment variables',
          debug: {
            hasGeminiKey: !!geminiApiKey,
            env: process.env.NODE_ENV
          }
        },
        { status: 500 }
      );
    }

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

    console.log('AI API: Received message:', message);
    console.log('AI API: Chat history length:', chatHistory?.length || 0);

    console.log('AI API: Fetching comprehensive billing data...');
    
    // Build the correct API URL for internal calls
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_SITE_URL 
      ? process.env.NEXT_PUBLIC_SITE_URL
      : 'http://localhost:3000';
    
    const billingApiUrl = `${baseUrl}/api/billing/data`;
    console.log('AI API: Calling billing API at:', billingApiUrl);
    
    // Fetch all billing data from our dedicated billing data API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    let billingResponse;
    try {
      billingResponse = await fetch(billingApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Failed to fetch billing data:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch billing data for AI context', 
          details: fetchError instanceof Error ? fetchError.message : 'Network error'
        },
        { status: 500 }
      );
    }
    
    clearTimeout(timeoutId);

    if (!billingResponse.ok) {
      console.error('Failed to fetch billing data:', {
        status: billingResponse.status,
        statusText: billingResponse.statusText,
        url: billingApiUrl
      });
      
      // Try to get error details from response
      let errorDetails = `Billing API returned status ${billingResponse.status}`;
      try {
        const errorResponse = await billingResponse.json();
        errorDetails = errorResponse.error || errorDetails;
      } catch {
        // If we can't parse the error response, use the status
      }
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch billing data for AI context', 
          details: errorDetails
        },
        { status: 500 }
      );
    }

    const billingResult = await billingResponse.json();
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

    // Prepare comprehensive context for AI with all billing data
    const dataContext = `HEALTHCARE BILLING SYSTEM DATA - COMPLETE DATASET

SUMMARY STATISTICS:
- Total Records: ${summary.totalRecords}
- Total Unique Patients: ${summary.totalPatients}
- Total Revenue: $${summary.totalRevenue.toLocaleString()}
- Total Amount Paid: $${summary.totalPaid.toLocaleString()}
- Total Outstanding: $${summary.totalOutstanding.toLocaleString()}
- Average Charges per Record: $${summary.averageCharges.toLocaleString()}
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

    console.log(`Data context prepared with ${summary.totalRecords} records for ${summary.totalPatients} patients`);

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
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const result = await model.generateContent(systemPrompt);
      const response = await result.response;
      const aiResponse = response.text();

      if (!aiResponse) {
        throw new Error('Empty response from Gemini API');
      }

      console.log('AI API: Successfully generated response of length:', aiResponse.length);

      return NextResponse.json({
        success: true,
        response: aiResponse,
        dataContext: {
          totalRecords: summary.totalRecords,
          totalPatients: summary.totalPatients,
          totalRevenue: summary.totalRevenue,
          totalOutstanding: summary.totalOutstanding,
          latestDate: summary.latestAdmissionDate
        }
      });
    } catch (geminiError) {
      console.error('Gemini API error:', {
        message: geminiError instanceof Error ? geminiError.message : 'Unknown error',
        name: geminiError instanceof Error ? geminiError.name : 'Unknown',
        stack: geminiError instanceof Error ? geminiError.stack : undefined
      });
      
      return NextResponse.json(
        { 
          error: 'Failed to generate AI response', 
          details: geminiError instanceof Error ? geminiError.message : 'Unknown error from AI service'
        },
        { status: 500 }
      );
    }

  } catch (error) {
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