import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching billing data for analytics...');
    
    const { data: billingData, error } = await supabase
      .from('billing_and_insurance')
      .select('*')
      .order('AdmissionDate', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch billing data', 
          details: error.message 
        },
        { status: 500 }
      );
    }

    const data = billingData as BillingRecord[];
    
    if (!data || data.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          paymentStatusData: [],
          insuranceProvidersData: [],
          monthlyRevenueData: [],
          genderDistributionData: [],
          averageCharges: 0,
          totalRevenue: 0,
          pendingAmount: 0,
          totalPatients: 0,
        }
      });
    }

    // Payment Status Distribution
    const paymentStatusCounts = data.reduce((acc, record) => {
      const status = record.PaymentStatus || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const paymentStatusColors = {
      'Paid': '#10B981',
      'Pending': '#F59E0B',
      'Overdue': '#EF4444',
      'Partial': '#8B5CF6',
      'Unknown': '#6B7280'
    };

    const paymentStatusData = Object.entries(paymentStatusCounts).map(([status, count]) => ({
      label: status,
      value: count,
      color: paymentStatusColors[status as keyof typeof paymentStatusColors] || '#6B7280'
    }));

    // Insurance Providers Distribution
    const insuranceProviderCounts = data.reduce((acc, record) => {
      const provider = record.InsuranceProvider || 'Unknown';
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const providerColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
    const insuranceProvidersData = Object.entries(insuranceProviderCounts)
      .slice(0, 7) // Top 7 providers
      .map(([provider, count], index) => ({
        label: provider,
        value: count,
        color: providerColors[index] || '#6B7280'
      }));

    // Gender Distribution
    const genderCounts = data.reduce((acc, record) => {
      const gender = record.Gender || 'Unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const genderColors = {
      'Male': '#3B82F6',
      'Female': '#EC4899',
      'Other': '#8B5CF6',
      'Unknown': '#6B7280'
    };

    const genderDistributionData = Object.entries(genderCounts).map(([gender, count]) => ({
      label: gender,
      value: count,
      color: genderColors[gender as keyof typeof genderColors] || '#6B7280'
    }));

    // Monthly Revenue Data
    const monthlyRevenue = data.reduce((acc, record) => {
      if (record.AdmissionDate && record.TotalCharges) {
        const date = new Date(record.AdmissionDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + record.TotalCharges;
      }
      return acc;
    }, {} as Record<string, number>);

    const monthlyRevenueData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, revenue]) => ({
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: Math.round(revenue)
      }));

    // Calculate metrics
    const totalRevenue = data.reduce((sum, record) => sum + (record.TotalCharges || 0), 0);
    const averageCharges = data.length > 0 ? totalRevenue / data.length : 0;
    const pendingAmount = data
      .filter(record => record.PaymentStatus === 'Pending' || record.PaymentStatus === 'Overdue')
      .reduce((sum, record) => sum + (record.RunningBalance || 0), 0);
    const totalPatients = new Set(data.map(record => record.PatientID)).size;

    console.log(`API: Successfully computed analytics for ${data.length} records`);
    
    return NextResponse.json({
      success: true,
      analytics: {
        paymentStatusData,
        insuranceProvidersData,
        monthlyRevenueData,
        genderDistributionData,
        averageCharges: Math.round(averageCharges),
        totalRevenue: Math.round(totalRevenue),
        pendingAmount: Math.round(pendingAmount),
        totalPatients,
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}