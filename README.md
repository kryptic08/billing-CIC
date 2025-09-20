# AI Nako - Payment Records Management System

A modern, secure payment records management system built with Next.js 15, TypeScript, Tailwin## Admin Features

- **Admin Dashboard** - Access at `/admin` (admin users only)
- **User Management** - Grant/revoke admin privileges
- **Global Oversight** - View all payment records across users
- **Role-Based Access** - Secure admin-only functionality

### Making the First User an Admin

After setting up the database, the first user to sign up can be made an admin by running:

```sql
-- In Supabase SQL Editor
SELECT make_first_user_admin();
```

Or manually insert the admin role:

````sql
INSERT INTO user_roles (user_id, role, granted_by)
SELECT id, 'admin', id FROM auth.users ORDER BY created_at ASC LIMIT 1;
```and Supabase. Features authentication, patient management, collapsible payment records, and professional UI design.

## Features

- 🔐 **Secure Authentication** - User authentication with Supabase Auth
- 👥 **Patient Management** - Complete patient database with dropdown selection
- 💳 **Payment Records** - Comprehensive payment tracking with multiple terms
- 📱 **Responsive Design** - Modern UI with collapsible records and smooth animations
- 🔄 **Real-time Updates** - Live data synchronization with Supabase
- 🎨 **Professional UI** - Beautiful design with Tailwind CSS and custom gradients

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Database + Authentication)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Deployment**: Vercel-ready

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd ai-nako
npm install
````

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your database password

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### 4. Database Setup

1. **Execute the main schema**:

   ```sql
   -- Run this in Supabase SQL Editor
   -- Copy and paste the contents of supabase-schema.sql
   ```

2. **If you get policy conflicts** (error 42710), use one of these reset scripts:

   ```sql
   -- Option 1: Safe reset (keeps your data)
   -- Copy and paste the contents of reset-policies-only.sql

   -- Option 2: Complete reset (removes all data)
   -- Copy and paste the contents of reset-database.sql
   ```

   Then run the main schema again.

3. **Add sample data** (optional):
   ```sql
   -- Copy and paste the contents of sample-data.sql
   ```

### 5. Authentication Setup

1. In Supabase dashboard, go to Authentication > Settings
2. Configure your site URL: `http://localhost:3000` (for development)
3. Add redirect URLs if needed

### 6. Admin Setup

After setting up the database, the first user to sign up can be made an admin by running:

```sql
-- In Supabase SQL Editor
SELECT make_first_user_admin();
```

Or manually insert the admin role:

```sql
INSERT INTO user_roles (user_id, role, granted_by)
SELECT id, 'admin', id FROM auth.users ORDER BY created_at ASC LIMIT 1;
```

### 7. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000/payments](http://localhost:3000/payments) to access the payment system.

## Database Schema

The system includes three main tables:

- **patients** - Patient information and demographics
- **payment_records** - Payment transactions linked to patients
- **payment_terms** - Available payment terms and conditions

All tables include Row Level Security (RLS) policies for data protection.

## Key Components

- **Auth.tsx** - Authentication wrapper with login/signup forms
- **PaymentForm.tsx** - Enhanced form with patient dropdown and autofill
- **CollapsiblePaymentRecords.tsx** - Interactive records with expand/collapse
- **supabase-db.ts** - Database operations and authentication helpers

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Project Structure

```
├── app/
│   ├── payments/
│   │   └── page.tsx          # Main payments page
│   └── layout.tsx            # Root layout
├── Components/
│   ├── Auth.tsx              # Authentication component
│   ├── PaymentForm.tsx       # Payment form with patient selection
│   ├── CollapsiblePaymentRecords.tsx  # Records display
│   └── ui/                   # UI components
├── lib/
│   ├── supabase-db.ts        # Database functions
│   ├── types.ts              # TypeScript interfaces
│   └── utils.ts              # Utility functions
├── utils/
│   └── supabase/             # Supabase configuration
└── supabase-schema.sql       # Database schema
```

## Deployment

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

### Environment Variables for Production

Make sure to update these for production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

## Security Features

- Row Level Security (RLS) on all database tables
- User authentication required for all operations
- Secure API keys and environment variables
- Input validation and sanitization
- Protected routes and data access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
