// // lib/supabase/serverClient.ts
// import { createClient } from "@supabase/supabase-js";
// import { Database } from "@/supabaseTypes";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

// if (!supabaseUrl || !serviceRoleKey) {
//   throw new Error("Missing Supabase environment variables");
// }

// export const supabaseServer = createClient<Database>(
//   supabaseUrl,
//   serviceRoleKey
// );


// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/supabaseTypes';

// This file creates a Supabase client that is intended ONLY for use in
// secure, server-only environments like scripts or cron jobs.
// It uses the SERVICE_ROLE_KEY and will bypass all RLS policies.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using the secure variable

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing Supabase URL or Service Role Key for admin client. Ensure SUPABASE_SERVICE_ROLE_KEY is set in your .env file.'
  );
}

// This is your new, secure admin client.
export const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey);