// Mock data for testing the analytics component
// Replace this with real Supabase calls once the database table exists

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

// Mock data for demonstration
const mockBillingData: BillingRecord[] = [
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
  }
];

export const getBillingDataClient = async (): Promise<BillingRecord[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockBillingData;
};

export const getBillingAnalyticsClient = async () => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const billingData = mockBillingData;
  
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
};