# Portfolio AI — MVP scaffold

Intent-routed portfolio assistant with a **3D knowledge space** (React Three Fiber) + grounded chat.

**Status:** MVP scaffold on a **labeled demo seed** (fictional Avery Chen — not a real biography).

## Run locally

You need **Node.js 20+**, **npm**, and **Python 3.12+**.

### 1. Get the code on your machine

If you haven’t created a GitHub (or other) repo yet, use **Create repo** in the Cursor agent UI, then clone it:

```bash
git clone <your-repo-url>
cd <your-repo-folder>
```

If the repo already exists on your machine, `git pull` on `main` instead.

### 2. Start the API (terminal 1)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 43124
```

Leave this running. Health check: [http://127.0.0.1:43124/api/health](http://127.0.0.1:43124/api/health)

### 3. Start the web app (terminal 2)

```bash
cd frontend
cp .env.local.example .env.local   # first time only
npm install
npm run dev -- --port 43123 -H 127.0.0.1
```

### 4. Open the app

[http://127.0.0.1:43123](http://127.0.0.1:43123)

The Next app proxies `/api/*` to FastAPI on port **43124**, so you only open the frontend URL.

## What works in this slice

- Full-bleed R3F knowledge space with region clusters, totems, orbit/zoom
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
