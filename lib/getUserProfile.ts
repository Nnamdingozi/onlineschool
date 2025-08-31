
import { Database } from "@/supabaseTypes";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

type UserProfileResult = {
  user: User | null;         // ✅ Supabase Auth user
  profile: Profile | null;   // ✅ Your app's profile table type
  supabase: SupabaseClient<Database>;
};
export async function getUserProfile(): Promise<UserProfileResult> {
  const supabase = await createClient();  // ✅ Use your existing server client

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return { supabase, user: null, profile: null };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) return { supabase, user, profile: null };

  return { supabase, user, profile };
}
