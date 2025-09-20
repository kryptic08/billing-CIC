-- STEP-BY-STEP IMPORT PROCESS FOR AI NAKO CSV DATA
-- Run these commands ONE BY ONE in your Supabase SQL Editor
-- Make sure to update the file paths to match your actual location!

-- STEP 1: Import patients (should work first)
COPY patients(
    id, patient_id, full_name, email, phone, address,
    date_of_birth, emergency_contact, created_at, updated_at
)
FROM 'C:/Users/coped/Documents/ai-nako/csv_generated/patients.csv'
WITH CSV HEADER DELIMITER ',';

-- Verify patients imported
SELECT COUNT(*) as patients_count FROM patients;

-- STEP 2: Import payment terms (lookup table)
COPY payment_terms(id, term_name, description, is_active, created_at)
FROM 'C:/Users/coped/Documents/ai-nako/csv_generated/payment_terms.csv'
WITH CSV HEADER DELIMITER ',';

-- STEP 3: Import profiles (CRITICAL - must be imported before payment_records)
COPY profiles(id, email, full_name, avatar_url, created_at, updated_at)
FROM 'C:/Users/coped/Documents/ai-nako/csv_generated/profiles.csv'
WITH CSV HEADER DELIMITER ',';

-- Verify profiles imported
SELECT COUNT(*) as profiles_count FROM profiles;

-- STEP 4: Import user roles (depends on profiles)
COPY user_roles(id, user_id, role, granted_by, granted_at)
FROM 'C:/Users/coped/Documents/ai-nako/csv_generated/user_roles.csv'
WITH CSV HEADER DELIMITER ',';

-- STEP 5: Import payment records (depends on patients AND profiles)
-- This should work now that both referenced tables are imported
COPY payment_records(
    id, patient_id, user_id, full_name, address, bank_name,
    bank_account_number, paying_for, insurance_provider,
    insurance_tier_availed, medication_used, quantity,
    total_price_php, terms_accepted, payment_status,
    created_at, updated_at
)
FROM 'C:/Users/coped/Documents/ai-nako/csv_generated/payment_records.csv'
WITH CSV HEADER DELIMITER ',';

-- FINAL VERIFICATION
SELECT
    'Patients' as table_name, COUNT(*) as record_count FROM patients
UNION ALL
SELECT 'Payment Terms', COUNT(*) FROM payment_terms
UNION ALL
SELECT 'Profiles', COUNT(*) FROM profiles
UNION ALL
SELECT 'User Roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'Payment Records', COUNT(*) FROM payment_records;
