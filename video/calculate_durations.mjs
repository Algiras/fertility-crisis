import fs from 'fs';
import path from 'path';
import pkg from 'wavefile';
const { WaveFile } = pkg;

const AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'chunks');
const OUT_FILE = path.join(process.cwd(), 'data', 'chunk_durations.json');

const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.wav'));
const durations = {};

for (const file of files) {
    const filePath = path.join(AUDIO_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const wav = new WaveFile(buffer);

    // bit depth can be found, but wavefile provides fmt chunk info
    const sampleRate = wav.fmt.sampleRate;

    // chunk size of data / (channels * byteDepth)
    // or simply wav.data.samples.length (if 1 channel)
    // Let's use the chunks to be safe:
    const byteRate = wav.fmt.byteRate;
    const dataSize = wav.data.chunkSize;

    const durationInSeconds = dataSize / byteRate;

    const id = file.replace('.wav', '');
    durations[id] = durationInSeconds + 1; // +1s buffer padding per chapter
    console.log(`[${id}] Duration: ${durationInSeconds.toFixed(2)}s`);
}

fs.writeFileSync(OUT_FILE, JSON.stringify(durations, null, 2));
console.log(`\n✅ Saved durations to ${OUT_FILE}`);
