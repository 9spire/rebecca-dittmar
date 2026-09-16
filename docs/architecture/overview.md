# Architecture Overview

Living spec for an intent-routed portfolio AI assistant. This document is the entry point; details live in the sibling specs.

Reference diagram from the initial design session (four layers: Frontend → Backend/API → AI Orchestration → Data).

## Stack defaults

| Layer | Choice |
| --- | --- |
| Frontend | Next.js (App Router), TypeScript, Tailwind, shadcn/ui |
| Primary UX | Bespoke **React Three Fiber knowledge space** + chat dock ([interaction.md](./interaction.md)) |
| API / orchestration | Python FastAPI + BAML (+ LangChain/LangGraph-friendly) |
| Structured I/O | BAML schemas (strict typed outputs) |
| Knowledge graph (v0) | File/SQLite graph seed; Neo4j later |
| Vectors (v0) | Local Chroma; pgvector later |
| Quotas (v0) | In-process sliding window + multi-id visitor key; Redis later |
| Persona | Rebecca’s portfolio — engineering + projects + electronic music / mixes |
| LLM | Provider-agnostic interface with mock/offline fallback |
| Validity | Machine-checked (Stages A + B); visitor thumbs are usefulness-only |

## Four-layer system

```mermaid
flowchart TB
  subgraph frontend [Frontend]
    Space[KnowledgeSpace_R3F]
    Chat[ChatDock]
  end
  subgraph api [BackendAPI]
    GW[APIGateway]
  end
  subgraph orch [AIOrchestration]
    Orch[Orchestrator]
    Intent[IntentRouter_BAML]
    Gen[ResponseGenerator]
    Ver[VerifierGuardrails]
  end
  subgraph data [DataLayer]
    KG[KnowledgeGraph]
    Vec[VectorIndex]
    FB[FeedbackLog]
    Web[AllowlistedWebFetch]
  end
  Space <-->|selectionAndFocus| Chat
  Chat -->|userQuery_plus_selectedNodes| GW
  GW --> Orch
  Orch --> Intent
  Intent --> Orch
  Orch <--> KG
  Orch <--> Vec
  Orch --> Gen
  Gen --> Ver
  Ver <--> KG
  Ver -.-> Web
  Ver --> GW
  GW -->|answer_citations_cameraCues| Chat
  Chat -->|highlightPath| Space
  Chat -->|visitorFeedback_usefulnessOnly| FB
  FB -.-> Vec
```

## Request path

1. Visitor explores the **knowledge space** (orbit/zoom/select) and/or types in the chat dock.
2. API gateway applies identity + quota checks, then hands off to the orchestrator (message + optional selected node ids).
3. Intent router (BAML) classifies the query and extracts slots (selection can seed slots).
4. Orchestrator runs the specialized handler: graph traversal and/or vector retrieval (and media catalog when relevant).
5. Response generator drafts an answer **only** from retrieved context.
6. Verifier runs the **validity stack** (see below), then returns answer + accuracy metadata + citation/camera cues.
7. Frontend highlights the cited subgraph and flies the camera; optional thumbs log **usefulness** — never factual correctness.

## Validity stack (summary)

Correctness does not depend on visitors knowing the topic.

- **MVP:** retrieve from graph → generate only from that pack → empty retrieval fallback (no full claim ledger yet).
- **Enhancement 1 — Stage A:** claim ledger → graph fact check → strip/rewrite contradictions and ungrounded hard claims.
- **Enhancement 2 — Stage B:** allowlisted web corroboration on high-stakes intents → `web_accuracy_confidence` / blended `accuracy_confidence`. Graph still wins on conflicts. Offline/mock → `null` and skip Stage B.

Details: [safety.md](./safety.md). Rollout: [roadmap.md](./roadmap.md).

```mermaid
flowchart LR
  Gen[ResponseGenerator] --> Extract[ClaimExtractor_BAML]
  Extract --> GraphCheck[GraphFactChecker]
  GraphCheck -->|cleanedClaims| Gate[ValidityGate]
  GraphCheck --> WebLight[WebCorroboration_light]
  WebLight -->|confidenceAndTags| Gate
  Gate -->|answerPlusAccuracyMeta| API[APIGateway]
```

## Spec map

| Doc | Topic |
| --- | --- |
| [interaction.md](./interaction.md) | R3F knowledge space, chat↔graph loop |
| [knowledge.md](./knowledge.md) | What content enters the graph (MVP inventory) |
| [intents.md](./intents.md) | Intent catalog, BAML shape, handlers |
| [data.md](./data.md) | Graph, vectors, hybrid retrieval, telemetry |
| [safety.md](./safety.md) | Prompt defenses, Stages A/B, feedback role |
| [quotas-identity.md](./quotas-identity.md) | Visitor keys, RPM/TPM, Stage B budget |
| [api.md](./api.md) | Endpoint sketches |
| [roadmap.md](./roadmap.md) | **MVP first**, then enhancements |
