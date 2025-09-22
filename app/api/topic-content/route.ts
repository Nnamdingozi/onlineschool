
// app/api/topic-content/route.ts
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const contentRequestSchema = z.object({
  topicId: z.number(),
  termId: z.number(),
  gradeId: z.number(),
  subjectId: z.number(),
  termName: z.string(),
  subjectName: z.string(),
  topicTitle: z.string(),
});

type ContentRequestParams = z.infer<typeof contentRequestSchema>;

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// 🔹 Helper: fetch or generate note
async function getNote(supabase: any, params: ContentRequestParams) {
  const { data: existing } = await supabase
    .from("notes")
    .select("content")
    .eq("topic_id", params.topicId)
    .maybeSingle();

  if (existing?.content) return existing.content;

  const generationPayload = {
    grade: `Grade ${params.gradeId}`,
    term: params.termName,
    subject: params.subjectName,
    topic: params.topicTitle,
  };

  const res = await fetch(new URL("/api/generate-note", baseUrl).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(generationPayload),
  });

  if (!res.ok) throw new Error("Failed to generate note.");
  const { note } = await res.json();

  await supabase.from("notes").insert({
    content: note,
    topic_id: params.topicId,
    term_id: params.termId,
    grade_id: params.gradeId,
    subject_id: params.subjectId,
  });

  return note;
}

// 🔹 Helper: fetch or generate quiz
async function getQuiz(supabase: any, params: ContentRequestParams) {
  const { data: existing } = await supabase
    .from("quizzes")
    .select("content")
    .eq("topic_id", params.topicId)
    .maybeSingle();

 // ✅ HARDENING: Validate the cached data.
  // If `content` exists AND it is a valid array, return it.
  if (existing?.content && Array.isArray(existing.content)) {
    console.log(`[API] Quiz Cache HIT and is valid for topicId: ${params.topicId}`);
    return existing.content;
  }
  
  // If we reach here, it's a cache miss OR the cached data is invalid.
  // We will proceed to generate a new quiz.
  console.log(`[API] Quiz Cache MISS or invalid data for topicId: ${params.topicId}. Regenerating...`);


  if (existing?.content) return existing.content;

  const generationPayload = {
    grade: `Grade ${params.gradeId}`,
    term: params.termName,
    subject: params.subjectName,
    topic: params.topicTitle,
  };

  const res = await fetch(new URL("/api/generate-quizz", baseUrl).toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(generationPayload),
  });

  if (!res.ok) throw new Error("Failed to generate quiz.");
  const { quiz } = await res.json();

  await supabase.from("quizzes").insert({
    content: quiz,
    topic_id: params.topicId,
    term_id: params.termId,
    grade_id: params.gradeId,
    subject_id: params.subjectId,
  });

  return quiz;
}

// 🔹 Main POST handler
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = contentRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error },
        { status: 400 }
      );
    }

    const params = validation.data;

    const [noteResult, quizResult] = await Promise.allSettled([
      getNote(supabase, params),
      getQuiz(supabase, params),
    ]);

    const responseData = {
      note: noteResult.status === "fulfilled" ? noteResult.value : null,
      quiz: quizResult.status === "fulfilled" ? quizResult.value : null,
    };

    if (noteResult.status === "rejected")
      console.error("Note generation failed:", noteResult.reason);
    if (quizResult.status === "rejected")
      console.error("Quiz generation failed:", quizResult.reason);

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("[API /topic-content] Error:", error);
    return NextResponse.json(
      { error: error.message || "An internal server error occurred." },
      { status: 500 }
    );
  }
}
