import fs from 'fs';
import path from 'path';

const CHUNKS_FILE = path.join(process.cwd(), 'data', 'chunks.json');
const DURATIONS_FILE = path.join(process.cwd(), 'data', 'chunk_durations.json');
const WORD_TIMINGS_FILE = path.join(process.cwd(), 'data', 'word_timings.json');
const CHART_NARRATIONS_FILE = path.join(process.cwd(), 'data', 'chart_narrations.json');
const CHART_AUDIO_DIR = path.join(process.cwd(), 'public', 'audio', 'charts');
const OUT_FILE = path.join(process.cwd(), 'data', 'script.json');

const FPS = 30;
const BACKGROUNDS = [
    'bg_toxicology.jpg',
    'bg_demographics.jpg',
    'bg_lifestyle.jpg',
    'bg_lab.jpg',
    'bg_abstract.jpg'
];

const CHAPTER_CHARTS = {
    'epi': { src: 'sperm_decline.png', title: 'Global Decline in Sperm Concentration (1973-2018)', audioId: 'chart_epi' },
    'toxicology': { src: 'plastics_growth.png', title: 'Exponential Growth in Plastic Production', audioId: 'chart_toxicology' },
    'lifestyle': { src: 'testosterone_decline.png', title: 'Age-Independent Testosterone Decline', audioId: 'chart_lifestyle' },
    'demographics': { src: 'tfr_collapse.png', title: 'Total Fertility Rate (TFR) Collapse', audioId: 'chart_demographics' },
    'you': { src: 'ivf_economics.png', title: 'The Economics of IVF access', audioId: 'chart_you' }
};

// Read actual audio duration from a WAV file — searches charts/ then audio/ root
function getChartAudioDuration(audioId) {
    try {
        const candidates = [
            path.join(CHART_AUDIO_DIR, `${audioId}.wav`),
            path.join(process.cwd(), 'public', 'audio', `${audioId}.wav`),
        ];
        const wavPath = candidates.find(p => fs.existsSync(p));
        if (!wavPath) return null;
        const buf = fs.readFileSync(wavPath);
        // Parse WAV header: data chunk size / byte rate
        const byteRate = buf.readUInt32LE(28);
        // Find 'data' chunk
        let offset = 12;
        while (offset < buf.length - 8) {
            const id = buf.slice(offset, offset + 4).toString('ascii');
            const size = buf.readUInt32LE(offset + 4);
            if (id === 'data') return size / byteRate;
            offset += 8 + size;
        }
        return null;
    } catch { return null; }
}

function main() {
    if (!fs.existsSync(CHUNKS_FILE) || !fs.existsSync(DURATIONS_FILE)) {
        console.error("Missing chunks.json or chunk_durations.json");
        return;
    }

    const chunksMeta = JSON.parse(fs.readFileSync(CHUNKS_FILE, 'utf8'));
    const durations = JSON.parse(fs.readFileSync(DURATIONS_FILE, 'utf8'));
    const wordTimings = fs.existsSync(WORD_TIMINGS_FILE)
        ? JSON.parse(fs.readFileSync(WORD_TIMINGS_FILE, 'utf8'))
        : {};

    const fullScript = [];
    let globalStartFrame = 0;

    // Intro: duration driven by narration audio length + 2s tail for the title to breathe
    const introDuration = getChartAudioDuration('intro_narration');
    const introDurationFrames = introDuration
        ? Math.ceil(introDuration * FPS) + 2 * FPS
        : 5 * FPS;
    fullScript.push({
        id: 'intro',
        title: 'Intro',
        globalStart: globalStartFrame,
        duration: introDurationFrames,
        subSlides: [{
            type: 'intro',
            start: 0,
            duration: introDurationFrames,
            audioSrc: 'audio/intro_narration.wav',
        }]
    });
    globalStartFrame += introDurationFrames;

    // Group chunks back by chapter
    const chapters = {};
    for (const chunk of chunksMeta) {
        if (!chapters[chunk.chapter_id]) {
            chapters[chunk.chapter_id] = { id: chunk.chapter_id, subSlides: [], durationFrames: 0 };
        }

        let durationSec = durations[chunk.chunk_id];
        let audioExists = true;

        // If the audio hasn't been generated yet, estimate the duration based on word count!
        // Average speaking rate: ~150 words per minute = 2.5 words per second.
        if (durationSec === undefined) {
            const wordCount = chunk.text.split(' ').length;
            durationSec = Math.max(wordCount / 2.8, 3); // minimum 3 seconds, assuming fast 1.2x pacing
            audioExists = false;
        }

        // ~0.4s breathing room after audio ends — enough to feel natural without dragging
        const PAUSE_BUFFER_FRAMES = Math.round(0.4 * FPS);
        const chunkFrames = Math.ceil(durationSec * FPS) + PAUSE_BUFFER_FRAMES;
        chapters[chunk.chapter_id].subSlides.push({
            type: 'quote',
            chunk_id: chunk.chunk_id,
            audio_exists: audioExists,
            text: chunk.text,
            duration: chunkFrames,
            bgImage: BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)],
            wordTimings: wordTimings[chunk.chunk_id] || null,
        });
        chapters[chunk.chapter_id].durationFrames += chunkFrames;
    }

    for (const chapterId of Object.keys(chapters)) {
        const chapter = chapters[chapterId];

        const bumperFrames = 3 * FPS;
        const chapterObj = {
            id: chapter.id,
            title: chapter.id.toUpperCase(),
            globalStart: globalStartFrame,
            duration: chapter.durationFrames + bumperFrames,
            subSlides: []
        };

        let localStart = 0;

        // Prepend bumper
        chapterObj.subSlides.push({
            type: 'bumper',
            start: localStart,
            duration: bumperFrames,
            title: chapter.id.toUpperCase()
        });
        localStart += bumperFrames;

        // Inject thematic chart if exists for this chapter (at the start after bumper)
        if (CHAPTER_CHARTS[chapterId]) {
            const chart = CHAPTER_CHARTS[chapterId];
            const audioDuration = chart.audioId ? getChartAudioDuration(chart.audioId) : null;
            // Use actual audio duration + 0.5s tail, or fall back to 6s
            const PAUSE_BUFFER_FRAMES = Math.round(0.5 * FPS);
            const chartFrames = audioDuration
                ? Math.ceil(audioDuration * FPS) + PAUSE_BUFFER_FRAMES
                : 6 * FPS;
            chapterObj.subSlides.push({
                type: 'chart',
                start: localStart,
                duration: chartFrames,
                chartSrc: chart.src,
                title: chart.title,
                audioSrc: chart.audioId ? `audio/charts/${chart.audioId}.wav` : null,
                bgImage: BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)]
            });
            localStart += chartFrames;
            chapterObj.duration += chartFrames;
        }

        for (const slide of chapter.subSlides) {
            slide.start = localStart;
            chapterObj.subSlides.push(slide);
            localStart += slide.duration;
        }

        fullScript.push(chapterObj);
        globalStartFrame += chapterObj.duration;
    }

    // Credits: duration driven by outro narration audio length + 3s tail
    const outroDuration = getChartAudioDuration('outro_narration');
    const creditsDurationFrames = outroDuration
        ? Math.ceil(outroDuration * FPS) + 3 * FPS
        : 10 * FPS;
    fullScript.push({
        id: 'credits',
        title: 'Credits',
        globalStart: globalStartFrame,
        duration: creditsDurationFrames,
        subSlides: [{
            type: 'credits',
            start: 0,
            duration: creditsDurationFrames,
            audioSrc: 'audio/outro_narration.wav',
        }]
    });

    fs.writeFileSync(OUT_FILE, JSON.stringify(fullScript, null, 2));
    console.log(`Generated exact-synced script JSON (${(globalStartFrame / FPS / 60).toFixed(1)} mins total).`);
}

main();
