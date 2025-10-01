
// app/api/video-eligibility/route.ts

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { z } from 'zod';


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Zod schema for validation
const eligibilityRequestSchema = z.object({
  noteText: z.string().min(50, { message: "Note text is too short to analyze." }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = eligibilityRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: "Invalid request", details: validation.error.format() }, { status: 400 });
    }
    const { noteText } = validation.data;

    // This prompt is the "brain" of our filter.
    // It asks the LLM to act as an expert and return a structured JSON response.
    const prompt = `
      You are an expert instructional designer. Your task is to determine if a lesson note would significantly benefit from being converted into an animated video with diagrams and illustrations.

      Analyze the following lesson note:
      ---
      ${noteText}
      ---

      Does this text describe concrete, visual concepts (like biological processes, geometric shapes, historical events, physical objects, or step-by-step diagrams) that would be enhanced by visual aids? Or is it primarily abstract, theoretical, or discussion-based?

      Respond with ONLY a valid JSON object in the following format:
      {
        "isEligible": boolean,
        "reason": "A brief explanation for your decision."
      }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "No content generated.";

    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResponse = JSON.parse(cleanedJson);

    // Return the structured response to the client
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error("Error generating note:", error);

    // ✅  Use a type guard to determine what the error is.
    let errorMessage = "An unexpected error occurred.";
    const statusCode = 500;

    // Check if it's an object with a 'message' property (like a standard Error)
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: "Failed to analyze note", details: errorMessage }, { status: statusCode });
  }
}

