#!/usr/bin/env python3
"""
Script to populate the billing_and_insurance table with comprehensive sample data
from the CSV files in csv_generated folder.
"""

import csv
import random
from datetime import datetime, timedelta
import os

def load_patients():
    """Load patient data from CSV"""
    patients = {}
    with open('csv_generated/patients.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            patient_id = int(row['patient_id'].replace('P', '').lstrip('0'))
            patients[patient_id] = {
                'name': row['full_name'],
                'email': row['email'],
                'phone': row['phone'],
                'address': row['address'],
                'dob': row['date_of_birth']
            }
    return patients

def load_payment_records():
    """Load payment records from CSV"""
    records = []
    with open('csv_generated/payment_records.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            patient_id = int(row['patient_id'].replace('P', '').lstrip('0'))
            records.append({
                'patient_id': patient_id,
                'service': row['paying_for'],
                'insurance_provider': row['insurance_provider'],
                'total_charges': float(row['total_price_php']),
                'payment_status': row['payment_status'],
                'admission_date': row['created_at']
            })
    return records

def generate_gender(name):
    """Generate gender based on name patterns"""
    male_names = ['John', 'James', 'Michael', 'David', 'Robert', 'William', 'Richard', 'Joseph', 'Thomas', 'Charles']
    female_names = ['Maria', 'Jane', 'Emily', 'Lisa', 'Sarah', 'Jennifer', 'Michelle', 'Amanda', 'Stephanie', 'Angela']

    first_name = name.split()[0]
    if first_name in male_names:
        return 'Male'
    elif first_name in female_names:
        return 'Female'
    else:
        return random.choice(['Male', 'Female'])

def calculate_insurance_coverage(total_charges, status):
    """Calculate insurance coverage based on status and charges"""
    if status == 'completed':
        coverage_pct = random.uniform(70, 95)
    elif status == 'pending':
        coverage_pct = random.uniform(60, 85)
    elif status == 'failed':
        coverage_pct = random.uniform(0, 50)
    else:
        coverage_pct = random.uniform(50, 90)

    coverage_amount = total_charges * (coverage_pct / 100)
    return round(coverage_pct, 1), round(coverage_amount, 2)

def calculate_payment_amount(total_charges, status):
    """Calculate amount paid based on status"""
    if status == 'completed':
        return total_charges
    elif status == 'pending':
        return round(total_charges * random.uniform(0.1, 0.5), 2)
    else:  # failed
        return 0.0

def generate_discharge_date(admission_date):
    """Generate discharge date 1-7 days after admission"""
    admission = datetime.fromisoformat(admission_date.replace('Z', '+00:00'))
    days_stay = random.randint(1, 7)
    discharge = admission + timedelta(days=days_stay)
    return discharge.isoformat()

def generate_billing_number(patient_id, record_num):
    """Generate unique billing number"""
    return f"BILL-2024-{patient_id:04d}-{record_num:02d}"

def map_payment_status(status):
    """Map CSV status to database status"""
    status_map = {
        'completed': 'Paid',
        'pending': 'Partially Paid',
        'failed': 'Unpaid'
    }
    return status_map.get(status, 'Unpaid')

def generate_sql_inserts():
    """Generate SQL INSERT statements"""
    print("-- POPULATE BILLING_AND_INSURANCE TABLE WITH COMPREHENSIVE SAMPLE DATA")
    print("-- Generated from CSV files: patients.csv and payment_records.csv")
    print()

    # Load data
    patients = load_patients()
    payment_records = load_payment_records()

    print("-- Clear existing data")
    print("DELETE FROM public.billing_and_insurance;")
    print()

    print("-- Insert comprehensive billing and insurance data")
    print("INSERT INTO public.billing_and_insurance (")
    print('  "PatientID", "PatientName", "DateOfBirth", "Gender", "Address",')
    print('  "PhoneNumber", "Email", "InsuranceProvider", "PolicyNumber",')
    print('  "BillingNumber", "AdmissionDate", "DischargeDate", "ServiceDescription",')
    print('  "TotalCharges", "InsuranceCoveragePercentage", "AmountCoveredByInsurance",')
    print('  "AmountPaid", "RunningBalance", "PaymentStatus"')
    print(") VALUES")

    values = []
    record_num = 1

    for record in payment_records:
        patient_id = record['patient_id']
        patient = patients.get(patient_id)

        if not patient:
            continue  # Skip if patient not found

        # Generate additional data
        gender = generate_gender(patient['name'])
        policy_number = random.randint(100000000, 999999999)
        billing_number = generate_billing_number(patient_id, record_num)
        discharge_date = generate_discharge_date(record['admission_date'])
        coverage_pct, coverage_amount = calculate_insurance_coverage(
            record['total_charges'], record['payment_status']
        )
        amount_paid = calculate_payment_amount(record['total_charges'], record['payment_status'])
        running_balance = record['total_charges'] - amount_paid
        payment_status = map_payment_status(record['payment_status'])

        # Create value tuple
        value = (
            patient_id,
            f"'{patient['name']}'",
            f"'{patient['dob']}'",
            f"'{gender}'",
            f"'{patient['address']}'",
            f"'{patient['phone']}'",
            f"'{patient['email']}'",
            f"'{record['insurance_provider']}'",
            policy_number,
            f"'{billing_number}'",
            f"'{record['admission_date']}'",
            f"'{discharge_date}'",
            f"'{record['service']}'",
            f"{record['total_charges']:.2f}",
            f"{coverage_pct:.1f}",
            f"{coverage_amount:.2f}",
            f"{amount_paid:.2f}",
            f"{running_balance:.2f}",
            f"'{payment_status}'"
        )

        values.append(f"({', '.join(map(str, value))})")
        record_num += 1

    # Join all values with commas and newlines
    print(",\n".join(values) + ";")
    print()

    # Add verification queries
    print("-- Verify the data was inserted")
    print("SELECT COUNT(*) as total_records FROM public.billing_and_insurance;")
    print()
    print("-- Show sample of the inserted data")
    print("SELECT")
    print('  "PatientID",')
    print('  "PatientName",')
    print('  "ServiceDescription",')
    print('  "TotalCharges",')
    print('  "InsuranceProvider",')
    print('  "PaymentStatus"')
    print("FROM public.billing_and_insurance")
    print("ORDER BY \"PatientID\"")
    print("LIMIT 20;")

if __name__ == "__main__":
    generate_sql_inserts()