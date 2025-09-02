
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  const { grade, term, subject, topic } = await req.json();

  const numQuestions = 10;
  const prompt = `
    You are an assistant that generates quizzes strictly based on the Nigerian school curriculum.
    Generate a ${numQuestions}-question multiple-choice quiz for:
    - Subject: ${subject}
    - Topic: ${topic}
    - Grade: ${grade}
    - Term: ${term}

    Rules:
    - Each question must include a number (e.g., "1. What is...").
    - Provide exactly 4 options: 1 correct and 3 plausible distractors.
    - Use clear, simple wording suitable for the grade.
    - Format output as valid JSON ONLY in this structure:

    {
      "quiz": [
        {
          "question": "1. Your question here",
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
    } catch (err) {
      console.error("Failed to parse AI response:", rawText);
      return NextResponse.json(
        { error: "Invalid JSON from AI", details: rawText },
        { status: 500 }
      );
    }

    return NextResponse.json({ quiz: quizData.quiz || [] });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}
