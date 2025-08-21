
// import { GoogleGenAI } from "@google/genai";

// // The client gets the API key from the environment variable `GEMINI_API_KEY`.
// const ai = new GoogleGenAI({});



// export async function generateNote({
//     grade,
//     term,
//     subject,
//     topic,
// }: {
//     subject: string;
//     topic: string;
//     grade: string;
//     term: string;
    
// }) {

//     const prompt = `Write a clear and concise lesson note on the topic "${topic}" for a student in ${grade} level, for  term ${term}. The subject is "${subject}". 
//   The content should align with the Nigerian school curriculum. Use bullet points and short paragraphs to improve readability. 
//   Include introduction, key definitions, relevant examples, and a short conclusion. Also mention any common misconceptions or real-life applications.`;

//     const response = await ai.models.generateContent({
//         model: "gemini-2.5-flash",
//         contents: prompt,
//     });
//     console.log(response.text);
//     return response.text
// }



// app/api/generate-note/route.ts

import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
    apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  });

export async function POST(req: Request) {
  const { grade, term, subject, topic } = await req.json();


  const prompt = `Write a clear and easy-to-understand lesson note on the topic "${topic}" for a student in ${grade} level, for term ${term}. The subject is "${subject}". 
  The content should follow the Nigerian school curriculum. 
  
  Do not use bullet points, LaTeX, or markdown formatting. Everything should be written in plain English.
  
  Start with a brief introduction, followed by simple definitions and explanations. Provide real-life examples or scenarios where the topic is used. For mathematics topics, include at least one fully worked-out example using clear and simple steps. 
  
  Also highlight common mistakes students make related to the topic, and end with a short summary to reinforce understanding.`;
  


  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const text = response.text || "No content generated.";
  return NextResponse.json({ note: text });
}



