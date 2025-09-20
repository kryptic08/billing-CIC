"use client";

// Real Supabase connection for billing and insurance data
import { createClient } from '@/utils/supabase/client';

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

const safeStringifyError = (err: any) => {
  try {
    if (!err) return String(err);
    if (err instanceof Error) return err.message;
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

// Client-side function for billing data
export const getBillingDataClient = async (): Promise<BillingRecord[]> => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('billing_and_insurance')
      .select('*')
      .order('AdmissionDate', { ascending: false });

    if (error) {
      console.error('getBillingDataClient error:', safeStringifyError(error));
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching billing data:', safeStringifyError(error));
    return []; // Return empty array on error to prevent crashes
  }
};

// Analytics computation function
export const getBillingAnalyticsClient = async () => {
  try {
    const billingData = await getBillingDataClient();
    
    if (!billingData || billingData.length === 0) {
      return {
        paymentStatusData: [],
        insuranceProvidersData: [],
        monthlyRevenueData: [],
        genderDistributionData: [],
        averageCharges: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        totalPatients: 0,
      };
    }

    // Payment Status Distribution
    const paymentStatusCounts = billingData.reduce((acc, record) => {
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
    const insuranceProviderCounts = billingData.reduce((acc, record) => {
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
    const genderCounts = billingData.reduce((acc, record) => {
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
    const monthlyRevenue = billingData.reduce((acc, record) => {
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
    const totalRevenue = billingData.reduce((sum, record) => sum + (record.TotalCharges || 0), 0);
    const averageCharges = billingData.length > 0 ? totalRevenue / billingData.length : 0;
    const pendingAmount = billingData
      .filter(record => record.PaymentStatus === 'Pending' || record.PaymentStatus === 'Overdue')
      .reduce((sum, record) => sum + (record.RunningBalance || 0), 0);
    const totalPatients = new Set(billingData.map(record => record.PatientID)).size;

    return {
      paymentStatusData,
      insuranceProvidersData,
      monthlyRevenueData,
      genderDistributionData,
      averageCharges: Math.round(averageCharges),
      totalRevenue: Math.round(totalRevenue),
      pendingAmount: Math.round(pendingAmount),
      totalPatients,
    };
  } catch (error) {
    console.error('getBillingAnalyticsClient error:', safeStringifyError(error));
    // Return empty analytics on error
    return {
      paymentStatusData: [],
      insuranceProvidersData: [],
      monthlyRevenueData: [],
      genderDistributionData: [],
      averageCharges: 0,
      totalRevenue: 0,
      pendingAmount: 0,
      totalPatients: 0,
    };
  }
};

// Test function for the billing table
export const testBillingConnection = async () => {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('billing_and_insurance')
      .select('PatientID')
      .limit(1);
    
    return {
      billingTable: !error,
      error: error ? safeStringifyError(error) : null
    };
  } catch (err) {
    console.error('testBillingConnection error:', safeStringifyError(err));
    return { 
      billingTable: false, 
      error: safeStringifyError(err) 
    };
  }
};

// Function to insert sample data (for testing)
export const insertSampleBillingData = async () => {
  try {
    const supabase = createClient();
    
    const sampleData = [
      {
        PatientID: 1001,
        PatientName: "John Doe",
        DateOfBirth: "1985-03-15",
        Gender: "Male",
        Address: "123 Main St, Anytown, USA",
        PhoneNumber: "555-0123",
        Email: "john.doe@email.com",
        InsuranceProvider: "Blue Cross Blue Shield",
        PolicyNumber: 123456789,
        BillingNumber: "BILL-2024-001",
        AdmissionDate: "2024-01-15T10:00:00Z",
        DischargeDate: "2024-01-17T14:00:00Z",
        ServiceDescription: "Emergency Room Visit",
        TotalCharges: 1500.00,
        InsuranceCoveragePercentage: 80.0,
        AmountCoveredByInsurance: 1200.00,
        AmountPaid: 1200.00,
        RunningBalance: 300.00,
        PaymentStatus: "Pending"
      },
      {
        PatientID: 1002,
        PatientName: "Jane Smith",
        DateOfBirth: "1990-07-22",
        Gender: "Female",
        Address: "456 Oak Ave, Another City, USA",
        PhoneNumber: "555-0456",
        Email: "jane.smith@email.com",
        InsuranceProvider: "Aetna",
        PolicyNumber: 987654321,
        BillingNumber: "BILL-2024-002",
        AdmissionDate: "2024-02-01T09:00:00Z",
        DischargeDate: "2024-02-03T16:00:00Z",
        ServiceDescription: "Routine Surgery",
        TotalCharges: 5000.00,
        InsuranceCoveragePercentage: 90.0,
        AmountCoveredByInsurance: 4500.00,
        AmountPaid: 5000.00,
        RunningBalance: 0.00,
        PaymentStatus: "Paid"
      },
      {
        PatientID: 1003,
        PatientName: "Bob Johnson",
        DateOfBirth: "1975-11-08",
        Gender: "Male",
        Address: "789 Pine St, Somewhere, USA",
        PhoneNumber: "555-0789",
        Email: "bob.johnson@email.com",
        InsuranceProvider: "Cigna",
        PolicyNumber: 456789123,
        BillingNumber: "BILL-2024-003",
        AdmissionDate: "2024-03-10T08:00:00Z",
        DischargeDate: "2024-03-12T12:00:00Z",
        ServiceDescription: "Physical Therapy",
        TotalCharges: 800.00,
        InsuranceCoveragePercentage: 75.0,
        AmountCoveredByInsurance: 600.00,
        AmountPaid: 600.00,
        RunningBalance: 200.00,
        PaymentStatus: "Overdue"
      },
      {
        PatientID: 1004,
        PatientName: "Alice Wilson",
        DateOfBirth: "1988-05-20",
        Gender: "Female",
        Address: "321 Elm Dr, Elsewhere, USA",
        PhoneNumber: "555-0321",
        Email: "alice.wilson@email.com",
        InsuranceProvider: "United Healthcare",
        PolicyNumber: 789123456,
        BillingNumber: "BILL-2024-004",
        AdmissionDate: "2024-04-05T14:00:00Z",
        DischargeDate: "2024-04-07T10:00:00Z",
        ServiceDescription: "Diagnostic Imaging",
        TotalCharges: 1200.00,
        InsuranceCoveragePercentage: 85.0,
        AmountCoveredByInsurance: 1020.00,
        AmountPaid: 1200.00,
        RunningBalance: 0.00,
        PaymentStatus: "Paid"
      },
      {
        PatientID: 1005,
        PatientName: "Charlie Brown",
        DateOfBirth: "1992-09-14",
        Gender: "Male",
        Address: "654 Maple Ave, Nearby, USA",
        PhoneNumber: "555-0654",
        Email: "charlie.brown@email.com",
        InsuranceProvider: "Anthem",
        PolicyNumber: 321654987,
        BillingNumber: "BILL-2024-005",
        AdmissionDate: "2024-05-20T11:00:00Z",
        DischargeDate: "2024-05-22T15:00:00Z",
        ServiceDescription: "Cardiology Consultation",
        TotalCharges: 2500.00,
        InsuranceCoveragePercentage: 70.0,
        AmountCoveredByInsurance: 1750.00,
        AmountPaid: 1750.00,
        RunningBalance: 750.00,
        PaymentStatus: "Partial"
      },
      {
        PatientID: 1006,
        PatientName: "Diana Prince",
        DateOfBirth: "1987-12-03",
        Gender: "Female",
        Address: "987 Hero Lane, Metropolis, USA",
        PhoneNumber: "555-0987",
        Email: "diana.prince@email.com",
        InsuranceProvider: "Blue Cross Blue Shield",
        PolicyNumber: 147258369,
        BillingNumber: "BILL-2024-006",
        AdmissionDate: "2024-06-15T13:00:00Z",
        DischargeDate: "2024-06-18T09:00:00Z",
        ServiceDescription: "Orthopedic Surgery",
        TotalCharges: 7500.00,
        InsuranceCoveragePercentage: 85.0,
        AmountCoveredByInsurance: 6375.00,
        AmountPaid: 6375.00,
        RunningBalance: 1125.00,
        PaymentStatus: "Pending"
      }
    ];

    const { data, error } = await supabase
      .from('billing_and_insurance')
      .insert(sampleData)
      .select();

    if (error) {
      console.error('insertSampleBillingData error:', safeStringifyError(error));
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error inserting sample data:', safeStringifyError(error));
    throw error;
  }
};

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

const safeStringifyError = (err: any) => {
  try {
    if (!err) return String(err);
    if (err instanceof Error) return err.message;
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

// Server-side functions
const createServerSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(cookieStore);
};

const runWithRlsRecovery = async <T>(queryFn: (client: any) => Promise<{ data: T; error: any }>): Promise<T> => {
  const serverClient = await createServerSupabase();
  const { data, error } = await queryFn(serverClient);
  if (!error) return data;

  const msg = safeStringifyError(error).toLowerCase();
  console.error('Server query error:', safeStringifyError(error));

  if (msg.includes('infinite recursion') || (msg.includes('policy') && msg.includes('recurs'))) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const svc = createServiceRoleClient();
        const { data: svcData, error: svcErr } = await queryFn(svc);
        if (svcErr) {
          console.error('Service role query failed:', safeStringifyError(svcErr));
          throw svcErr;
        }
        return svcData;
      } catch (svcError) {
        console.error('Service role retry error:', safeStringifyError(svcError));
        throw new Error('Service-role retry failed: ' + safeStringifyError(svcError));
      }
    }

    throw new Error(
      'RLS policy recursion detected. Set SUPABASE_SERVICE_ROLE_KEY to diagnose or inspect/adjust RLS policies.'
    );
  }

  throw error;
};

// Client-side functions for billing data
export const getBillingDataClient = async (): Promise<BillingRecord[]> => {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('billing_and_insurance')
    .select('*')
    .order('AdmissionDate', { ascending: false });

  if (error) {
    console.error('getBillingDataClient error:', safeStringifyError(error));
    throw error;
  }
  
  return data || [];
};

// Server-side function for billing data
export const getBillingData = async (): Promise<BillingRecord[]> => {
  return runWithRlsRecovery<BillingRecord[]>(async (client) =>
    client
      .from('billing_and_insurance')
      .select('*')
      .order('AdmissionDate', { ascending: false })
  );
};

// Analytics computation functions
export const getBillingAnalytics = async () => {
  try {
    const billingData = await getBillingData();
    
    if (!billingData || billingData.length === 0) {
      return {
        paymentStatusData: [],
        insuranceProvidersData: [],
        monthlyRevenueData: [],
        genderDistributionData: [],
        averageCharges: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        totalPatients: 0,
      };
    }

    // Payment Status Distribution
    const paymentStatusCounts = billingData.reduce((acc, record) => {
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
    const insuranceProviderCounts = billingData.reduce((acc, record) => {
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
    const genderCounts = billingData.reduce((acc, record) => {
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
    const monthlyRevenue = billingData.reduce((acc, record) => {
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
    const totalRevenue = billingData.reduce((sum, record) => sum + (record.TotalCharges || 0), 0);
    const averageCharges = totalRevenue / billingData.length;
    const pendingAmount = billingData
      .filter(record => record.PaymentStatus === 'Pending' || record.PaymentStatus === 'Overdue')
      .reduce((sum, record) => sum + (record.RunningBalance || 0), 0);
    const totalPatients = new Set(billingData.map(record => record.PatientID)).size;

    return {
      paymentStatusData,
      insuranceProvidersData,
      monthlyRevenueData,
      genderDistributionData,
      averageCharges: Math.round(averageCharges),
      totalRevenue: Math.round(totalRevenue),
      pendingAmount: Math.round(pendingAmount),
      totalPatients,
    };
  } catch (error) {
    console.error('getBillingAnalytics error:', safeStringifyError(error));
    throw error;
  }
};

// Client-side analytics function
export const getBillingAnalyticsClient = async () => {
  try {
    const billingData = await getBillingDataClient();
    
    if (!billingData || billingData.length === 0) {
      return {
        paymentStatusData: [],
        insuranceProvidersData: [],
        monthlyRevenueData: [],
        genderDistributionData: [],
        averageCharges: 0,
        totalRevenue: 0,
        pendingAmount: 0,
        totalPatients: 0,
      };
    }

    // Same analytics logic as server version...
    // (Implementation identical to getBillingAnalytics above)
    
    // Payment Status Distribution
    const paymentStatusCounts = billingData.reduce((acc, record) => {
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
    const insuranceProviderCounts = billingData.reduce((acc, record) => {
      const provider = record.InsuranceProvider || 'Unknown';
      acc[provider] = (acc[provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const providerColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];
    const insuranceProvidersData = Object.entries(insuranceProviderCounts)
      .slice(0, 7)
      .map(([provider, count], index) => ({
        label: provider,
        value: count,
        color: providerColors[index] || '#6B7280'
      }));

    // Gender Distribution
    const genderCounts = billingData.reduce((acc, record) => {
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
    const monthlyRevenue = billingData.reduce((acc, record) => {
      if (record.AdmissionDate && record.TotalCharges) {
        const date = new Date(record.AdmissionDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        acc[monthKey] = (acc[monthKey] || 0) + record.TotalCharges;
      }
      return acc;
    }, {} as Record<string, number>);

    const monthlyRevenueData = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, revenue]) => ({
        label: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        value: Math.round(revenue)
      }));

    // Calculate metrics
    const totalRevenue = billingData.reduce((sum, record) => sum + (record.TotalCharges || 0), 0);
    const averageCharges = totalRevenue / billingData.length;
    const pendingAmount = billingData
      .filter(record => record.PaymentStatus === 'Pending' || record.PaymentStatus === 'Overdue')
      .reduce((sum, record) => sum + (record.RunningBalance || 0), 0);
    const totalPatients = new Set(billingData.map(record => record.PatientID)).size;

    return {
      paymentStatusData,
      insuranceProvidersData,
      monthlyRevenueData,
      genderDistributionData,
      averageCharges: Math.round(averageCharges),
      totalRevenue: Math.round(totalRevenue),
      pendingAmount: Math.round(pendingAmount),
      totalPatients,
    };
  } catch (error) {
    console.error('getBillingAnalyticsClient error:', safeStringifyError(error));
    throw error;
  }
};

// Test function for the billing table
export const testBillingConnection = async () => {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('billing_and_insurance')
      .select('PatientID')
      .limit(1);
    
    return {
      billingTable: !error,
      error: error ? safeStringifyError(error) : null
    };
  } catch (err) {
    console.error('testBillingConnection error:', safeStringifyError(err));
    return { 
      billingTable: false, 
      error: safeStringifyError(err) 
    };
  }
};

// Function to insert sample data (for testing)
export const insertSampleBillingData = async () => {
  const supabase = createBrowserClient();
  
  const sampleData = [
    {
      PatientID: 1001,
      PatientName: "John Doe",
      DateOfBirth: "1985-03-15",
      Gender: "Male",
      Address: "123 Main St, Anytown, USA",
      PhoneNumber: "555-0123",
      Email: "john.doe@email.com",
      InsuranceProvider: "Blue Cross Blue Shield",
      PolicyNumber: 123456789,
      BillingNumber: "BILL-2024-001",
      AdmissionDate: "2024-01-15T10:00:00Z",
      DischargeDate: "2024-01-17T14:00:00Z",
      ServiceDescription: "Emergency Room Visit",
      TotalCharges: 1500.00,
      InsuranceCoveragePercentage: 80.0,
      AmountCoveredByInsurance: 1200.00,
      AmountPaid: 1200.00,
      RunningBalance: 300.00,
      PaymentStatus: "Pending"
    },
    {
      PatientID: 1002,
      PatientName: "Jane Smith",
      DateOfBirth: "1990-07-22",
      Gender: "Female",
      Address: "456 Oak Ave, Another City, USA",
      PhoneNumber: "555-0456",
      Email: "jane.smith@email.com",
      InsuranceProvider: "Aetna",
      PolicyNumber: 987654321,
      BillingNumber: "BILL-2024-002",
      AdmissionDate: "2024-02-01T09:00:00Z",
      DischargeDate: "2024-02-03T16:00:00Z",
      ServiceDescription: "Routine Surgery",
      TotalCharges: 5000.00,
      InsuranceCoveragePercentage: 90.0,
      AmountCoveredByInsurance: 4500.00,
      AmountPaid: 5000.00,
      RunningBalance: 0.00,
      PaymentStatus: "Paid"
    }
  ];

  const { data, error } = await supabase
    .from('billing_and_insurance')
    .insert(sampleData)
    .select();

  if (error) {
    console.error('insertSampleBillingData error:', safeStringifyError(error));
    throw error;
  }

  return data;
};