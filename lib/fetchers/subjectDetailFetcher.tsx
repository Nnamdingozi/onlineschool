// lib/fetchers/subjectDetailPageFetcher.ts

import { createClient } from "@/lib/supabase/client";
import { getUserProfileClient } from "@/lib/getUserProfileClient";
import { Database } from '@/supabaseTypes';

type Topic = Database['public']['Tables']['topics']['Row'];

export const subjectDetailPageFetcher = async ([_key, subjectSlug]: [string, string]) => {
  const supabase = createClient();
  console.log(`[FETCHER] Received subjectSlug in subject detail page fetcter: "${subjectSlug}"`);
  const profileData = await getUserProfileClient();
  if (!profileData) {
    const error = new Error("User not authenticated");
    (error as any).status = 401;
    throw error
  }
  const { profile } = profileData;
  const gradeId = profile.grade_id;
  if (!gradeId) throw new Error("User grade not found.");

  const [subjectResult, termsResult] = await Promise.all([
    supabase.from('subjects').select('*, subject_grades!inner(grade_id)').eq('slug', subjectSlug).eq('subject_grades.grade_id', gradeId).single(),
    supabase.from('terms').select('*').order('term_order', { ascending: true })
  ]);

  if (subjectResult.error || !subjectResult.data) throw new Error("Subject not found for your class.");

  const subject = subjectResult.data;

  // Fetch topics and their counts per term in parallel
  const [topicsResult, termCountsResult] = await Promise.all([
    supabase.from("topics").select("*").eq("grade_id", gradeId).eq("subject_id", subject.id),
    supabase.rpc('get_term_topic_counts_for_subject', { p_grade_id: gradeId, p_subject_id: subject.id })
  ]);

  if (topicsResult.error) throw new Error("Failed to fetch topics.");
  if (termCountsResult.error) throw new Error("Failed to fetch term counts.");

  const allTopics = topicsResult.data || [];
  const termCounts = termCountsResult.data || [];

  const topicsByTerm: Record<number, { topics: Topic[]; count: number }> = {};
  termCounts.forEach(term => {
    topicsByTerm[term.term_id] = { topics: [], count: term.topic_count };
  });
  allTopics.forEach(topic => {
    if (topic.term_id && topicsByTerm[topic.term_id]) {
      topicsByTerm[topic.term_id].topics.push(topic);
    }
  });

  return {
    subject,
    terms: termsResult.data!,
    topicsByTerm,
    grade: { id: gradeId, name: profile.username || '' },
    userId: profile.id,
  };
};