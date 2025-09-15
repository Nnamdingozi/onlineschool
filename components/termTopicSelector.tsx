
// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { BookOpen, Play, Brain, ChevronDown, ChevronUp } from "lucide-react";
// import { Database } from "@/supabaseTypes";
// import { createClient } from "@/lib/supabase/client";

// type Subject = Database["public"]["Tables"]["subjects"]["Row"];
// type Term = Database["public"]["Tables"]["terms"]["Row"];
// type Topic = Database["public"]["Tables"]["topics"]["Row"];a
// type Note = Database["public"]["Tables"]["notes"]["Row"];
// type Quiz = Database["public"]["Tables"]["quizzes"]["Row"]; // 👈 new type

// interface TermSelectionProps {
//   subject: Subject;
//   terms: Term[];
//   topicsByTerm: Record<number, { topics: Topic[]; count: number }>;
//   gradeId: number;
// }

// type QuizItem = {
//   question: string;
//   options: string[];
//   answer: string;
// };



// export default function TermSelection({
//   subject,
//   terms,
//   topicsByTerm,
//   gradeId,
// }: TermSelectionProps) {
//   const [expandedTermId, setExpandedTermId] = useState<number | null>(null);
//   const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
//   const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
//  // Notes states
// const [note, setNote] = useState<string | null>(null);
// const [noteLoading, setNoteLoading] = useState(false);
// const [noteError, setNoteError] = useState<string | null>(null);

// // Quiz states
// const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
// const [quizLoading, setQuizLoading] = useState(false);
// const [quizError, setQuizError] = useState<string | null>(null);
//   const supabase = createClient();

//   // 🔹 Fetch Note Logic (unchanged)
//   const fetchNote = async (topic: Topic) => {
//     if (!selectedTerm) {
//       setNoteError("Please select a term first.");
//       return;
//     }

//     // const formattedTerm =
//     //   selectedTerm.name?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
//     //   "Selected Term";

//     setNoteLoading(true);
//     setNoteError(null);
//     try {
//       const { data: existingNote } = await supabase
//         .from("notes")
//         .select("content")
//         .eq("grade_id", gradeId)
//         .eq("topic_id", topic.id)
//         .eq("term_id", selectedTerm.id)
//         .eq("subject_id", subject.id)
//         .maybeSingle();

//       if (existingNote?.content) {
//         setNote(existingNote.content);
//         setNoteLoading(false);
//         return;
//       }

//       const res = await fetch("/api/generate-note", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           grade: gradeId,
//           term: selectedTerm.name,
//           subject: subject.name,
//           topic: topic.title,
//         }),
//       });

//       const data = await res.json();
//       const generatedNote: string = data.note;

//       setNote(generatedNote);

//       await supabase.from("notes").insert({
//         grade_id: gradeId,
//         topic_id: topic.id,
//         term_id: selectedTerm.id,
//         subject_id: subject.id,
//         content: generatedNote,
//       } as Note);
//     } catch (err) {
//       console.error(err);
//       setNoteError("Failed to fetch or generate note.");
//     } finally {
//       setNoteLoading(false);
//     }
//   };

//   // 🔹 Fetch Quiz Logic
//   const fetchQuiz = async (topic: Topic) => {
//     if (!selectedTerm) {
//       setQuizError("Please select a term first.");
//       return;
//     }

//     // const formattedTerm =
//     //   selectedTerm.name?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
//     //   "Selected Term";

//       setQuizLoading(true);
//       setQuizError(null);
//     try {
//       // Step 1 — Check if quiz already exists
//       const { data: existingQuiz } = await supabase
//         .from("quizzes")
//         .select("content")
//         .eq("grade_id", gradeId)
//         .eq("topic_id", topic.id)
//         .eq("term_id", selectedTerm.id)
//         .eq("subject_id", subject.id)
//         .maybeSingle();

//       if (existingQuiz?.content) {
//         setQuiz(JSON.parse(existingQuiz.content));
//         setQuizError(null);
//         return;
//       }
// // Step 2 — Generate new quiz
// const res = await fetch("/api/generate-quizz", {
//   method: "POST",
//   headers: { "Content-Type": "application/json" },
//   body: JSON.stringify({
//     grade: gradeId,
//     term: selectedTerm.name,
//     subject: subject.name,
//     topic: topic.title,
//   }),
// });

// const data = await res.json();

// if (!Array.isArray(data.quiz)) {
//   setQuizError("Invalid quiz format.");
//   return;
// }

// setQuiz(data.quiz);


//       // Step 3 — Save quiz
//       await supabase.from("quizzes").insert({
//         grade_id: gradeId,
//         topic_id: topic.id,
//         term_id: selectedTerm.id,
//         subject_id: subject.id,
//         content: JSON.stringify(data.quizz),
//       } as Quiz);
//     } catch (err) {
//       console.error(err);
//       setQuizError("Failed to fetch or generate quiz.");
//     } finally {
//       setQuizLoading(false);
//     }
//   };

//   const handleTermClick = (term: Term) => {
//     const isExpanded = expandedTermId === term.id;
//     setExpandedTermId(isExpanded ? null : term.id);
//     setSelectedTerm(isExpanded ? null : term);
//     setSelectedTopic(null);
//     setNote(null);
//     setQuiz(null);
//   };

//   const handleTopicClick = (topic: Topic) => {
//     setSelectedTopic(topic);
//     setNote(null);
//     setQuiz(null);
//   };

//   return (
//     <div className="flex h-full flex-col md:flex-row bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 dark:from-[#1f1c2c] dark:via-[#928dab] dark:to-[#1f1c2c] rounded-sm">
//       {/* Sidebar */}
//       <div className="w-full md:w-1/4 border-b md:border-r md:border-b-0 overflow-y-auto p-4">
//         <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black dark:text-white">
//           {subject.name}
//         </h2>

//         {terms.map((term) => {
//           const { topics = [] } = topicsByTerm[term.id] || {};
//           const isExpanded = expandedTermId === term.id;

//           return (
//             <div key={term.id} className="mb-4">
//               <button
//                 className="flex items-center justify-between w-full px-2 py-1 font-medium text-left bg-muted rounded hover:bg-muted/70"
//                 onClick={() => handleTermClick(term)}
//               >
//                 <span>{term.name}</span>
//                 {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//               </button>

//               {isExpanded && (
//                 <div className="ml-2 mt-2 space-y-1 max-h-64 overflow-y-auto">
//                   {topics.map((topic) => (
//                     <button
//                       key={topic.id}
//                       className={`block w-full text-left px-2 py-1 rounded hover:bg-accent ${
//                         selectedTopic?.id === topic.id ? "bg-accent" : ""
//                       }`}
//                       onClick={() => handleTopicClick(topic)}
//                     >
//                       {topic.title}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Main Content */}
//       <div className="w-full md:w-3/4 p-4 sm:p-6 overflow-y-auto">
//         {selectedTopic ? (
//           <div className="space-y-6">
//             <h1 className="text-xl sm:text-2xl font-bold mb-4">{selectedTopic.title}</h1>

//             {/* Note Card */}
//             <Card onClick={() => fetchNote(selectedTopic)} className="cursor-pointer">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <BookOpen className="h-5 w-5" /> Notes
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {noteLoading && <p>Generating note...</p>}
//                 {noteError && <p className="text-red-500">{noteError}</p>}
//                 {!noteLoading && !note && <p>Click to generate lesson note.</p>}
//                 {note && <div className="whitespace-pre-wrap">{note}</div>}
//               </CardContent>
//             </Card>

//             {/* Video Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Play className="h-5 w-5" /> Video
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p>Preview or link to video content for this topic.</p>
//               </CardContent>
//             </Card>

//             {/* Quiz Card */}
//             <Card onClick={() => fetchQuiz(selectedTopic)} className="cursor-pointer">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Brain className="h-5 w-5" /> Quiz
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {quizLoading && <p>Generating quiz...</p>}
//                 {quizError && <p className="text-red-500">{quizError}</p>}
//                 {!quizLoading && !quiz && <p>Click to generate quiz for this topic.</p>}
//                 {quiz &&
//                   quiz.map((q, i) => (
//                     <div key={i} className="mb-4">
//                       <p className="font-semibold">{i + 1}. {q.question}</p>
//                       <ul className="list-disc ml-6">
//                         {q.options.map((opt: string, j: number) => (
//                           <li key={j}>{opt}</li>
//                         ))}
//                       </ul>
//                       <p className="text-green-600 text-sm">Answer: {q.answer}</p>
//                     </div>
//                   ))}
//               </CardContent>
//             </Card>
//           </div>
//         ) : (
//           <div className="text-muted-foreground text-center">
//             <p>Select a topic to view its content.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { BookOpen, Play, Brain, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
// import { Database } from "@/supabaseTypes";
// import { createClient } from "@/lib/supabase/client";
// import { Button } from "@/components/ui/button"; // 👈 using your button component
// import { getStudentSubjectProgress } from "@/lib/getStudentProgress";

// type Subject = Database["public"]["Tables"]["subjects"]["Row"];
// type Term = Database["public"]["Tables"]["terms"]["Row"];
// type Topic = Database["public"]["Tables"]["topics"]["Row"];
// type Note = Database["public"]["Tables"]["notes"]["Row"];
// type Quiz = Database["public"]["Tables"]["quizzes"]["Row"];

// interface TermSelectionProps {
//   subject: Subject;
//   terms: Term[];
//   topicsByTerm: Record<number, { topics: Topic[]; count: number }>;
//   gradeId: number;
//   userId: string
// }

// type QuizItem = {
//   question: string;
//   options: string[];
//   answer: string;
// };

// export default function TermSelection({
//   subject,
//   terms,
//   topicsByTerm,
//   gradeId,
//   userId
// }: TermSelectionProps) {
//   const [expandedTermId, setExpandedTermId] = useState<number | null>(null);
//   const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
//   const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

//   // Notes states
//   const [note, setNote] = useState<string | null>(null);
//   const [noteLoading, setNoteLoading] = useState(false);
//   const [noteError, setNoteError] = useState<string | null>(null);

//   // Quiz states
//   const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
//   const [quizLoading, setQuizLoading] = useState(false);
//   const [quizError, setQuizError] = useState<string | null>(null);

  // // Progress state
  // const [completed, setCompleted] = useState(false);
  // const [savingProgress, setSavingProgress] = useState(false);

//   const supabase = createClient();
  

//   // 🔹 Mark Topic as Completed
//   const markTopicCompleted = async () => {
//     if (!selectedTopic || !userId) return;
  
//     setSavingProgress(true);
//     try {
//       // Step 1: mark as completed
//       const { error } = await supabase.from("student_topic_progress").upsert(
//         {
//           student_id: userId,
//           topic_id: selectedTopic.id,
//           subject_id: subject.id,
//           is_completed: true,
//         },
//         { onConflict: "student_id,topic_id" }
//       );
  
//       if (error) throw error;
  
//       setCompleted(true);
  
//       // Step 2: immediately fetch updated progress
//       // const updatedProgress = await getStudentSubjectProgress(userId);
//       // setProgressData(updatedProgress); // 👈 update your UI state here
//     } catch (err) {
//       console.error("Error saving progress:", err);
//     } finally {
//       setSavingProgress(false);
//     }
//   };
//   // 🔹 Fetch Note Logic (unchanged)
//   const fetchNote = async (topic: Topic) => {
//     if (!selectedTerm) {
//       setNoteError("Please select a term first.");
//       return;
//     }
//     setNoteLoading(true);
//     setNoteError(null);
//     try {
//       const { data: existingNote } = await supabase
//         .from("notes")
//         .select("content")
//         .eq("grade_id", gradeId)
//         .eq("topic_id", topic.id)
//         .eq("term_id", selectedTerm.id)
//         .eq("subject_id", subject.id)
//         .maybeSingle();

//       if (existingNote?.content) {
//         setNote(existingNote.content);
//         return;
//       }

//       const res = await fetch("/api/generate-note", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           grade: gradeId,
//           term: selectedTerm.name,
//           subject: subject.name,
//           topic: topic.title,
//         }),
//       });

//       const data = await res.json();
//       setNote(data.note);

//       await supabase.from("notes").insert({
//         grade_id: gradeId,
//         topic_id: topic.id,
//         term_id: selectedTerm.id,
//         subject_id: subject.id,
//         content: data.note,
//       } as Note);
//     } catch (err) {
//       console.error(err);
//       setNoteError("Failed to fetch or generate note.");
//     } finally {
//       setNoteLoading(false);
//     }
//   };

//   // 🔹 Fetch Quiz Logic
//   const fetchQuiz = async (topic: Topic) => {
//     if (!selectedTerm) {
//       setQuizError("Please select a term first.");
//       return;
//     }
//     setQuizLoading(true);
//     setQuizError(null);
//     try {
//       const { data: existingQuiz } = await supabase
//         .from("quizzes")
//         .select("content")
//         .eq("grade_id", gradeId)
//         .eq("topic_id", topic.id)
//         .eq("term_id", selectedTerm.id)
//         .eq("subject_id", subject.id)
//         .maybeSingle();

//       if (existingQuiz?.content) {
//         setQuiz(JSON.parse(existingQuiz.content));
//         return;
//       }

//       const res = await fetch("/api/generate-quizz", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           grade: gradeId,
//           term: selectedTerm.name,
//           subject: subject.name,
//           topic: topic.title,
//         }),
//       });

//       const data = await res.json();
//       if (!Array.isArray(data.quiz)) {
//         setQuizError("Invalid quiz format.");
//         return;
//       }

//       setQuiz(data.quiz);

//       await supabase.from("quizzes").insert({
//         grade_id: gradeId,
//         topic_id: topic.id,
//         term_id: selectedTerm.id,
//         subject_id: subject.id,
//         content: JSON.stringify(data.quiz),
//       } as Quiz);
//     } catch (err) {
//       console.error(err);
//       setQuizError("Failed to fetch or generate quiz.");
//     } finally {
//       setQuizLoading(false);
//     }
//   };

//   const handleTermClick = (term: Term) => {
//     const isExpanded = expandedTermId === term.id;
//     setExpandedTermId(isExpanded ? null : term.id);
//     setSelectedTerm(isExpanded ? null : term);
//     setSelectedTopic(null);
//     setNote(null);
//     setQuiz(null);
//     setCompleted(false);
//   };

//   const handleTopicClick = (topic: Topic) => {
//     setSelectedTopic(topic);
//     setNote(null);
//     setQuiz(null);
//     setCompleted(false);
//   };

//   return (
//     <div className="flex h-full flex-col md:flex-row bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 dark:from-[#1f1c2c] dark:via-[#928dab] dark:to-[#1f1c2c] rounded-sm">
//       {/* Sidebar */}
//       <div className="w-full md:w-1/4 border-b md:border-r md:border-b-0 overflow-y-auto p-4">
//         <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black dark:text-white">
//           {subject.name}
//         </h2>
//         {terms.map((term) => {
//           const { topics = [] } = topicsByTerm[termzx .id] || {};
//           const isExpanded = expandedTermId === term.id;
//           return (
//             <div key={term.id} className="mb-4">
//               <button
//                 className="flex items-center justify-between w-full px-2 py-1 font-medium text-left bg-muted rounded hover:bg-muted/70"
//                 onClick={() => handleTermClick(term)}
//               >
//                 <span>{term.name}</span>
//                 {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
//               </button>
//               {isExpanded && (
//                 <div className="ml-2 mt-2 space-y-1 max-h-64 overflow-y-auto">
//                   {topics.map((topic) => (
//                     <button
//                       key={topic.id}
//                       className={`block w-full text-left px-2 py-1 rounded hover:bg-accent ${
//                         selectedTopic?.id === topic.id ? "bg-accent" : ""
//                       }`}
//                       onClick={() => handleTopicClick(topic)}
//                     >
//                       {topic.title}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

//       {/* Main Content */}
//       <div className="w-full md:w-3/4 p-4 sm:p-6 overflow-y-auto">
//         {selectedTopic ? (
//           <div className="space-y-6">
//             <h1 className="text-xl sm:text-2xl font-bold mb-4">{selectedTopic.title}</h1>

//             {/* Note Card */}
//             <Card onClick={() => fetchNote(selectedTopic)} className="cursor-pointer">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <BookOpen className="h-5 w-5" /> Notes
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {noteLoading && <p>Generating note...</p>}
//                 {noteError && <p className="text-red-500">{noteError}</p>}
//                 {!noteLoading && !note && <p>Click to generate lesson note.</p>}
//                 {note && <div className="whitespace-pre-wrap">{note}</div>}
//               </CardContent>
//             </Card>

//             {/* Video Card */}
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Play className="h-5 w-5" /> Video
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p>Preview or link to video content for this topic.</p>
//               </CardContent>
//             </Card>

//             {/* Quiz Card */}
//             <Card onClick={() => fetchQuiz(selectedTopic)} className="cursor-pointer">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Brain className="h-5 w-5" /> Quiz
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {quizLoading && <p>Generating quiz...</p>}
//                 {quizError && <p className="text-red-500">{quizError}</p>}
//                 {!quizLoading && !quiz && <p>Click to generate quiz for this topic.</p>}
//                 {quiz &&
//                   quiz.map((q, i) => (
//                     <div key={i} className="mb-4">
//                       <p className="font-semibold">{i + 1}. {q.question}</p>
//                       <ul className="list-disc ml-6">
//                         {q.options.map((opt: string, j: number) => (
//                           <li key={j}>{opt}</li>
//                         ))}
//                       </ul>
//                       <p className="text-green-600 text-sm">Answer: {q.answer}</p>
//                     </div>
//                   ))}
//               </CardContent>
//             </Card>

//             {/* Completion Button */}
//             <div className="flex justify-end">
//               <Button
//                 onClick={markTopicCompleted}
//                 disabled={completed || savingProgress}
//                 className="flex items-center gap-2"
//               >
//                 <CheckCircle className="h-5 w-5" />
//                 {completed ? "Completed" : savingProgress ? "Saving..." : "Mark as Completed"}
//               </Button>
//             </div>
//           </div>
//         ) : (
//           <div className="text-muted-foreground text-center">
//             <p>Select a topic to view its content.</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }







"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle,  } from "@/components/ui/card";
import { BookOpen, Play, Brain, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { Database } from "@/supabaseTypes";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button"; // 👈 using your button component



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
const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
const [quizLoading, setQuizLoading] = useState(false);
const [quizError, setQuizError] = useState<string | null>(null);

  // Progress state
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const supabase = createClient();



  // 🔹 Mark Topic as Completed
  const markTopicCompleted = async (topic:Topic) => {
    console.log('selectedTopic and userId in termselectorcomponent', selectedTopic, userId)
    if (!selectedTopic || !userId) return;

    setSavingProgress(true);
    try {
      // Step 1: mark as completed
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
  
      // Step 2: immediately fetch updated progress
      // const updatedProgress = await getStudentSubjectProgress(userId);
      // setProgressData(updatedProgress); // 👈 update your UI state here
    } catch (err) {
      console.error("Error saving progress:", err);
    } finally {
      setSavingProgress(false);
    }
  };



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

  // 🔹 Fetch Quiz Logic
  const fetchQuiz = async (topic: Topic) => {
    if (!selectedTerm) {
      setQuizError("Please select a term first.");
      return;
    }

    // const formattedTerm =
    //   selectedTerm.name?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
    //   "Selected Term";

      setQuizLoading(true);
      setQuizError(null);
    try {
      // Step 1 — Check if quiz already exists
      const { data: existingQuiz } = await supabase
        .from("quizzes")
        .select("content")
        .eq("grade_id", gradeId)
        .eq("topic_id", topic.id)
        .eq("term_id", selectedTerm.id)
        .eq("subject_id", subject.id)
        .maybeSingle();

      if (existingQuiz?.content) {
        setQuiz(JSON.parse(existingQuiz.content));
        setQuizError(null);
        return;
      }
// Step 2 — Generate new quiz
const res = await fetch("/api/generate-quizz", {
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

if (!Array.isArray(data.quiz)) {
  setQuizError("Invalid quiz format.");
  return;
}

setQuiz(data.quiz);


      // Step 3 — Save quiz
      await supabase.from("quizzes").insert({
        grade_id: gradeId,
        topic_id: topic.id,
        term_id: selectedTerm.id,
        subject_id: subject.id,
        content: JSON.stringify(data.quizz),
      } as Quiz);
    } catch (err) {
      console.error(err);
      setQuizError("Failed to fetch or generate quiz.");
    } finally {
      setQuizLoading(false);
    }
  };

  const handleTermClick = (term: Term) => {
    const isExpanded = expandedTermId === term.id;
    setExpandedTermId(isExpanded ? null : term.id);
    setSelectedTerm(isExpanded ? null : term);
    setSelectedTopic(null);
    setNote(null);
    setQuiz(null);
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setNote(null);
    setQuiz(null);
  };

  return (
    <div className="flex h-full flex-col md:flex-row bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 dark:from-[#1f1c2c] dark:via-[#928dab] dark:to-[#1f1c2c] rounded-sm">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 border-b md:border-r md:border-b-0 overflow-y-auto p-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black dark:text-white">
          {subject.name}
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
                      className={`block w-full text-left px-2 py-1 rounded hover:bg-accent ${
                        selectedTopic?.id === topic.id ? "bg-accent" : ""
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

            {/* Quiz Card */}
            <Card onClick={() => fetchQuiz(selectedTopic)} className="cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" /> Quiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                {quizLoading && <p>Generating quiz...</p>}
                {quizError && <p className="text-red-500">{quizError}</p>}
                {!quizLoading && !quiz && <p>Click to generate quiz for this topic.</p>}
                {quiz &&
                  quiz.map((q, i) => (
                    <div key={i} className="mb-4">
                      <p className="font-semibold">{i + 1}. {q.question}</p>
                      <ul className="list-disc ml-6">
                        {q.options.map((opt: string, j: number) => (
                          <li key={j}>{opt}</li>
                        ))}
                      </ul>
                      <p className="text-green-600 text-sm">Answer: {q.answer}</p>
                    </div>
                  ))}
              </CardContent>
            </Card>

 {/* Completion Button */}
 <div className="flex justify-end">
              <Button
                onClick={ ()=> markTopicCompleted(selectedTopic)}
                disabled={completed || savingProgress}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                {completed ? "Completed" : savingProgress ? "Saving..." : "Mark as Completed"}
              </Button>
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
