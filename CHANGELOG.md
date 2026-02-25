# Changelog

All notable changes to this project will be documented here.

## [1.0.0] — 2026-02-25

### Initial release

#### Book
- 10-chapter investigation into male fertility decline
- Executive summary + epidemiological review with full references
- Part I: The Problem — epidemiology, critiques, psychology, socio-economics
- Part II: Causes — toxicology (EDCs/plastics), lifestyle factors
- Part III: Solutions — diagnostics, policy landscape, actionable guidance, epilogue
- Outputs: HTML (online), PDF, EPUB

#### Documentary Video
- Full-length documentary built with Remotion (React-based video framework)
- 216 narration segments generated with Kokoro-JS TTS (`am_adam` voice)
- Word-level karaoke highlighting via faster-whisper timestamp extraction
- 5 data visualisation slides with AI narration (sperm decline, plastics growth,
  testosterone trends, TFR collapse, IVF economics)
- Bookend narrations (intro + outro)
- Dynamic font sizing for long text passages
- Background music bed (looped ambient track)

#### Infrastructure
- GitHub Pages landing page with dark-themed design
- GitHub Actions: automatic Pages deploy on push
- GitHub Actions: manual video render workflow
- Audio assets stored in GitHub Release (too large for git)
