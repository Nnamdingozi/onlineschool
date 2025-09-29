
// app/api/note-video/route.ts

import { createClient } from "@/lib/supabase/server"; // Import the async factory
import { NextResponse } from "next/server";
import { generateVideoFromNote } from "@/lib/ai/videoAgentClip";
import { z } from 'zod';

export const runtime = 'nodejs';
export const maxDuration = 60;

const videoRequestSchema = z.object({
  noteId: z.number(),
  noteText: z.string(),
  subjectName: z.string(),
});

export async function POST(request: Request) {
  console.log("\n--- [API /note-video] INCOMING REQUEST ---");

  try {
    // ✅ THE DEFINITIVE FIX:
    // We are now correctly awaiting the async createClient function.
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("[API /note-video] Unauthorized: No user session found.");
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log(`[API /note-video] Authenticated user: ${user.id}`);

    const body = await request.json();
    const validation = videoRequestSchema.safeParse(body);
    if (!validation.success) {
      console.error("[API /note-video] Invalid request body:", validation.error.format());
      return NextResponse.json({ error: 'Invalid request body', details: validation.error.format() }, { status: 400 });
    }

    const { noteId, noteText, subjectName } = validation.data;
    const filePath = `note-videos/${noteId}.mp4`;
    console.log(`[API /note-video] Processing request for noteId: ${noteId}, subject: ${subjectName}`);

    // Hardened Cache Check
    const { data: fileList } = await supabase.storage.from('videos').list('note-videos', { search: `${noteId}.mp4`, limit: 1 });
    const existingFile = fileList?.[0];
    if (existingFile && existingFile.metadata.size > 1024) {
      console.log(`[API /note-video] Cache HIT for noteId: ${noteId}. Returning public URL.`);
      const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);
      return NextResponse.json({ status: 'complete', videoUrl: publicUrl });
    }

    console.log(`[API /note-video] Cache MISS for noteId: ${noteId}. Calling video agent...`);
    const videoBuffer = await generateVideoFromNote(noteText, subjectName);

    console.log(`[API /note-video] Video agent returned buffer of size: ${videoBuffer.length} bytes. Uploading to Supabase...`);
    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, videoBuffer, { contentType: 'video/mp4', upsert: true });

    if (uploadError) {
      console.error("[API /note-video] Supabase upload error:", uploadError);
      throw uploadError;
    }

    console.log(`[API /note-video] Upload successful. Getting public URL.`);
    const { data: { publicUrl } } = supabase.storage.from('videos').getPublicUrl(filePath);
    return NextResponse.json({ status: 'complete', videoUrl: publicUrl });

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