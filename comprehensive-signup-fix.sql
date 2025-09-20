-- Comprehensive fix for Supabase user signup database errors
-- Run this in your Supabase SQL Editor to fix all potential issues

-- 1. First, let's check current state
SELECT 'Current profiles count:' as info, COUNT(*) as count FROM profiles;
SELECT 'Current users count:' as info, COUNT(*) as count FROM auth.users;

-- 2. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create improved trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_full_name TEXT;
BEGIN
    -- Extract full_name from user metadata, with fallback
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->'data'->>'full_name',
        ''
    );

    -- Insert profile record
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, user_full_name);

    -- Log successful creation
    RAISE LOG 'Profile auto-created for user: % with name: %', NEW.id, user_full_name;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail user creation
        RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Fix RLS policies to allow service role operations
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Allow users to insert their own profiles OR service role to insert any profile
CREATE POLICY "Users can insert their own profile" ON profiles
    FOR INSERT WITH CHECK (
        auth.uid() = id OR
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Allow service role full access to profiles table
CREATE POLICY "Service role can manage profiles" ON profiles
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. Create a manual profile creation function for client-side fallback
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_email TEXT,
    user_full_name TEXT DEFAULT ''
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (user_id, user_email, user_full_name)
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        updated_at = NOW();

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in create_user_profile for user %: %', user_id, SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.create_user_profile(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;

-- 8. Test the setup
-- This will test if we can create a profile manually
SELECT 'Testing manual profile creation...' as test;
-- Note: Replace with actual test values if needed
-- SELECT public.create_user_profile('test-uuid'::UUID, 'test@example.com', 'Test User');

-- 9. Verify trigger exists
SELECT
    'Trigger status:' as info,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 10. Check RLS policies
SELECT
    'RLS Policies on profiles:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;