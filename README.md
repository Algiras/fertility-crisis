# The Male Fertility Crisis

> *Epidemiological Trends, Etiological Mechanisms, and the Silent Trauma*
> — Algimantas K., 2026

An investigation into one of the most urgent and overlooked public health emergencies of our time — published as a book, documentary film, and interactive web experience.

---

## Live

| | |
|---|---|
| **Website** | [algiras.github.io/fertility-crisis](https://algiras.github.io/fertility-crisis) |
| **Read online** | [algiras.github.io/fertility-crisis/book](https://algiras.github.io/fertility-crisis/book) |
| **Download PDF** | [The-Male-Fertility-Crisis.pdf](https://algiras.github.io/fertility-crisis/book/The-Male-Fertility-Crisis.pdf) |
| **Download EPUB** | [The-Male-Fertility-Crisis.epub](https://algiras.github.io/fertility-crisis/book/The-Male-Fertility-Crisis.epub) |

---

## Repository Structure

```
ferility-crisis/
├── book/                        # Quarto book source
│   ├── _quarto.yml              # Book configuration
│   ├── index.qmd                # Preface
│   ├── 00-executive-summary.qmd
│   ├── 01-epidemiology.qmd      # Part I — The Problem
│   ├── 02-critiques.qmd
│   ├── 03-toxicology.qmd        # Part II — The Causes
│   ├── 04-lifestyle.qmd
│   ├── 05-diagnostics.qmd       # Part III — Solutions
│   ├── ...
│   └── _book/                   # Built output (HTML, PDF, EPUB)
│
├── video/                       # Remotion documentary video project
│   ├── src/
│   │   ├── Video.tsx            # Main composition
│   │   ├── components/
│   │   │   ├── TitleCard.tsx    # Opening title
│   │   │   ├── QuoteSlide.tsx   # Narration slides w/ karaoke highlight
│   │   │   ├── ChartSlide.tsx   # Data visualisation slides
│   │   │   ├── SectionBumper.tsx
│   │   │   └── CreditsSlide.tsx
│   │   └── index.ts
│   ├── data/
│   │   ├── chunks.json          # 216 TTS narration segments
│   │   ├── chunk_durations.json # Actual audio durations (WAV headers)
│   │   ├── word_timings.json    # Per-word Whisper timestamps (karaoke)
│   │   ├── script.json          # Generated timing manifest for Remotion
│   │   ├── chart_narrations.json
│   │   └── bookend_narrations.json
│   ├── public/
│   │   ├── audio/
│   │   │   ├── chunks/          # 216 TTS WAV files (excluded from git →
│   │   │   │                    #   see audio-assets release)
│   │   │   ├── charts/          # Chart narration WAVs (5 files)
│   │   │   ├── intro_narration.wav
│   │   │   └── outro_narration.wav
│   │   └── images/              # Background images, chart PNGs
│   ├── generate_script.mjs      # Builds script.json from timing data
│   ├── generate_audio_kokoro.mjs # TTS: Kokoro-JS → 216 WAV chunks
│   ├── generate_bookend_audio.mjs# TTS: intro + outro narrations
│   ├── generate_chart_audio.mjs # TTS: 5 chart narrations
│   ├── extract_word_timings.py  # Whisper STT → word_timings.json
│   └── calculate_chunk_durations.mjs # Reads WAV headers → durations JSON
│
├── docs/                        # GitHub Pages root
│   ├── index.html               # Landing page
│   └── book/                    # Mirrored book output
│
└── .github/workflows/
    ├── pages.yml                # Build book + deploy GitHub Pages on push
    └── render-video.yml         # Manual trigger: render & release MP4
```

---

## The Book

Written in [Quarto](https://quarto.org/), the book covers:

| Part | Chapters |
|---|---|
| **Part I — The Problem** | Epidemiology · Scientific Critiques · Psychology & Trauma · Socio-Economics |
| **Part II — The Causes** | Toxicology (EDCs, plastics) · Lifestyle & Behaviour |
| **Part III — Solutions** | Diagnostics · Policy · What You Can Do · Epilogue |

### Build locally

```bash
cd book
quarto render
# Output: book/_book/
```

Requires [Quarto](https://quarto.org/docs/get-started/) and TinyTeX (`quarto install tinytex`).

---

## The Documentary

A data-driven documentary built entirely with code using [Remotion](https://www.remotion.dev/).

**Features:**
- AI narration via [Kokoro-JS](https://github.com/xenova/kokoro-js) TTS (`am_adam` voice)
- Word-level karaoke highlighting using [faster-whisper](https://github.com/SYSTRAN/faster-whisper) timestamps
- Dynamic font sizing for long passages
- Animated data visualisations (sperm decline, testosterone trends, IVF economics)
- Chapter bumpers, chart narrations, bookend intro/outro
- Background music bed (looped ambient track)

### Dev server

```bash
cd video
npm install
# Download audio assets from the audio-assets release first (see below)
npm start
# Open http://localhost:3000
```

### Generate audio (first time)

```bash
cd video

# 1. Generate 216 narration chunks (~30min, requires Node 20+)
node generate_audio_kokoro.mjs

# 2. Generate chart narrations (5 files)
node generate_chart_audio.mjs

# 3. Generate bookend narrations
node generate_bookend_audio.mjs

# 4. Extract word timings via Whisper (~20min, requires Python + faster-whisper)
pip install faster-whisper
python extract_word_timings.py

# 5. Calculate durations from WAV headers
node calculate_chunk_durations.mjs

# 6. Rebuild timing manifest
node generate_script.mjs
```

### Render video locally

```bash
cd video
npx remotion render src/index.ts FertilityCrisis out/FertilityCrisis.mp4
```

### Audio assets (prebuilt)

The 216 narration WAVs (~430MB) and background music are stored in the
[audio-assets](https://github.com/Algiras/fertility-crisis/releases/tag/audio-assets)
GitHub Release. Download and unpack before rendering:

```bash
# Using GitHub CLI
gh release download audio-assets \
  --repo Algiras/fertility-crisis \
  --pattern "audio-chunks.tar.gz" --dir /tmp/audio-assets
gh release download audio-assets \
  --repo Algiras/fertility-crisis \
  --pattern "bgm.wav" --dir /tmp/audio-assets

tar -xzf /tmp/audio-assets/audio-chunks.tar.gz \
  -C video/public/audio/chunks/
cp /tmp/audio-assets/bgm.wav video/public/audio/bgm.wav
```

---

## CI / GitHub Actions

| Workflow | Trigger | What it does |
|---|---|---|
| **pages.yml** | Push to `main` | Builds Quarto book, deploys `docs/` to GitHub Pages |
| **render-video.yml** | Manual (`workflow_dispatch`) | Downloads audio assets, renders MP4 with Remotion, uploads to GitHub Release |

To render the video via CI: go to **Actions → Render Documentary Video → Run workflow**.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Quarto](https://quarto.org/) | Book (HTML / PDF / EPUB) |
| [Remotion](https://www.remotion.dev/) | Programmatic video (React) |
| [Kokoro-JS](https://github.com/xenova/kokoro-js) | Local TTS (ONNX, `am_adam`) |
| [faster-whisper](https://github.com/SYSTRAN/faster-whisper) | Word-level timestamp extraction |
| [ffmpeg](https://ffmpeg.org/) | Audio resampling (24kHz → 44.1kHz) |
| GitHub Actions | CI: Pages deploy + video render |
| GitHub Pages | Hosting |

---

## Key Statistics

- **−59%** global sperm concentration decline (1973–2018)
- **1 in 6** couples affected by infertility worldwide
- **50%** of infertility cases have a male factor
- **2045** projected year median sperm count reaches zero (Levine et al.)

> *The science is clear. The decline is real. And the window to reverse it is narrowing.*

---

## License

Content © 2026 Algimantas K. All rights reserved.
Code (video pipeline, generators) is MIT licensed.
