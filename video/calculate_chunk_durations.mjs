import fs from 'fs';
import path from 'path';
import pkg from 'wavefile';
const { WaveFile } = pkg;

const CHUNK_DIR = path.join(process.cwd(), 'public', 'audio', 'chunks');
const OUT_FILE = path.join(process.cwd(), 'data', 'chunk_durations.json');

const files = fs.readdirSync(CHUNK_DIR).filter(f => f.endsWith('.wav'));
const durations = {};

for (const file of files) {
    const filePath = path.join(CHUNK_DIR, file);
    try {
        const buffer = fs.readFileSync(filePath);
        const wav = new WaveFile(buffer);
        const byteRate = wav.fmt.byteRate;
        const dataSize = wav.data.chunkSize;
        const durationInSeconds = dataSize / byteRate;

        const id = file.replace('.wav', '');
        durations[id] = durationInSeconds;
    } catch (err) {
        console.error(`Error processing ${file}:`, err);
    }
}

fs.writeFileSync(OUT_FILE, JSON.stringify(durations, null, 2));
console.log(`\n✅ Saved exact chunk durations to ${OUT_FILE}`);
