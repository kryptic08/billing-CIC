-- Test script to verify CSV import success
-- Run this after importing all CSV files to confirm everything worked

-- 1. Check total record counts
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

-- 2. Verify foreign key relationships in payment_records
SELECT
    COUNT(*) as total_payment_records,
    COUNT(DISTINCT pr.patient_id) as unique_patients_referenced,
    COUNT(DISTINCT pr.user_id) as unique_users_referenced
FROM payment_records pr;

-- 3. Check for any orphaned payment records (should return 0 rows)
SELECT COUNT(*) as orphaned_payment_records
FROM payment_records pr
LEFT JOIN patients p ON pr.patient_id = p.patient_id
LEFT JOIN profiles pf ON pr.user_id = pf.id
WHERE p.patient_id IS NULL OR pf.id IS NULL;

-- 4. Sample data verification
SELECT
    p.patient_id,
    p.full_name as patient_name,
    pf.full_name as user_name,
    pr.paying_for,
    pr.total_price_php,
    pr.payment_status
FROM payment_records pr
JOIN patients p ON pr.patient_id = p.patient_id
JOIN profiles pf ON pr.user_id = pf.id
ORDER BY pr.created_at DESC
LIMIT 5;

-- 5. Check user roles distribution
SELECT role, COUNT(*) as count
FROM user_roles
GROUP BY role
ORDER BY count DESC;
