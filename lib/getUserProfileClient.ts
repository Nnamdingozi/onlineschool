

import { createClient } from "./supabase/client";


export async function getUserProfileClient() {
    const supabase = createClient();
  
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
  
    if (userError || !user) return null;
  
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
  
    if (profileError) return null;
  
    return {
      user,
      profile, 
    };
  }
  
