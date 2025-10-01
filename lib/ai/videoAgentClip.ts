
// // lib/ai/videoAgent.ts
// import 'dotenv/config';

// import { ElevenLabsClient } from 'elevenlabs';
// import ffmpeg from 'fluent-ffmpeg';
// import ffmpegStatic from 'ffmpeg-static';
// import ffprobeStatic from 'ffprobe-static';
// import { promises as fs } from 'fs';
// import path from 'path';
// import os from 'os';
// import { Readable } from 'stream';
// import fetch from 'node-fetch';

// // --- Configuration ---
// // ❗ Replicate client is GONE
// const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
// const huggingFaceToken = process.env.HUGGINGFACE_API_TOKEN!; // ✅ Use this for auth

// if (!huggingFaceToken) {
//   throw new Error("Missing HUGGINGFACE_API_TOKEN environment variable.");
// }


// // ✅ Force ffmpeg to use portable binaries
// ffmpeg.setFfmpegPath(ffmpegStatic!);
// ffmpeg.setFfprobePath(ffprobeStatic.path);

// console.log("[FFMPEG CONFIG] Using ffmpeg:", ffmpegStatic);
// console.log("[FFPROBE CONFIG] Using ffprobe:", ffprobeStatic.path);


// // --- The Main Exportable Function ---
// export async function generateVideoFromNote(noteText: string, subjectName: string): Promise<Buffer> {
//   console.log("--- 🎬 VIDEO AGENT STARTED ---");
//   const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-video-'));
//   console.log(`[LOG] Created temporary directory: ${tempDir}`);

//   try {
//     const scenes = noteText.match(/[^.!?]+[.!?]+/g) || [];
//     if (scenes.length === 0) throw new Error("Could not break note into scenes.");

//     const sceneAssets: { audioPath: string; imagePath: string; duration: number }[] = [];

//     for (let i = 0; i < scenes.length; i++) {
//       const sceneText = scenes[i].trim();
//       console.log(`\n--- [SCENE ${i + 1}/${scenes.length}] START ---`);


//       // --- Generate Audio with ElevenLabs (This part is correct) ---
//       const audioPath = path.join(tempDir, `scene_${i}.mp3`);
//       try {
//         console.log(`   🎤 Calling ElevenLabs API...`);
//         const audioStream = await elevenlabs.textToSpeech.convert(
//           "21m00Tcm4TlvDq8ikWAM", // voice_id
//           {
//             text: sceneText,
//             model_id: "eleven_multilingual_v2",
//           }
//         );
//         const chunks: Buffer[] = [];
//         for await (const chunk of audioStream as Readable) chunks.push(chunk);
//         await fs.writeFile(audioPath, Buffer.concat(chunks));
//         console.log(`   ✅ Audio saved.`);
//       } catch (error) {
//         console.error("   ❌ ERROR during ElevenLabs audio generation:", error);
//         throw error;
//       }

//       // --- ✅ Generate Image with Hugging Face ---
//       const imagePath = path.join(tempDir, `scene_${i}.png`);
//       try {
//         const styleGuide: Record<string, string> = {
//           'Biology': 'clear educational diagram style, vibrant colors, labels',
//           'Chemistry': 'scientific illustration of molecules and reactions, digital art',
//           'Physics': 'clean physics diagram, showing forces and vectors, minimalist',
//           'History': 'realistic historical photograph style, black and white, cinematic lighting',
//           'Literature': 'dramatic oil painting, expressive, rich colors',
//           'Mathematics': 'clear handwritten chalkboard style, showing the steps of the equation',
//         };
//         const subjectStyle = styleGuide[subjectName] || "simple educational illustration";
//         const imagePrompt = `An educational visual for a ${subjectName} tutorial about: "${sceneText}". Style: ${subjectStyle}.`;
//         console.log(`   🎨 Calling Hugging Face API with prompt: "${imagePrompt}"`);

//         const modelEndpoint = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

//         // ✅ Define the request options in a variable so we can reuse them.
//         const fetchOptions = {
//           method: 'POST',
//           headers: {
//             'Authorization': `Bearer ${huggingFaceToken}`,
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ inputs: imagePrompt }),
//         };

//         // Initial API call
//         let response = await fetch(modelEndpoint, fetchOptions);

//         // Handle the "model is loading" case with a retry.
//         if (response.status === 503) {
//           console.log("   ⏳ Model is loading, waiting 20 seconds before retrying...");
//           await new Promise(resolve => setTimeout(resolve, 20000));

//           console.log("   Retrying fetch...");
//           // ✅ Retry the fetch call using the exact same options.
//           response = await fetch(modelEndpoint, fetchOptions);
//         }

//         if (!response.ok) {
//           const errorBody = await response.text();
//           throw new Error(`Hugging Face API failed with status ${response.status}: ${errorBody}`);
//         }

//         const imageBuffer = await response.buffer();
//         await fs.writeFile(imagePath, imageBuffer);
//         console.log(`   ✅ Image saved to ${imagePath} (${imageBuffer.length} bytes)`);

//       } catch (error) {
//         console.error("   ❌ ERROR during Hugging Face image generation:", error);
//         throw error;
//       }
//       const duration = await getAudioDuration(audioPath);
//       if (duration <= 0) throw new Error(`Audio for scene ${i + 1} has zero duration.`);
//       console.log(`   ⏱️ Audio duration is ${duration} seconds.`);
//       sceneAssets.push({ audioPath, imagePath, duration });
//     }


//     // --- Assemble the video ---
//     console.log("\n--- 🎥 ASSEMBLING VIDEO WITH FFMPEG ---");
//     const finalVideoPath = path.join(tempDir, "final_video.mp4");

//     const imageListPath = path.join(tempDir, "imagelist.txt");
//     const imageListContent = sceneAssets.map((asset) => `file '${path.resolve(asset.imagePath)}'\nduration ${asset.duration}`).join("\n");
//     await fs.writeFile(imageListPath, imageListContent);

//     const audioListPath = path.join(tempDir, "audiolist.txt");
//     const audioListContent = sceneAssets.map(asset => `file '${path.resolve(asset.audioPath)}'`).join("\n");
//     await fs.writeFile(audioListPath, audioListContent);

//     await new Promise<void>((resolve, reject) => {
//       ffmpeg()
//         .input(imageListPath)
//         .inputOptions(['-f', 'concat', '-safe', '0'])
//         .input(audioListPath)
//         .inputOptions(['-f', 'concat', '-safe', '0'])
//         .outputOptions(['-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p', '-shortest'])
//         .on('end', () => resolve())
//         .on('error', (err) => reject(err))
//         .save(finalVideoPath);
//     });

//     const videoBuffer = await fs.readFile(finalVideoPath);

//     // ✅ THE SAFEGUARD
//     if (videoBuffer.length === 0) {
//       throw new Error("FFmpeg produced an empty (0-byte) video file. Check FFmpeg logs for errors.");
//     }

//     console.log(`[AGENT] Final video buffer size is ${videoBuffer.length} bytes. Returning buffer.`);
//     return videoBuffer;

//   } finally {
//     console.log(`   🗑️ Cleaning up temporary directory: ${tempDir}`);
//     await fs.rm(tempDir, { recursive: true, force: true });
//   }
// }

// // --- Helper function to get audio duration ---
// // --- Helper function to get audio duration ---
// function getAudioDuration(filePath: string): Promise<number> {
//   console.log(`   [FFPROBE] Probing audio duration for: ${filePath}`);
//   return new Promise((resolve, reject) => {
//     ffmpeg.ffprobe(filePath, (err, metadata) => {
//       if (err) {
//         console.error(`   [FFPROBE] ERROR probing file ${filePath}:`, err);
//         return reject(err);
//       }
//       resolve(metadata.format.duration || 0);
//     });
//   });
// }

import 'dotenv/config';
import { ElevenLabsClient } from 'elevenlabs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import ffprobeStatic from 'ffprobe-static';
import ffprobePath from "ffprobe-static";
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import fetch from 'node-fetch';
import { spawn } from "child_process";

// --- Configuration ---
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });
const huggingFaceToken = process.env.HUGGINGFACE_API_TOKEN!;

if (!huggingFaceToken) {
  throw new Error("Missing HUGGINGFACE_API_TOKEN environment variable.");
}

// ✅ Force ffmpeg to use portable binaries
ffmpeg.setFfmpegPath(ffmpegStatic!);
ffmpeg.setFfprobePath(ffprobeStatic.path);

console.log("[FFMPEG CONFIG] Using ffmpeg:", ffmpegStatic);
console.log("[FFPROBE CONFIG] Using ffprobe:", ffprobeStatic.path);

// --- Main Function ---
export async function generateVideoFromNote(noteText: string, subjectName: string): Promise<Buffer> {
  console.log("--- 🎬 VIDEO AGENT STARTED ---");

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-video-'));
  console.log(`[LOG] Created temporary directory: ${tempDir}`);

  try {
    const scenes = noteText.match(/[^.!?]+[.!?]+/g) || [];
    if (scenes.length === 0) throw new Error("Could not break note into scenes.");

    const sceneAssets: { audioPath: string; imagePath: string; duration: number }[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const sceneText = scenes[i].trim();
      console.log(`\n--- [SCENE ${i + 1}/${scenes.length}] START ---`);

      // --- Audio (ElevenLabs) ---
      const audioPath = path.join(tempDir, `scene_${i}.mp3`);
      try {
        console.log(`   🎤 Calling ElevenLabs API...`);
        const audioStream = await elevenlabs.textToSpeech.convert(
          "21m00Tcm4TlvDq8ikWAM",
          { text: sceneText, model_id: "eleven_multilingual_v2" }
        );
        const chunks: Buffer[] = [];
        for await (const chunk of audioStream as Readable) chunks.push(chunk);
        await fs.writeFile(audioPath, Buffer.concat(chunks));
        console.log(`   ✅ Audio saved.`);
      } catch (error) {
        console.error("   ❌ ERROR during ElevenLabs audio generation:", error);
        throw error;
      }

      // --- Image (Hugging Face) ---
      const imagePath = path.join(tempDir, `scene_${i}.png`);
      try {
        const styleGuide: Record<string, string> = {
          'Biology': 'clear educational diagram style, vibrant colors, labels',
          'Chemistry': 'scientific illustration of molecules and reactions, digital art',
          'Physics': 'clean physics diagram, showing forces and vectors, minimalist',
          'History': 'realistic historical photograph style, black and white, cinematic lighting',
          'Literature': 'dramatic oil painting, expressive, rich colors',
          'Mathematics': 'clear handwritten chalkboard style, showing the steps of the equation',
        };
        const subjectStyle = styleGuide[subjectName] || "simple educational illustration";
        const imagePrompt = `An educational visual for a ${subjectName} tutorial about: "${sceneText}". Style: ${subjectStyle}.`;

        console.log(`   🎨 Calling Hugging Face API with prompt: "${imagePrompt}"`);

        const modelEndpoint = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";

        const fetchOptions = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${huggingFaceToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ inputs: imagePrompt }),
        };

        let response = await fetch(modelEndpoint, fetchOptions);
        if (response.status === 503) {
          console.log("   ⏳ Model is loading, retrying after 20s...");
          await new Promise(resolve => setTimeout(resolve, 20000));
          response = await fetch(modelEndpoint, fetchOptions);
        }

        if (!response.ok) {
          const errorBody = await response.text();
          throw new Error(`Hugging Face API failed with status ${response.status}: ${errorBody}`);
        }

        const imageBuffer = await response.buffer();
        await fs.writeFile(imagePath, imageBuffer);
        console.log(`   ✅ Image saved (${imageBuffer.length} bytes)`);

      } catch (error) {
        console.error("   ❌ ERROR during Hugging Face image generation:", error);
        throw error;
      }

      const duration = await getAudioDuration(audioPath);
      if (duration <= 0) throw new Error(`Audio for scene ${i + 1} has zero duration.`);
      console.log(`   ⏱️ Audio duration is ${duration} seconds.`);
      sceneAssets.push({ audioPath, imagePath, duration });
    }

    // --- Assemble video ---
    console.log("\n--- 🎥 ASSEMBLING VIDEO WITH FFMPEG ---");
    const finalVideoPath = path.join(tempDir, "final_video.mp4");

    const imageListPath = path.join(tempDir, "imagelist.txt");
    const imageListContent = sceneAssets.map((a) =>
      `file '${path.resolve(a.imagePath)}'\nduration ${a.duration}`
    ).join("\n");
    await fs.writeFile(imageListPath, imageListContent);

    const audioListPath = path.join(tempDir, "audiolist.txt");
    const audioListContent = sceneAssets.map(a =>
      `file '${path.resolve(a.audioPath)}'`
    ).join("\n");
    await fs.writeFile(audioListPath, audioListContent);

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(imageListPath)
        .inputOptions(['-f concat', '-safe 0'])
        .input(audioListPath)
        .inputOptions(['-f concat', '-safe 0'])
        .outputOptions(['-c:v libx264', '-c:a aac', '-pix_fmt yuv420p', '-shortest'])
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(finalVideoPath);
    });

    const videoBuffer = await fs.readFile(finalVideoPath);
    if (videoBuffer.length === 0) throw new Error("FFmpeg produced an empty video file.");

    console.log(`[AGENT] Final video size: ${videoBuffer.length} bytes.`);
    return videoBuffer;

  } finally {
    console.log(`   🗑️ Cleaning up temp directory: ${tempDir}`);
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

// --- Helper ---

export async function getAudioDuration(filePath: string): Promise<number> {
  console.log(`[FFPROBE] Checking duration for: ${filePath}`);

  return new Promise((resolve, reject) => {
    const probe = spawn(ffprobePath.path, [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let output = "";
    probe.stdout.on("data", (chunk) => {
      output += chunk;
    });

    probe.stderr.on("data", (err) => {
      console.error("[FFPROBE STDERR]:", err.toString());
    });

    probe.on("close", (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        resolve(isNaN(duration) ? 0 : duration);
      } else {
        reject(new Error(`FFPROBE failed with code ${code}`));
      }
    });
  });
}
