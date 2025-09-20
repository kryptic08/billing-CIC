# CSV Files for AI Nako Database

This directory contains generated CSV files based on the AI Nako Payment Records Management System database schema.

## Generated Files

### 📄 patients.csv

- **Records**: 1000 sample patients
- **Key Fields**: patient_id (unique), full_name, email, phone, address, date_of_birth
- **Usage**: Import first (referenced by payment_records)

### 📄 payment_terms.csv

- **Records**: 6 payment term options
- **Key Fields**: term_name (unique), description, is_active
- **Usage**: Lookup table, import early

### 📄 profiles.csv

- **Records**: 100 user profiles
- **Key Fields**: id (UUID), email, full_name, avatar_url
- **Usage**: Extends auth.users, import before user_roles

### 📄 user_roles.csv

- **Records**: 11 user role assignments
- **Key Fields**: user_id, role (admin/user), granted_by
- **Usage**: References profiles, first user is admin

### 📄 payment_records.csv

- **Records**: 1000 payment transactions
- **Key Fields**: patient_id, user_id, total_price_php, payment_status
- **Usage**: References patients and profiles, import last
- **Assignment**: Sequential - Payment record ID 1 uses Patient P0001, ID 2 uses P0002, etc.

### 📄 database_schema.json

- **Content**: Complete database schema documentation
- **Format**: JSON with tables, columns, and relationships
- **Usage**: Reference for understanding the structure

## Import Order

When importing these CSV files into your database, follow this order:

1. **patients.csv** - Base patient data
2. **payment_terms.csv** - Lookup data
3. **profiles.csv** - User profile data
4. **user_roles.csv** - Role assignments
5. **payment_records.csv** - Transaction data

## Sample Data Characteristics

- **Dates**: Random dates from 2024
- **Names**: Generated from common name pools
- **Addresses**: US addresses with realistic format
- **Phone Numbers**: US format (+1-XXX-XXXXXXX)
- **Prices**: PHP currency, 500-50000 range
- **UUIDs**: Properly formatted unique identifiers

## Usage Examples

### Import to Supabase

```sql
-- Example: Import patients
COPY patients(patient_id, full_name, email, phone, address, date_of_birth, emergency_contact, created_at, updated_at)
FROM '/path/to/patients.csv'
WITH CSV HEADER;
```

### Import to PostgreSQL

```sql
-- Example: Import with psql
\COPY patients FROM 'patients.csv' WITH CSV HEADER
```

### Import to Python/Pandas

```python
import pandas as pd

# Read CSV
df = pd.read_csv('patients.csv')

# Display info
print(df.head())
print(df.info())
```

## Data Relationships

```
auth.users → profiles (1:1)
auth.users → user_roles (1:N)
auth.users → payment_records (1:N)
patients → payment_records (1:N)
```

## Notes

- All foreign key relationships are maintained
- Data types match the database schema
- Sample data is realistic but fictional
- UUIDs are properly formatted
- Timestamps include timezone information
- Check constraints are respected (payment_status, user roles)

## Customization

To generate different data:

1. Modify `generate_csv.py`
2. Adjust record counts in the `generate_all_csvs()` method
3. Update sample data pools (names, addresses, etc.)
4. Run `python generate_csv.py` again

## File Sizes

- patients.csv: ~1000 records
- payment_terms.csv: 6 records
- profiles.csv: 100 records
- user_roles.csv: 11 records
- payment_records.csv: 1000 records
- database_schema.json: Schema documentation
