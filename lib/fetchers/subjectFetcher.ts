

// lib/fetchers/subjectsPageFetcher.ts

import { createClient } from "@/lib/supabase/client";
import { getUserProfileClient } from "@/lib/getUserProfileClient";
import { Database } from '@/supabaseTypes';
import { HttpError } from "../error";

// Type definitions for clarity
type Subject = Database['public']['Tables']['subjects']['Row'];
// type Grade = Database['public']['Tables']['grades']['Row'];
// type ProgressData = Database['public']['Tables']['student_subject_progress']['Row'];
type TopicCount = { subject_id: number; total_topics: number; };

// This is the SWR fetcher for the MAIN subjects list page.
export const subjectsPageFetcher = async () => {
  const supabase = createClient();

  // 1. Get user profile and gradeId
  const profileData = await getUserProfileClient();
  if (!profileData) {
    throw new HttpError("User not authenticated", 401);
  }
  const { profile } = profileData;
  const gradeId = profile.grade_id;
  const userId = profile.id;
  if (!gradeId) throw new Error("User grade not found.");

  // 2. Fetch all necessary data in parallel for performance
  const [subjectGradeResult, progressResult, gradeResult, topicCountsResult] = await Promise.all([
    supabase.from('subject_grades').select('subjects(*)').eq('grade_id', gradeId),
    supabase.from('student_subject_progress').select('*').eq('student_id', userId),
    supabase.from('grades').select('*').eq('id', gradeId).single(),
    supabase.rpc('get_subject_topic_counts_for_grade', { p_grade_id: gradeId })
  ]);

  // 3. Robust error handling
  if (subjectGradeResult.error) throw new Error(`Failed to fetch subjects: ${subjectGradeResult.error.message}`);
  if (progressResult.error) throw new Error(`Failed to fetch progress: ${progressResult.error.message}`);
  if (gradeResult.error) throw new Error(`Failed to fetch grade: ${gradeResult.error.message}`);
  if (topicCountsResult.error) throw new Error(`Failed to fetch topic counts: ${topicCountsResult.error.message}`);
  if (!subjectGradeResult.data || !gradeResult.data) throw new Error("Core subject or grade data is missing.");

  // 4. Process and package the data into a clean object
  const subjects = subjectGradeResult.data.map(sg => sg.subjects).filter(Boolean) as Subject[];
  
  const topicCountsMap: Record<number, number> = {};
  if (topicCountsResult.data) {
    (topicCountsResult.data as TopicCount[]).forEach(row => {
      topicCountsMap[row.subject_id] = row.total_topics;
    });
  }
  console.log("[FETCHER] Final Topic Counts Map:", topicCountsMap);
  return {
    subjects, 
    progressData: progressResult.data ?? [],
    grade: gradeResult.data,
    topicCounts: topicCountsMap,
  };
};