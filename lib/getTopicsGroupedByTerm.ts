// // import { createClient } from "@/lib/supabase/client";
// // import { Database } from "@/supabaseTypes";

// // type Topic = Database["public"]["Tables"]["topics"]["Row"];

// // export async function getTopicsCountBySubject(gradeId: number) {
// //   const supabase = createClient();

// //   const { data, error } = await supabase
// //     .from("topics")
// //     .select("subject_id, id")
// //     .eq("grade_id", gradeId);

// //   if (error) {
// //     console.error("Error fetching topics:", error);
// //     return [];
// //   }

// //   // group by subject_id
// //   const topicCountMap: Record<number, number> = {};
// //   data.forEach((row) => {
// //     topicCountMap[row.subject_id!] = (topicCountMap[row.subject_id!] || 0) + 1;
// //   });

// //   return topicCountMap; // { subjectId: count }
// // }


// // import { createClient } from "@/lib/supabase/client";
// // import { Database } from "@/supabaseTypes";

// // type Topic = Database["public"]["Tables"]["topics"]["Row"];

// // export async function getTopicsCountBySubject(gradeId: number) {
// //   const supabase = createClient();

// //   const { data, error } = await supabase
// //     .from("topics")
// //     .select("subject_id")
// //     .eq("grade_id", gradeId);

// //   if (error) {
// //     console.error("Error fetching topics:", error);
// //     return {};
// //   }

// //   return data?.reduce((acc, topic) => {
// //     const subjectId = topic.subject_id!;
// //     acc[subjectId] = (acc[subjectId] || 0) + 1;
// //     return acc;
// //   }, {} as Record<number, number>) || {};
// // }


// // import { createClient } from "@/lib/supabase/client";
// // import { Database } from "@/supabaseTypes";

// // type Topic = Database["public"]["Tables"]["topics"]["Row"];

// // export async function getTopicsGroupedByTerm(gradeId: number, subjectId: number) {
// //   const supabase = await createClient();

// //   const { data: topicsData, error } = await supabase
// //     .from("topics")
// //     .select("*")
// //     .eq("grade_id", gradeId)
// //     .eq("subject_id", subjectId)
// //     .order("id", { ascending: true });

// //   if (error || !topicsData) {
// //     console.error("Error fetching topics:", error);
// //     return { grouped: {}, total: 0 };
// //   }

// //   const grouped: Record<number, { topics: Topic[]; count: number }> = {};
// //   let overallTotal = 0;

// //   topicsData.forEach((topic) => {
// //     if (topic.term_id != null) {
// //       if (!grouped[topic.term_id]) {
// //         grouped[topic.term_id] = { topics: [], count: 0 };
// //       }
// //       grouped[topic.term_id].topics.push(topic);
// //       grouped[topic.term_id].count++;
// //       overallTotal++;
// //     }
// //   });

// //   return { grouped, total: overallTotal };
// // }


// // lib/getTopicsGroupedByTerm.ts

// import { createClient } from "@/lib/supabase/client";
// import { Database } from "@/supabaseTypes";

// type Topic = Database["public"]["Tables"]["topics"]["Row"];

// // This is the new, primary function for getting topics for the TermSelection page.
// export async function getTopicsAndCountsByTerm(gradeId: number, subjectId: number) {
//   const supabase = createClient();

//   // We need to fetch two things in parallel:
//   // 1. The actual topic details for display.
//   // 2. The accurate counts per term from our RPC.
//   const [topicsResult, termCountsResult] = await Promise.all([
//     supabase
//       .from("topics")
//       .select("*")
//       .eq("grade_id", gradeId)
//       .eq("subject_id", subjectId)
//       .order("id", { ascending: true }),
//     supabase.rpc('get_term_topic_counts_for_subject', {
//       p_grade_id: gradeId,
//       p_subject_id: subjectId
//     })
//   ]);

//   if (topicsResult.error) {
//     console.error("Error fetching topics:", topicsResult.error);
//     return { grouped: {} };
//   }
//   if (termCountsResult.error) {
//     console.error("Error fetching term counts:", termCountsResult.error);
//     return { grouped: {} };
//   }

//   const allTopics = topicsResult.data || [];
//   const termCounts = termCountsResult.data || [];

//   // Now, we assemble the final data structure our component needs.
//   const grouped: Record<number, { topics: Topic[]; count: number }> = {};
  
//   // Initialize the structure using the accurate counts from the database.
//   termCounts.forEach(term => {
//     grouped[term.term_id] = {
//       topics: [],
//       count: term.topic_count, // Use the accurate count from the database RPC
//     };
//   });

//   // Distribute the fetched topic details into the structure.
//   allTopics.forEach((topic) => {
//     if (topic.term_id != null && grouped[topic.term_id]) {
//       grouped[topic.term_id].topics.push(topic);
//     }
//   });

//   return { grouped };
// }