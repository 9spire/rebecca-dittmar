# Roadmap

Technical milestones only — no calendar estimates. Specs come first; each later phase can revise these docs.

## Milestone 0 — Specs (current)

- Living architecture docs under `docs/architecture/`
- Validity stack (Stage A claim ledger + Stage B light web confidence) documented
- Intent catalog, API sketches, quotas/identity, data model sketched

## Milestone 1 — Scaffold

- Next.js frontend shell with chat surface (empty/loading/error states)
- FastAPI service with health + stub `POST /api/chat`
- Shared types / OpenAPI alignment for chat + feedback payloads
- Mock LLM path so local demos run without credentials

## Milestone 2 — Intent stub

- BAML intent classification wired end-to-end
- Handler dispatch table for all v0 intents
- Off-topic / unsafe paths returning correct refusals/redirects
- No real knowledge required yet (stub retrieval)

## Milestone 3 — Graph + RAG seed

- SQLite/file graph seed with sample Person/Project/Tech/Media
- Vector index over seeded docs
- Hybrid retrieval into a bounded context pack
- Deterministic grounding + empty-retrieval fallback CTA

## Milestone 4 — Stage A validity

- BAML claim extractor
- Graph fact checker (`SUPPORTED` / `CONTRADICTED` / `NOT_IN_GRAPH`)
- Strip/rewrite policy for hard claims
- Validity telemetry store
- First golden question → expected claims suite in CI

## Milestone 5 — Stage B light web confidence

- Allowlist config + fetch/search adapter
- Structured corroboration judge → `web_accuracy_confidence` + per-claim tags
- Blend into `accuracy_confidence` on API responses
- Stage B quota budget; offline `null` behavior
- High-stakes intent gating only

## Milestone 6 — Quotas, identity, feedback UX

- Composite visitor key (IP heuristics + cookie + session)
- RPM + TPM sliding window / token bucket
- Thumbs usefulness widget + feedback log (not correctness)
- Optional confidence affordance in UI

## Milestone 7 — Polish

- Prompt bookends / delimiter hardening pass
- Input moderation + output leak checks
- Neo4j / pgvector / Redis upgrades when single-node limits hurt
- Knowledge ingest tooling for ongoing graph/vector updates
