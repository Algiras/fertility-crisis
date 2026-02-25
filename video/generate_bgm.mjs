/**
 * Generates a dark cinematic ambient pad as a WAV, then we convert to MP3 via ffmpeg.
 * Uses layered detuned sine oscillators with slow amplitude modulation to create
 * an organic, breathing drone suitable for documentary narration.
 */
import fs from 'fs';
import { execSync } from 'child_process';

const SAMPLE_RATE = 44100;
const DURATION_SEC = 180; // 3 minutes — long enough to loop without obvious seam
const OUT_WAV = '/tmp/bgm_raw.wav';
const OUT_MP3 = 'public/audio/bgm.mp3';

const totalSamples = SAMPLE_RATE * DURATION_SEC;

// Oscillator layers: [frequency_hz, amplitude 0-1, lfo_rate_hz, lfo_depth 0-1, lfo_phase_offset]
// Root note: D (73.4 Hz) — sombre, weighty
const LAYERS = [
    // Sub bass drone
    [36.7,  0.18, 0.04, 0.3, 0.0],
    // Root
    [73.4,  0.22, 0.05, 0.4, 0.3],
    // Fifth (A) — hollow fifth interval
    [110.0, 0.16, 0.07, 0.35, 1.1],
    // Octave
    [146.8, 0.12, 0.06, 0.3, 2.1],
    // Slightly detuned root for movement
    [73.9,  0.10, 0.03, 0.25, 0.8],
    // High shimmer (D5)
    [587.3, 0.04, 0.09, 0.5, 1.6],
    // Pad texture — minor 7th color
    [330.0, 0.06, 0.08, 0.4, 0.5],
];

// Slow fade in and fade out to avoid clicks at loop points
const FADE_SAMPLES = SAMPLE_RATE * 4; // 4 second fade

console.log(`Generating ${DURATION_SEC}s ambient drone (${totalSamples} samples)...`);

const samples = new Float32Array(totalSamples);

for (const [freq, amp, lfoRate, lfoDepth, lfoPhase] of LAYERS) {
    const angFreq = 2 * Math.PI * freq / SAMPLE_RATE;
    const lfoAngFreq = 2 * Math.PI * lfoRate / SAMPLE_RATE;

    for (let i = 0; i < totalSamples; i++) {
        const lfo = 1.0 - lfoDepth * (0.5 + 0.5 * Math.sin(lfoAngFreq * i + lfoPhase));
        samples[i] += amp * lfo * Math.sin(angFreq * i);
    }
}

// Apply fade in/out
for (let i = 0; i < FADE_SAMPLES; i++) {
    const t = i / FADE_SAMPLES;
    samples[i] *= t * t; // ease in
    samples[totalSamples - 1 - i] *= t * t; // ease out
}

// Normalize to prevent clipping
let peak = 0;
for (const s of samples) peak = Math.max(peak, Math.abs(s));
const gain = 0.85 / peak;

// Convert to 16-bit PCM
const pcm = new Int16Array(totalSamples);
for (let i = 0; i < totalSamples; i++) {
    pcm[i] = Math.round(Math.max(-1, Math.min(1, samples[i] * gain)) * 32767);
}

// Write WAV manually
const dataSize = pcm.length * 2;
const buf = Buffer.alloc(44 + dataSize);
buf.write('RIFF', 0);
buf.writeUInt32LE(36 + dataSize, 4);
buf.write('WAVE', 8);
buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16);        // chunk size
buf.writeUInt16LE(1, 20);         // PCM
buf.writeUInt16LE(1, 22);         // mono
buf.writeUInt32LE(SAMPLE_RATE, 24);
buf.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
buf.writeUInt16LE(2, 32);         // block align
buf.writeUInt16LE(16, 34);        // bits per sample
buf.write('data', 36);
buf.writeUInt32LE(dataSize, 40);
for (let i = 0; i < pcm.length; i++) buf.writeInt16LE(pcm[i], 44 + i * 2);

fs.writeFileSync(OUT_WAV, buf);
console.log(`WAV written to ${OUT_WAV}`);

// Convert to MP3 using ffmpeg
console.log('Converting to MP3...');
execSync(`ffmpeg -y -i ${OUT_WAV} -codec:a libmp3lame -b:a 128k -q:a 4 ${OUT_MP3}`, { stdio: 'inherit' });
console.log(`BGM saved to ${OUT_MP3}`);
