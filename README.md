# Portfolio AI — MVP scaffold

Intent-routed portfolio assistant with a **3D knowledge space** (React Three Fiber) + grounded chat.

**Status:** MVP scaffold on a **labeled demo seed** (fictional Avery Chen — not a real biography).

## Quick start

### Backend (port 43124)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 43124 --app-dir .
```

Note: run uvicorn from `backend/` with `app.main:app`. The seed file is loaded from `../data/demo/graph.json`.

### Frontend (port 43123)

```bash
cd frontend
cp .env.local.example .env.local   # if needed
npm install
npm run dev -- --port 43123 -H 127.0.0.1
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

## What works in this slice

- Full-bleed R3D knowledge space with region clusters, totems, orbit/zoom
- Node selection feeds chat
- FastAPI `GET /api/graph`, `POST /api/chat`, `GET /api/health`
- Keyword intent routing + **graph-only** grounded answers (mock, no LLM key)
- Highlight path + camera fly-to on answers

## Docs

- [Architecture overview](docs/architecture/overview.md)
- [MVP roadmap](docs/architecture/roadmap.md)
- [Knowledge inventory](docs/architecture/knowledge.md)
- [Interaction / R3F](docs/architecture/interaction.md)

## Demo seed

[`data/demo/graph.json`](data/demo/graph.json) — `"demo": true`. Replace with real approved facts before presenting as a live portfolio.
