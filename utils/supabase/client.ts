import { createBrowserClient } from "@supabase/ssr";

// Use environment variables for client-side creation. NEXT_PUBLIC_* vars are expected.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing client-side Supabase environment variables:', {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'present' : 'missing',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? 'present' : 'missing'
  });
  // Do not throw here; allowing runtime to surface the error in the browser is acceptable for dev.
}

export const createClient = () =>
  createBrowserClient(
    supabaseUrl || '',
    supabaseKey || '',
  );
