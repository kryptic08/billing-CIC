import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const geminiApiKey = process.env.NEXT_GEMINI_KEY!;

if (!geminiApiKey) {
  console.error('Missing Google AI API key');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('AI API: Fetching comprehensive billing data...');
    
    // Fetch all billing data from our dedicated billing data API
    const billingResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/billing/data`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!billingResponse.ok) {
      console.error('Failed to fetch billing data:', billingResponse.status);
      return NextResponse.json(
        { 
          error: 'Failed to fetch billing data for AI context', 
          details: `Billing API returned status ${billingResponse.status}`
        },
        { status: 500 }
      );
    }

    const billingResult = await billingResponse.json();
    
    if (!billingResult.success || !billingResult.data) {
      console.error('No billing data available');
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

    const systemPrompt = `You are a healthcare billing and insurance AI assistant. You have access to billing data from a healthcare management system. Your role is to:

1. Help users understand their billing and insurance data
2. Answer questions about payments, claims, and outstanding amounts
3. Provide insights about healthcare costs and insurance coverage
4. Explain billing codes and medical procedures when relevant
5. Help identify trends in healthcare spending

Please be professional, accurate, and helpful. If you don't have enough information to answer a question completely, let the user know what additional information would be helpful.

${dataContext}

User Question: ${message}`;

    console.log('AI API: Sending request to Gemini...');

    // Get AI response using Gemini 1.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const aiResponse = response.text();

    console.log('AI API: Successfully generated response');

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

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate AI response', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}