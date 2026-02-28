# VoiceLog

A mobile-responsive web app for uploading, transcribing, and organizing voice recordings into structured projects. Upload an audio file, get a transcript and summary back, and watch your project knowledge base grow with every recording.

---

## What It Does

- Upload audio recordings (mp3, m4a, wav, webm, ogg — max 25MB)
- Transcribes audio via the Whisper API
- Generates per-recording summaries via a self-hosted Ollama instance
- Organizes recordings into projects with a living transcript and an AI-updated project summary
- Discards audio after transcription — only text is stored

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (mobile-responsive) |
| Transcription | Whisper API |
| Summarization | Ollama (self-hosted on VPS) |
| Storage | Database TBD — transcripts and summaries only |
| Auth | None — single user |

---

## Project Structure

```
/
├── app/                  # Next.js app directory
│   ├── page.tsx          # Home / project list (/)
│   ├── projects/
│   │   └── [project_id]/
│   │       ├── page.tsx                        # Project detail
│   │       └── recordings/
│   │           ├── page.tsx                    # Recordings list
│   │           └── [recording_id]/
│   │               └── page.tsx                # Recording detail
├── components/           # Shared UI components
│   ├── UploadSheet/      # Bottom sheet upload flow
│   ├── TabView/          # Summary / Transcript tab pattern
│   └── SearchBar/        # Inline search with highlight
├── lib/
│   ├── whisper.ts        # Whisper API integration
│   ├── ollama.ts         # Ollama summarization calls
│   └── processing.ts     # Upload → transcribe → summarize pipeline
├── docs/
│   └── PRD.md            # Full product requirements document
└── README.md
```

---

## Routes

| Route | Page |
|---|---|
| `/` | Home — project list or empty state |
| `/projects/:project_id` | Project detail — summary, transcript, upload |
| `/projects/:project_id/recordings` | Recordings list |
| `/projects/:project_id/recordings/:recording_id` | Recording detail |

---

## Processing Pipeline

```
Upload audio
    → Validate (format + size ≤ 25MB)
    → Submit to Whisper API
    → Receive raw transcript
    → Discard audio
    → Generate recording summary (Ollama)
    → If first recording: generate project title (Ollama)
    → Append transcript to project transcript
    → Regenerate project summary (Ollama)
    → Done
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Whisper API key
- Ollama running on a accessible VPS or locally

### Environment Variables

```bash
WHISPER_API_KEY=your_key_here
OLLAMA_BASE_URL=http://your-vps:11434
OLLAMA_MODEL=your_model_name
```

### Install & Run

```bash
git clone https://github.com/yourusername/voicelog.git
cd voicelog
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

## Roadmap

- [x] MVP — upload, transcribe, summarize, organize
- [ ] In-app recording (Android, screen-off + Bluetooth)
- [ ] Chat interface for querying projects (LLM + VectorStore)
- [ ] Multi-user / auth layer
- [ ] Native mobile app (React Native)

---

## Docs

Full PRD with data model, task breakdown, and UI specs: [`docs/PRD.md`](./docs/PRD.md)
