# NEXUS
### Autonomous Multi-Agent Investment Intelligence Operating System

NEXUS is a two-part system:

1. **Frontend** — a cinematic, scroll-driven Next.js experience (Three.js / React Three Fiber / GSAP / Lenis / Framer Motion) that introduces the system, plus a real working **Command Center** dashboard where you actually run analyses.
2. **Backend** — an Express + TypeScript API that orchestrates **ten independent AI agents** through a **LangGraph** state graph, each reasoning via **Google Gemini**, with JWT auth, a lightweight JSON database, rate limiting, caching, structured logging, a live websocket agent monitor, and a PDF report generator.

---

## A note on scope

This is a real, working, from-scratch implementation of the architecture — not a mockup. It is intentionally scoped to **7 cinematic scenes** (Boot Sequence → Particle Universe → Neural Network → Data Highways → Financial Cosmos → AI Board Room → Command Center) rather than twelve, and to a clean, readable visual language rather than claiming to have invented entirely novel interaction paradigms. Every agent call is a genuine request to the Gemini API — there is no mocked or hardcoded analysis data. You will need your own `GEMINI_API_KEY` for the agents to produce real output.

---

## Architecture

```
nexus/
├── frontend/                  Next.js 14 (App Router) + TypeScript + Tailwind
│   ├── app/                   Routes: / (scroll journey), /login, /dashboard
│   ├── components/
│   │   ├── scenes/            R3F scene components (particles, neural graph, data highway, helix)
│   │   ├── dashboard/         TickerForm, LiveAgentMonitor, ResultsPanel
│   │   └── ScrollController   GSAP ScrollTrigger → per-scene scroll progress
│   ├── context/AuthContext    JWT session state
│   ├── hooks/                 useLenis (smooth scroll), useAgentStream (websocket)
│   ├── lib/                   api.ts (fetch client), scrollStore.ts (zustand), types.ts
│   └── shaders/               Custom GLSL (as TS string exports) for particle + pulse effects
│
└── backend/                    Express + TypeScript
    ├── src/agents/             10 independent agent modules (Research, News, Financial,
    │                           Macro, Risk, Sentiment, Forecast, Memory, Decision, CEO)
    ├── src/graph/              LangGraph StateGraph wiring the agents into a DAG
    ├── src/routes/             auth, agents (analyze/runs/memory), reports (PDF)
    ├── src/middleware/         JWT auth, rate limiting, centralized error handling
    ├── src/services/           Gemini client, in-memory cache, Winston logger
    ├── src/ws/                 Websocket "Live Agent Monitor" broadcaster
    └── src/db/                 lowdb (JSON file) schema + accessor — swap for Postgres/Prisma in production
```

### The agent graph

```
        ┌─ Research ─┐
START ──┼─ News ─────┼──► Sentiment ─┐
        ├─ Financial ┤               ├─► Forecast ─┐
        └─ Macro ────┴──► Risk ──────┘   Memory ───┴─► Decision ─► CEO ─► END
```

- **Stage 1** (parallel, independent): Research, News, Financial, Macro
- **Stage 2**: Risk (reads Research + Financial), Sentiment (reads News + Macro)
- **Stage 3**: Forecast and Memory (read everything above)
- **Stage 4**: Decision synthesizes all eight agents into one call
- **Stage 5**: CEO agent stages a 3-persona board debate and renders the final verdict

Every stage is a real `@langchain/langgraph` `StateGraph` node — see `backend/src/graph/investmentGraph.ts`.

---

## Setup

### Prerequisites
- Node.js 18+
- A Google Gemini API key: https://aistudio.google.com/app/apikey

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env and set GEMINI_API_KEY + JWT_SECRET
npm install
npm run dev        # http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:3000
```

Open http://localhost:3000, scroll through the journey, then sign up and run a real ticker analysis from the Command Center.

---

## Environment variables

### `backend/.env`
| Variable | Description |
|---|---|
| `PORT` | Backend port (default 4000) |
| `CLIENT_ORIGIN` | Allowed CORS origin for the frontend |
| `JWT_SECRET` | Secret used to sign auth tokens — change this |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `7d` |
| `GEMINI_API_KEY` | Your Google AI Studio key — **required** for agents to run |
| `GEMINI_MODEL` | Defaults to `gemini-1.5-pro` |
| `DB_PATH` | Path to the JSON database file |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` | API rate limiting |
| `CACHE_TTL_SECONDS` | In-memory cache TTL for repeated agent calls |

### `frontend/.env`
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL |
| `NEXT_PUBLIC_WS_URL` | Backend websocket base URL |

---

## API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create an account |
| POST | `/api/auth/login` | – | Sign in, returns a JWT |
| GET | `/api/auth/me` | ✓ | Current user |
| POST | `/api/agents/analyze` | ✓ | Run the full 10-agent graph for a ticker |
| GET | `/api/agents/runs` | ✓ | List your past analysis runs |
| GET | `/api/agents/runs/:id` | ✓ | Fetch one run |
| GET | `/api/agents/memory/:ticker` | ✓ | Company Memory entries for a ticker |
| GET | `/api/reports/:runId/pdf` | ✓ | Download a generated PDF report |
| WS | `/ws/agents?token=...` | ✓ | Live Agent Monitor event stream |

---

## Features implemented

- ✅ AI Board of Directors + Debate Engine (CEO agent, 3 personas)
- ✅ Investment Timeline + basic Alternate Reality Scenario (Forecast agent)
- ✅ Hidden Risk Detection (Risk agent)
- ✅ Company Memory (Memory agent + persisted insights per ticker)
- ✅ Confidence Engine (every agent + final decision carries a 0–100 score)
- ✅ Interactive Report (Command Center dashboard) + PDF Generator
- ✅ Live Agent Monitor (websocket, real-time per-agent completion)
- ✅ CEO Mode / Investor Mode / Student Mode (Explain Like I'm Five)
- ✅ JWT authentication, rate limiting, structured logging, caching

### Not included in this pass (clearly out of scope for one deliverable)
- Voice assistant, AI avatar, and a full Knowledge Graph visualization
- A production database (ships with a JSON file store — swap in Postgres/Prisma easily since the DB layer is isolated in `backend/src/db`)
- Live market data / news feeds (agents reason from the LLM's knowledge — see the caveats each agent returns)

---

## Deployment

- **Frontend**: deploy `frontend/` to Vercel directly (`vercel.json` is preconfigured). Set `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` to your deployed backend.
- **Backend**: deploy `backend/` to any Node host (Render, Fly.io, Railway, a VPS). Run `npm run build && npm start`. Make sure the JSON DB path is on a persistent volume, or swap in a real database for production.

---

## License

MIT — do whatever you want with this.
