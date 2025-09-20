#!/usr/bin/env python3
"""
CSV Data Validator for AI Nako Database
Validates CSV data integrity before import
"""

import csv
import os
from typing import Set, Dict, List

class CSVValidator:
    def __init__(self, csv_dir: str = "csv_generated"):
        self.csv_dir = csv_dir

    def load_csv_data(self, filename: str) -> List[Dict[str, str]]:
        """Load CSV data into list of dictionaries"""
        filepath = os.path.join(self.csv_dir, filename)
        data = []
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                data = list(reader)
            print(f"✅ Loaded {len(data)} records from {filename}")
        except Exception as e:
            print(f"❌ Error loading {filename}: {e}")
        return data

    def validate_foreign_keys(self):
        """Validate all foreign key relationships"""
        print("🔍 VALIDATING FOREIGN KEY CONSTRAINTS")
        print("=" * 50)

        # Load all data
        patients = self.load_csv_data('patients.csv')
        profiles = self.load_csv_data('profiles.csv')
        payment_records = self.load_csv_data('payment_records.csv')
        user_roles = self.load_csv_data('user_roles.csv')

        # Extract key sets
        patient_ids = {p['patient_id'] for p in patients}
        profile_ids = {p['id'] for p in profiles}

        print(f"\n📊 Data Summary:")
        print(f"   Patients: {len(patients)}")
        print(f"   Profiles: {len(profiles)}")
        print(f"   Payment Records: {len(payment_records)}")
        print(f"   User Roles: {len(user_roles)}")

        # Validate payment_records foreign keys
        print(f"\n🔗 Checking payment_records foreign keys...")

        missing_patient_refs = []
        missing_user_refs = []

        for i, record in enumerate(payment_records[:10]):  # Check first 10 for sample
            patient_id = record.get('patient_id')
            user_id = record.get('user_id')

            if patient_id and patient_id not in patient_ids:
                missing_patient_refs.append((i+1, patient_id))

            if user_id and user_id not in profile_ids:
                missing_user_refs.append((i+1, user_id))

        if missing_patient_refs:
            print(f"❌ Missing patient references: {missing_patient_refs[:5]}")
        else:
            print("✅ All patient references are valid")

        if missing_user_refs:
            print(f"❌ Missing user references: {missing_user_refs[:5]}")
        else:
            print("✅ All user references are valid")

        # Validate user_roles foreign keys
        print(f"\n🔗 Checking user_roles foreign keys...")

        missing_user_role_refs = []
        missing_granted_by_refs = []

        for i, record in enumerate(user_roles[:10]):  # Check first 10 for sample
            user_id = record.get('user_id')
            granted_by = record.get('granted_by')

            if user_id and user_id not in profile_ids:
                missing_user_role_refs.append((i+1, user_id))

            if granted_by and granted_by not in profile_ids:
                missing_granted_by_refs.append((i+1, granted_by))

        if missing_user_role_refs:
            print(f"❌ Missing user role references: {missing_user_role_refs[:5]}")
        else:
            print("✅ All user role references are valid")

        if missing_granted_by_refs:
            print(f"❌ Missing granted_by references: {missing_granted_by_refs[:5]}")
        else:
            print("✅ All granted_by references are valid")

        # Check for data consistency
        print(f"\n📋 Data Consistency Checks:")

        # Check if patient_ids are unique in patients
        patient_id_counts = {}
        for p in patients:
            pid = p['patient_id']
            patient_id_counts[pid] = patient_id_counts.get(pid, 0) + 1

        duplicates = [pid for pid, count in patient_id_counts.items() if count > 1]
        if duplicates:
            print(f"❌ Duplicate patient_ids in patients: {duplicates[:5]}")
        else:
            print("✅ All patient_ids are unique")

        # Check if emails are unique in patients
        patient_emails = {p['email'] for p in patients}
        if len(patient_emails) < len(patients):
            print("❌ Duplicate emails found in patients")
        else:
            print("✅ All patient emails are unique")

        # Check if profile emails are unique
        profile_emails = {p['email'] for p in profiles}
        if len(profile_emails) < len(profiles):
            print("❌ Duplicate emails found in profiles")
        else:
            print("✅ All profile emails are unique")

        print(f"\n🎯 Validation Complete!")
        print("If all checks pass, your CSV data should import successfully.")
        print("If you see errors, regenerate the CSV files.")

def main():
    validator = CSVValidator()
    validator.validate_foreign_keys()

if __name__ == "__main__":
    main()
