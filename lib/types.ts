export interface Patient {
  id?: number;
  patient_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  address: string;
  date_of_birth?: string;
  emergency_contact?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTerm {
  id?: number;
  term_name: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
}

export interface PaymentRecord {
  id?: number;
  patient_id: string;
  user_id?: string;
  full_name: string;
  address: string;
  bank_name: string;
  bank_account_number: number;
  paying_for: string;
  insurance_provider: string;
  insurance_tier_availed: string;
  medication_used: string;
  quantity: number;
  total_price_php: number;
  terms_accepted?: string;
  payment_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BillingSummary {
  totalRecords: number;
  totalPatients: number;
  totalRevenue: number;
  totalOutstanding: number;
  serviceTypes: { [key: string]: number };
  insuranceProviders: { [key: string]: number };
  paymentStatusBreakdown: { [key: string]: number };
  genderDistribution: { [key: string]: number };
  monthlyRevenue: { [key: string]: number };
}
