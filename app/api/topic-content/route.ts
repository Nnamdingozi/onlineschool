
// app/api/topic-content/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from "@/lib/supabase/server";
import { Database } from '@/supabaseTypes';

// --- Type Definitions ---
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
type Note = Database['public']['Tables']['notes']['Row'];
type QuizItem = { question: string; options: string[]; answer: string; };
type Quiz = QuizItem[]; // Our contract: Quiz is an array of QuizItems.

// Use a helper for the base URL
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// --- Helper Functions (Now with consistent return types) ---

async function getNote(supabase: any, params: ContentRequestParams): Promise<Note | null> {
  const { data: existingNote } = await supabase
    .from("notes")
    .select("*") // Select all columns to get the full object
    .eq("topic_id", params.topicId)
    .maybeSingle();

  // ✅ FIX 2: On a cache hit, return the ENTIRE note object, not just the content.
  if (existingNote) {
    return existingNote;
  }

  // --- Generation Logic ---
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
  const { note: noteContent } = await res.json();

  const { data: newNote, error: insertError } = await supabase
    .from("notes")
    .insert({
      content: noteContent,
      topic_id: params.topicId,
      term_id: params.termId,
      grade_id: params.gradeId,
      subject_id: params.subjectId,
    })
    .select() // Return the newly created row
    .single();

  if (insertError) throw insertError;
  return newNote;
}

async function getQuiz(supabase: any, params: ContentRequestParams): Promise<Quiz | null> {
  const { data: existing } = await supabase
    .from("quizzes")
    .select("content")
    .eq("topic_id", params.topicId)
    .maybeSingle();

  if (existing?.content) {
    console.log('existing content from DB:', existing.content )
    return existing.content;
  }
  
  // --- Generation Logic ---
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
  const responseData = await res.json();
console.log('responseData after fetch in topic-contet', responseData)
  const quizArray = responseData.quiz;
console.log('quiz array extracted from responseData', quizArray)
  if (!Array.isArray(quizArray)) {
    console.error("Data received from generate-quizz API is not in the expected format:", responseData);
    throw new Error("Generated quiz data is malformed.");
  }

  // Use upsert to be safe and return the new content
  const { data: newQuiz, error: upsertError } = await supabase.from("quizzes").upsert({
    content: quizArray,
    topic_id: params.topicId,
    term_id: params.termId,
    grade_id: params.gradeId,
    subject_id: params.subjectId,
  }).select('content').single();

  if (upsertError) throw upsertError;
  return newQuiz?.content ?? null;
}

// --- Main POST handler ---
export async function POST(request: Request) {
  // ✅ FIX 1: Use the correct, purpose-built client for API Routes.
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = contentRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request", details: validation.error}, { status: 400 });
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

console.log('responseData after calling getQuiz', responseData.quiz)

    return NextResponse.json(responseData);
  } catch (error) {
    // Your existing robust catch block is good.
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("[API /topic-content] Error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to process content request", details: errorMessage },
      { status: 500 }
    );
  }
}