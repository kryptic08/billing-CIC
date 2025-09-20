-- Alternative Import Method: Using INSERT statements
-- This method is slower but more reliable for debugging

-- First, let's test with just a few records to see if the structure works

-- Test 1: Insert one patient
INSERT INTO patients (id, patient_id, full_name, email, phone, address, date_of_birth, emergency_contact, created_at, updated_at)
VALUES (1, 'P0001', 'John Smith', 'john.smith.1@email.com', '+1-555-0101', '123 Main St, Test City, IL 62701', '1985-03-15', 'Jane Smith +1-555-0102', NOW(), NOW());

-- Test 2: Insert one profile
INSERT INTO profiles (id, email, full_name, avatar_url, created_at, updated_at)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'test.user.1@profile.com', 'Test User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=test', NOW(), NOW());

-- Test 3: Insert one payment record (should work now)
INSERT INTO payment_records (
    id, patient_id, user_id, full_name, address, bank_name,
    bank_account_number, paying_for, insurance_provider,
    insurance_tier_availed, medication_used, quantity,
    total_price_php, terms_accepted, payment_status,
    created_at, updated_at
) VALUES (
    1, 'P0001', '550e8400-e29b-41d4-a716-446655440000', 'John Smith',
    '123 Main St, Test City, IL 62701', 'Test Bank', 1234567890,
    'General Consultation', 'Test Insurance', 'Gold', 'Test Med', 1,
    1000.00, 'Cash Payment', 'completed', NOW(), NOW()
);

-- If the above works, you can continue with bulk import
-- Otherwise, check the error messages for specific issues
