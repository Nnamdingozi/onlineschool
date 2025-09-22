
'use client';

import { Database } from '@/supabaseTypes';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { BookOpen, Clock, Users } from 'lucide-react';
import { getSubjectColor } from '@/lib/subjectColourSelector';


type Subject = Database['public']['Tables']['subjects']['Row'];
type ProgressData = Database['public']['Tables']['student_subject_progress']['Row'];

interface SubjectCardsProps {
  subjects: Subject[];
  handleSubjectClick: (subjectName: string) => void;
  progressData: ProgressData[]; 
  topicCounts: Record<number, number>;
}



export default function SubjectCards({ subjects, handleSubjectClick, progressData, topicCounts }: SubjectCardsProps) {
  console.log("[COMPONENT] Received topicCounts prop:", topicCounts);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
      {subjects.map(subject => {
        const subjectProgress = progressData?.find(p => p.subject_id === subject.id);
        const progress = subjectProgress?.progress_percentage ?? 0;
        const completedTopics = subjectProgress?.completed_topics ?? 0;
        const totalTopics = topicCounts[subject.id] ?? 0;

        const color = getSubjectColor(subject.name ?? 'unknown');

        return (
          <Card
            key={subject.id}
            className="w-full max-w-[700px] mx-auto group hover:shadow-hover transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                <p className="text-sm text-muted-foreground"> Total Topics: {totalTopics}</p>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-lg font-semibold text-primary">
                  <span> {progress} </span> %
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {subject.name}
              </h3>
              {/* <p className="text-muted-foreground mb-4 line-clamp-2">
                {description}
              </p> */}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                    {completedTopics}/{totalTopics} topics
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>3 terms</span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-2 mb-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <Button
                onClick={() => {
                  if (subject.slug) {
                    handleSubjectClick(subject.slug);
                  }
                }}
                className="w-full"
                variant="default"
              >
                Continue Learning
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
