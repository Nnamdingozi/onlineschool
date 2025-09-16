
"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { BookOpen, Play, Brain, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Database } from "@/supabaseTypes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const supabase = createClient();


type Subject = Database["public"]["Tables"]["subjects"]["Row"];
type Term = Database["public"]["Tables"]["terms"]["Row"];
type Topic = Database["public"]["Tables"]["topics"]["Row"];
type Note = Database["public"]["Tables"]["notes"]["Row"];
type Quiz = Database["public"]["Tables"]["quizzes"]["Row"]; // 👈 new type

interface TermSelectionProps {
  subject: Subject;
  terms: Term[];
  topicsByTerm: Record<number, { topics: Topic[]; count: number }>;
  gradeId: number;
  userId: string
}

type QuizItem = {
  question: string;
  options: string[];
  answer: string;
};



export default function TermSelection({
  subject,
  terms,
  topicsByTerm,
  gradeId,
  userId
}: TermSelectionProps) {
  const [expandedTermId, setExpandedTermId] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  // Notes states
  const [note, setNote] = useState<string | null>(null);
  const [noteLoading, setNoteLoading] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);

  // Quiz states

  // --- Refactored Quiz State ---
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // Persists until a new topic is selected or submitted
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [isQuizVisible, setIsQuizVisible] = useState(false);

  // Progress state
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);


  const router = useRouter()

  // reset quiz states
  const resetQuizState = useCallback(() => {
    setQuiz(null);
    setAnswers({});
    setSubmitted(false);
    setScore(null);
    setQuizError(null);
    setIsQuizVisible(false);
  }, []);


  // 🔹 Mark Topic as Completed
  const markTopicCompleted = async (topic: Topic) => {
    console.log('selectedTopic and userId in termselectorcomponent', selectedTopic, userId)
    if (!selectedTopic || !userId) return;

    setSavingProgress(true);
    try {
      // update student_topic_progress

      const { error } = await supabase.from("student_topic_progress").upsert(
        {
          student_id: userId,
          topic_id: topic.id,
          subject_id: subject.id,
          is_completed: true,
        },
        { onConflict: "student_id,topic_id" }
      );

      if (error) throw error;

      setCompleted(true);


    } catch (err) {
      console.error("Error saving progress:", err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Redirect user to subjects page
  const handleBackToSubject = () => {
    router.push('/protected/class')
  }


  // 🔹 Fetch Note Logic (unchanged)
  const fetchNote = async (topic: Topic) => {
    if (!selectedTerm) {
      setNoteError("Please select a term first.");
      return;
    }

    // const formattedTerm =
    //   selectedTerm.name?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    //   "Selected Term";

    setNoteLoading(true);
    setNoteError(null);
    try {
      const { data: existingNote } = await supabase
        .from("notes")
        .select("content")
        .eq("grade_id", gradeId)
        .eq("topic_id", topic.id)
        .eq("term_id", selectedTerm.id)
        .eq("subject_id", subject.id)
        .maybeSingle();

      if (existingNote?.content) {
        setNote(existingNote.content);
        setNoteLoading(false);
        return;
      }

      const res = await fetch("/api/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: gradeId,
          term: selectedTerm.name,
          subject: subject.name,
          topic: topic.title,
        }),
      });

      const data = await res.json();
      const generatedNote: string = data.note;

      setNote(generatedNote);

      await supabase.from("notes").insert({
        grade_id: gradeId,
        topic_id: topic.id,
        term_id: selectedTerm.id,
        subject_id: subject.id,
        content: generatedNote,
      } as Note);
    } catch (err) {
      console.error(err);
      setNoteError("Failed to fetch or generate note.");
    } finally {
      setNoteLoading(false);
    }
  };

  // fetchQuiz: loads existing quiz from DB or generates one, normalizes, saves and sets state

  const fetchQuizForTopic = useCallback(async () => {
    if (!selectedTopic || !selectedTerm) return;

    setQuizLoading(true);
    setQuizError(null);

    try {

      const { data: existingQuiz } = await supabase
        .from("quizzes")
        .select("content")
        .eq("grade_id", gradeId)
        .eq("topic_id", selectedTopic.id)
        .eq("term_id", selectedTerm.id)
        .eq("subject_id", subject.id)
        .maybeSingle();

      if (existingQuiz?.content) {
        const parsedContent = typeof existingQuiz.content === "string" ? JSON.parse(existingQuiz.content) : existingQuiz.content;
        if (Array.isArray(parsedContent) && parsedContent.length > 0) {
          setQuiz(parsedContent as QuizItem[]);
          return;
        }
      }

      const response = await fetch("/api/generate-quizz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: gradeId,
          term: selectedTerm.name,
          subject: subject.name,
          topic: selectedTopic.title,
        }),
      });
      if (!response.ok) throw new Error(`API failed with status: ${response.status}`);

      const data = await response.json();
      const newQuiz = data.quiz || [];
      if (newQuiz.length === 0) throw new Error("The generated quiz was empty.");

      const { error: insertError } = await supabase.from("quizzes").insert({
        grade_id: gradeId,
        topic_id: selectedTopic.id,
        term_id: selectedTerm.id,
        subject_id: subject.id,
        content: newQuiz,
      } as Quiz);
      if (insertError) throw insertError;

      setQuiz(newQuiz);
    } catch (err: unknown) {
      console.error("Error in fetchQuizForTopic:", err);

      if (err instanceof Error) {
        setQuizError(err.message);
      } else {
        setQuizError("An unexpected error occurred while fetching the quiz.");
      }
    } finally {
      setQuizLoading(false);
    }
  }, [selectedTopic, selectedTerm, gradeId, subject.id]);


  //  {Auto-fetch when the topic changes
  useEffect(() => {

    if (selectedTopic && selectedTerm) {
      fetchQuizForTopic();
    }
  }, [selectedTopic, selectedTerm, fetchQuizForTopic, subject.name]);


  // retry fetching quizz handler
  const handleRetryFetch = () => {
    fetchQuizForTopic();
  };


  // Term selection 
  const handleTermClick = (term: Term) => {
    const isExpanded = expandedTermId === term.id;
    setExpandedTermId(isExpanded ? null : term.id);
    setSelectedTerm(isExpanded ? null : term);

    if (selectedTopic) {
      setSelectedTopic(null);
      setNote(null);
      resetQuizState();
    }
  };

  // Topic selection
  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setNote(null);
    setNoteError(null);
    resetQuizState();
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
            <Card onClick={() => fetchNote(selectedTopic)} className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" /> Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {noteLoading && <p>Generating note...</p>}
                {noteError && <p className="text-red-500">{noteError}</p>}
                {!noteLoading && !note && <p>Click to generate lesson note.</p>}
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

                {/* retry if quizz is not generated */}
                {quizError && !quizLoading && (
                  <div className="text-center">
                    <p className="text-red-500 mb-4">
                      Error: {quizError}
                    </p>
                    <Button onClick={handleRetryFetch}>
                      Retry
                    </Button>
                  </div>
                )}

                {/* display quizz button */}
                {!quizLoading && !quizError && quiz && !isQuizVisible && (
                  <div className="text-center">
                    <p className="mb-4">A quiz is ready for this topic.</p>
                    <Button onClick={() => setIsQuizVisible(true)}>Start Quiz</Button>
                  </div>
                )}

                {/* quizz display */}
                {quiz && isQuizVisible && (
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
                )}
              </CardContent>
            </Card>


            {/* Completion Button */}
            <div className="flex justify-end">
              <Button
                onClick={() => markTopicCompleted(selectedTopic)}
                disabled={completed || savingProgress}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                {completed ? "Completed" : savingProgress ? "Saving..." : "Mark as Completed"}
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
    </div>
  );
}


