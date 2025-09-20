import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

interface BillingRecord {
  PatientID: number;
  PatientName: string;
  DateOfBirth: string;
  Gender: string;
  Address: string;
  PhoneNumber: string;
  Email: string;
  InsuranceProvider: string;
  PolicyNumber: number;
  BillingNumber: string;
  AdmissionDate: string;
  DischargeDate: string;
  ServiceDescription: string;
  TotalCharges: number;
  InsuranceCoveragePercentage: number;
  AmountCoveredByInsurance: number;
  AmountPaid: number;
  RunningBalance: number;
  PaymentStatus: string;
}

export async function GET() {
  try {
    // Check if Supabase is properly configured
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { 
          error: 'Database service is not properly configured', 
          details: 'Missing Supabase environment variables'
        },
        { status: 500 }
      );
    }

    console.log('Billing Data API: Fetching all patient records from Supabase...');
    
    // Fetch ALL billing data from Supabase (no limit for complete dataset)
    const { data, error } = await supabase
      .from('billing_and_insurance')
      .select('*')
      .order('AdmissionDate', { ascending: false });

    if (error) {
      console.error('Supabase error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch billing data', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    const billingData = data as BillingRecord[];
    
    if (!billingData || billingData.length === 0) {
      return NextResponse.json({
        error: 'No billing data found',
        details: 'The database appears to be empty'
      }, { status: 404 });
    }

    // Calculate comprehensive statistics for AI context
    const totalPatients = new Set(billingData.map(record => record.PatientID)).size;
    const totalRevenue = billingData.reduce((sum, record) => sum + (record.TotalCharges || 0), 0);
    const totalPaid = billingData.reduce((sum, record) => sum + (record.AmountPaid || 0), 0);
    const totalOutstanding = billingData.reduce((sum, record) => sum + (record.RunningBalance || 0), 0);
    
    // Payment status breakdown
    const paymentStatusCounts = billingData.reduce((acc, record) => {
      const status = record.PaymentStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Insurance provider breakdown
    const insuranceProviders = billingData.reduce((acc, record) => {
      const provider = record.InsuranceProvider || 'Unknown';
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Gender distribution
    const genderDistribution = billingData.reduce((acc, record) => {
      const gender = record.Gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Service type analysis
    const serviceTypes = billingData.reduce((acc, record) => {
      const service = record.ServiceDescription || 'Unknown';
      acc[service] = (acc[service] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Average calculations
    const averageCharges = billingData.length > 0 ? totalRevenue / billingData.length : 0;
    const averageCoverage = billingData.length > 0 ? 
      billingData.reduce((sum, record) => sum + (record.InsuranceCoveragePercentage || 0), 0) / billingData.length : 0;

    // Most recent records for context (limit to 10 for AI context)
    const recentRecords = billingData.slice(0, 10);

    console.log(`Billing Data API: Successfully fetched ${billingData.length} records for ${totalPatients} patients`);
    
    return NextResponse.json({
      success: true,
      data: billingData,
      summary: {
        totalRecords: billingData.length,
        totalPatients: totalPatients,
        totalRevenue: Math.round(totalRevenue),
        totalPaid: Math.round(totalPaid),
        totalOutstanding: Math.round(totalOutstanding),
        averageCharges: Math.round(averageCharges),
        averageCoverage: Math.round(averageCoverage * 100) / 100,
        latestAdmissionDate: billingData[0]?.AdmissionDate || null,
        oldestAdmissionDate: billingData[billingData.length - 1]?.AdmissionDate || null,
        paymentStatusBreakdown: paymentStatusCounts,
        insuranceProviders: insuranceProviders,
        genderDistribution: genderDistribution,
        serviceTypes: serviceTypes,
        recentRecords: recentRecords
      }
    });

  } catch (error) {
    console.error('Billing Data API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}