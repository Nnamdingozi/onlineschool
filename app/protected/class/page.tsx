


'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { createClient } from "@/lib/supabase/client";
import { getUserProfileClient } from "@/lib/getUserProfileClient";
import SubjectCards from "@/components/subjectCard";
import { Database } from '@/supabaseTypes';

type Subject = Database['public']['Tables']['subjects']['Row'];
type SubjectGradeJoin = {
  grade_id: number;
  subject_id: number;
  subjects: Subject;
};

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchSubjects = async () => {
      const profileData = await getUserProfileClient();

      if (!profileData) {
        router.push('/auth/login');
        return;
      }

      const { profile } = profileData;
      const gradeId = profile.grade_id;

      if (!gradeId) {
        setError("Grade not found for this user.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subject_grades')
        .select('subjects(*), grade_id, subject_id')
        .eq('grade_id', gradeId);

      if (error || !data) {
        setError("Failed to fetch subjects.");
        setLoading(false);
        return;
      }

      const subjectGrades = data as SubjectGradeJoin[];
      const subjectsList = subjectGrades.map(row => row.subjects);
      setSubjects(subjectsList);
      setLoading(false);
    };

    fetchSubjects();
  }, [router, supabase]);


  const handleSubjectClick = (subjectName: string) => {
    
    const formattedSubject = subjectName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/protected/subjectTopics/${formattedSubject}`);
  };



  if (loading) return <div className="p-4">Loading subjects...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-4 w-full">
      <h1 className="text-xl font-bold mb-4">Subjects for Your Class</h1>
      {subjects && <SubjectCards subjects={subjects} handleSubjectClick={handleSubjectClick} />}
    </div>
  );
}
