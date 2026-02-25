import fs from 'fs';
import path from 'path';
import { KokoroTTS } from 'kokoro-js';
import pkg from 'wavefile';
const { WaveFile } = pkg;

const NARRATIONS_FILE = path.join(process.cwd(), 'data', 'bookend_narrations.json');
const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio');
const VOICE = 'am_adam';

function float32To16BitPCM(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
}

// Split on paragraph breaks and generate each paragraph separately,
// then concatenate with a short silence pause between them.
async function synthesizeWithPauses(tts, text, voice) {
    const paragraphs = text.split(/\n+/).map(p => p.trim()).filter(p => p.length > 0);
    const PAUSE_SAMPLES = 24000 * 0.6; // 0.6s pause between paragraphs
    const allBuffers = [];
    let totalSamples = 0;

    for (const para of paragraphs) {
        const audio = await tts.generate(para, { voice, speed: 1.1 });
        allBuffers.push(audio.audio);
        totalSamples += audio.audio.length;
        // Add silence between paragraphs
        allBuffers.push(new Float32Array(PAUSE_SAMPLES));
        totalSamples += PAUSE_SAMPLES;
    }

    const combined = new Float32Array(totalSamples);
    let offset = 0;
    for (const buf of allBuffers) {
        combined.set(buf, offset);
        offset += buf.length;
    }
    return { audio: combined, sampling_rate: 24000 };
}

async function main() {
    const narrations = JSON.parse(fs.readFileSync(NARRATIONS_FILE, 'utf8'));
    console.log('Initializing Kokoro TTS...');
    const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', { dtype: 'fp32' });
    console.log(`TTS loaded. Voice: ${VOICE}`);

    for (const item of narrations) {
        const outPath = path.join(AUDIO_DIR, `${item.id}.wav`);
        if (fs.existsSync(outPath) && fs.statSync(outPath).size > 1000) {
            console.log(`Skipping ${item.id} (already exists)`);
            continue;
        }
        console.log(`Synthesizing ${item.id}...`);
        const result = await synthesizeWithPauses(tts, item.text, VOICE);
        const wav = new WaveFile();
        wav.fromScratch(1, result.sampling_rate, '16', float32To16BitPCM(result.audio));
        fs.writeFileSync(outPath, wav.toBuffer());
        const duration = (result.audio.length / result.sampling_rate).toFixed(1);
        console.log(`  Saved ${item.id}.wav (${duration}s)`);
    }
    console.log('Done.');
}

main().catch(console.error);
