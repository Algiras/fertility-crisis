import fs from 'fs';
import path from 'path';
import { KokoroTTS } from 'kokoro-js';
import pkg from 'wavefile';
const { WaveFile } = pkg;

const BASE_DIR = process.cwd();
const NARRATIONS_FILE = path.join(BASE_DIR, 'data', 'chart_narrations.json');
const AUDIO_DIR = path.join(BASE_DIR, 'public', 'audio', 'charts');
const VOICE = 'am_adam';

function float32To16BitPCM(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        let s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
}

async function main() {
    fs.mkdirSync(AUDIO_DIR, { recursive: true });
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
        const audio = await tts.generate(item.text, { voice: VOICE, speed: 1.15 });
        const wav = new WaveFile();
        wav.fromScratch(1, audio.sampling_rate, '16', float32To16BitPCM(audio.audio));
        fs.writeFileSync(outPath, wav.toBuffer());
        console.log(`  Saved ${item.id}.wav (${(audio.audio.length / audio.sampling_rate).toFixed(1)}s)`);
    }
    console.log('Done.');
}

main().catch(console.error);
