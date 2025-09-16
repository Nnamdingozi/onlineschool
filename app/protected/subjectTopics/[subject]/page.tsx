
'use client';

import { getUserProfileClient } from "@/lib/getUserProfileClient";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import TermSelection from "@/components/termTopicSelector";
import { Database } from "@/supabaseTypes";
import { useEffect, useState, useMemo } from "react";
import { getTopicsGroupedByTerm } from "@/lib/getTopicsGroupedByTerm";


type Subject = Database['public']['Tables']['subjects']['Row'];
type Term = Database['public']['Tables']['terms']['Row'];
type Topic = Database['public']['Tables']['topics']['Row'];
type Grade = Database['public']['Tables']['grades']['Row'];

export default function SubjectTopicsPage() {
  const [subject, setSubject] = useState<Subject | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);
  const [topicsByTerm, setTopicsByTerm] = useState<Record<number, { topics: Topic[]; count: number }>>({});
  const [grade, setGrade] = useState<Grade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');


  const router = useRouter();
  const params = useParams();
  
  const supabase = useMemo(() => createClient(), []);

  const subjectSlug = useMemo(() => {
    const raw = params.subject as string | undefined;
    return raw ? decodeURIComponent(raw) : '';
  }, [params.subject]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1️⃣ Get user profile + grade id
        const profileData = await getUserProfileClient();
        if (!profileData) {
          router.push('/auth/login');
          return;
        }

        const { profile } = profileData;
        const gradeId = profile.grade_id;
        const userId = profile.id

        if (userId) {
          setUserId(userId)

          console.log('userId in termselectorpage:', userId)
        }


        if (!gradeId) {
          setError("User grade not found.");
          return;
        }

        // 2️⃣ Fetch grade
        const { data: gradeData, error: gradeError } = await supabase
          .from('grades')
          .select('*')
          .eq('id', gradeId)
          .maybeSingle();

        if (gradeError || !gradeData) {
          setError("Error fetching class name.");
          return;
        }
        setGrade(gradeData);

        // 3️⃣ Fetch subject by slug + grade association
        const { data: matchedSubject, error: subjectError } = await supabase
          .from('subjects')
          .select('*, subject_grades!inner(grade_id)')
          .eq('slug', subjectSlug)
          .eq('subject_grades.grade_id', gradeId)
          .maybeSingle();

        if (!matchedSubject || subjectError) {
          setError("Subject not found for your class.");
          return;
        }
        setSubject(matchedSubject);

        // 4️⃣ Fetch terms
        const { data: termsData, error: termsError } = await supabase
          .from('terms')
          .select('*')
          .order('term_order', { ascending: true });

        if (termsError || !termsData || termsData.length === 0) {
          setError("Error loading terms.");
          return;
        }
        setTerms(termsData);

      
        const { grouped } = await getTopicsGroupedByTerm(gradeId, matchedSubject.id);

        setTopicsByTerm(grouped);

      } catch (err) {
        console.error(err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    if (subjectSlug) {
      fetchData();
    }
  }, [subjectSlug, supabase, router]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!subject || !grade || terms.length === 0) {
    return <div className="p-4 text-red-500">Required data is missing.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-white text-center text-5xl mb-5">
        Welcome to {grade.name}
      </h1>
      <TermSelection
        subject={subject}
        terms={terms}
        topicsByTerm={topicsByTerm}
        gradeId={grade.id}
        userId={userId}
      />
    </div>
  );
}
