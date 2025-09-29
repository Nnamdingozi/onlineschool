
// lib/ai/videoAgent.ts
import 'dotenv/config';
import Replicate from 'replicate';
import { ElevenLabsClient } from 'elevenlabs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { Readable } from 'stream';
import fetch from 'node-fetch';

// --- Configuration ---
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN! });
const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY! });

if (ffmpegStatic) {
  ffmpeg.setFfmpegPath(ffmpegStatic);
}

// --- The Main Exportable Function ---
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

      // --- Generate Audio with ElevenLabs ---
      const audioPath = path.join(tempDir, `scene_${i}.mp3`);
      try {
        console.log(`   🎤 Calling ElevenLabs API...`);
        
        // Use the `.convert()` method which returns a Readable stream in the Node SDK
        const audioStream = await elevenlabs.textToSpeech.convert(
          "21m00Tcm4TlvDq8ikWAM", // voice_id
          {
            text: sceneText,
            model_id: "eleven_multilingual_v2",
          }
        );

        // ✅ FIX 1: Correctly consume the Readable stream to a Buffer.
        const chunks: Buffer[] = [];
        for await (const chunk of audioStream as Readable) {
          chunks.push(chunk);
        }
        const audioBuffer = Buffer.concat(chunks);
        await fs.writeFile(audioPath, audioBuffer);
        console.log(`   ✅ Audio saved to ${audioPath} (${audioBuffer.length} bytes)`);
      } catch (error) {
        console.error("   ❌ ERROR during ElevenLabs audio generation:", error);
        throw error;
      }

           // --- Generate Image with Replicate ---
           const imagePath = path.join(tempDir, `scene_${i}.png`);
           try {
             const styleGuide: Record<string, string> = {
               'Biology': 'clear educational diagram style, vibrant colors, labels',
               'Chemistry': 'scientific illustration of molecules and reactions, digital art',
               'Physics': 'clean physics diagram, showing forces and vectors, minimalist',
               'History': 'realistic historical photograph style, black and white, cinematic lighting',
               'Literature': 'dramatic oil painting, expressive, rich colors',
               'Mathematics': 'clear handwritten chalkboard style, showing the steps of the equation',
               // Add more subjects as needed...
             };
             const subjectStyle = styleGuide[subjectName] || "simple educational illustration";
             const imagePrompt = `An educational visual for a ${subjectName} tutorial about: "${sceneText}". Style: ${subjectStyle}.`;
             console.log(`   🤖 Calling Replicate API with prompt: "${imagePrompt}"`);
     
             // ✅ THIS IS THE COMPLETE, WORKING CODE FOR THE REPLICATE CALL
             const imageOutput = await replicate.run(
               "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
               {
                 input: {
                   prompt: imagePrompt,
                   width: 1280,
                   height: 720,
                   // A negative prompt helps guide the AI away from bad results
                   negative_prompt: "blurry, deformed, text, watermark, ugly, low quality, signature, letters"
                 }
               }
             );
             
             // The output is an array of URLs, we'll take the first one.
             const imageUrl = (imageOutput as string[])[0];
             if (!imageUrl) {
               throw new Error("Replicate did not return an image URL.");
             }
     
             console.log(`   Image URL from Replicate: ${imageUrl}`);
             const imageResponse = await fetch(imageUrl);
             if (!imageResponse.ok) {
               throw new Error(`Failed to download image from Replicate: ${imageResponse.statusText}`);
             }
     
             // Use .buffer() for node-fetch compatibility
             const imageBuffer = await imageResponse.buffer();
             await fs.writeFile(imagePath, imageBuffer);
             console.log(`   ✅ Image saved to ${imagePath} (${imageBuffer.length} bytes)`);
     
           } catch (error) {
             console.error("   ❌ ERROR during Replicate image generation:", error);
             throw error;
           }
      
      const duration = await getAudioDuration(audioPath);
      sceneAssets.push({ audioPath, imagePath, duration });
    }


    // --- Assemble the video ---
    console.log("\n--- 🎥 ASSEMBLING VIDEO WITH FFMPEG ---");
    const finalVideoPath = path.join(tempDir, "final_video.mp4");
    
    const imageListPath = path.join(tempDir, "imagelist.txt");
    const imageListContent = sceneAssets.map((asset) => `file '${path.resolve(asset.imagePath)}'\nduration ${asset.duration}`).join("\n");
    await fs.writeFile(imageListPath, imageListContent);

    const audioListPath = path.join(tempDir, "audiolist.txt");
    const audioListContent = sceneAssets.map(asset => `file '${path.resolve(asset.audioPath)}'`).join("\n");
    await fs.writeFile(audioListPath, audioListContent);

    await new Promise<void>((resolve, reject) => {
        ffmpeg()
            .input(imageListPath)
            .inputOptions(['-f', 'concat', '-safe', '0'])
            .input(audioListPath)
            .inputOptions(['-f', 'concat', '-safe', '0'])
            .outputOptions(['-c:v', 'libx264', '-c:a', 'aac', '-pix_fmt', 'yuv420p', '-shortest'])
            // ✅ FIX 2: Wrap resolve and reject in arrow functions to satisfy TypeScript.
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .save(finalVideoPath);
    });

    const videoBuffer = await fs.readFile(finalVideoPath);
    
    // ✅ THE SAFEGUARD
    if (videoBuffer.length === 0) {
        throw new Error("FFmpeg produced an empty (0-byte) video file. Check FFmpeg logs for errors.");
    }

    console.log(`[AGENT] Final video buffer size is ${videoBuffer.length} bytes. Returning buffer.`);
    return videoBuffer;

  } finally {
    console.log(`   🗑️ Cleaning up temporary directory: ${tempDir}`);
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

// Helper function to get audio duration (This part is correct)
function getAudioDuration(filePath: string): Promise<number> {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration || 0);
        });
    });
}