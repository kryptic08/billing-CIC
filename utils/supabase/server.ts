import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use Next.js built-in environment variable loading
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Prefer the service role key on the server to avoid RLS/policy recursion when necessary.
// If the service role key is not provided, fall back to the anon key but log a warning.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables not found:', {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'present' : 'missing',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'present' : 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing',
    cwd: process.cwd()
  });
  throw new Error(
    `Missing Supabase environment variables. Please ensure .env.local includes at least:\n` +
    `NEXT_PUBLIC_SUPABASE_URL=your_supabase_url\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\n` +
    `AND (recommended) SUPABASE_SERVICE_ROLE_KEY=your_service_role_key for server-side operations`
  );
}

export const createClient = async (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Creating Supabase server client with service role key');
  } else {
    console.warn('Creating Supabase server client with anon key (no service role key present)');
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};

// Create a server client that explicitly uses the service role key and (optionally) the
// provided cookie store for session introspection. Use this for diagnostics or admin
// operations that need to bypass RLS when a service key is available.
export const createServiceRoleClient = (cookieStore?: Awaited<ReturnType<typeof cookies>>) => {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in the environment');
  }

  if (!cookieStore) {
    // Create a client without cookie handling (useful for background jobs)
    return createServerClient(supabaseUrl, serviceKey, { cookies: { getAll: () => [], setAll: () => {} } as any });
  }

  // If a cookie store is provided, forward it so the client can still read the session
  return createServerClient(
    supabaseUrl,
    serviceKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll() {
          // Intentionally no-op for service-role diagnostic client
        },
      },
    }
  );
};