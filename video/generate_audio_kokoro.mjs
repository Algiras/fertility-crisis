import fs from 'fs';
import path from 'path';
import { KokoroTTS } from 'kokoro-js';
import pkg from 'wavefile';

const { WaveFile } = pkg;

const BASE_DIR = process.cwd();
const SCENES_FILE = path.join(BASE_DIR, "data/scenes.json");
const AUDIO_DIR = path.join(BASE_DIR, "public/audio", "chunks");
const CHUNKS_JSON = path.join(BASE_DIR, "data", "chunks.json");
// We use the excellent built-in American Male Adam voice
const VOICE = 'am_adam';

function splitIntoSentences(text) {
    // Basic regex split on sentence punctuation followed by space
    const sentences = text.split(/(?<=[.!?])\s+/);
    return sentences.map(s => s.trim()).filter(s => s.length > 0);
}

function chunkText(text, maxChars = 250) {
    const sentences = splitIntoSentences(text);
    const chunks = [];
    let currentChunk = "";

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChars) {
            if (currentChunk.trim()) {
                chunks.push(currentChunk.trim());
            }
            currentChunk = sentence + " ";
        } else {
            currentChunk += sentence + " ";
        }
    }
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
}

// Float32Array to 16-bit PCM for standard WAV compatibility
function float32To16BitPCM(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
}

async function main() {
    if (!fs.existsSync(AUDIO_DIR)) {
        fs.mkdirSync(AUDIO_DIR, { recursive: true });
    }

    const scenes = JSON.parse(fs.readFileSync(SCENES_FILE, 'utf8'));
    console.log(`Loaded ${scenes.length} chapters. Initializing Kokoro-JS... (this may take a moment to load WebAssembly weights)`);

    // Initialize the TTS model
    // 17 is the default model size ID, we'll just instantiate correctly via the kokoro-js package
    const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-v1.0-ONNX", { dtype: "fp32" });

    console.log(`TTS Engine loaded! using voice: ${VOICE}`);

    let allChunksMetadata = [];

    // If chunks.json exists, we can load it to resume
    if (fs.existsSync(CHUNKS_JSON)) {
        try {
            allChunksMetadata = JSON.parse(fs.readFileSync(CHUNKS_JSON, 'utf8'));
            console.log(`Resuming from ${allChunksMetadata.length} existing chunks...`);
        } catch (e) { }
    }

    for (const scene of scenes) {
        console.log(`\n[${scene.id}] Processing chapter...`);
        const chunks = chunkText(scene.text);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const chunkId = `${scene.id}_${i}`;
            const chunkPath = path.join(AUDIO_DIR, `${chunkId}.wav`);

            // Check if we already processed this
            const existingMeta = allChunksMetadata.find(c => c.chunk_id === chunkId);
            if (!existingMeta) {
                allChunksMetadata.push({
                    chapter_id: scene.id,
                    chunk_id: chunkId,
                    text: chunk
                });
                // Progressively save metadata
                fs.writeFileSync(CHUNKS_JSON, JSON.stringify(allChunksMetadata, null, 2));
            }

            // Skip if the WAV already exists and has data
            if (fs.existsSync(chunkPath) && fs.statSync(chunkPath).size > 1000) {
                console.log(`  -> Skipping ${chunkId}, already generated.`);
                continue;
            }

            console.log(`  -> Synthesizing [${chunkId}]: "${chunk.substring(0, 40)}..."`);
            try {
                // Generate the audio
                const audio = await tts.generate(chunk, {
                    voice: VOICE,
                    speed: 1.15 // slightly faster for dynamic narrative
                });

                // Pack into standard WAV file using wavefile
                const wav = new WaveFile();
                const pcmData = float32To16BitPCM(audio.audio);
                // Kokoro outputs at 24000Hz mono
                wav.fromScratch(1, audio.sampling_rate, '16', pcmData);

                fs.writeFileSync(chunkPath, wav.toBuffer());
                console.log(`  -> Saved ${chunkId}.wav`);

            } catch (err) {
                console.error(`  -> ERROR generating ${chunkId}:`, err);
            }
        }
    }

    console.log(`\nFinished generating all scenes! total chunks: ${allChunksMetadata.length}`);
}

main().catch(console.error);
