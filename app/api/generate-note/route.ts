
// app/api/generate-note/route.ts

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// ✅ Mapping of Grades → Nigerian School Levels
const gradeMapping: Record<string, string> = {
  "Grade 1": "JSS 1",
  "Grade 2": "JSS 2",
  "Grade 3": "JSS 3",
  "Grade 4": "SS 1",
  "Grade 5": "SS 2",
  "Grade 6": "SS 3",
};

export async function POST(req: Request) {
  try {
    const { grade, term, subject, topic } = await req.json();

    // ✅ Translate grade into Nigerian school level
    const mappedGrade = gradeMapping[grade] || grade;

    const prompt = `
      Write a clear and easy-to-understand lesson note on the topic "${topic}" 
      for a student in ${mappedGrade} level, for term ${term}. 
      The subject is "${subject}". 
      The content should follow the Nigerian school curriculum. 
      
      Do not use bullet points, LaTeX, or markdown formatting. 
      Everything should be written in plain English.
      
      Start with a brief introduction, followed by simple definitions and explanations. 
      Provide real-life examples or scenarios where the topic is used. 
      
      For mathematics topics, include at least one fully worked-out example using clear and simple steps. 
      
      Highlight common mistakes students make related to the topic, 
      and end with a short summary to reinforce understanding.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "No content generated.";
    return NextResponse.json({ note: text });
  } catch (error) {
    console.error("Error generating note:", error);

    // ✅  Use a type guard to determine what the error is.
    let errorMessage = "An unexpected error occurred.";
    const statusCode = 500;

    // Check if it's an object with a 'message' property (like a standard Error)
    if (error instanceof Error) {
      errorMessage = error.message;
    }


    return NextResponse.json(
      { error: "Failed to generate note", details: errorMessage },
      { status: statusCode }
    );
  }
}
