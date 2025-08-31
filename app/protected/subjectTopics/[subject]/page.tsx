
'use client';

import { getUserProfileClient } from "@/lib/getUserProfileClient";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import TermSelection from "@/components/termTopicSelector";
import { Database } from "@/supabaseTypes";
import { useEffect, useState, useMemo } from "react";

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

  const router = useRouter();
  const params = useParams();
  const supabase = useMemo(() => createClient(), []);

  const subjectSlug = useMemo(() => {
    const raw = params.subject as string | undefined;
    return raw ? decodeURIComponent(raw) : '';
  }, [params.subject]);

  console.log('formatted subject slug', subjectSlug);

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
        console.log('grade id from topics page:', gradeId);

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

        // 3️⃣ Fetch subject
        const formattedName = subjectSlug.replace(/-/g, ' ');
        const { data: subjectGradesData, error: sgError } = await supabase
          .from('subject_grades')
          .select('subject_id')
          .eq('grade_id', gradeId);

        if (!subjectGradesData || sgError) {
          setError("Could not fetch subject associations.");
          return;
        }

        const subjectIds = subjectGradesData.map(sg => sg.subject_id);
        const { data: matchedSubject, error: subjectError } = await supabase
          .from('subjects')
          .select('*')
          .in('id', subjectIds)
          .ilike('name', `%${formattedName}%`)
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

        // 5️⃣ Fetch topics
        const { data: topicsData, error: topicError } = await supabase
          .from('topics')
          .select('*')
          .eq('subject_id', matchedSubject.id);

        if (topicError || !topicsData) {
          setError("Error loading topics.");
          return;
        }

        const grouped: Record<number, { topics: Topic[]; count: number }> = {};
        topicsData.forEach(topic => {
          if (topic.term_id != null) {
            if (!grouped[topic.term_id]) {
              grouped[topic.term_id] = { topics: [], count: 0 };
            }
            grouped[topic.term_id].topics.push(topic);
            grouped[topic.term_id].count++;
          }
        });

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
      />
    </div>
  );
}
