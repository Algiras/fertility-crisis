import fs from 'fs';
import path from 'path';
import { KokoroTTS } from 'kokoro-js';
import pkg from 'wavefile';
const { WaveFile } = pkg;

const SCENES_FILE = path.join(process.cwd(), 'data', 'scenes.json');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');

// Split text into ~200 character chunks cleanly at sentence boundaries
function chunkText(text) {
    const sentences = text.match(/[^.!?]+[.!?]+[\])'"`’”]*|.+/g) || [text];
    const chunks = [];
    let currentChunk = '';

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > 300) {
            if (currentChunk.trim()) chunks.push(currentChunk.trim());
            currentChunk = sentence + ' ';
        } else {
            currentChunk += sentence + ' ';
        }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks;
}

async function main() {
    if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true });
    const scenes = JSON.parse(fs.readFileSync(SCENES_FILE, 'utf8'));
    console.log(`Loaded ${scenes.length} scenes.`);

    const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-ONNX', { dtype: 'fp32' });

    for (const scene of scenes) {
        const audioPath = path.join(AUDIO_DIR, `${scene.id}.wav`);
        console.log(`\n[${scene.id}] Chunking and generating ${scene.text.split(' ').length} words...`);

        try {
            const chunks = chunkText(scene.text);
            let totalLength = 0;
            const allAudioArrays = [];

            for (let i = 0; i < chunks.length; i++) {
                process.stdout.write(`  Chunk ${i + 1}/${chunks.length}... `);
                const result = await tts.generate(chunks[i], { voice: 'af_heart' });
                // result.audio is a Float32Array
                allAudioArrays.push(result.audio);
                totalLength += result.audio.length;
                // add 0.4s silence pause between sentences (24000 * 0.4 = 9600 samples)
                const silence = new Float32Array(9600);
                allAudioArrays.push(silence);
                totalLength += 9600;
                console.log(`done.`);
            }

            // Concatenate
            const combined = new Float32Array(totalLength);
            let offset = 0;
            for (const arr of allAudioArrays) {
                combined.set(arr, offset);
                offset += arr.length;
            }

            const wav = new WaveFile();
            wav.fromScratch(1, 24000, '32f', combined);
            fs.writeFileSync(audioPath, wav.toBuffer());

            console.log(`[${scene.id}] ✅ Saved combined audio to ${audioPath} (${(totalLength / 24000).toFixed(1)}s)`);
        } catch (err) {
            console.error(`[${scene.id}] ❌ Error:`, err);
        }
    }
    console.log('\nAll audio generation complete.');
}

main().catch(console.error);
