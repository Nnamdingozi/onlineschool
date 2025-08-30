
'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleLogIn = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setIsLoading(false);
      setError(error.message);
      return;
    }

    const userId = data.user.id;
    console.log('user id in login form:', userId)

    // Fetch user's profile to get grade_id
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('grade_id')
      .eq('id', userId)
      .single(); // Expect only one profile

    setIsLoading(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    const gradeId = profileData.grade_id;
    console.log('gradeid in loginform:' , gradeId)

    if (data?.user && !error) {
      router.push('/protected/class');
    } else {
      setError("Grade information not found for this user.");
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Log in</CardTitle>
          <CardDescription>Enter your credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogIn}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="mt-4 text-sm text-center">
        Forgot password?{' '}
        <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
          Reset it here
        </Link>
      </p>
    </div>
  );
}




// 'use client';

// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { useState } from 'react';
// import { createClient } from '@/lib/supabase/client';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';

// export default function LoginForm() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const supabase = createClient();
//   const router = useRouter();

//   const handleLogIn = async (
//     e: React.FormEvent<HTMLFormElement>
//   ): Promise<void> => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);

//     const { data, error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setIsLoading(false);
//       setError(error.message);
//       return;
//     }

//     const userId = data.user.id;
//     console.log('user id in login form:', userId)

//     // Fetch user's profile to get grade_id
//     const { data: profileData, error: profileError } = await supabase
//       .from('profiles')
//       .select('grade_id')
//       .eq('id', userId)
//       .single(); // Expect only one profile

//     setIsLoading(false);

//     if (profileError) {
//       setError(profileError.message);
//       return;
//     }

//     const gradeId = profileData.grade_id;
//     console.log('gradeid in loginform:' , gradeId)

//     if (data?.user && !error) {
//       router.push('/protected/class');
//     } else {
//       setError("Grade information not found for this user.");
//     }
//   };

//   return (
//     <div>
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">Log in</CardTitle>
//           <CardDescription>Enter your credentials</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogIn}>
//             <div className="flex flex-col gap-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="email">Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="m@example.com"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                 />
//               </div>
//               <div className="grid gap-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                 />
//               </div>

//               {error && (
//                 <p className="text-sm text-red-500">
//                   {error}
//                 </p>
//               )}

//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? 'Logging in...' : 'Login'}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>

//       <p className="mt-4 text-sm text-center">
//         Forgot password?{' '}
//         <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
//           Reset it here
//         </Link>
//       </p>
//     </div>
//   );
// }
