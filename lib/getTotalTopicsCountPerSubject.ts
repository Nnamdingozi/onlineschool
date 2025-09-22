// // For example, in lib/getTotalTopicCount.ts
// // This should be at the top of your 'SubjectsPage.tsx' file or imported

// import { createClient } from "@/lib/supabase/client";
// import { getUserProfileClient } from "@/lib/getUserProfileClient";
// import { Database } from '@/supabaseTypes';

// // Type definitions for clarity
// type Subject = Database['public']['Tables']['subjects']['Row'];
// type Grade = Database['public']['Tables']['grades']['Row'];
// type ProgressData = Database['public']['Tables']['student_subject_progress']['Row'];

// // This is the SWR fetcher. Its key will be a simple string like 'subjects-page-data'.
// const subjectsPageFetcher = async () => {
//   const supabase = createClient();

//   // 1. Get the user profile first, as everything depends on it.
//   const profileData = await getUserProfileClient();
//   if (!profileData) {
//     const error = new Error("User not authenticated");
//     (error as any).status = 401; // Special status for SWR to handle redirection
//     throw error;
//   }
//   const { profile } = profileData;
//   const gradeId = profile.grade_id;
//   const userId = profile.id;
//   if (!gradeId) throw new Error("User grade not found.");

//   // 2. Fetch subjects, progress, grade, and topic counts ALL IN PARALLEL.
//   const [subjectGradeResult, progressResult, gradeResult, topicCountsResult] = await Promise.all([
//     // Fetches all subjects associated with the user's grade
//     supabase.from('subject_grades').select('subjects(*)').eq('grade_id', gradeId),
//     // Fetches all progress records for the user
//     supabase.from('student_subject_progress').select('*').eq('student_id', userId),
//     // Fetches the user's grade details
//     supabase.from('grades').select('*').eq('id', gradeId).single(),
//     // Calls our new, efficient database function to get all topic counts at once
//     supabase.rpc('get_all_subject_topic_counts', { p_grade_id: gradeId })
//   ]);

//   // 3. Error handling
//   if (subjectGradeResult.error) throw new Error("Failed to fetch subjects.");
//   if (progressResult.error) throw new Error("Failed to fetch progress data.");
//   if (gradeResult.error) throw new Error("Failed to fetch grade details.");
//   if (topicCountsResult.error) throw new Error("Failed to fetch topic counts.");

//   // 4. Process and package the data into a clean object
//   const subjects = subjectGradeResult.data.map(sg => sg.subjects).filter(Boolean) as Subject[];
  
//   // Transform the topic counts array into an easy-to-use map: { subjectId: count }
//   const topicCountsMap: Record<number, number> = {};
//   topicCountsResult.data?.forEach(row => {
//     topicCountsMap[row.subject_id] = row.total_topics;
//   });

//   return {
//     subjects,
//     progressData: progressResult.data ?? [],
//     grade: gradeResult.data,
//     topicCounts: topicCountsMap,
//   };
// };