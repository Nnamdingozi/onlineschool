// // app/protected/class/[subject]/terms/page.tsx

// // import { createClient } from "@/lib/supabase/client";
// // import { notFound } from "next/navigation";
// // import TermSelection from "@/components/termSelector";
// // import { Database } from "@/supabaseTypes";

// // type Subject = Database['public']['Tables']['subjects']['Row'];
// // type Term = Database['public']['Tables']['terms']['Row'];a
// // type Topic = Database['public']['Tables']['topics']['Row'];

// // interface PageProps {
// //   params: {
// //     subject: string;  // slugified subject name
// //   };
// // }

// // export default async function TermsPage({ params }: PageProps) {
//   // const supabase = createClient();
//   // const subjectSlug = decodeURIComponent(params.subject);
//   // const formattedName = subjectSlug.replace(/-/g, ' ');  // Convert slug to name

// //   // ✅ Fetch subject safely typed
// //   const { data: subjectData, error: subjectError } = await supabase
// //     .from<Subject>('subjects')
// //     .select('*')
// //     .ilike('name', formattedName)
// //     .single();

// //   if (!subjectData || subjectError) return notFound();

// //   const subject: Subject = subjectData;

// //   // ✅ Fetch terms typed
// //   const { data: termData, error: termError } = await supabase
// //     .from<Term>('terms')
// //     .select('*')
// //     .eq('subject_id', subject.id);

// //   if (!termData || termError) {
// //     return <p className="p-4 text-red-500">Error loading terms.</p>;
// //   }

// //   const terms: Term[] = termData;

// //   // ✅ Fetch topics and count, typed
// //   const { data: topicData, count, error: topicError } = await supabase
// //     .from<Topic>('topics')
// //     .select('*', { count: 'exact' })
// //     .eq('subject_id', subject.id);

// //   if (!topicData || topicError) {
// //     return <p className="p-4 text-red-500">Error loading topics.</p>;
// //   }

// //   const topics: Topic[] = topicData;

// //   return (
// //     <div className="p-4">
// //       <TermSelection
// //         subject={subject}
// //         terms={terms}
// //         topics={topics}
// //         topicCount={count ?? 0}  // fallback if count is null
// //       />
// //     </div>
// //   );
// // }
// // app/protected/class/[subject]/terms/page.tsx

// import { createClient } from "@/lib/supabase/client";
// import { notFound } from "next/navigation";
// import TermSelection from "@/components/termTopicSelector";
// import { Database } from "@/supabaseTypes";

// type Subject = Database['public']['Tables']['subjects']['Row'];
// type Term = Database['public']['Tables']['terms']['Row'];
// type Topic = Database['public']['Tables']['topics']['Row'];

// interface PageProps {
//   params: {
//     subject: string; // slugified subject name
//   };
// }

// export default async function subjectTopicsPage({ params }: PageProps) {
//   const supabase = createClient();
//   const subjectSlug = decodeURIComponent(params.subject);
//   const formattedName = subjectSlug.replace(/-/g, ' '); // e.g., 'basic-science' → 'basic science'

//   // ✅ Fetch subject by name
//   const { data: subjectData, error: subjectError } = await supabase
//     .from('subjects')
//     .select('*')
//     .ilike('name', formattedName)
//     .single();

//   if (!subjectData || subjectError) return notFound();
//   const subject: Subject = subjectData;

//   // ✅ Fetch terms for this subject
//   const { data: termsData, error: termError } = await supabase
//     .from('terms')
//     .select('*')
//     .eq('subject_id', subject.id);

//   if (!termsData || termError) {
//     return <p className="p-4 text-red-500">Error loading terms.</p>;
//   }

//   const terms: Term[] = termsData;

//   // ✅ Fetch topics for this subject (all terms)
//   const { data: topicsData, error: topicError } = await supabase
//     .from('topics')
//     .select('*')
//     .eq('subject_id', subject.id);

//   if (!topicsData || topicError) {
//     return <p className="p-4 text-red-500">Error loading topics.</p>;
//   }

//   const topics: Topic[] = topicsData;

//   const topicsByTerm: Record<number, { topics: Topic[]; count: number }> = {};

//   topics.forEach(topic => {
//     if (topic.term_id !== null) {
//       if (!topicsByTerm[topic.term_id]) {
//         topicsByTerm[topic.term_id] = { topics: [], count: 0 };
//       }
//       topicsByTerm[topic.term_id].topics.push(topic);
//       topicsByTerm[topic.term_id].count++;
//     } else {
//       console.warn(`Topic with id ${topic.id} has null term_id and was skipped.`);
//       // Optional: group under unknown or skip
//       // Example if grouping unknowns:
//       // const unknownKey = -1;
//       // if (!topicsByTerm[unknownKey]) topicsByTerm[unknownKey] = { topics: [], count: 0 };
//       // topicsByTerm[unknownKey].topics.push(topic);
//       // topicsByTerm[unknownKey].count++;
//     }
//   });
  
//   // ✅ Pass grouped topics along with terms to TermSelection
//   return (
//     <div className="p-4">
//       <TermSelection
//         subject={subject}
//         terms={terms}
//         topicsByTerm={topicsByTerm}  // group topics by term
//       />
//     </div>
//   );
// }


// import { createClient } from "@/lib/supabase/client";
// import { notFound } from "next/navigation";
// import TermSelection from "@/components/termTopicSelector";
// import { Database } from "@/supabaseTypes";


// export default async function TermsPage ({ params }: PageProps) {

//   const supabase = createClient();
//   const subjectSlug = decodeURIComponent(params.subject);
//   const formattedName = subjectSlug.replace(/-/g, ' ');  // Convert slug to name

  // interface PageProps {
  //   params: {
  //     subject: string; // slugified subject name
  //   };
  // }

//   return <div className="p-4 text-green-600">Page Loaded for {formattedName} and {subjectSlug}</div>;
// }

// 'use client'

// import { getUserProfileClient } from "@/lib/getUserProfileClient"; // Server-side profile fetch
// import { createClient } from "@/lib/supabase/client";
// import { notFound } from "next/navigation";
// import TermSelection from "@/components/termTopicSelector";
// import { Database } from "@/supabaseTypes";


// interface PageProps {
//   params: {
//     subject: string; // slugified subject name
//   };
// }

// type Subject = Database['public']['Tables']['subjects']['Row'];
// type Term = Database['public']['Tables']['terms']['Row'];
// type Topic = Database['public']['Tables']['topics']['Row'];

// export default async function subjectTopicsPage({ params }: PageProps) {
//   const supabase = createClient();
//   const subjectSlug = decodeURIComponent(params.subject);
//   const formattedName = subjectSlug.replace(/-/g, ' ');

//   // ✅ Fetch user profile (server-side) to get grade_id
//   const profileData = await getUserProfileClient();
//   if (!profileData) {
//     return <p className="p-4 text-red-500">User not authenticated</p>;
//   }

//   const { profile } = profileData;
//   const gradeId = profile.grade_id;

//   if (!gradeId) {
//     return <p className="p-4 text-red-500">User grade not found</p>;
//   }

//   // ✅ Fetch subject for this grade
//   const { data: subjectData, error: subjectError } = await supabase
//     .from('subject_grades')
//     .select('subjects(*), grade_id')
//     .eq('grade_id', gradeId)
//     .eq('subjects.name', formattedName)
//     .maybeSingle();

//   if (!subjectData || subjectError || !subjectData.subjects) {
//     return <p className="p-4 text-red-500">Subject not found for your class</p>;
//   }

//   const subject: Subject = subjectData.subjects;

//   // ✅ Fetch terms for this subject (optional: filter by grade if needed)
//   const { data: termsData, error: termError } = await supabase
//     .from('terms')
//     .select('*')
//     .eq('subject_id', subject.id);

//   if (!termsData || termError) {
//     return <p className="p-4 text-red-500">Error loading terms</p>;
//   }

//   const terms: Term[] = termsData;

//   // ✅ Fetch topics for this subject
//   const { data: topicsData, error: topicError } = await supabase
//     .from('topics')
//     .select('*')
//     .eq('subject_id', subject.id);

//   if (!topicsData || topicError) {
//     return <p className="p-4 text-red-500">Error loading topics</p>;
//   }

//   const topics: Topic[] = topicsData;

//   // ✅ Group topics by term
//   const topicsByTerm: Record<number, { topics: Topic[]; count: number }> = {};

//   topics.forEach(topic => {
//     if (topic.term_id !== null) {
//       if (!topicsByTerm[topic.term_id]) {
//         topicsByTerm[topic.term_id] = { topics: [], count: 0 };
//       }
//       topicsByTerm[topic.term_id].topics.push(topic);
//       topicsByTerm[topic.term_id].count++;
//     }
//   });

//   return (
//     <div className="p-4">
//       <TermSelection
//         subject={subject}
//         terms={terms}
//         topicsByTerm={topicsByTerm}
//       />
//     </div>
//   );
// }



// 'use client'

// import { getUserProfileClient } from "@/lib/getUserProfileClient"; // client side fetch
// import { createClient } from "@/lib/supabase/client";
// import { notFound } from "next/navigation";
// import TermSelection from "@/components/termTopicSelector";
// import { Database } from "@/supabaseTypes";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";


// interface PageProps {
//   params: {
//     subject: string; // slugified subject name
//   };
// }



// type Subject = Database['public']['Tables']['subjects']['Row'];
// type Term = Database['public']['Tables']['terms']['Row'];
// type Topic = Database['public']['Tables']['topics']['Row'];
// type Grade = Database['public']['Tables']['grades']['Row'];


// export default function SubjectTopicsPage({ params }: PageProps) {
//   const [subject, setSubject] = useState<Subject | null>(null);
//   const [terms, setTerms] = useState<Term[]>([]);
//   const [topicsByTerm, setTopicsByTerm] = useState<Record<number, { topics: Topic[]; count: number }>>({});
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [grade, setGrade] = useState<Grade[]>([]);


//   const router = useRouter();
//   const supabase = createClient();

//   useEffect(() => {
//     const fetchData = async () => {
//       const profileData = await getUserProfileClient();

//       if (!profileData) {
//         router.push('/auth/login');
//         return;
//       }

//       const { profile} = profileData;
//       const gradeId = profile.grade_id;
   

//       if (!gradeId) {
//         setError("User grade not found.");
//         setLoading(false);
//         return;
//       }

//       const subjectSlug = decodeURIComponent(params.subject);

//       console.log('subject extracted from params;', subjectSlug)

//       const formattedName = subjectSlug.replace(/-/g, ' ');
//       console.log('subject formatted subject from params;', formattedName)


//       const { data: gradeData, error: gradeError } = await supabase
//         .from('grades')
//         .select('*')
//         .eq('grade_id', gradeId);

//       if (!gradeData || gradeError) {
//         setError("Error fetching class name.");
//         setLoading(false);
//         return;
//       }

// setGrade(gradeData)



//       // Fetch subject for grade
//       const { data: subjectData, error: subjectError } = await supabase
//         .from('subject_grades')
//         .select('subjects(*), grade_id')
//         .eq('grade_id', gradeId)
//         .eq('subjects.name', formattedName)
//         .maybeSingle();

//       if (!subjectData || subjectError || !subjectData.subjects) {
//         setError("Subject not found for your class.");
//         setLoading(false);
//         return;
//       }

//       const subjectValue: Subject = subjectData.subjects;
//       setSubject(subjectValue);

//       // Fetch terms
//       const { data: termsData, error: termError } = await supabase
//         .from('terms')
//         .select('*')
//         .eq('subject_id', subjectValue.id);

//       if (!termsData || termError) {
//         setError("Error loading terms.");
//         setLoading(false);
//         return;
//       }

//       setTerms(termsData);

//       // Fetch topics
//       const { data: topicsData, error: topicError } = await supabase
//         .from('topics')
//         .select('*')
//         .eq('subject_id', subjectValue.id);

//       if (!topicsData || topicError) {
//         setError("Error loading topics.");
//         setLoading(false);
//         return;
//       }



//       const grouped: Record<number, { topics: Topic[]; count: number }> = {};
//       topicsData.forEach(topic => {
//         if (topic.term_id !== null) {
//           if (!grouped[topic.term_id]) {
//             grouped[topic.term_id] = { topics: [], count: 0 };
//           }
//           grouped[topic.term_id].topics.push(topic);
//           grouped[topic.term_id].count++;
//         }
//       });

//       setTopicsByTerm(grouped);
//       setLoading(false);
//     };

//     fetchData();
//   }, [params.subject, router]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (error) return <div className="p-4 text-red-500">{error}</div>;
//   if (!subject) return <div className="p-4 text-red-500">Subject not found.</div>;

//   return (
//     <div className="p-4">
//       <h1>Welcome to {grade.name}</h1>
//       <TermSelection
//         subject={subject}
//         terms={terms}
//         topicsByTerm={topicsByTerm}
//       />
//     </div>
//   );
// }



// 'use client';

// import { getUserProfileClient } from "@/lib/getUserProfileClient";
// import { createClient } from "@/lib/supabase/client";
// import { useRouter, useParams } from "next/navigation";
// import TermSelection from "@/components/termTopicSelector";
// import { Database } from "@/supabaseTypes";
// import { useEffect, useState } from "react";

// type Subject = Database['public']['Tables']['subjects']['Row'];
// type Term = Database['public']['Tables']['terms']['Row'];
// type Topic = Database['public']['Tables']['topics']['Row'];
// type Grade = Database['public']['Tables']['grades']['Row'];

// export default function SubjectTopicsPage() {
//   const [subject, setSubject] = useState<Subject | null>(null);
//   const [terms, setTerms] = useState<Term[]>([]);
//   const [topicsByTerm, setTopicsByTerm] = useState<Record<number, { topics: Topic[]; count: number }>>({});
//   const [grade, setGrade] = useState<Grade | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const router = useRouter();
//   const supabase = createClient();
//   const params = useParams();  // ✅ Get route params in client
//   const subjectSlug = decodeURIComponent(params.subject as string || '');

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);

//       const profileData = await getUserProfileClient();

//       if (!profileData) {
//         router.push('/auth/login');
//         return;
//       }

//       const { profile } = profileData;
//       const gradeId = profile.grade_id;

//       if (!gradeId) {
//         setError("User grade not found.");
//         setLoading(false);
//         return;
//       }

//       // Fetch Grade Info (optional display)
//       const { data: gradeData, error: gradeError } = await supabase
//         .from('grades')
//         .select('*')
//         .eq('grade_id', gradeId)
//         .maybeSingle();

//       if (gradeError || !gradeData) {
//         setError("Error fetching class name.");
//         setLoading(false);
//         return;
//       }

//       setGrade(gradeData);

//       const formattedName = subjectSlug.replace(/-/g, ' ');

//       // Fetch subject based on user's grade
//       const { data: subjectData, error: subjectError } = await supabase
//         .from('subject_grades')
//         .select('subjects(*), grade_id')
//         .eq('grade_id', gradeId)
//         .eq('subjects.name', formattedName)
//         .maybeSingle();

//       if (subjectError || !subjectData?.subjects) {
//         setError("Subject not found for your class.");
//         setLoading(false);
//         return;
//       }

//       const subjectValue = subjectData.subjects;
//       setSubject(subjectValue);

//       // Fetch terms
//       const { data: termsData, error: termsError } = await supabase
//         .from('terms')
//         .select('*')
//         .eq('subject_id', subjectValue.id);

//       if (termsError || !termsData) {
//         setError("Error loading terms.");
//         setLoading(false);
//         return;
//       }

//       setTerms(termsData);

//       // Fetch topics
//       const { data: topicsData, error: topicError } = await supabase
//         .from('topics')
//         .select('*')
//         .eq('subject_id', subjectValue.id);

//       if (topicError || !topicsData) {
//         setError("Error loading topics.");
//         setLoading(false);
//         return;
//       }

//       const grouped: Record<number, { topics: Topic[]; count: number }> = {};
//       topicsData.forEach(topic => {
//         if (topic.term_id != null) {
//           if (!grouped[topic.term_id]) {
//             grouped[topic.term_id] = { topics: [], count: 0 };
//           }
//           grouped[topic.term_id].topics.push(topic);
//           grouped[topic.term_id].count++;
//         }
//       });

//       setTopicsByTerm(grouped);
//       setLoading(false);
//     };

//     if (subjectSlug) {
//       fetchData();
//     }
//   }, [subjectSlug, router, supabase]);

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (error) return <div className="p-4 text-red-500">{error}</div>;
//   if (!subject) return <div className="p-4 text-red-500">Subject not found.</div>;

//   return (
//     <div className="p-4">
//       {grade && <h1>Welcome to {grade.name}</h1>}
//       <TermSelection subject={subject} terms={terms} topicsByTerm={topicsByTerm} />
//     </div>
//   );
// }



// 'use client';

// import { getUserProfileClient } from "@/lib/getUserProfileClient";
// import { createClient } from "@/lib/supabase/client";
// import { useRouter, useParams } from "next/navigation";
// import TermSelection from "@/components/termTopicSelector";
// import { Database } from "@/supabaseTypes";
// import { useEffect, useState, useMemo } from "react";

// type Subject = Database['public']['Tables']['subjects']['Row'];
// type Term = Database['public']['Tables']['terms']['Row'];
// type Topic = Database['public']['Tables']['topics']['Row'];
// type Grade = Database['public']['Tables']['grades']['Row'];

// export default function SubjectTopicsPage() {
//   const [subject, setSubject] = useState<Subject | null>(null);
//   const [terms, setTerms] = useState<Term[]>([]);
//   const [topicsByTerm, setTopicsByTerm] = useState<Record<number, { topics: Topic[]; count: number }>>({});
//   const [grade, setGrade] = useState<Grade | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const router = useRouter();
//   const params = useParams();

//   const supabase = useMemo(() => createClient(), []);  // ✅ Memoize supabase instance

//   const subjectSlug = useMemo(() => {
//     const raw = params.subject as string | undefined;
//     return raw ? decodeURIComponent(raw) : '';
//   }, [params.subject]);

//   console.log('formated subject slug', subjectSlug)

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);

//       // fetch user profile and extract grade id
//       const profileData = await getUserProfileClient();
//       if (!profileData) {
//         router.push('/auth/login');
//         return;
//       }

//       const { profile } = profileData;
//       const gradeId = profile.grade_id;
//       console.log('grade id from topics page:', gradeId)

//       if (!gradeId) {
//         setError("User grade not found.");
//         setLoading(false);
//         return;
//       }

//       // Fetch Grade Info
//       const { data: gradeData, error: gradeError } = await supabase
//         .from('grades')
//         .select('*')
//         .eq('id', gradeId)
//         .maybeSingle();

//       if (gradeError || !gradeData) {
//         setError("Error fetching class name.");
//         setLoading(false);
//         return;
//       }
//       console.log('grade data on topics page', gradeData)

//       setGrade(gradeData);

//       const formattedName = subjectSlug.replace(/-/g, ' ');

    
// // Fetch subject via subject_grades + join subjects table
// const { data: subjectGradesData, error: sgError } = await supabase
//   .from('subject_grades')
//   .select('subject_id')
//   .eq('grade_id', gradeId);

// if (!subjectGradesData || sgError) {
//   setError("Could not fetch subject associations.");
//   setLoading(false);
//   return;
// }

// const subjectIds = subjectGradesData.map(sg => sg.subject_id);

// const { data: matchedSubject, error: subjectError } = await supabase
//   .from('subjects')
//   .select('*')
//   .in('id', subjectIds)
//   .ilike('name', `%${formattedName}%`)
//   .maybeSingle();

// if (!matchedSubject || subjectError) {
//   setError("Subject not found for your class.");
//   setLoading(false);
//   return;
// }
// console.log('matched subject', matchedSubject)


// setSubject(matchedSubject);
      

//       // Fetch terms
//       const { data: termsData, error: termsError } = await supabase
//       .from('terms')
//       .select('*')
//       .order('term_order', { ascending: true }); // Ensures terms appear in correct sequence
    
//     if (termsError || !termsData || termsData.length === 0) {
//       setError("Error loading terms.");
//       setLoading(false);
//       return;
//     }
    
//     console.log('terms data on topics page', termsData);
//     setTerms(termsData);
    

//       // Fetch topics
//       const { data: topicsData, error: topicError } = await supabase
//         .from('topics')
//         .select('*')
//         .eq('subject_id', matchedSubject.id);

//       if (topicError || !topicsData) {
//         setError("Error loading topics.");
//         setLoading(false);
//         return;
//       }

//       const grouped: Record<number, { topics: Topic[]; count: number }> = {};
//       topicsData.forEach(topic => {
//         if (topic.term_id != null) {
//           if (!grouped[topic.term_id]) {
//             grouped[topic.term_id] = { topics: [], count: 0 };
//           }
//           grouped[topic.term_id].topics.push(topic);
//           grouped[topic.term_id].count++;
//         }
//       });

//       console.log('grouped terms data on topics page', grouped)


//       setTopicsByTerm(grouped);
//       setLoading(false);
//     };

//     if (subjectSlug) {
//       fetchData();
//     }
//   }, [subjectSlug]); // ✅ Only depend on subjectSlug

//   const gradeName = grade?.name;
//   console.log('gradename on topics page', gradeName)

//   const gradeId = grade!.id

//   if (loading) return <div className="p-4">Loading...</div>;
//   if (error) return <div className="p-4 text-red-500">{error}</div>;
//   if (!subject) return <div className="p-4 text-red-500">Subject not found.</div>;

//   return (
//     <div className="p-4">
//       {grade && <h1 className="text-white text-center text-5xl mb-5">Welcome to {gradeName}</h1>}
//       <TermSelection subject={subject} terms={terms} topicsByTerm={topicsByTerm} gradeId={gradeId}/>
//     </div>
//   );
// }


'use client';

import { getUserProfileClient } from "@/lib/getUserProfileClient";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import TermSelection from "@/components/termTopicSelector";
import { Database } from "@/supabaseTypes";
import { useEffect, useState, useMemo } from "react";

type Subject = Database['public']['Tables']['subjects']['Row'];
type Term = Database['public']['Tables']['terms']['Row'];
type Topic = Database['public']['Tables']['topics']['Row'];
type Grade = Database['public']['Tables']['grades']['Row'];

export default function SubjectTopicsPage() {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [topicsByTerm, setTopicsByTerm] = useState<Record<number, { topics: Topic[]; count: number }>>({});
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => createClient(), []);

  const subjectSlug = useMemo(() => {
    const raw = params.subject as string | undefined;
    return raw ? decodeURIComponent(raw) : '';
  }, [params.subject]);

  console.log('formatted subject slug', subjectSlug);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Get user profile + grade id
        const profileData = await getUserProfileClient();
        if (!profileData) {
          router.push('/auth/login');
          return;
        }

        const { profile } = profileData;
        const gradeId = profile.grade_id;
        console.log('grade id from topics page:', gradeId);

        if (!gradeId) {
          setError("User grade not found.");
          return;
        }

        // 2️⃣ Fetch grade
        const { data: gradeData, error: gradeError } = await supabase
          .from('grades')
          .select('*')
          .eq('id', gradeId)
          .maybeSingle();

        if (gradeError || !gradeData) {
          setError("Error fetching class name.");
          return;
        }
        setGrade(gradeData);

        // 3️⃣ Fetch subject
        const formattedName = subjectSlug.replace(/-/g, ' ');
        const { data: subjectGradesData, error: sgError } = await supabase
          .from('subject_grades')
          .select('subject_id')
          .eq('grade_id', gradeId);

        if (!subjectGradesData || sgError) {
          setError("Could not fetch subject associations.");
          return;
        }

        const subjectIds = subjectGradesData.map(sg => sg.subject_id);
        const { data: matchedSubject, error: subjectError } = await supabase
          .from('subjects')
          .select('*')
          .in('id', subjectIds)
          .ilike('name', `%${formattedName}%`)
          .maybeSingle();

        if (!matchedSubject || subjectError) {
          setError("Subject not found for your class.");
          return;
        }
        setSubject(matchedSubject);

        // 4️⃣ Fetch terms
        const { data: termsData, error: termsError } = await supabase
          .from('terms')
          .select('*')
          .order('term_order', { ascending: true });

        if (termsError || !termsData || termsData.length === 0) {
          setError("Error loading terms.");
          return;
        }
        setTerms(termsData);

        // 5️⃣ Fetch topics
        const { data: topicsData, error: topicError } = await supabase
          .from('topics')
          .select('*')
          .eq('subject_id', matchedSubject.id);

        if (topicError || !topicsData) {
          setError("Error loading topics.");
          return;
        }

        const grouped: Record<number, { topics: Topic[]; count: number }> = {};
        topicsData.forEach(topic => {
          if (topic.term_id != null) {
            if (!grouped[topic.term_id]) {
              grouped[topic.term_id] = { topics: [], count: 0 };
            }
            grouped[topic.term_id].topics.push(topic);
            grouped[topic.term_id].count++;
          }
        });

        setTopicsByTerm(grouped);
      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (subjectSlug) {
      fetchData();
    }
  }, [subjectSlug, supabase, router]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!subject || !grade || terms.length === 0) {
    return <div className="p-4 text-red-500">Required data is missing.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-white text-center text-5xl mb-5">
        Welcome to {grade.name}
      </h1>
      <TermSelection
        subject={subject}
        terms={terms}
        topicsByTerm={topicsByTerm}
        gradeId={grade.id}
      />
    </div>
  );
}
