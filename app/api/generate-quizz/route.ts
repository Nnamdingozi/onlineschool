
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
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
  const { grade, term, subject, topic } = await req.json();

  // ✅ Translate grade into Nigerian school level
  const mappedGrade = gradeMapping[grade] || grade;

  const numQuestions = 10;
  const prompt = `
    You are an assistant that generates quizzes strictly based on the Nigerian school curriculum.
    Generate a ${numQuestions}-question multiple-choice quiz for:
    - Subject: ${subject}
    - Topic: ${topic}
    - Grade: ${mappedGrade}
    - Term: ${term}

    Rules:
    - Each question must include a number (e.g., "1. What is...").
    - Provide exactly 4 options: 1 correct and 3 plausible distractors.
    - Use clear, simple wording suitable for the grade.
    - Format output as valid JSON ONLY in this structure:
    - Do not add numbering to the questions

    {
      "quiz": [
        {
          "question": Your question here",
          "options": ["opt1", "opt2", "opt3", "opt4"],
          "answer": "the correct option here"
        }
      ]
    }
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const rawText = result.text || 'No Quizz generateed';
    console.log("Raw quiz response:", rawText);

    let quizData;
    try {
      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      quizData = JSON.parse(cleaned);
      console.log('cleaned quzz data', quizData)
    } catch (err) {
      console.error("Failed to parse AI response:", err);

      // ✅  Use a type guard to determine what the error is.
      let errorMessage = "An unexpected error occurred.";
      const statusCode = 500;

      // Check if it's an object with a 'message' property (like a standard Error)
      if (err instanceof Error) {
        errorMessage = err.message;
      }



      return NextResponse.json(
        { error: "Failed to generate note", details: errorMessage },
        { status: statusCode }
      );
    }


    return NextResponse.json(quizData || []);
  } catch (error) {
    console.error("Quiz generation error:", error);


    let errorMessage = "An unexpected error occurred.";
    const statusCode = 500;

    // Check if it's an object with a 'message' property (like a standard Error)
    if (error instanceof Error) {
      errorMessage = error.message;
    }



    return NextResponse.json(
      { error: "Failed to generate  quizz", details: errorMessage },
      { status: statusCode }
    );
  }
}
