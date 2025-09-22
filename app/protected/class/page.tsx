
// 'use client';

// import { useEffect, useState } from "react";
// import { useRouter } from 'next/navigation';
// import { createClient } from "@/lib/supabase/client";
// import { getUserProfileClient } from "@/lib/getUserProfileClient";
// import SubjectCards from "@/components/subjectCard";
// import { Database } from '@/supabaseTypes';
// import { getTopicsGroupedByTerm } from '@/lib/getTopicsGroupedByTerm';


// type Subject = Database['public']['Tables']['subjects']['Row'];
// type Grade = Database['public']['Tables']['grades']['Row'];
// type ProgressData = Database['public']['Tables']['student_subject_progress']['Row'];

// type SubjectGradeJoin = {
//   grade_id: number;
//   subject_id: number;
//   subjects: Subject;
// };

// export default function SubjectsPage() {
//   const [subjects, setSubjects] = useState<Subject[] | null>(null);
//   const [progressData, setProgressData] = useState<ProgressData[]>([]); // ✅ array, not null
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [grade, setGrade] = useState<Grade | null>(null);
//   const [topicCounts, setTopicCounts] = useState<Record<number, number>>({});

//   const router = useRouter();
//   const supabase = createClient();

//   useEffect(() => {
//     const fetchSubjectsAndProgress = async () => {
      
//       const profileData = await getUserProfileClient();

//       if (!profileData) {
//         router.push('/auth/login');
//         return;
//       }

//       const { profile } = profileData;
//       const gradeId = profile.grade_id;
//       const userId = profile.id;

//       if (!gradeId) {
//         setError("Grade not found for this user.");
//         setLoading(false);
//         return;
//       }


//       // fetch subjects for this grade
//       const { data: subjectGradeData, error: subjectGradeError } = await supabase
//         .from('subject_grades')
//         .select('subjects(*), grade_id, subject_id')
//         .eq('grade_id', gradeId);

//       if (subjectGradeError || !subjectGradeData) {
//         setError("Failed to fetch subjects.");
//         setLoading(false);
//         return;
//       }



//       // fetch progress for this student
//       const { data: progressRows, error: progressError } = await supabase
//         .from("student_subject_progress")
//         .select("*")
//         .eq("student_id", userId);

//       if (progressError) {
//         console.error("Error fetching progress:", progressError.message);
//       }

//       // fetch grade details
//       const { data: gradeData, error: gradeError } = await supabase
//         .from('grades')
//         .select('*')
//         .eq('id', gradeId)
//         .single();

//       if (gradeError || !gradeData) {
//         setError("Failed to fetch grade.");
//         setLoading(false);
//         return;
//       }

//       const subjectGrades = subjectGradeData as SubjectGradeJoin[];
//       const subjectsList = subjectGrades.map(row => row.subjects);

      
//            // ✅ calculate topic totals per subject using grouped function
//            const counts: Record<number, number> = {};
//            for (const sg of subjectGrades) {
//              const { total } = await getTopicsGroupedByTerm(gradeId, sg.subject_id);
//              counts[sg.subject_id] = total;
//            }
//            setTopicCounts(counts);




//       setSubjects(subjectsList);
//       setProgressData(progressRows ?? []); // ✅ ensure array
//       setGrade(gradeData);
//       setLoading(false);
//     };

//     fetchSubjectsAndProgress();
//   }, [router, supabase]);

//   const handleSubjectClick = (subjectName: string) => {
//     const formattedSubject = subjectName.toLowerCase().replace(/\s+/g, '-');
//     router.push(`/protected/subjectTopics/${formattedSubject}`);
//   };

//   if (loading) return <div className="p-4 text-white">Loading subjects...</div>;
//   if (error) return <div className="p-4 text-red-500">{error}</div>;

//   return (
//     <div className="p-4 w-full">
//       <h1 className="text-xl font-bold mb-4 text-white">
//         Subjects for {grade ? grade.name : ""}
//       </h1>
//       {subjects && (
//         <SubjectCards
//           subjects={subjects}
//           handleSubjectClick={handleSubjectClick}
//           progressData={progressData}
//           topicCounts={topicCounts}
//         />
//       )}
//     </div>
//   );
// }



'use client';

import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import SubjectCards from "@/components/subjectCard";
import { subjectsPageFetcher } from '@/lib/fetchers/subjectFetcher'; 
import { Database } from '@/supabaseTypes';

// Define the type for the data SWR will return. This improves type safety.
type SubjectsPageData = {
  subjects: Database['public']['Tables']['subjects']['Row'][];
  progressData: Database['public']['Tables']['student_subject_progress']['Row'][];
  grade: Database['public']['Tables']['grades']['Row'];
  topicCounts: Record<number, number>;
};

export default function SubjectsPage() {
  const router = useRouter();

  // ✅ Use SWR with the correct fetcher. The key is a simple string.
  const { data, error, isLoading } = useSWR<SubjectsPageData>('subjects-page-data', subjectsPageFetcher, {
    onError: (err) => {
      // This will automatically redirect the user if they are not logged in.
      if (err.status === 401) router.push('/auth/login');
    }
  });

  const handleSubjectClick = (subjectSlug: string) => {
    // Use the slug for routing as it's more reliable
    router.push(`/protected/subjectTopics/${subjectSlug}`);
  };

  // --- Render Logic ---
  if (isLoading) return <div className="p-4 text-white">Loading subjects...</div>;
  if (error && error.status !== 401) return <div className="p-4 text-red-500">{error.message}</div>;
  if (!data || !data.subjects || data.subjects.length === 0) return <div className="p-4 text-white">No subjects found for your class.</div>;

  // ✅ Destructure the data object returned by SWR.
  const { subjects, progressData, grade, topicCounts } = data;

  return (
    <div className="p-4 w-full">
      <h1 className="text-xl font-bold mb-4 text-white">
        Subjects for {grade?.name ?? ""}
      </h1>
      <SubjectCards
        subjects={subjects} 
        handleSubjectClick={handleSubjectClick}
        progressData={progressData} 
        topicCounts={topicCounts} 
      />
    </div>
  );
}