"""
Extract per-word timestamps from all chunk WAV files using faster-whisper.
Outputs data/word_timings.json: { chunk_id: [{ word, start, end }, ...] }
"""
import json
import os
import sys
from pathlib import Path

CHUNKS_DIR = Path(__file__).parent / "public/audio/chunks"
OUT_FILE = Path(__file__).parent / "data/word_timings.json"

def main():
    from faster_whisper import WhisperModel

    wav_files = sorted(CHUNKS_DIR.glob("*.wav"))
    if not wav_files:
        print("No WAV files found in", CHUNKS_DIR)
        sys.exit(1)

    print(f"Loading Whisper model (base.en)...")
    model = WhisperModel("base.en", device="cpu", compute_type="int8")

    # Load existing timings so we can resume
    timings = {}
    if OUT_FILE.exists():
        timings = json.loads(OUT_FILE.read_text())
        print(f"Resuming — {len(timings)} already processed.")

    total = len(wav_files)
    for i, wav_path in enumerate(wav_files):
        chunk_id = wav_path.stem
        if chunk_id in timings:
            print(f"  [{i+1}/{total}] Skipping {chunk_id}")
            continue

        print(f"  [{i+1}/{total}] Processing {chunk_id}...", end=" ", flush=True)
        try:
            segments, _ = model.transcribe(
                str(wav_path),
                word_timestamps=True,
                language="en",
                beam_size=1,
                condition_on_previous_text=False,
            )
            words = []
            for seg in segments:
                if seg.words:
                    for w in seg.words:
                        words.append({
                            "word": w.word.strip(),
                            "start": round(w.start, 3),
                            "end": round(w.end, 3),
                        })
            timings[chunk_id] = words
            # Save after every chunk so we can resume
            OUT_FILE.write_text(json.dumps(timings, indent=2))
            print(f"{len(words)} words")
        except Exception as e:
            print(f"ERROR: {e}")
            timings[chunk_id] = []

    print(f"\nDone. Saved to {OUT_FILE}")

if __name__ == "__main__":
    main()
