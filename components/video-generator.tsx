
// components/VideoGenerator.tsx
'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Film, Loader2 } from 'lucide-react';

// --- SWR Fetchers ---
const eligibilityFetcher = (url: string, noteText: string) => 
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ noteText }),
  }).then(res => res.json());

// --- Component ---
interface VideoGeneratorProps {
  noteId: number;
  noteText: string;
  subjectName: string; // ✅ Add subjectName to the props
}

export default function VideoGenerator({ noteId, noteText, subjectName }: VideoGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // 1. Check for eligibility first
  const eligibilitySwrKey = noteText ? ['/api/video-eligibility', noteText] : null;
  const { data: eligibilityData, isLoading: isEligibilityLoading } = useSWR(
    eligibilitySwrKey, 
    ([url, text]) => eligibilityFetcher(url, text)
  );

  // 2. Handler to start the generation
  const handleGenerateVideo = async () => {
    setIsGenerating(true);
    setVideoUrl(null);
    try {
      const response = await fetch('/api/note-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, noteText, subjectName }),
      });
      const data = await response.json();
      if (data.status === 'complete') {
        setVideoUrl(data.videoUrl);
      } else {
        // Handle pending/error states if you implement the advanced polling architecture
        throw new Error(data.error || "Generation did not complete immediately.");
      }
    } catch (error) {
      console.error("Failed to generate video:", error);
      // You could show an error toast here
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Video Lesson
          {isEligibilityLoading ? (
            <Button disabled><Loader2 className="animate-spin mr-2" /> Checking...</Button>
          ) : (
            eligibilityData?.isEligible && (
              <Button onClick={handleGenerateVideo} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Film className="mr-2" />}
                {isGenerating ? 'Generating...' : 'Generate Video'}
              </Button>
            )
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {videoUrl && <video controls src={videoUrl} className="w-full rounded-lg" />}
        {isGenerating && !videoUrl && <p className="text-sm text-muted-foreground">Generating your video. This may take a minute...</p>}
        {eligibilityData && !eligibilityData.isEligible && (
          <p className="text-sm text-muted-foreground">A video lesson is not recommended for this topic.</p>
        )}
      </CardContent>
    </Card>
  );
}