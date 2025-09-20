# Database ERD - AI Nako Payment Records Management System

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE AUTH                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                          auth.users                                │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │ id (UUID, PK)              │ email (TEXT)                   │   │   │
│  │  │ created_at (TIMESTAMP)     │ raw_user_meta_data (JSON)      │   │   │
│  │  │ updated_at (TIMESTAMP)     │ ...                            │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ 1:1
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              profiles                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id (UUID, PK, FK→auth.users.id) │ email (TEXT)                   │   │
│  │ full_name (TEXT)                │ avatar_url (TEXT)              │   │
│  │ created_at (TIMESTAMP)          │ updated_at (TIMESTAMP)         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ 1:N
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             user_roles                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id (BIGSERIAL, PK)            │ user_id (UUID, FK→auth.users.id) │   │
│  │ role (TEXT, CHECK admin/user) │ granted_by (UUID, FK→auth.users.id)│   │
│  │ granted_at (TIMESTAMP)        │                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ 1:N
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           payment_records                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id (BIGSERIAL, PK)            │ patient_id (TEXT, FK→patients.patient_id)│
│  │ user_id (UUID, FK→auth.users.id)│ full_name (TEXT)                 │   │
│  │ address (TEXT)                 │ bank_name (TEXT)                  │   │
│  │ bank_account_number (BIGINT)   │ paying_for (TEXT)                 │   │
│  │ insurance_provider (TEXT)      │ insurance_tier_availed (TEXT)     │   │
│  │ medication_used (TEXT)         │ quantity (BIGINT)                 │   │
│  │ total_price_php (DOUBLE)       │ terms_accepted (TEXT)             │   │
│  │ payment_status (TEXT)          │ created_at (TIMESTAMP)            │   │
│  │ updated_at (TIMESTAMP)         │                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ 1:N
                                      │
┌─────────────────────────────────────────────────────────────────────────────┐
│                              patients                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id (BIGSERIAL, PK)            │ patient_id (TEXT, UNIQUE)         │   │
│  │ full_name (TEXT)              │ email (TEXT, UNIQUE)              │   │
│  │ phone (TEXT)                  │ address (TEXT)                    │   │
│  │ date_of_birth (DATE)          │ emergency_contact (TEXT)          │   │
│  │ created_at (TIMESTAMP)        │ updated_at (TIMESTAMP)            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           payment_terms                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id (BIGSERIAL, PK)            │ term_name (TEXT, UNIQUE)          │   │
│  │ description (TEXT)            │ is_active (BOOLEAN)               │   │
│  │ created_at (TIMESTAMP)        │                                   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Relationships Summary

### One-to-One Relationships

- `auth.users.id` → `profiles.id` (User profile extension)

### One-to-Many Relationships

- `auth.users.id` → `user_roles.user_id` (User can have multiple roles)
- `auth.users.id` → `payment_records.user_id` (User can have multiple payment records)
- `patients.patient_id` → `payment_records.patient_id` (Patient can have multiple payment records)

### Many-to-One Relationships

- `user_roles.granted_by` → `auth.users.id` (Who granted the role)

### Lookup Tables

- `payment_terms` (Independent lookup table for payment options)

## Key Constraints

### Primary Keys

- `profiles.id` (UUID)
- `user_roles.id` (BIGSERIAL)
- `patients.id` (BIGSERIAL)
- `payment_records.id` (BIGSERIAL)
- `payment_terms.id` (BIGSERIAL)

### Foreign Keys

- `profiles.id` → `auth.users.id`
- `user_roles.user_id` → `auth.users.id`
- `user_roles.granted_by` → `auth.users.id`
- `payment_records.user_id` → `auth.users.id`
- `payment_records.patient_id` → `patients.patient_id`

### Unique Constraints

- `patients.patient_id`
- `patients.email`
- `user_roles(user_id, role)`
- `payment_terms.term_name`

### Check Constraints

- `user_roles.role IN ('admin', 'user')`
- `payment_records.payment_status IN ('pending', 'completed', 'failed')`
- `payment_terms.is_active DEFAULT true`

## Indexes

- `patients.patient_id`
- `payment_records.patient_id`
- `payment_records.user_id`
- `payment_records.created_at DESC`
- `payment_terms.is_active`
- `profiles.id`
- `user_roles.user_id`
- `user_roles.role`
