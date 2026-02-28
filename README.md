# VoiceLog

A mobile-responsive web app for uploading, transcribing, and organizing voice recordings into structured projects. Upload an audio file, get a transcript and AI-generated summary back, and watch your project knowledge base grow with every recording.

The web app is purely frontend — all processing logic (transcription, summarization, storage) lives in n8n workflows.

---

## What It Does

- Upload audio recordings (mp3, m4a, wav, webm, ogg — max 25MB)
- Sends audio to Whisper API for transcription via n8n
- Generates per-recording summaries via self-hosted Ollama
- Auto-creates a project if no project context exists at upload time
- Builds a living project transcript (append-only) and an AI-updated project summary
- Discards audio after transcription — only text is stored in n8n Tables

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (mobile-responsive) |
| Orchestration | Self-hosted n8n |
| Transcription | Whisper API (called from n8n) |
| Summarization | Self-hosted Ollama on VPS (called from n8n) |
| Storage | n8n Tables |
| Auth | None — single user |

---

## Architecture

```
Web App (Next.js)
    │
    ├── POST audio + project_id → n8n Webhook
    │       │
    │       ├── Whisper API → raw transcript
    │       ├── Discard audio
    │       ├── Ollama → recording summary
    │       ├── Ollama → project title (first recording only)
    │       ├── Append to project transcript
    │       ├── Ollama → updated project summary
    │       └── Write to n8n Tables
    │
    └── Poll for status → navigate on completion
        Read project + recording data from n8n webhook endpoints
```

---

## Project Structure

```
/
├── app/                        # Next.js app directory
│   ├── page.tsx                # Home / project list (/)
│   └── projects/
│       └── [project_id]/
│           ├── page.tsx        # Project detail
│           └── recordings/
│               ├── page.tsx    # Recordings list
│               └── [recording_id]/
│                   └── page.tsx  # Recording detail
├── components/
│   ├── UploadSheet/            # Bottom sheet upload + processing flow
│   ├── TabView/                # Summary / Transcript tab pattern
│   └── SearchBar/              # Inline search with highlight
├── lib/
│   └── api.ts                  # n8n webhook calls + polling logic
├── docs/
│   └── PRD.md                  # Full product requirements document
└── README.md
```

---

## Routes

| Route | Page |
|---|---|
| `/` | Home — project list or empty state |
| `/projects/:project_id` | Project detail — summary, transcript, upload |
| `/projects/:project_id/recordings` | Recordings list (read-only) |
| `/projects/:project_id/recordings/:recording_id` | Recording detail (read-only) |

---

## n8n Workflows

| Workflow | Trigger | Description |
|---|---|---|
| WORKFLOW-001 | POST (webhook) | Upload audio, transcribe, summarize, store |
| WORKFLOW-002 | GET (webhook) | Return all projects |
| WORKFLOW-003 | GET (webhook) | Return single project detail |
| WORKFLOW-004 | GET (webhook) | Return recordings list for a project |
| WORKFLOW-005 | GET (webhook) | Return single recording detail |
| WORKFLOW-006 | PATCH (webhook) | Update project title / description |

---

## Processing Pipeline

```
Upload audio (web app)
    → POST to n8n webhook
    → Validate (format + size ≤ 25MB)
    → Auto-create project if no project_id
    → Submit to Whisper API → raw transcript
    → Discard audio
    → Ollama → recording summary
    → If first recording: Ollama → project title
    → Append transcript to project_transcript
    → Ollama → updated project_summary
    → Set status: done
    → Web app polls → navigates on completion
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Self-hosted n8n instance
- Whisper API key
- Ollama running on an accessible VPS

### Environment Variables

Copy `.env.local.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_N8N_BASE_URL=https://your-n8n-instance.com
NEXT_PUBLIC_N8N_WEBHOOK_PATH=webhook
```

The app calls `{BASE_URL}/{WEBHOOK_PATH}/voice-upload`, `.../projects`, `.../projects/:id`, etc.

### Install & Run

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`

### n8n Setup

1. **Create tables:** In n8n, open the **VoiceLog Bootstrap Tables** workflow and run it once (Execute Workflow) to create the Projects and Recordings data tables.
2. **Credentials:** In the **Upload & Process Recording** workflow, set the Whisper (OpenAI API) credential on the Whisper node. Ensure Ollama is reachable at `http://localhost:11434` (or update the Ollama nodes’ URL in that workflow).
3. **Activate:** Activate all six VoiceLog workflows (Upload & Process Recording, Get Projects, Get Project, Get Recordings, Get Recording, Update Project) so production webhooks are registered.
4. Your webhook base will be `https://your-n8n-instance.com/webhook/` with paths: `voice-upload`, `projects`, `projects/:project_id`, etc.

---

## Roadmap

- [x] MVP — upload, transcribe, summarize, organize via n8n
- [ ] In-app recording (Android, screen-off + Bluetooth)
- [ ] Chat interface for querying projects (LLM + VectorStore)
- [ ] Native mobile app (React Native)
- [ ] Multi-user / auth layer

---

## Docs

Full PRD with data model, task breakdown, n8n workflow specs, and UI details: [`docs/PRD.md`](./docs/PRD.md)
