// // lib/getTopicCountsByTerm.ts

// import { createClient } from "@/lib/supabase/client"; 

// // This function efficiently gets topic counts grouped by term_id for a specific grade and subject.
// export async function getTopicCountsByTerm(gradeId: number, subjectId: number) {
//   const supabase = createClient();

//   const { data, error } = await supabase.rpc('get_topic_counts_for_subject', {
//     p_grade_id: gradeId,
//     p_subject_id: subjectId,
//   });

//   if (error) {
//     console.error("Error fetching topic counts:", error);
//     return {}; // Return an empty object on error
//   }

//   // The database will return an array like: [{ term_id: 1, topic_count: 12 }, { term_id: 2, topic_count: 14 }]
//   // We need to transform it into the shape our component expects: { 1: { count: 12 }, 2: { count: 14 } }
//   const countsByTerm: Record<number, { count: number }> = {};
//   data.forEach(row => {
//     countsByTerm[row.term_id] = { count: row.topic_count };
//   });

//   return countsByTerm;
// }