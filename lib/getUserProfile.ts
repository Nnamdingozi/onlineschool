
// import { createClient as createClientServer } from "@/lib/supabase/server";



// export async function getUserProfile() {
//     const supabase = await createClientServer();
  
//     const {
//       data: { user },
//       error: userError,
//     } = await supabase.auth.getUser();
  
//     if (userError || !user) return null;
  
//     const { data: profile, error: profileError } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('id', user.id)
//       .single();
  
//     if (profileError) return null;
  
//     return {
//       user,
//       profile, 
//       supabase
//     };
//   }
  

// import { createClient as createClientServer } from "@/lib/supabase/server";
// import { Database } from "@/supabaseTypes";  // Supabase-generated types

// type ProfileType = Database['public']['Tables']['profiles']['Row'];

// export async function getUserProfile(): Promise<{ user: any; profile: ProfileType } | null> {
//   const supabase = await createClientServer();

//   const { data: { user }, error: userError } = await supabase.auth.getUser();
//   if (userError || !user) return null;

//   const { data: profile, error: profileError } = await supabase
//     .from('profiles')
//     .select('*')
//     .eq('id', user.id)
//     .single();

//   if (profileError || !profile) return null;

//   return { user, profile };
// }


// import { Database } from "@/supabaseTypes";
// import { SupabaseClient, User } from "@supabase/supabase-js";

// // Define Profile type from your database
// type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// // Define return type
// type UserProfileResult = {
//   user: User;
//   profile: Profile;
// } | null;

// export async function getUserProfile(
//   supabase: SupabaseClient<Database>
// ): Promise<UserProfileResult> {
//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return null;

//   const { data: profile, error: profileError } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", user.id)
//     .single();

//   if (profileError || !profile) return null;

//   return { user, profile, supabase };
// }

// import { createClient } from "@/lib/supabase/server";
// import { Database } from "@/supabaseTypes";

// type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// export async function getUserProfile() {
//   const supabase = await createClient();  // ✅ Use your existing server client

//   const {
//     data: { user },
//     error: userError,
//   } = await supabase.auth.getUser();

//   if (userError || !user) return { supabase, user: null, profile: null };

//   const { data: profile, error: profileError } = await supabase
//     .from("profiles")
//     .select("*")
//     .eq("id", user.id)
//     .single();

//   if (profileError || !profile) return { supabase, user, profile: null };

//   return { supabase, user, profile };
// }

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
