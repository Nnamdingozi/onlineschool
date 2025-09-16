// lib/supabase/serverClient.ts
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/supabaseTypes";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabaseServer = createClient<Database>(
  supabaseUrl,
  serviceRoleKey
);
