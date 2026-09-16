# Roadmap

Technical milestones only — no calendar estimates. Specs come first; each later phase can revise these docs.

## Milestone 0 — Specs (current)

- Living architecture docs under `docs/architecture/`
- Validity stack (Stage A claim ledger + Stage B light web confidence) documented
- Intent catalog, API sketches, quotas/identity, data model sketched
- **R3F knowledge space** chosen as primary interaction surface ([interaction.md](./interaction.md))

## Milestone 1 — Scaffold

- Next.js frontend shell: chat dock + placeholder full-bleed canvas host
- FastAPI service with health + stub `POST /api/chat` (+ stub `GET /api/graph`)
- Shared types / OpenAPI alignment for chat, feedback, graph scene, camera/highlight cues
- Mock LLM path so local demos run without credentials

## Milestone 2 — Knowledge space v0 (visual)

- Client-only R3F Canvas with orbit/zoom, region layout, sample nodes/edges
- Custom totems / type markers; idle drift + focus fly-to
- Selection HUD wired to local state (not yet live AI)
- Reduced-motion + WebGL fallback list

## Milestone 3 — Intent stub

- BAML intent classification wired end-to-end
- Handler dispatch table for all v0 intents
- Off-topic / unsafe paths returning correct refusals/redirects
- Chat accepts `selected_node_ids`; stub retrieval

## Milestone 4 — Graph + RAG seed

- SQLite/file graph seed with sample Person/Project/Tech/Media + `region` metadata
- Vector index over seeded docs
- Hybrid retrieval into a bounded context pack
- Deterministic grounding + empty-retrieval fallback CTA
- Live `GET /api/graph` feeds the scene

## Milestone 5 — Chat ↔ scene coupling

- Completion `highlight` + `camera` cues drive path lighting and fly-to / region moves
- Intent-aware region bias (e.g. `MEDIA_SEARCH` → music region)
- Citation click-back from chat to node focus

## Milestone 6 — Stage A validity

- BAML claim extractor
- Graph fact checker (`SUPPORTED` / `CONTRADICTED` / `NOT_IN_GRAPH`)
- Strip/rewrite policy for hard claims
- Validity telemetry store
- First golden question → expected claims suite in CI

## Milestone 7 — Stage B light web confidence

- Allowlist config + fetch/search adapter
- Structured corroboration judge → `web_accuracy_confidence` + per-claim tags
- Blend into `accuracy_confidence` on API responses
- Stage B quota budget; offline `null` behavior
- High-stakes intent gating only

## Milestone 8 — Quotas, identity, feedback UX

- Composite visitor key (IP heuristics + cookie + session)
- RPM + TPM sliding window / token bucket
- Thumbs usefulness widget + feedback log (not correctness)
- Optional confidence affordance in UI

## Milestone 9 — Polish

- Prompt bookends / delimiter hardening pass
- Input moderation + output leak checks
- Scene art pass (totems, lighting, postprocessing discipline)
- Neo4j / pgvector / Redis upgrades when single-node limits hurt
- Knowledge ingest tooling for ongoing graph/vector updates
