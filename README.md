# BILLING FOR CLOUD INC CO whatever

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-green?style=for-the-badge&logo=supabase&logoColor=white)

A payment records management system built with Next.js 15, TypeScript, Tailwind CSS, and Supabase. Features authentication, patient management, and collapsible payment records.

## Table of Contents

- [Features](#features)
- [Admin Features](#admin-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
- [Development](#development)
  - [Scripts](#scripts)
  - [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔐 **Secure Authentication**: User login with Supabase Auth.
- 👥 **Patient Management**: Patient database with dropdown selection.
- 💳 **Payment Records**: Payment tracking with multiple terms.
- 📱 **Responsive Design**: Modern UI with collapsible records.
- 🔄 **Real-time Updates**: Live data sync with Supabase.
- 🎨 **Professional UI**: Design using Tailwind CSS and custom gradients.

## Admin Features

- **Admin Dashboard**: Access at `/admin` for admin users.
- **User Management**: Grant or revoke admin privileges.
- **Global Oversight**: View all payment records.
- **Role-Based Access**: Secure admin-only functionality.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Database + Authentication)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### Setup

#### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-nako
npm install
```

#### 2. Supabase Setup

1.  Create a project at [supabase.com](https://supabase.com).
2.  Get your project URL and `anon` key from **Settings > API**.
3.  Get your database password from **Settings > Database**.

#### 3. Environment Variables

Create a `.env.local` file with the following:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
```

#### 4. Database Setup

1.  **Run Schema**: In the Supabase SQL Editor, run the contents of `supabase-schema.sql`.
2.  **(Optional) Reset**: If you see policy conflicts (error `42710`), use a reset script (`reset-policies-only.sql` or `reset-database.sql`) before running the schema again.
3.  **(Optional) Sample Data**: Run `sample-data.sql` in the SQL Editor.

#### 5. Authentication Setup

1.  In Supabase, go to **Authentication > Settings**.
2.  Set **Site URL** to `http://localhost:3000` for development.
3.  Add other necessary redirect URLs.

#### 6. Create an Admin User

After a user signs up, grant them admin privileges by running one of the following in the Supabase SQL Editor.

**Option A: Helper function** (from `supabase-schema.sql`)

```sql
-- Makes the first user who signed up an admin.
SELECT make_first_user_admin();
```

**Option B: Manual insert**

```sql
-- Makes the first user an admin.
INSERT INTO user_roles (user_id, role, granted_by)
SELECT id, 'admin', id FROM auth.users ORDER BY created_at ASC LIMIT 1;
```

#### 7. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Development

### Scripts

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
│   ├── Auth.tsx              # Auth component
│   ├── PaymentForm.tsx       # Payment form
│   ├── CollapsiblePaymentRecords.tsx  # Records display
│   └── ui/                   # UI components
├── lib/
│   ├── supabase-db.ts        # Database functions
│   ├── types.ts              # TypeScript types
│   └── utils.ts              # Utility functions
├── utils/
│   └── supabase/             # Supabase config
└── supabase-schema.sql       # Database schema
```

## Deployment

This project is ready for Vercel deployment.

1.  Connect your GitHub repo to Vercel.
2.  Add production environment variables in Vercel project settings.
3.  Deploy.

### Production Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

## Security

- **Row Level Security (RLS)**: Users can only access their own data.
- **User Authentication**: Required for all data modification.
- **Secure API Keys**: Managed via environment variables.
- **Input Validation**: Sanitization and validation of user input.
- **Protected Routes**: Secure data access logic.

## Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

## License

Pilot License
