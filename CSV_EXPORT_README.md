# Supabase CSV Export Tool

A Python script to export all tables from the AI Nako Payment Records Management System to CSV files.

## Database Schema Overview

### Tables and Relationships

```
auth.users (Supabase Auth)
├── profiles (extends user info)
├── user_roles (admin privileges)
└── payment_records (user's payment transactions)

patients
└── payment_records (patient's payment transactions)

payment_terms (lookup table)
```

### Table Details

#### 1. profiles

- **Purpose**: Extended user information from Supabase Auth
- **Key Columns**: id, email, full_name, avatar_url
- **Relationships**: References auth.users(id)

#### 2. user_roles

- **Purpose**: Admin role assignments
- **Key Columns**: user_id, role, granted_by, granted_at
- **Relationships**: References auth.users(user_id, granted_by)

#### 3. patients

- **Purpose**: Patient demographic information
- **Key Columns**: patient_id (unique), full_name, email, phone, address, date_of_birth
- **Relationships**: Referenced by payment_records

#### 4. payment_records

- **Purpose**: Payment transaction records
- **Key Columns**: patient_id, user_id, total_price_php, payment_status
- **Relationships**: References patients(patient_id), auth.users(user_id)

#### 5. payment_terms

- **Purpose**: Available payment term options
- **Key Columns**: term_name, description, is_active
- **Relationships**: None (lookup table)

## Setup

1. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

2. **Ensure environment variables are set** in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SERVICE_ROLE_KEY=your-service-role-key  # Optional, for admin access
   ```

## Usage

### Export All Tables to CSV

```bash
python export_to_csv.py
```

This will:

- ✅ Connect to your Supabase database
- ✅ Export all tables to CSV files
- ✅ Create a timestamped output directory
- ✅ Generate a metadata file with export information

### Output Structure

```
csv_export_20251201_143022/
├── profiles.csv
├── user_roles.csv
├── patients.csv
├── payment_terms.csv
├── payment_records.csv
└── export_metadata.json
```

## Features

- **Automatic Authentication**: Uses service role key if available, falls back to anon key
- **Error Handling**: Graceful handling of permission issues and connection problems
- **Metadata Generation**: Creates a JSON file with export details
- **UTF-8 Encoding**: Proper handling of international characters
- **Timestamped Directories**: Each export creates a unique directory

## Troubleshooting

### Permission Errors

If you get permission errors:

1. Use the service role key in your `.env.local`
2. Or run the RLS fix script first: `fix-rls-recursion.sql`

### Connection Issues

- Verify your Supabase URL and keys in `.env.local`
- Check your internet connection
- Ensure the Supabase project is active

### Missing Data

- Some tables may be empty if no data exists
- Check Supabase dashboard to verify data exists
- Ensure you have proper permissions to access the data

## CSV File Formats

Each CSV file includes:

- **Headers**: Column names from the database
- **Data Rows**: All records from the table
- **UTF-8 Encoding**: Supports international characters
- **Proper Escaping**: Handles commas and quotes in data

## Import Notes

When importing CSV files back to Supabase:

1. Use the Supabase dashboard SQL editor
2. Or create a Python import script using `COPY` commands
3. Be aware of foreign key constraints
4. Handle UUID references properly

## Security Notes

- Never commit `.env.local` to version control
- Service role key has admin privileges - use carefully
- CSV files may contain sensitive patient data
- Store exported files securely
