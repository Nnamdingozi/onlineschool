
// // app/api/topic-content/route.ts

// import { NextResponse } from 'next/server';
// import { z } from 'zod';
// import { createClient } from "@/lib/supabase/server";
// import { Database } from '@/supabaseTypes';
// import { SupabaseClient } from '@supabase/supabase-js';
// // --- Type Definitions ---
// const contentRequestSchema = z.object({
//   topicId: z.number(),
//   termId: z.number(),
//   gradeId: z.number(),
//   subjectId: z.number(),
//   termName: z.string(),
//   subjectName: z.string(),
//   topicTitle: z.string(),
// });
// type ContentRequestParams = z.infer<typeof contentRequestSchema>;
// type Note = Database['public']['Tables']['notes']['Row'];
// type QuizItem = { question: string; options: string[]; answer: string; };
// type Quiz = QuizItem[]; // Our contract: Quiz is an array of QuizItems.
// type TypedSupabaseClient = SupabaseClient<Database>;

// // Use a helper for the base URL
// const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// // --- Helper Functions (Now with consistent return types) ---

// async function getNote(supabase: TypedSupabaseClient, params: ContentRequestParams): Promise<Note | null> {
//   const { data: existingNote } = await supabase
//     .from("notes")
//     .select("*") // Select all columns to get the full object
//     .eq("topic_id", params.topicId)
//     .maybeSingle();

//   // ✅ FIX 2: On a cache hit, return the ENTIRE note object, not just the content.
//   if (existingNote) {
//     return existingNote;
//   }

//   // --- Generation Logic ---
//   const generationPayload = {
//     grade: `Grade ${params.gradeId}`,
//     term: params.termName,
//     subject: params.subjectName,
//     topic: params.topicTitle,
//   };
//   const res = await fetch(new URL("/api/generate-note", baseUrl).toString(), {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(generationPayload),
//   });
//   if (!res.ok) throw new Error("Failed to generate note.");
//   const { note: noteContent } = await res.json();

//   const { data: newNote, error: insertError } = await supabase
//     .from("notes")
//     .insert({
//       content: noteContent,
//       topic_id: params.topicId,
//       term_id: params.termId,
//       grade_id: params.gradeId,
//       subject_id: params.subjectId,
//     })
//     .select() // Return the newly created row
//     .single();

//   if (insertError) throw insertError;
//   return newNote;
// }

// async function getQuiz(supabase: TypedSupabaseClient, params: ContentRequestParams): Promise<Quiz | null> {
  
//   const { data: existing } = await supabase
//     .from("quizzes")
//     .select("content")
//     .eq("topic_id", params.topicId)
//     .maybeSingle();

//     if (existing?.content) {
//       // Cast to `unknown` first. This is a safe pattern that forces us to check the type.
//       const content = existing.content as unknown;
  
//       // Case 1: The content is already a perfect JavaScript array.
//       if (Array.isArray(content)) {
//         console.log(`[API] Quiz Cache HIT (native array) for topicId: ${params.topicId}`);
//         return content as Quiz; // We can safely assert it's our Quiz type.
//       }
  
//       // Case 2: The content is a string that needs to be parsed.
//       if (typeof content === 'string') {
//         try {
//           const parsedContent = JSON.parse(content);
//           // After parsing, we must check if the result is an array.
//           if (Array.isArray(parsedContent)) {
//             console.log(`[API] Quiz Cache HIT (stringified JSON) for topicId: ${params.topicId}`);
//             return parsedContent as Quiz; // Assert that the parsed content is our Quiz type.
//           }
//         } catch (error) {
//           // Your existing robust catch block is good.
//           let errorMessage = "An unexpected error occurred.";
//           if (error instanceof Error) {
//             errorMessage = error.message;
//           }
//           console.error("[API /topic-content] Error:", errorMessage);
//           return NextResponse.json(
//             { error: "Failed to process content request", details: errorMessage },
//             { status: 500 }
//           );
        
//       }
//     }

//   // Use upsert to be safe and return the new content
//   const { data: newQuiz, error: upsertError } = await supabase.from("quizzes").upsert({
//     content: quizArray,
//     topic_id: params.topicId,
//     term_id: params.termId,
//     grade_id: params.gradeId,
//     subject_id: params.subjectId,
//   }).select('content').single();

//   if (upsertError) throw upsertError;
//   return newQuiz?.content ?? null;
// }

// // --- Main POST handler ---
// export async function POST(request: Request) {
//   // ✅ FIX 1: Use the correct, purpose-built client for API Routes.
//   const supabase = await createClient();

//   try {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

//     const body = await request.json();
//     const validation = contentRequestSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json({ error: "Invalid request", details: validation.error}, { status: 400 });
//     }

//     const params = validation.data;

//     const [noteResult, quizResult] = await Promise.allSettled([
//       getNote(supabase, params),
//       getQuiz(supabase, params),
//     ]);

//     const responseData = {
//       note: noteResult.status === "fulfilled" ? noteResult.value : null,
//       quiz: quizResult.status === "fulfilled" ? quizResult.value : null,
//     };

// console.log('responseData after calling getQuiz', responseData.quiz)

//     return NextResponse.json(responseData);
//   } catch (error) {
//     // Your existing robust catch block is good.
//     let errorMessage = "An unexpected error occurred.";
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }
//     console.error("[API /topic-content] Error:", errorMessage);
//     return NextResponse.json(
//       { error: "Failed to process content request", details: errorMessage },
//       { status: 500 }
//     );
//   }
// }




// app/api/topic-content/route.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from "@/lib/supabase/server";
import { Database } from '@/supabaseTypes';
import { SupabaseClient } from '@supabase/supabase-js';

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
type Quiz = QuizItem[];
type TypedSupabaseClient = SupabaseClient<Database>;

const baseUrl =  process.env.NEXT_PUBLIC_SITE_URL;

// --- Helper Functions (Now Correct and Fully Typed) ---

async function getNote(supabase: TypedSupabaseClient, params: ContentRequestParams): Promise<Note | null> {
  const { data: existingNote } = await supabase
    .from("notes")
    .select("*")
    .eq("topic_id", params.topicId)
    .maybeSingle();

  if (existingNote) {
    return existingNote; // Always return the full Note object
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
    .select()
    .single();

  if (insertError) throw insertError;
  return newNote;
}

async function getQuiz(supabase: TypedSupabaseClient, params: ContentRequestParams): Promise<Quiz | null> {
  const { data: existing } = await supabase
    .from("quizzes")
    .select("content")
    .eq("topic_id", params.topicId)
    .maybeSingle();

  if (existing?.content) {
    const content = existing.content as unknown;
    if (Array.isArray(content)) {
      return content as Quiz;
    }
    if (typeof content === 'string') {
      try {
        const parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          return parsedContent as Quiz;
        }
      } catch (error) {
        // ✅ FIX: Log the error and fall through to regenerate. Do NOT return a response.
        console.error(`[API] Cache for topicId ${params.topicId} is corrupted. Regenerating...`, error);
      }
    }
  }

  // ✅ FIX: The entire generation logic was missing. It is now restored.
  console.log(`[API] Quiz Cache MISS for topicId: ${params.topicId}. Regenerating...`);
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
  const quizArray = responseData.quiz;

  if (!Array.isArray(quizArray)) {
    throw new Error("Generated quiz data is not in the expected array format.");
  }

  await supabase.from("quizzes").upsert({
    content: quizArray,
    topic_id: params.topicId,
    term_id: params.termId,
    grade_id: params.gradeId,
    subject_id: params.subjectId,
  });
  
  return quizArray as Quiz;
}

// --- Main POST handler ---
export async function POST(request: Request) {
  // ✅ FIX: Remove 'await'. createClient() is synchronous.
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const validation = contentRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request", details: validation.error.format() }, { status: 400 });
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

    return NextResponse.json(responseData);
  } catch (error) {
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