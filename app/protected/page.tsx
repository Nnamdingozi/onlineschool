

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/client";


export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
  
    <div className="w-full h-auto min-h-screen" >
      <h1 className="text-center text-5xl">Thank you for choosing us!</h1>
      <p className="text-center text-3xl"> Select Your Class to get started</p>

   

    </div>


  );
}
