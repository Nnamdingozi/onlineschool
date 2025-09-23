
"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { BookOpen, Play, Brain, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Database } from "@/supabaseTypes";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useSWR from 'swr';
import { RotateCw } from "lucide-react";
import { Volume2, Square } from 'lucide-react'; 
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';



type Subject = Database["public"]["Tables"]["subjects"]["Row"];
type Term = Database["public"]["Tables"]["terms"]["Row"];
type Topic = Database["public"]["Tables"]["topics"]["Row"];
// type Note = Database["public"]["Tables"]["notes"]["Row"];
// type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];

type TopicContent = {
  note: string | null;
  quiz: QuizItem[] | null;
  error?: string | null;
}

interface TermSelectionProps {
  subject: Subject;
  terms: Term[];
  topicsByTerm: Record<number, { topics: Topic[]; count: number }>;
  gradeId: number;
  userId: string;
  initialSelectedTermId?: number;
  initialSelectedTopicId?: number;
}

type QuizItem = {
  question: string;
  options: string[];
  answer: string;
};

// 1. DEFINE THE MAIN FETCHER. It calls the api for note and quizz

const contentFetcher = async (key: { topic: Topic; term: Term; gradeId: number; subject: Subject }): Promise<TopicContent> => {
  const { topic, term, gradeId, subject } = key;
  const response = await fetch('/api/topic-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topicId: topic.id,
      termId: term.id,
      gradeId,
      subjectId: subject.id,
      topicTitle: topic.title,
      termName: term.name,
      subjectName: subject.name,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch content.');
  }
  return response.json();
};



// 2. CREATE A FETCHER FOR THE PROGRESS
const progressFetcher = async (key: [string, number]): Promise<{ is_completed: boolean }> => {
  const [url, topicId] = key;
  const fullUrl = `${url}?topicId=${topicId}`;

  const response = await fetch(fullUrl, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error('Failed to fetch progress.');
  }

  const data = await response.json();

  // ✅ TYPE GUARD: Ensure the return value matches the promised type.
  return { is_completed: data?.is_completed ?? false };
};


export default function TermSelection({
  subject,
  terms,
  topicsByTerm,
  gradeId,
  initialSelectedTermId,
  initialSelectedTopicId,

}: TermSelectionProps) {

  const [expandedTermId, setExpandedTermId] = useState<number | null>(initialSelectedTermId || null);

  // Find the full "Term" object based on the initial ID provided by the parent.
  const initialTerm = useMemo(() => {
    if (!initialSelectedTermId) return null;
    return terms.find(t => t.id === initialSelectedTermId) || null;
  }, [terms, initialSelectedTermId]);

  const [selectedTerm, setSelectedTerm] = useState<Term | null>(initialTerm);

  // Find the full "Topic" object based on the initial ID.
  const initialTopic = useMemo(() => {
    if (!initialTerm || !initialSelectedTopicId || !topicsByTerm[initialTerm.id]) {
      return null;
    }
    return topicsByTerm[initialTerm.id].topics.find(t => t.id === initialSelectedTopicId) || null;
  }, [initialTerm, initialSelectedTopicId, topicsByTerm]);

  // Set the initially selected topic.
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(initialTopic);

  // UI interaction state 
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isQuizVisible, setIsQuizVisible] = useState(false);

  // Progress state
  const [savingProgress, setSavingProgress] = useState(false);


  const router = useRouter()


  // 1. ADD SWR HOOK FOR MAIN
  const swrKey = selectedTopic && selectedTerm ? { topic: selectedTopic, term: selectedTerm, gradeId, subject } : null;
  const { data, error, isLoading, mutate } = useSWR<TopicContent>(swrKey, contentFetcher);

  // 2. ADD SWR HOOK FOR PROGRESS
  const progressSWRKey = selectedTopic ? ['/api/topic-progress', selectedTopic.id] : null;
  const { data: progressData, error: progressError, mutate: mutateProgress } = useSWR(progressSWRKey, progressFetcher);

  if (progressError){
    console.log('error saving progress', progressError)
  }
  
  
  // Derive the completion state from SWR data
  const isCompleted = progressData?.is_completed ?? false;



  // Derive note and quiz from the single data object
  const note = data?.note;
  const quiz = data?.quiz || [];


  const { isSpeaking, speak, cancel, supported} = useSpeechSynthesis();

  const handleSpeak = () => {
    if (isSpeaking) {
      cancel();
    } else if (note) {
      speak(note);
    }
  };


  // 🔹 Mark Topic as Completed

  const markTopicCompleted = async () => {
    // if (!selectedTopic || !subject) return;

    const finalData = { is_completed: true };

    const mutateOptions = {
      optimisticData: finalData,
      rollbackOnError: true,
      populateCache: true,
      revalidate: false,
    };

    setSavingProgress(true);
    try {
      await mutateProgress(async () => {

        const response = await fetch('/api/topic-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topicId: selectedTopic?.id,
            subjectId: subject.id,
          }),
        });

        if (!response.ok) {
          throw new Error('API request failed'); // Triggers rollback
        }

        return finalData;

      }, mutateOptions);

    } catch (err) {

      console.error("Error saving progress:", err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleBackToSubject = () => {
    router.push('/protected/class');
  };


  // Term selection 
  const resetInteractionState = useCallback(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setIsQuizVisible(false);
  }, []);

  const handleTermClick = (term: Term) => {

    const isExpanded = expandedTermId === term.id;
    setExpandedTermId(isExpanded ? null : term.id);
    setSelectedTerm(isExpanded ? null : term);

    if (selectedTopic) {
      setSelectedTopic(null);
      resetInteractionState();
    }
  };


  // Topic selection
  const handleTopicClick = (topic: Topic) => {
    if (selectedTopic?.id === topic.id) return;
    setSelectedTopic(topic);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setIsQuizVisible(false);
  };

  //  Option selection for quizz
  const handleOptionChange = (questionIndex: number, option: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: option }));
  };


  // Submit quizz
  const handleSubmitQuiz = () => {
    if (!quiz) return;
    let correctCount = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  return (
    <div className="flex h-full flex-col md:flex-row bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 dark:from-[#1f1c2c] dark:via-[#928dab] dark:to-[#1f1c2c] rounded-sm">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 border-b md:border-r md:border-b-0 overflow-y-auto p-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black dark:text-white">
          {subject.name}    <Button onClick={handleBackToSubject} className="ml-5">Back To Subjects</Button>

        </h2>

        {terms.map((term) => {
          const { topics = [], count = 0 } = topicsByTerm[term.id] || { topics: [], count: 0 };
          const isExpanded = expandedTermId === term.id;



          return (
            <div key={term.id} className="mb-4">
              <button
                className="flex items-center justify-between w-full px-2 py-1 font-medium text-left bg-muted rounded hover:bg-muted/70"
                onClick={() => handleTermClick(term)}
              >
                <span>
                  {term.name} — {count} topics
                </span>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {isExpanded && (
                <div className="ml-2 mt-2 space-y-1 max-h-64 overflow-y-auto">
                  {topics.map((topic) => (
                    <button
                      key={topic.id}
                      className={`block w-full text-left px-2 py-1 rounded hover:bg-accent ${selectedTopic?.id === topic.id ? "bg-accent" : ""
                        }`}
                      onClick={() => handleTopicClick(topic)}
                    >
                      {topic.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4 p-4 sm:p-6 overflow-y-auto">
        {selectedTopic ? (
          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold mb-4">{selectedTopic.title}</h1>


            {/* Note Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <div className="flex items-center gap-2"><BookOpen /> Notes</div>
            
            {/* Play/Stop Button - only render if supported */}
            {supported && note && !isLoading && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSpeak}
                aria-label={isSpeaking ? "Stop reading" : "Read note aloud"}
              >
                {isSpeaking ? <Square /> : <Volume2 />}
              </Button>
            )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading && <p>Loading content...</p>}
                {error && <p className="text-red-500">Error: {error.message}</p>}
                {data && !note && <p>Note could not be loaded for this topic Refresh page.</p>}
                {note && <div className="whitespace-pre-wrap">{note}</div>}
              </CardContent>
            </Card>

            {/* Video Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" /> Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Preview or link to video content for this topic.</p>
              </CardContent>
            </Card>

            {/* Quizz card */}
            <Card className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" /> Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>

                {isLoading && <p>Loading content...</p>}
                {error && (
                  <div className="text-center">
                    <p className="text-red-500 mb-4">{error.message}</p>
                    <Button onClick={() => mutate()}>
                      <RotateCw className="mr-2 h-4 w-4" /> Retry
                    </Button>
                  </div>
                )}
                {data && !quiz && <p>A quiz could not be loaded for this topic.</p>}

                {quiz && !isQuizVisible && (
                  <Button onClick={() => setIsQuizVisible(true)}>Start Quiz</Button>
                )}

                {/* quizz display */}
                {quiz && isQuizVisible && (
                  Array.isArray(quiz) ? (
                    <div className="space-y-6">
                      {quiz.map((q, i) => (
                        <div key={i} className="border p-3 rounded">
                          <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
                          <div className="space-y-1">
                            {q.options.map((opt, j) => (
                              <label key={j} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`question-${i}`}
                                  value={opt}
                                  disabled={submitted}
                                  checked={answers[i] === opt}
                                  onChange={() => handleOptionChange(i, opt)}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>

                          {/* After submit → show feedback */}
                          {submitted && (
                            <div className="mt-2">
                              {answers[i] === q.answer ? (
                                <p className="text-green-600">✅ Correct!</p>
                              ) : (
                                <div>
                                  <p className="text-red-600">❌ Incorrect.</p>
                                  <p className="text-green-700">✔ Correct Answer: {q.answer}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Submit button */}
                      {!submitted && (
                        <Button
                          onClick={handleSubmitQuiz}
                          disabled={Object.keys(answers).length !== quiz.length}
                        >
                          Submit Quiz
                        </Button>
                      )}

                      {/* Score summary */}
                      {submitted && score !== null && (
                        <p className="font-bold mt-4">
                          Your Score: {score}/{quiz.length}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-red-500">
                      Quiz data is available but in an incorrect format. Please try again or contact support.
                    </p>
                  )
                )}

              </CardContent>
            </Card>


            {/* Completion Button */}
            <div className="flex justify-end">
              <Button
                onClick={markTopicCompleted}
                // The button is disabled if it's already completed or in the process of saving.
                disabled={isCompleted || savingProgress}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                {isCompleted ? "Completed" : savingProgress ? "Saving..." : "Mark as Completed"}
              </Button>
              <Button onClick={handleBackToSubject} className="ml-9">Back To Subjects</Button>
           
              
            </div>

          </div>
        ) : (
          <div className="text-muted-foreground text-center">
            <p>Select a topic to view its content.</p>
          </div>
        )}
      </div>
    </div >
  );
}


