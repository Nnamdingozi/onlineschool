
// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { BookOpen, Play, Brain, ChevronDown, ChevronUp } from "lucide-react";
// import { Database } from "@/supabaseTypes";
// import { createClient } from "@/lib/supabase/client";

// type Subject = Database["public"]["Tables"]["subjects"]["Row"];
// type Term = Database["public"]["Tables"]["terms"]["Row"];
// type Topic = Database["public"]["Tables"]["topics"]["Row"];
// type Note = Database["public"]["Tables"]["notes"]["Row"];

// interface TermSelectionProps {
//   subject: Subject;
//   terms: Term[];
//   topicsByTerm: Record<number, { topics: Topic[]; count: number }>;
//   gradeId: number
// }

// export default function TermSelection({ subject, terms, topicsByTerm, gradeId }: TermSelectionProps) {
//   const [expandedTermId, setExpandedTermId] = useState<number | null>(null);
//   const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
//   const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
//   const [note, setNote] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const supabase = createClient();




//   const fetchNote = async (topic: Topic) => {
//     if (!selectedTerm) {
//       setError("Please select a term first.");
//       return;
//     }

//     const formattedTerm =
//       selectedTerm.name
//         ?.replace(/_/g, " ")
//         .replace(/\b\w/g, (c) => c.toUpperCase()) || "Selected Term";

//     setLoading(true);
//     setError(null);

//     try {
//       // Step 1 — Check if note exists in DB
//       const { data: existingNote, error: fetchError } = await supabase
//         .from("notes")
//         .select("content")
//         .eq("grade_id", gradeId)
//         .eq("topic_id", topic.id)
//         .eq("term_id", selectedTerm.id)
//         .eq("subject_id", subject.id)
//         .maybeSingle();

//       if (fetchError) {
//         console.error("Error fetching note from DB:", fetchError);
//       }

//       if (existingNote?.content) {
//         setNote(existingNote.content);
//         setLoading(false);
//         return;
//       }

//       // Step 2 — Generate new note
//       const res = await fetch("/api/generate-note", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           grade: gradeId,
//           term: selectedTerm.name,
//           subject: formattedTerm,
//           topic: topic.title,
//         }),
//       });

//       const data = await res.json();
//       const generatedNote: string = data.note;

//       setNote(generatedNote);

//       console.log({
//         gradeId,
//         topicName: topic.title,
//         topicId: topic?.id,
//         termId: selectedTerm?.id,
//         subjectId: subject?.id,
//         generatedNote
//       });

//       // Step 3 — Save new note in DB
//       const { error: insertError } = await supabase
//         .from("notes")
//         .insert({
//           grade_id: gradeId,
//           topic_id: topic.id,
//           term_id: selectedTerm.id,
//           subject_id: subject.id,
//           content: generatedNote,
//         } as Note);

//       if (insertError) {
//         console.error("Error saving note to DB:", insertError);
//       }

//     } catch (err) {
//       console.error(err);
//       setError("Failed to fetch or generate note.");
//     } finally {
//       setLoading(false);
//     }
//   };


//   const handleTermClick = (term: Term) => {
//     const isExpanded = expandedTermId === term.id;
//     setExpandedTermId(isExpanded ? null : term.id);
//     setSelectedTerm(isExpanded ? null : term); // Track selected term
//     setSelectedTopic(null);
//     setNote(null);
//   };

//   const handleTopicClick = (topic: Topic) => {
//     setSelectedTopic(topic);
//     setNote(null);
//   };

//   return (
//     <div className="flex h-full bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 dark:from-[#1f1c2c] dark:via-[#928dab] dark:to-[#1f1c2c] rounded-sm">
//       {/* Sidebar */}
//       <div className="w-1/4 border-r overflow-y-auto p-4">
//         <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">{subject.name}</h2>

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
//                       className={`block w-full text-left px-2 py-1 rounded hover:bg-accent ${selectedTopic?.id === topic.id ? "bg-accent" : ""}`}
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
//       <div className="w-3/4 p-6 overflow-y-auto">
//         {selectedTopic ? (
//           <div className="space-y-6">
//             <h1 className="text-2xl font-bold mb-4">{selectedTopic.title}</h1>

//             {/* Note Card */}
//             <Card onClick={() => fetchNote(selectedTopic)} className="cursor-pointer">
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <BookOpen className="h-5 w-5" /> Notes
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 {loading && <p>Generating note...</p>}
//                 {error && <p className="text-red-500">{error}</p>}
//                 {!loading && !note && <p>Click to generate lesson note.</p>}
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
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2">
//                   <Brain className="h-5 w-5" /> Quiz
//                 </CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <p>Preview or link to quiz content for this topic.</p>
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




import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Play, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { Database } from "@/supabaseTypes";
import { createClient } from "@/lib/supabase/client";

type Subject = Database["public"]["Tables"]["subjects"]["Row"];
type Term = Database["public"]["Tables"]["terms"]["Row"];
type Topic = Database["public"]["Tables"]["topics"]["Row"];
type Note = Database["public"]["Tables"]["notes"]["Row"];

interface TermSelectionProps {
  subject: Subject;
  terms: Term[];
  topicsByTerm: Record<number, { topics: Topic[]; count: number }>;
  gradeId: number
}

export default function TermSelection({ subject, terms, topicsByTerm, gradeId }: TermSelectionProps) {
  const [expandedTermId, setExpandedTermId] = useState<number | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();




  const fetchNote = async (topic: Topic) => {
    if (!selectedTerm) {
      setError("Please select a term first.");
      return;
    }

    const formattedTerm =
      selectedTerm.name
        ?.replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) || "Selected Term";

    setLoading(true);
    setError(null);

    try {
      // Step 1 — Check if note exists in DB
      const { data: existingNote, error: fetchError } = await supabase
        .from("notes")
        .select("content")
        .eq("grade_id", gradeId)
        .eq("topic_id", topic.id)
        .eq("term_id", selectedTerm.id)
        .eq("subject_id", subject.id)
        .maybeSingle();

      if (fetchError) {
        console.error("Error fetching note from DB:", fetchError);
      }

      if (existingNote?.content) {
        setNote(existingNote.content);
        setLoading(false);
        return;
      }

      // Step 2 — Generate new note
      const res = await fetch("/api/generate-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade: gradeId,
          term: selectedTerm.name,
          subject: formattedTerm,
          topic: topic.title,
        }),
      });

      const data = await res.json();
      const generatedNote: string = data.note;

      setNote(generatedNote);

      console.log({
        gradeId,
        topicName: topic.title,
        topicId: topic?.id,
        termId: selectedTerm?.id,
        subjectId: subject?.id,
        generatedNote
      });

      // Step 3 — Save new note in DB
      const { error: insertError } = await supabase
        .from("notes")
        .insert({
          grade_id: gradeId,
          topic_id: topic.id,
          term_id: selectedTerm.id,
          subject_id: subject.id,
          content: generatedNote,
        } as Note);

      if (insertError) {
        console.error("Error saving note to DB:", insertError);
      }

    } catch (err) {
      console.error(err);
      setError("Failed to fetch or generate note.");
    } finally {
      setLoading(false);
    }
  };


  const handleTermClick = (term: Term) => {
    const isExpanded = expandedTermId === term.id;
    setExpandedTermId(isExpanded ? null : term.id);
    setSelectedTerm(isExpanded ? null : term); // Track selected term
    setSelectedTopic(null);
    setNote(null);
  };

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopic(topic);
    setNote(null);
  };

  return (
    <div className="flex h-full flex-col md:flex-row bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 dark:from-[#1f1c2c] dark:via-[#928dab] dark:to-[#1f1c2c] rounded-sm">
  {/* Sidebar */}
  <div className="w-full md:w-1/4 border-b md:border-r md:border-b-0 overflow-y-auto p-4">
    <h2 className="text-xl sm:text-2xl font-bold mb-4 text-black dark:text-white">
      {subject.name}
    </h2>

    {terms.map((term) => {
      const { topics = [] } = topicsByTerm[term.id] || {};
      const isExpanded = expandedTermId === term.id;

      return (
        <div key={term.id} className="mb-4">
          <button
            className="flex items-center justify-between w-full px-2 py-1 font-medium text-left bg-muted rounded hover:bg-muted/70"
            onClick={() => handleTermClick(term)}
          >
            <span>{term.name}</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
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
        <h1 className="text-xl sm:text-2xl font-bold mb-4">
          {selectedTopic.title}
        </h1>

        {/* Note Card */}
        <Card
          onClick={() => fetchNote(selectedTopic)}
          className="cursor-pointer"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Generating note...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !note && <p>Click to generate lesson note.</p>}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" /> Quiz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Preview or link to quiz content for this topic.</p>
          </CardContent>
        </Card>
      </div>
    ) : (
      <div className="text-muted-foreground text-center">
        <p>Select a topic to view its content.</p>
      </div>
    )}
  </div>
</div>
  )} 