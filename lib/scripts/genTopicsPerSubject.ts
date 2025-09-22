
import 'dotenv/config';
import { supabaseAdmin } from "@/lib/supabase/admin";
import { GoogleGenAI } from "@google/genai";



const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

async function generateTopicsOnce() {
  try {
    // 1. Fetch subject-grade links
    const { data: subjectGrades, error: sgError } = await supabaseAdmin
      .from('subject_grades')
      .select('subject_id, grade_id');
    if (sgError) throw sgError;
    console.log("Fetched subjects-grades:", subjectGrades);


    // 2. Fetch subjects
    const { data: subjects, error: subjError } = await supabaseAdmin
      .from('subjects')
      .select('*');
    if (subjError) throw subjError;

    console.log("Fetched subjects:", subjects);


    // 3. Fetch grades
    const { data: grades, error: gradeError } = await supabaseAdmin
      .from('grades')
      .select('*');
    if (gradeError) throw gradeError;
    console.log("Fetched grades:", grades);

    // 4. Fetch terms
    const { data: terms, error: termError } = await supabaseAdmin
      .from('terms')
      .select('*');
    if (termError) throw termError;

    console.log("Fetched terms:", terms);

    // 5. Lookup maps
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));
    const gradeMap = new Map(grades.map(g => [g.id, g.name]));

    // 6. Loop through subject-grade pairs
    for (const sg of subjectGrades) {
      const subjectName = subjectMap.get(sg.subject_id);
      const gradeName = gradeMap.get(sg.grade_id);

      if (!subjectName || !gradeName) {
        console.warn(`⚠ Missing subject or grade name for`, sg);
        continue;
      }

      for (const term of terms) {
        // 7. Prompt AI
        const prompt = `
        You are a curriculum expert in Nigerian education.
        
        Generate a list of weekly learning topics from the Nigerian school curriculum for:
        Subject: "${subjectName}"
        Grade: "${gradeName}"
        Term: "${term.name}"
        
        - There should be one topic per week (usually 12–14 weeks).
        - Return ONLY a valid JSON array of strings.
        - Do NOT include any explanation, numbering, or markdown formatting.
        - Do NOT wrap the JSON in a code block.
        Example output: ["Topic 1", "Topic 2", "Topic 3"]
        `;

        const aiResponse = await genAI.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });



        const text = aiResponse.text || "No content generated.";

        // remove extra texts markdowns etc to ensure clean json
        function cleanGeminiJSON(raw: string) {
          return raw
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        }

        const cleaned = cleanGeminiJSON(text);

        let topics: string[];
        try {
          topics = JSON.parse(cleaned);
        } catch {
          console.error(`❌ Failed to parse AI response for ${subjectName} - ${gradeName} (${term.name})`);
          continue;
        }

        // 8. Insert topics only if not already in DB
        for (const topic of topics) {
          const { data: existing, error: checkError } = await supabaseAdmin
            .from('topics')
            .select('id')
            .eq('subject_id', sg.subject_id)
            .eq('grade_id', sg.grade_id)
            .eq('term_id', term.id)
            .eq('title', topic)
            .maybeSingle(); // returns null if no match

          if (checkError) throw checkError;

          if (existing) {
            console.log(`⚠ Skipped duplicate: ${topic} (${subjectName} - ${gradeName} - ${term.name})`);
            continue;
          }

          await supabaseAdmin.from('topics').insert({
            subject_id: sg.subject_id,
            grade_id: sg.grade_id,
            term_id: term.id,
            title: topic,
          });

          console.log(`✅ Added topic: ${topic} (${subjectName} - ${gradeName} - ${term.name})`);
        }
      }
    }

    console.log('🎯 Topics generation completed without duplicates!');
  } catch (error) {
    console.error('❌ Error generating topics:', error);
  }
}


generateTopicsOnce();


