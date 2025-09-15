import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getStudentSubjectProgress(studentId: string) {
  const { data, error } = await supabase
    .from("student_subject_progress")
    .select("student_id, subject_id, total_topics, completed_topics, progress_percentage")
    .eq("student_id", studentId);

  if (error) {
    console.error("Error fetching progress:", error.message);
    return [];
  }

  return data || [];
}
