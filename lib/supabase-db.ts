"use server";
import { createClient as createBrowserClient } from '@/utils/supabase/client';
import { createClient as createServerClient, createServiceRoleClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { PaymentRecord, Patient } from '@/lib/types';

const safeStringifyError = (err: unknown) => {
  try {
    if (!err) return String(err);
    if (err instanceof Error) return err.message;
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
};

// Client-side helpers
export const getPatients = async () => {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('patients').select('*').order('full_name');
  if (error) {
    console.error('getPatients error:', safeStringifyError(error));
    throw error;
  }
  return data;
};

export const getPaymentTerms = async () => {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('payment_terms').select('*').eq('is_active', true).order('term_name');
  if (error) {
    console.error('getPaymentTerms error:', safeStringifyError(error));
    throw error;
  }
  return data;
};

export const insertPatient = async (patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.from('patients').insert([patient]).select();
  if (error) {
    console.error('insertPatient error:', safeStringifyError(error));
    throw error;
  }
  return data;
};

export const insertPaymentRecord = async (record: Omit<PaymentRecord, 'id' | 'created_at' | 'updated_at'>) => {
  const supabase = createBrowserClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user;
  if (!user) throw new Error('User must be authenticated');
  const recordWithUser = { ...record, user_id: user.id };
  const { data, error } = await supabase.from('payment_records').insert([recordWithUser]).select();
  if (error) {
    console.error('insertPaymentRecord error:', safeStringifyError(error));
    throw error;
  }
  return data;
};

// Server-side helpers
const createServerSupabase = async () => {
  const cookieStore = await cookies();
  return createServerClient(cookieStore);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const runWithRlsRecovery = async <T>(queryFn: (client: any) => Promise<{ data: T; error: any }>): Promise<T> => {
  const serverClient = await createServerSupabase();
  const { data, error } = await queryFn(serverClient);
  if (!error) return data;

  const msg = safeStringifyError(error).toLowerCase();
  console.error('Server query error:', safeStringifyError(error));

  if (msg.includes('infinite recursion') || (msg.includes('policy') && msg.includes('recurs'))) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const svc = createServiceRoleClient();
        const { data: svcData, error: svcErr } = await queryFn(svc);
        if (svcErr) {
          console.error('Service role query failed:', safeStringifyError(svcErr));
          throw svcErr;
        }
        return svcData;
      } catch (svcError) {
        console.error('Service role retry error:', safeStringifyError(svcError));
        throw new Error('Service-role retry failed: ' + safeStringifyError(svcError));
      }
    }

    throw new Error(
      'RLS policy recursion detected (likely on user_roles). Set SUPABASE_SERVICE_ROLE_KEY to diagnose or inspect/adjust RLS policies.'
    );
  }

  throw error;
};

// Server-side public functions
export const getPaymentRecords = async (): Promise<PaymentRecord[]> => {
  return runWithRlsRecovery<PaymentRecord[]>(async (client) =>
    client
      .from('payment_records')
      .select(`
        *,
        patients (
          full_name,
          email,
          phone
        )
      `)
      .eq('user_id', (await client.auth.getUser()).data?.user?.id)
      .order('created_at', { ascending: false })
  );
};

export const getPaymentRecordById = async (id: number): Promise<PaymentRecord> => {
  return runWithRlsRecovery<PaymentRecord>(async (client) =>
    client
      .from('payment_records')
      .select(`
        *,
        patients (
          full_name,
          email,
          phone
        )
      `)
      .eq('id', id)
      .eq('user_id', (await client.auth.getUser()).data?.user?.id)
      .single()
  );
};

export const updatePaymentRecord = async (id: number, updates: Partial<PaymentRecord>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return runWithRlsRecovery<any>(async (client) =>
    client
      .from('payment_records')
      .update(updates)
      .eq('id', id)
      .eq('user_id', (await client.auth.getUser()).data?.user?.id)
      .select()
  );
};

export const deletePaymentRecord = async (id: number) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return runWithRlsRecovery<any>(async (client) =>
    client
      .from('payment_records')
      .delete()
      .eq('id', id)
      .eq('user_id', (await client.auth.getUser()).data?.user?.id)
  );
};

export const isUserAdmin = async (userId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return runWithRlsRecovery<any>(async (client) => client.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').single())
    .then((res) => !!res)
    .catch((err) => {
      console.error('isUserAdmin error:', safeStringifyError(err));
      return false;
    });
};

// Client-side admin helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isUserAdminClient = async (userId: string, currentUser?: any) => {
  const supabase = createBrowserClient();

  let currentUserData = currentUser;
  if (!currentUserData) {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserData = user;
  }

  if (!currentUserData) {
    return false;
  }

  const { data, error } = await supabase.from('user_roles').select('role').eq('user_id', userId).eq('role', 'admin').single();
  if (error && typeof error === 'object' && error !== null && 'code' in error && error.code !== 'PGRST116') {
    console.error('isUserAdminClient error:', safeStringifyError(error));
    return false;
  }
  return !!data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const grantAdminPrivilegesClient = async (userId: string, currentUser?: any) => {
  const supabase = createBrowserClient();

  let currentUserData = currentUser;
  if (!currentUserData) {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserData = user;
  }

  if (!currentUserData) {
    throw new Error('User must be authenticated');
  }

  // Allow self-granting if no admins exist yet, or if current user is already admin
  const isCurrentUserAdmin = await isUserAdminClient(currentUser.id);

  // Check if any admins exist
  const { data: existingAdmins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')
    .limit(1);

  const noAdminsExist = !existingAdmins || existingAdmins.length === 0;

  // Allow granting if: current user is admin, OR no admins exist yet (allows first admin setup)
  if (!isCurrentUserAdmin && !noAdminsExist) {
    throw new Error('Only admins can grant admin privileges');
  }

  const { data, error } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role: 'admin',
      granted_by: currentUser.id,
      granted_at: new Date().toISOString()
    })
    .select();

  if (error) {
    console.error('Error granting admin privileges:', error);
    throw error;
  }

  return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const revokeAdminPrivilegesClient = async (userId: string, currentUser?: any) => {
  const supabase = createBrowserClient();

  let currentUserData = currentUser;
  if (!currentUserData) {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserData = user;
  }

  if (!currentUserData) {
    throw new Error('User must be authenticated');
  }

  const isCurrentUserAdmin = await isUserAdminClient(currentUser.id);

  // Check if any admins exist
  const { data: existingAdmins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')
    .limit(1);

  const noAdminsExist = !existingAdmins || existingAdmins.length === 0;

  // Allow revoking if: current user is admin, OR no admins exist yet
  if (!isCurrentUserAdmin && !noAdminsExist) {
    throw new Error('Only admins can revoke admin privileges');
  }

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', 'admin');

  if (error) {
    console.error('Error revoking admin privileges:', error);
    throw error;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAllUsersClient = async (currentUser?: any) => {
  const supabase = createBrowserClient();

  let currentUserData = currentUser;
  if (!currentUserData) {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserData = user;
  }

  if (!currentUserData) {
    throw new Error('User must be authenticated');
  }

  const isCurrentUserAdmin = await isUserAdminClient(currentUser.id);

  // Check if any admins exist
  const { data: existingAdmins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')
    .limit(1);

  const noAdminsExist = !existingAdmins || existingAdmins.length === 0;

  // Allow viewing if: current user is admin, OR no admins exist yet
  if (!isCurrentUserAdmin && !noAdminsExist) {
    throw new Error('Only admins can view all users');
  }

  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      role,
      granted_by,
      granted_at,
      profiles:user_id (
        email,
        full_name
      )
    `);

  if (error) {
    console.error('Error fetching users:', error);
    throw error;
  }

  return data;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAllPaymentRecordsClient = async (currentUser?: any) => {
  const supabase = createBrowserClient();

  let currentUserData = currentUser;
  if (!currentUserData) {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserData = user;
  }

  if (!currentUserData) {
    throw new Error('User must be authenticated');
  }

  const isCurrentUserAdmin = await isUserAdminClient(currentUser.id);

  // Check if any admins exist
  const { data: existingAdmins } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'admin')
    .limit(1);

  const noAdminsExist = !existingAdmins || existingAdmins.length === 0;

  // Allow viewing if: current user is admin, OR no admins exist yet
  if (!isCurrentUserAdmin && !noAdminsExist) {
    throw new Error('Only admins can view all payment records');
  }

  const { data, error } = await supabase
    .from('payment_records')
    .select(`
      *,
      patients (
        full_name,
        email,
        phone
      ),
      profiles:user_id (
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all payment records:', error);
    throw error;
  }

  return data;
};

export const testDatabaseConnection = async () => {
  try {
    const supabase = createBrowserClient();
    const checks = await Promise.all([
      supabase.from('patients').select('id').limit(1),
      supabase.from('payment_terms').select('id').limit(1),
      supabase.from('payment_records').select('id').limit(1),
    ]);
    return {
      patients: !checks[0].error,
      paymentTerms: !checks[1].error,
      paymentRecords: !checks[2].error,
    };
  } catch (err) {
    console.error('testDatabaseConnection error:', safeStringifyError(err));
    return { error: safeStringifyError(err) };
  }
};

export const getPaymentRecordsFallback = async (): Promise<PaymentRecord[]> => {
  console.log('Using fallback - returning empty payment records array');
  return [];
};

export const getPaymentRecordsSafe = async (): Promise<PaymentRecord[]> => {
  try {
    return await getPaymentRecords();
  } catch (err) {
    console.error('getPaymentRecordsSafe - Primary function failed, using fallback:', safeStringifyError(err));
    return getPaymentRecordsFallback();
  }
};

export const diagnoseRlsPolicies = async () => {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for diagnostics. Set it in .env.local and restart the dev server.');
  }

  const svc = createServiceRoleClient();

  // Get policies on user_roles
  const { data: policies, error: polErr } = await svc
    .from('pg_policies')
    .select('policyname, qual, with_check')
    .eq('schemaname', 'public')
    .eq('tablename', 'user_roles');

  if (polErr) {
    console.error('Error fetching policies:', polErr);
    return { error: 'Failed to fetch policies' };
  }

  return { policies };
};

