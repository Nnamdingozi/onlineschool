
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../supabaseTypes';
import { GoogleGenAI } from "@google/genai";

// type SubjectGrade = Database['public']['Tables']['subject_grades']['Row'];
// type Subject = Database['public']['Tables']['subjects']['Row'];
// type Grade = Database['public']['Tables']['grades']['Row'];
// type Term = Database['public']['Tables']['terms']['Row'];

console.log('SUPABASE_URL:', process.env.SUPABASE_URL)
console.log('SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)


const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
)



const genAI = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});

async function generateTopicsOnce() {
  try {
    // 1. Fetch subject-grade links
    const { data: subjectGrades, error: sgError } = await supabase
      .from('subject_grades')
      .select('subject_id, grade_id');
    if (sgError) throw sgError;
    console.log("Fetched subjects-grades:", subjectGrades);


    // 2. Fetch subjects
    const { data: subjects, error: subjError } = await supabase
      .from('subjects')
      .select('*');
    if (subjError) throw subjError;

    console.log("Fetched subjects:", subjects);


    // 3. Fetch grades
    const { data: grades, error: gradeError } = await supabase
      .from('grades')
      .select('*');
    if (gradeError) throw gradeError;
    console.log("Fetched grades:", grades);

    // 4. Fetch terms
    const { data: terms, error: termError } = await supabase
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
          const { data: existing, error: checkError } = await supabase
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

          await supabase.from('topics').insert({
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


