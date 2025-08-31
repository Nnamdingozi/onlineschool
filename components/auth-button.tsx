
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthButton() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (user && !error) {
        setUserEmail(user.email ?? null);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();

        if (!profileError && profile) {
          setUsername(profile.username);
        }
      } else {
        // Clear state if no user
        setUserEmail(null);
        setUsername(null);
      }
    };

    fetchUserProfile();

    // 🔔 Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // User just logged out
        setUserEmail(null);
        setUsername(null);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // User just logged in or token refreshed
        fetchUserProfile();
    
      }
    });

    // ✅ Cleanup listener on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  return userEmail ? (
    <div className="flex items-center gap-4">
      Hey, {username ?? userEmail}!
      <Link href={'/'}>
        <Home />
      </Link>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
