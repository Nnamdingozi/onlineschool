// "use client";

// import { cn } from "@/lib/utils";
// import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useState, useEffect } from "react";

// export function SignUpForm({
//   className,
//   ...props
// }: React.ComponentPropsWithoutRef<"div">) {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [repeatPassword, setRepeatPassword] = useState("");
//   const [username, setUsername] = useState("");
//   const [gradeId, setGradeId] = useState(""); // store grade_id
//   const [grades, setGrades] = useState<{ id: string; name: string }[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   // Fetch available grades from Supabase
//   useEffect(() => {
//     const fetchGrades = async () => {
//       const supabase = createClient();
//       const { data, error } = await supabase.from("grades").select("id, name");
//       if (!error && data) setGrades(data);
//     };

//     fetchGrades();
//   }, []);

//   const handleSignUp = async (e: React.FormEvent) => {
//     e.preventDefault();
//     const supabase = createClient();
//     setIsLoading(true);
//     setError(null);

//     if (password !== repeatPassword) {
//       setError("Passwords do not match");
//       setIsLoading(false);
//       return;
//     }

//     try {
//       const { error, data } = await supabase.auth.signUp({
//         email,
//         password,
//         options: {
//           emailRedirectTo: `${window.location.origin}/protected`,
//         },
//       });

//       if (error) throw error;

//       const userId = data?.user?.id;

//       if (userId) {
//         const { error: profileError } = await supabase.from("profiles").insert([
//           {
//             id: userId,
//             username: username,
//             grade_id: gradeId,
//           },
//         ]);

//         if (profileError) {
//           setError(profileError.message);
//         }
//       }

//       router.push("/auth/sign-up-success");
//     } catch (error: unknown) {
//       setError(error instanceof Error ? error.message : "An error occurred");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={cn("flex flex-col gap-6", className)} {...props}>
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-2xl">Sign up</CardTitle>
//           <CardDescription>Create a new account</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSignUp}>
//             <div className="flex flex-col gap-6">
//               <div className="grid gap-2">
//                 <Label htmlFor="username">Username</Label>
//                 <Input
//                   id="username"
//                   type="text"
//                   placeholder="Joe"
//                   required
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                 />
//               </div>

//               <div className="grid gap-2">
//                 <Label htmlFor="grade">Select Class (Grade)</Label>
//                 <select
//                   id="grade"
//                   required
//                   value={gradeId}
//                   onChange={(e) => setGradeId(e.target.value)}
//                   className="border rounded-md px-2 py-2"
//                 >
//                   <option value="">-- Choose your class --</option>
//                   {grades.map((grade) => (
//                     <option key={grade.id} value={grade.id}>
//                       {grade.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

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

//               <div className="grid gap-2">
//                 <Label htmlFor="repeat-password">Repeat Password</Label>
//                 <Input
//                   id="repeat-password"
//                   type="password"
//                   required
//                   value={repeatPassword}
//                   onChange={(e) => setRepeatPassword(e.target.value)}
//                 />
//               </div>

//               {error && <p className="text-sm text-red-500">{error}</p>}

//               <Button type="submit" className="w-full" disabled={isLoading}>
//                 {isLoading ? "Creating an account..." : "Sign up"}
//               </Button>
//             </div>

//             <div className="mt-4 text-center text-sm">
//               Already have an account?{" "}
//               <Link
//                 href="/auth/login"
//                 className="underline underline-offset-4"
//               >
//                 Login
//               </Link>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
