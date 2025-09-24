

// // hooks/useSpeechSynthesis.ts
// 'use client'; // This hook uses browser-only APIs

// import { useState, useEffect, useCallback } from 'react';

// // ✅ 1. Define the possible states for clarity and type safety.
// type SpeechState = 'idle' | 'playing' | 'paused';

// export const useSpeechSynthesis = () => {
//   // ✅ 2. Use the new, more descriptive state.
//   const [speechState, setSpeechState] = useState<SpeechState>('idle');
//   const [supported, setSupported] = useState(false);
  

//   // We need to keep a reference to the utterance to pause/resume it.
//   // const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

//   useEffect(() => {
//     // Check for browser support on component mount.
//     if ('speechSynthesis' in window) {
//       setSupported(true);
//     }
//     // ✅ Add a cleanup function to cancel speech when the component unmounts.
//     // This prevents audio from continuing to play after navigating away.
//     return () => {
//       if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel();
//       }
//     };
//   }, []);

//   const speak = useCallback((text: string) => {
//     if (!supported) return;

//     // Always cancel any previous speech before starting a new one.
//     window.speechSynthesis.cancel();

//     const newUtterance = new SpeechSynthesisUtterance(text);
    
//     // ✅ 3. Wire up all event listeners to keep our React state
//     // perfectly in sync with the browser's speech engine.
//     newUtterance.onstart = () => setSpeechState('playing');
//     newUtterance.onpause = () => setSpeechState('paused');
//     newUtterance.onresume = () => setSpeechState('playing');
//     newUtterance.onend = () => setSpeechState('idle');
//     newUtterance.onerror = (event) => {
//       console.error("SpeechSynthesis Error", event);
//       setSpeechState('idle');
//     };

//     // // Save the utterance in state so we can access it from other functions.
//     // setUtterance(newUtterance);
//     window.speechSynthesis.speak(newUtterance);
//   }, [supported]);

  // // ✅ 4. Add the new `pause` function.

  // const pause = useCallback(() => {
  //   // We can only pause if it's currently playing.
  //   if (speechState === 'playing') {
  //     window.speechSynthesis.pause();
  //   }
  // }, [speechState]);

  // // ✅ 5. Add the new `resume` function.
  // const resume = useCallback(() => {
  //   // We can only resume if it's currently paused.
  //   if (speechState === 'paused') {
  //     window.speechSynthesis.resume();
  //   }
  // }, [speechState]);

//   const cancel = useCallback(() => {
//     if (!supported) return;
//     window.speechSynthesis.cancel();
//     setSpeechState('idle');
//   }, [supported]);

//   // ✅ 6. Return the new state and functions.
//   return { speechState, speak, pause, resume, cancel, supported };
// };





// hooks/useSpeechSynthesis.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

type SpeechState = 'idle' | 'playing' | 'paused';

export const useSpeechSynthesis = (text: string) => {
  const [speechState, setSpeechState] = useState<SpeechState>('idle');
  const [supported, setSupported] = useState(false);
  
  // ✅ 1. Add state to track the current character index.
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      setSupported(true);
    }
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((textToSpeak: string) => {
    if (!supported) return;

    window.speechSynthesis.cancel();

    const newUtterance = new SpeechSynthesisUtterance(textToSpeak);
    
    newUtterance.onstart = () => setSpeechState('playing');
    newUtterance.onpause = () => setSpeechState('paused');
    newUtterance.onresume = () => setSpeechState('playing');
    newUtterance.onend = () => {
      setSpeechState('idle');
      setCurrentCharIndex(0); // Reset index when speech finishes
    };
    newUtterance.onerror = (event) => {
      console.error("SpeechSynthesis Error", event);
      setSpeechState('idle');
    };
    
    // ✅ 2. The key to tracking progress: the `onboundary` event.
    // This event fires for each word, giving us the character index.
    newUtterance.onboundary = (event) => {
      // We add the starting position of the spoken text to get the true index
      const baseIndex = text.indexOf(textToSpeak);
      setCurrentCharIndex(baseIndex + event.charIndex);
    };

    window.speechSynthesis.speak(newUtterance);
  }, [supported, text]);

  // ✅ 4. Add the new `pause` function.
  const pause = useCallback(() => {
    // We can only pause if it's currently playing.
    if (speechState === 'playing') {
      window.speechSynthesis.pause();
    }
  }, [speechState]);

   // ✅ 5. Add the new `resume` function.
   const resume = useCallback(() => {
    // We can only resume if it's currently paused.
    if (speechState === 'paused') {
      window.speechSynthesis.resume();
    }
  }, [speechState]);

  
  const cancel = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeechState('idle');
    setCurrentCharIndex(0); // Reset index on cancel
  }, [supported]);

  // ✅ 3. Add the new `rewind` function.
  const rewind = useCallback(() => {
    if (!text) return;
    // Find the last sentence end before the current position
    // We look back a bit to avoid finding the end of the current sentence.
    const searchCutoff = Math.max(0, currentCharIndex - 5);
    const lastSentenceEnd = text.substring(0, searchCutoff).lastIndexOf('.');
    
    let startIndex = 0;
    if (lastSentenceEnd !== -1) {
      // Start from the character after the period and space
      startIndex = lastSentenceEnd + 2;
    }
    
    speak(text.substring(startIndex));
  }, [currentCharIndex, text, speak]);

  // ✅ 4. Add the new `fastForward` function.
  const fastForward = useCallback(() => {
    if (!text) return;
    // Find the next sentence end after the current position
    const nextSentenceEnd = text.indexOf('.', currentCharIndex);
    
    if (nextSentenceEnd !== -1) {
      const startIndex = nextSentenceEnd + 2;
      if (startIndex < text.length) {
        speak(text.substring(startIndex));
      } else {
        cancel(); // We're at the end
      }
    } else {
      cancel(); // No more sentences
    }
  }, [currentCharIndex, text, speak, cancel]);

  return { speechState, speak, pause, resume, cancel, rewind, fastForward, supported };
};