// // app/api/topic-progress/route.ts

// import { createClient } from "@/lib/supabase/server"; // Import the factory function
// import { NextRequest, NextResponse } from 'next/server';
// import { z } from 'zod';

// export const dynamic = 'force-dynamic';

// const postRequestSchema = z.object({
//   topicId: z.number(),
//   subjectId: z.number(),
// });

// export async function POST(request: NextRequest) {
//   // ✅ THE FIX: Create a fresh, request-specific client HERE.
//   const supabase = await createClient();

//   try {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) {
//       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     }

//     const body = await request.json();
//     const validation = postRequestSchema.safeParse(body);
//     if (!validation.success) {
//       return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
//     }
//     const { topicId, subjectId } = validation.data;

//     // Log everything before the database call
//     console.log(`[API POST] User: ${user.id}, Upserting topic: ${topicId}, subject: ${subjectId}`);

//     const { error } = await supabase.from('student_topic_progress').upsert(
//       {
//         student_id: user.id,
//         topic_id: topicId,
//         subject_id: subjectId,
//         is_completed: true,
//       },
//       { onConflict: 'student_id,topic_id' }
//     );

//     if (error) {
//       console.error("[API POST] Supabase returned a direct error:", error);
//       throw new Error(`Database upsert failed: ${error.message}`);
//     }

//     console.log(`[API POST] Upsert successful for topic ${topicId}`);
//     return NextResponse.json({ success: true, is_completed: true });

//   } catch (error) {

//     let errorMessage = "An unexpected error occurred.";
//      statusCode = 500;

//     // Check if it's an object with a 'message' property (like a standard Error)
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }

//     console.error("[API POST] Caught a fatal error:", errorMessage);

//     return NextResponse.json(
//       { error: "Failed to generate  topic progress", details: errorMessage },
//       { status: statusCode }
//     );
//   }
// }

// // Ensure the GET handler also follows this pattern
// export async function GET(request: NextRequest) {
//   // ✅ THE FIX: Create a fresh, request-specific client HERE.
//   const supabase = await createClient();
//   try {
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     // ... rest of GET handler
//   } catch (error) {
//     let errorMessage = "An unexpected error occurred.";
//     let statusCode = 500;

//     // Check if it's an object with a 'message' property (like a standard Error)
//     if (error instanceof Error) {
//       errorMessage = error.message;
//     }

//     console.error("[API POST] Caught a fatal error:", errorMessage);

//     return NextResponse.json(
//       { error: "Failed to verify user", details: errorMessage },
//       { status: statusCode }
//     );
//   }
// }



// app/api/topic-progress/route.ts

import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// --- GET Handler ---
export async function GET(request: NextRequest) { // ✅ FIX 1: Add the `request` parameter back.
  // ✅ FIX 2: Remove `await`. createClient is synchronous.
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Now we can use the `request` object to get the topicId.
    const topicId = request.nextUrl.searchParams.get('topicId');
    if (!topicId) {
      return NextResponse.json({ error: 'topicId is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('student_topic_progress')
      .select('is_completed')
      .eq('student_id', user.id)
      .eq('topic_id', Number(topicId))
      .maybeSingle();

    if (error) {
      console.error("[API GET] Database error:", error);
      throw error; // Let the catch block handle it
    }

    const response = NextResponse.json({ is_completed: data?.is_completed ?? false });
    response.headers.set('Cache-Control', 'no-store');
    return response;

  } catch (error) {
    // This is the catch block for the entire GET handler.
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("[API GET] Caught a fatal error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch topic progress", details: errorMessage },
      { status: 500 }
    );
  }
}

// --- POST Handler ---
const postRequestSchema = z.object({
  topicId: z.number(),
  subjectId: z.number(),
});

export async function POST(request: NextRequest) { // This handler already correctly had the `request` parameter
  // ✅ FIX 2: Remove `await`.
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = postRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.format() }, { status: 400 });
    }
    const { topicId, subjectId } = validation.data;

    const { error } = await supabase.from('student_topic_progress').upsert(
      {
        student_id: user.id,
        topic_id: topicId,
        subject_id: subjectId,
        is_completed: true,
      },
      { onConflict: 'student_id,topic_id' }
    );

    if (error) {
      console.error("[API POST] Supabase returned a direct error:", error);
      throw new Error(`Database upsert failed: ${error.message}`);
    }

    return NextResponse.json({ success: true, is_completed: true });

  } catch (error) {
    // Catch block for the POST handler
    let errorMessage = "An unexpected error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("[API POST] Caught a fatal error:", errorMessage);
    return NextResponse.json(
      { error: "Failed to save topic progress", details: errorMessage },
      { status: 500 }
    );
  }
}