# Data layer

Knowledge representation for interactive, context-aware portfolio answers: explicit relationships in a graph, semantic prose in a vector index, plus separate stores for usefulness feedback and validity telemetry.

## Knowledge graph

Model professional history, projects, tech stacks, and creative work as connected nodes.

### Example shape

```text
(Rebecca)-[:BUILT]->(Project)-[:USES_TECH]->(TypeScript)
(Project)-[:RELATES_TO]->(Domain: MusicProduction)
(Rebecca)-[:HAS_ROLE]->(Role)-[:AT]->(Organization)
(Rebecca)-[:PUBLISHED]->(Media:Mix)
```

### Node kinds (v0)

- `Person`, `Organization`, `Role`, `Project`, `Tech`, `Domain`, `Media`, `Document`

### Edge kinds (v0)

- `BUILT`, `USES_TECH`, `RELATES_TO`, `HAS_ROLE`, `AT`, `PUBLISHED`, `DOCUMENTS`

v0 storage: lightweight file or SQLite-backed graph seed. Neo4j (or equivalent) is the later scale path when traversal volume or tooling needs grow.

## Vector index / RAG

Embeddings over resume chunks, blog posts, project documentation, and audio/mix transcripts or notes.

v0: local Chroma. Later: pgvector or a hosted vector store if ops prefer it.

Chunks should carry stable IDs so citations and claim `citation_ids` can point back to source spans.

## Hybrid retrieval

When an intent matches a query:

1. **Graph traversal** pulls structured relational context (e.g. tools used for a specific deployment).
2. **Vector search** pulls semantic matches (e.g. articles about CI pipelines).
3. Orchestrator merges refs into a bounded context pack for the generator.

Deterministic grounding rule: the LLM answers **only** from that context pack. Empty retrieval → configured fallback CTA (“I can’t find specific details on that…”) — never invent employers, dates, or project facts.

## Validity telemetry (distinct from feedback)

Machine-check outcomes are first-class data, not thumbs.

Suggested row fields:

- `message_id`, `intent`
- extracted claims (JSON)
- per-claim Stage A outcome: `SUPPORTED` | `CONTRADICTED` | `NOT_IN_GRAPH`
- Stage B ran?, `web_accuracy_confidence`, per-claim web tags, `evidence_urls`
- blended `accuracy_confidence`
- stripped/rewritten flags
- timestamps

Used for offline review, knowledge-gap repair, and CI golden suites.

## Feedback log (usefulness only)

Visitor thumbs-up/down or “Was this helpful?” widgets log:

- raw prompt, intent, retrieved refs, answer text
- helpful bool / optional comment
- visitor key, timestamps

Feedback may later inform index refresh or prompt iteration. It **must not** gate or override Stage A/B factual decisions.

## Web allowlist (Stage B)

Stage B corroboration fetches only configured public sources, for example:

- Personal site / portfolio canonical URLs
- Public GitHub profile or allowlisted repos
- Published posts on allowlisted domains
- Optional public profile pages if explicitly configured

No open-ended browsing of model-suggested arbitrary URLs. Allowlist lives in config (env or checked-in YAML), versioned with the knowledge seed where practical.
