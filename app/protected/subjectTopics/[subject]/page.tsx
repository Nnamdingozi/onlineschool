
'use client';

import { useRouter, useParams } from "next/navigation";
import TermSelection from "@/components/termTopicSelector";
import { useMemo } from "react";
import useSWR from 'swr';
import { subjectDetailPageFetcher } from '@/lib/fetchers/subjectDetailFetcher'; 
import { HttpError } from "@/lib/error";


export default function SubjectTopicsPage() {
  const router = useRouter();
  const params = useParams();

  const subjectSlug = useMemo(() => {
    const raw = params.subject as string | undefined;
    return raw ? decodeURIComponent(raw) : '';
  }, [params.subject]);

  // Use SWR with the detail page fetcher
  const swrKey = subjectSlug ? ['subject-detail-page', subjectSlug] : null;
  const { data, error, isLoading } = useSWR(swrKey, subjectDetailPageFetcher, {
    onError: (err) => {
      if (err instanceof HttpError && err.status === 401) {
        router.push('/auth/login');
      }
    }
  });

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error.message}</div>;
  if (!data) return <div className="p-4">No data available.</div>;

  const { subject, grade, terms, topicsByTerm, userId } = data;
  
  // Logic for pre-fetching the first topic's note/quiz can go here if desired
  const initialTerm = terms[0];
  const initialTopic = initialTerm ? topicsByTerm[initialTerm.id]?.topics[0] : null;

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
        initialSelectedTermId={initialTerm?.id}
        initialSelectedTopicId={initialTopic?.id}
      />
    </div>
  );
}