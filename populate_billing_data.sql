-- POPULATE BILLING_AND_INSURANCE TABLE WITH SAMPLE DATA
-- This script combines data from patients.csv and payment_records.csv
-- to create comprehensive billing records for the AI to use

-- Clear existing data
DELETE FROM public.billing_and_insurance;

-- Insert sample billing and insurance data
-- Combining patient information with payment/billing data
INSERT INTO public.billing_and_insurance (
  "PatientID", "PatientName", "DateOfBirth", "Gender", "Address",
  "PhoneNumber", "Email", "InsuranceProvider", "PolicyNumber",
  "BillingNumber", "AdmissionDate", "DischargeDate", "ServiceDescription",
  "TotalCharges", "InsuranceCoveragePercentage", "AmountCoveredByInsurance",
  "AmountPaid", "RunningBalance", "PaymentStatus"
) VALUES
-- Patient 1: Maria Johnson
(1, 'Maria Johnson', '1974-03-01', 'Female', '328 Birch St, Fairview, NY 63957',
 '+1-540-9891225', 'maria.johnson.1@email.com', 'Kaiser', 123456789,
 'BILL-2024-0001', '2024-08-16 00:00:00+00', '2024-08-20 00:00:00+00', 'Vaccination',
 19921.0, 80.0, 15936.8, 1992.1, 17928.9, 'Partially Paid'),

-- Patient 2: John Rodriguez
(2, 'John Rodriguez', '1974-05-26', 'Male', '296 Main St, Cedarburg, GA 65145',
 '+1-684-8371946', 'john.rodriguez.2@email.com', 'Cigna', 234567890,
 'BILL-2024-0002', '2024-09-05 00:00:00+00', '2024-09-08 00:00:00+00', 'Dermatology Treatment',
 13312.6, 70.0, 9318.82, 0.0, 13312.6, 'Unpaid'),

-- Patient 3: James Williams
(3, 'James Williams', '1974-12-07', 'Male', '765 Pine Rd, Cedarburg, GA 63244',
 '+1-435-8156438', 'james.williams.3@email.com', 'Blue Cross', 345678901,
 'BILL-2024-0003', '2024-09-21 00:00:00+00', '2024-09-25 00:00:00+00', 'Cardiology Consultation',
 33148.67, 90.0, 29833.803, 0.0, 33148.67, 'Unpaid'),

-- Patient 4: John Williams
(4, 'John Williams', '1974-02-16', 'Male', '887 Elm St, Riverside, GA 68306',
 '+1-272-4665077', 'john.williams.4@email.com', 'United Healthcare', 456789012,
 'BILL-2024-0004', '2024-09-01 00:00:00+00', '2024-09-03 00:00:00+00', 'Dental Checkup',
 20663.73, 75.0, 15497.7975, 2066.373, 18597.357, 'Partially Paid'),

-- Patient 5: Michael Miller
(5, 'Michael Miller', '1974-02-23', 'Male', '839 Oak Ave, Pineville, GA 66422',
 '+1-423-3854751', 'michael.miller.5@email.com', 'Blue Shield', 567890123,
 'BILL-2024-0005', '2024-09-07 00:00:00+00', '2024-09-10 00:00:00+00', 'Vaccination',
 30965.01, 60.0, 18579.006, 0.0, 30965.01, 'Unpaid'),

-- Patient 6: James Garcia
(6, 'James Garcia', '1974-03-01', 'Male', '788 Elm St, Pineville, TX 60893',
 '+1-236-1901357', 'james.garcia.6@email.com', 'Blue Cross', 678901234,
 'BILL-2024-0006', '2024-11-20 00:00:00+00', '2024-11-22 00:00:00+00', 'General Consultation',
 4220.82, 85.0, 3587.697, 4220.82, 0.0, 'Paid'),

-- Patient 7: Jane Williams
(7, 'Jane Williams', '1974-09-03', 'Female', '249 Oak Ave, Elmwood, GA 60287',
 '+1-595-3736022', 'jane.williams.7@email.com', 'Blue Shield', 789012345,
 'BILL-2024-0007', '2024-01-25 00:00:00+00', '2024-01-27 00:00:00+00', 'Eye Examination',
 25353.82, 80.0, 20283.056, 2535.382, 22818.438, 'Partially Paid'),

-- Patient 8: Emily Davis
(8, 'Emily Davis', '1974-11-11', 'Female', '483 Pine Rd, Maplewood, FL 66645',
 '+1-369-5917836', 'emily.davis.8@email.com', 'Cigna', 890123456,
 'BILL-2024-0008', '2024-12-30 00:00:00+00', '2025-01-02 00:00:00+00', 'Vaccination',
 4199.79, 95.0, 3989.8005, 419.979, 3779.811, 'Partially Paid'),

-- Patient 9: Robert Jones
(9, 'Robert Jones', '1974-05-10', 'Male', '855 Pine Rd, Oakwood, IL 65452',
 '+1-609-8452262', 'robert.jones.9@email.com', 'Blue Cross', 901234567,
 'BILL-2024-0009', '2024-01-29 00:00:00+00', '2024-01-31 00:00:00+00', 'Dental Checkup',
 28132.39, 70.0, 19692.673, 28132.39, 0.0, 'Paid'),

-- Patient 10: David Garcia
(10, 'David Garcia', '1974-10-11', 'Male', '720 Cedar Ln, Riverside, CO 66277',
 '+1-492-3103057', 'david.garcia.10@email.com', 'Cigna', 12345678,
 'BILL-2024-0010', '2024-08-30 00:00:00+00', '2024-09-01 00:00:00+00', 'General Consultation',
 16826.52, 75.0, 12619.89, 1682.652, 15143.868, 'Partially Paid'),

-- Additional sample records for more comprehensive data
(11, 'Lisa Brown', '1980-06-15', 'Female', '123 Oak St, Springfield, IL 62701',
 '+1-217-555-0123', 'lisa.brown@email.com', 'Aetna', 112233445,
 'BILL-2024-0011', '2024-10-01 00:00:00+00', '2024-10-05 00:00:00+00', 'Emergency Room Visit',
 12500.00, 90.0, 11250.0, 1250.0, 11250.0, 'Partially Paid'),

(12, 'Mark Thompson', '1975-03-22', 'Male', '456 Pine Ave, Madison, WI 53703',
 '+1-608-555-0456', 'mark.thompson@email.com', 'Humana', 223344556,
 'BILL-2024-0012', '2024-09-15 00:00:00+00', '2024-09-18 00:00:00+00', 'Surgery',
 45000.00, 95.0, 42750.0, 45000.0, 0.0, 'Paid'),

(13, 'Sarah Wilson', '1982-11-08', 'Female', '789 Elm Dr, Austin, TX 78701',
 '+1-512-555-0789', 'sarah.wilson@email.com', 'United Healthcare', 334455667,
 'BILL-2024-0013', '2024-11-10 00:00:00+00', '2024-11-12 00:00:00+00', 'Physical Therapy',
 3200.00, 80.0, 2560.0, 320.0, 2880.0, 'Partially Paid'),

(14, 'Kevin Martinez', '1978-07-30', 'Male', '321 Cedar Ln, Denver, CO 80202',
 '+1-303-555-0321', 'kevin.martinez@email.com', 'Kaiser', 445566778,
 'BILL-2024-0014', '2024-08-20 00:00:00+00', '2024-08-22 00:00:00+00', 'MRI Scan',
 2800.00, 85.0, 2380.0, 0.0, 2800.0, 'Unpaid'),

(15, 'Jennifer Lee', '1985-12-25', 'Female', '654 Birch Rd, Seattle, WA 98101',
 '+1-206-555-0654', 'jennifer.lee@email.com', 'Blue Cross', 556677889,
 'BILL-2024-0015', '2024-12-01 00:00:00+00', '2024-12-03 00:00:00+00', 'Lab Tests',
 850.00, 70.0, 595.0, 850.0, 0.0, 'Paid'),

(16, 'Brian Anderson', '1973-04-12', 'Male', '987 Maple St, Boston, MA 02101',
 '+1-617-555-0987', 'brian.anderson@email.com', 'Cigna', 667788990,
 'BILL-2024-0016', '2024-07-15 00:00:00+00', '2024-07-17 00:00:00+00', 'Cardiac Stress Test',
 1200.00, 90.0, 1080.0, 120.0, 1080.0, 'Partially Paid'),

(17, 'Michelle Davis', '1988-09-05', 'Female', '147 Spruce Ave, Miami, FL 33101',
 '+1-305-555-0147', 'michelle.davis@email.com', 'Blue Shield', 778899001,
 'BILL-2024-0017', '2024-10-25 00:00:00+00', '2024-10-27 00:00:00+00', 'Ultrasound',
 650.00, 75.0, 487.5, 65.0, 585.0, 'Partially Paid'),

(18, 'Christopher White', '1976-01-18', 'Male', '258 Willow Dr, Phoenix, AZ 85001',
 '+1-602-555-0258', 'christopher.white@email.com', 'Aetna', 889900112,
 'BILL-2024-0018', '2024-06-10 00:00:00+00', '2024-06-12 00:00:00+00', 'Colonoscopy',
 2200.00, 95.0, 2090.0, 2200.0, 0.0, 'Paid'),

(19, 'Amanda Taylor', '1983-08-14', 'Female', '369 Poplar Ln, Nashville, TN 37201',
 '+1-615-555-0369', 'amanda.taylor@email.com', 'Humana', 990011223,
 'BILL-2024-0019', '2024-11-05 00:00:00+00', '2024-11-07 00:00:00+00', 'Mammogram',
 450.00, 80.0, 360.0, 45.0, 405.0, 'Partially Paid'),

(20, 'Daniel Harris', '1979-05-27', 'Male', '741 Ash St, Portland, OR 97201',
 '+1-503-555-0741', 'daniel.harris@email.com', 'United Healthcare', 101112334,
 'BILL-2024-0020', '2024-09-30 00:00:00+00', '2024-10-02 00:00:00+00', 'CT Scan',
 1800.00, 85.0, 1530.0, 0.0, 1800.0, 'Unpaid'),

-- Continue with more records to reach at least 50 comprehensive records
(21, 'Rachel Clark', '1981-02-09', 'Female', '852 Beech Rd, Salt Lake City, UT 84101',
 '+1-801-555-0852', 'rachel.clark@email.com', 'Blue Cross', 112233446,
 'BILL-2024-0021', '2024-08-05 00:00:00+00', '2024-08-07 00:00:00+00', 'X-Ray',
 350.00, 70.0, 245.0, 350.0, 0.0, 'Paid'),

(22, 'Steven Lewis', '1977-11-21', 'Male', '963 Hickory Ave, Las Vegas, NV 89101',
 '+1-702-555-0963', 'steven.lewis@email.com', 'Cigna', 223344557,
 'BILL-2024-0022', '2024-07-20 00:00:00+00', '2024-07-22 00:00:00+00', 'Physical Therapy',
 2400.00, 90.0, 2160.0, 240.0, 2160.0, 'Partially Paid'),

(23, 'Nicole Walker', '1986-04-03', 'Female', '159 Sycamore Dr, Albuquerque, NM 87101',
 '+1-505-555-0159', 'nicole.walker@email.com', 'Kaiser', 334455668,
 'BILL-2024-0023', '2024-10-15 00:00:00+00', '2024-10-17 00:00:00+00', 'Dental Cleaning',
 150.00, 60.0, 90.0, 15.0, 135.0, 'Partially Paid'),

(24, 'Timothy Hall', '1974-08-16', 'Male', '260 Walnut St, Tucson, AZ 85701',
 '+1-520-555-0260', 'timothy.hall@email.com', 'Blue Shield', 445566779,
 'BILL-2024-0024', '2024-06-25 00:00:00+00', '2024-06-27 00:00:00+00', 'Eye Exam',
 120.00, 75.0, 90.0, 120.0, 0.0, 'Paid'),

(25, 'Heather Young', '1984-12-30', 'Female', '371 Chestnut Ln, Omaha, NE 68101',
 '+1-402-555-0371', 'heather.young@email.com', 'Aetna', 556677880,
 'BILL-2024-0025', '2024-11-20 00:00:00+00', '2024-11-22 00:00:00+00', 'Blood Work',
 200.00, 80.0, 160.0, 20.0, 180.0, 'Partially Paid'),

(26, 'Patrick King', '1972-03-14', 'Male', '482 Fir Ave, Colorado Springs, CO 80901',
 '+1-719-555-0482', 'patrick.king@email.com', 'Humana', 667788991,
 'BILL-2024-0026', '2024-09-08 00:00:00+00', '2024-09-10 00:00:00+00', 'Vaccination',
 180.00, 85.0, 153.0, 0.0, 180.0, 'Unpaid'),

(27, 'Megan Wright', '1987-07-07', 'Female', '593 Palm Dr, Raleigh, NC 27601',
 '+1-919-555-0593', 'megan.wright@email.com', 'United Healthcare', 778899002,
 'BILL-2024-0027', '2024-08-12 00:00:00+00', '2024-08-14 00:00:00+00', 'Prenatal Care',
 280.00, 90.0, 252.0, 280.0, 0.0, 'Paid'),

(28, 'Andrew Lopez', '1975-10-29', 'Male', '604 Cypress St, Virginia Beach, VA 23451',
 '+1-757-555-0604', 'andrew.lopez@email.com', 'Blue Cross', 889900113,
 'BILL-2024-0028', '2024-07-05 00:00:00+00', '2024-07-07 00:00:00+00', 'Mental Health Consultation',
 220.00, 95.0, 209.0, 22.0, 198.0, 'Partially Paid'),

(29, 'Stephanie Hill', '1989-01-22', 'Female', '715 Magnolia Ave, Wichita, KS 67201',
 '+1-316-555-0715', 'stephanie.hill@email.com', 'Cigna', 990011224,
 'BILL-2024-0029', '2024-10-30 00:00:00+00', '2024-11-01 00:00:00+00', 'Physical Exam',
 180.00, 70.0, 126.0, 18.0, 162.0, 'Partially Paid'),

(30, 'Joshua Green', '1978-06-11', 'Male', '826 Juniper Ln, Arlington, TX 76001',
 '+1-817-555-0826', 'joshua.green@email.com', 'Kaiser', 101112335,
 'BILL-2024-0030', '2024-06-18 00:00:00+00', '2024-06-20 00:00:00+00', 'Chiropractic Care',
 140.00, 60.0, 84.0, 0.0, 140.0, 'Unpaid'),

-- Add more diverse medical services and insurance providers
(31, 'Angela Adams', '1980-09-18', 'Female', '937 Redwood Rd, Bakersfield, CA 93301',
 '+1-661-555-0937', 'angela.adams@email.com', 'Blue Shield', 112233447,
 'BILL-2024-0031', '2024-08-28 00:00:00+00', '2024-08-30 00:00:00+00', 'Pediatric Checkup',
 120.00, 85.0, 102.0, 120.0, 0.0, 'Paid'),

(32, 'Ryan Baker', '1976-12-05', 'Male', '048 Sequoia Dr, Fresno, CA 93701',
 '+1-559-555-0048', 'ryan.baker@email.com', 'Aetna', 223344558,
 'BILL-2024-0032', '2024-09-22 00:00:00+00', '2024-09-24 00:00:00+00', 'Orthopedic Consultation',
 350.00, 90.0, 315.0, 35.0, 315.0, 'Partially Paid'),

(33, 'Lauren Carter', '1985-05-27', 'Female', '159 Dogwood Ln, Mesa, AZ 85201',
 '+1-480-555-0159', 'lauren.carter@email.com', 'Humana', 334455669,
 'BILL-2024-0033', '2024-11-12 00:00:00+00', '2024-11-14 00:00:00+00', 'Dermatology Consultation',
 280.00, 75.0, 210.0, 28.0, 252.0, 'Partially Paid'),

(34, 'Justin Evans', '1979-08-09', 'Male', '260 Eucalyptus Ave, Sacramento, CA 95801',
 '+1-916-555-0260', 'justin.evans@email.com', 'United Healthcare', 445566770,
 'BILL-2024-0034', '2024-07-30 00:00:00+00', '2024-08-01 00:00:00+00', 'Neurology Consultation',
 450.00, 95.0, 427.5, 0.0, 450.0, 'Unpaid'),

(35, 'Rebecca Fisher', '1982-11-14', 'Female', '371 Hawthorn St, Atlanta, GA 30301',
 '+1-404-555-0371', 'rebecca.fisher@email.com', 'Blue Cross', 556677881,
 'BILL-2024-0035', '2024-10-08 00:00:00+00', '2024-10-10 00:00:00+00', 'Gynecology Exam',
 320.00, 80.0, 256.0, 320.0, 0.0, 'Paid'),

(36, 'Brandon Gonzalez', '1974-02-28', 'Male', '482 Ironwood Rd, Kansas City, MO 64101',
 '+1-816-555-0482', 'brandon.gonzalez@email.com', 'Cigna', 667788992,
 'BILL-2024-0036', '2024-06-12 00:00:00+00', '2024-06-14 00:00:00+00', 'Urology Consultation',
 380.00, 85.0, 323.0, 38.0, 342.0, 'Partially Paid'),

(37, 'Victoria Hernandez', '1988-04-21', 'Female', '593 Jacaranda Dr, Long Beach, CA 90801',
 '+1-562-555-0593', 'victoria.hernandez@email.com', 'Kaiser', 778899003,
 'BILL-2024-0037', '2024-09-14 00:00:00+00', '2024-09-16 00:00:00+00', 'Endocrinology Consultation',
 290.00, 90.0, 261.0, 29.0, 261.0, 'Partially Paid'),

(38, 'Nicholas Jackson', '1977-07-04', 'Male', '604 Kapok Ln, Oakland, CA 94601',
 '+1-510-555-0604', 'nicholas.jackson@email.com', 'Blue Shield', 889900114,
 'BILL-2024-0038', '2024-08-18 00:00:00+00', '2024-08-20 00:00:00+00', 'Ophthalmology Exam',
 250.00, 70.0, 175.0, 0.0, 250.0, 'Unpaid'),

(39, 'Olivia Kelly', '1983-10-17', 'Female', '715 Laurel St, Tampa, FL 33601',
 '+1-813-555-0715', 'olivia.kelly@email.com', 'Aetna', 990011225,
 'BILL-2024-0039', '2024-11-28 00:00:00+00', '2024-11-30 00:00:00+00', 'ENT Consultation',
 220.00, 75.0, 165.0, 220.0, 0.0, 'Paid'),

(40, 'Ethan Long', '1975-01-30', 'Male', '826 Mahogany Ave, Minneapolis, MN 55401',
 '+1-612-555-0826', 'ethan.long@email.com', 'Humana', 101112336,
 'BILL-2024-0040', '2024-07-22 00:00:00+00', '2024-07-24 00:00:00+00', 'Podiatry Consultation',
 160.00, 80.0, 128.0, 16.0, 144.0, 'Partially Paid'),

-- Add more high-value procedures and emergency cases
(41, 'Sophia Mitchell', '1981-06-23', 'Female', '937 Neem Rd, Honolulu, HI 96801',
 '+1-808-555-0937', 'sophia.mitchell@email.com', 'United Healthcare', 112233448,
 'BILL-2024-0041', '2024-10-18 00:00:00+00', '2024-10-22 00:00:00+00', 'Emergency Surgery',
 25000.00, 95.0, 23750.0, 2500.0, 22500.0, 'Partially Paid'),

(42, 'Alexander Nelson', '1973-09-06', 'Male', '048 Olive Dr, Anchorage, AK 99501',
 '+1-907-555-0048', 'alexander.nelson@email.com', 'Blue Cross', 223344559,
 'BILL-2024-0042', '2024-08-08 00:00:00+00', '2024-08-12 00:00:00+00', 'Major Surgery',
 35000.00, 90.0, 31500.0, 35000.0, 0.0, 'Paid'),

(43, 'Madison Ortiz', '1986-12-11', 'Female', '159 Palm St, Boise, ID 83701',
 '+1-208-555-0159', 'madison.ortiz@email.com', 'Cigna', 334455660,
 'BILL-2024-0043', '2024-09-28 00:00:00+00', '2024-10-02 00:00:00+00', 'Hospital Stay',
 15000.00, 85.0, 12750.0, 1500.0, 13500.0, 'Partially Paid'),

(44, 'Benjamin Parker', '1978-03-25', 'Male', '260 Pine St, Des Moines, IA 50301',
 '+1-515-555-0260', 'benjamin.parker@email.com', 'Kaiser', 445566771,
 'BILL-2024-0044', '2024-06-30 00:00:00+00', '2024-07-05 00:00:00+00', 'Intensive Care',
 45000.00, 95.0, 42750.0, 0.0, 45000.0, 'Unpaid'),

(45, 'Ava Ramirez', '1984-08-08', 'Female', '371 Redwood Ave, Hartford, CT 06101',
 '+1-860-555-0371', 'ava.ramirez@email.com', 'Blue Shield', 556677882,
 'BILL-2024-0045', '2024-11-15 00:00:00+00', '2024-11-18 00:00:00+00', 'Chemotherapy Session',
 5200.00, 80.0, 4160.0, 520.0, 4680.0, 'Partially Paid'),

(46, 'Lucas Sanchez', '1976-11-19', 'Male', '482 Sequoia Ln, Dover, DE 19901',
 '+1-302-555-0482', 'lucas.sanchez@email.com', 'Aetna', 667788993,
 'BILL-2024-0046', '2024-08-25 00:00:00+00', '2024-08-28 00:00:00+00', 'Radiation Therapy',
 3800.00, 90.0, 3420.0, 3800.0, 0.0, 'Paid'),

(47, 'Isabella Torres', '1989-02-02', 'Female', '593 Tamarack Rd, Montgomery, AL 36101',
 '+1-334-555-0593', 'isabella.torres@email.com', 'Humana', 778899004,
 'BILL-2024-0047', '2024-10-05 00:00:00+00', '2024-10-08 00:00:00+00', 'Physical Rehabilitation',
 2400.00, 75.0, 1800.0, 240.0, 2160.0, 'Partially Paid'),

(48, 'Mason Turner', '1974-05-14', 'Male', '604 Upas St, Juneau, AK 99801',
 '+1-907-555-0604', 'mason.turner@email.com', 'United Healthcare', 889900115,
 'BILL-2024-0048', '2024-07-12 00:00:00+00', '2024-07-16 00:00:00+00', 'Cardiac Catheterization',
 12000.00, 95.0, 11400.0, 0.0, 12000.0, 'Unpaid'),

(49, 'Charlotte Ward', '1987-10-27', 'Female', '715 Walnut Dr, Cheyenne, WY 82001',
 '+1-307-555-0715', 'charlotte.ward@email.com', 'Blue Cross', 990011226,
 'BILL-2024-0049', '2024-09-10 00:00:00+00', '2024-09-13 00:00:00+00', 'Knee Replacement Surgery',
 28000.00, 85.0, 23800.0, 2800.0, 25200.0, 'Partially Paid'),

(50, 'Henry Watson', '1979-12-31', 'Male', '826 Yew Ave, Pierre, SD 57501',
 '+1-605-555-0826', 'henry.watson@email.com', 'Cigna', 101112337,
 'BILL-2024-0050', '2024-08-15 00:00:00+00', '2024-08-19 00:00:00+00', 'Hip Replacement Surgery',
 32000.00, 90.0, 28800.0, 32000.0, 0.0, 'Paid');

-- Verify the data was inserted
SELECT COUNT(*) as total_records FROM public.billing_and_insurance;

-- Show sample of the inserted data
SELECT
  "PatientID",
  "PatientName",
  "ServiceDescription",
  "TotalCharges",
  "InsuranceProvider",
  "PaymentStatus"
FROM public.billing_and_insurance
ORDER BY "PatientID"
LIMIT 10;