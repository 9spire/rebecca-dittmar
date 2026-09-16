# API sketches

HTTP shapes for the first implementation slice. Transport may be JSON request/response or SSE for streamed tokens; accuracy metadata is always available at completion.

Base path assumption: FastAPI service mounted behind the Next.js app (rewrites or separate origin). Exact hosting is deferred.

## `POST /api/chat`

Accept a visitor query; return grounded answer plus validity metadata.

### Request

```json
{
  "message": "What is your experience with CI/CD?",
  "session_id": "optional-client-session-uuid",
  "conversation_id": "optional-thread-id",
  "selected_node_ids": ["tech:cicd", "project:deploy-pipeline"]
}
```

`selected_node_ids` come from the R3F knowledge space selection (see [interaction.md](./interaction.md)). Identity cookies/headers are read by the gateway (see [quotas-identity.md](./quotas-identity.md)). Do not trust client-supplied visitor IDs as the sole key.

### Response (completion payload)

```json
{
  "conversation_id": "…",
  "message_id": "…",
  "intent": "EXPERIENCE_QUERY",
  "answer": "…",
  "citations": [
    { "source_type": "graph", "id": "project:deploy-pipeline", "label": "Deploy Pipeline" },
    { "source_type": "vector", "id": "chunk:resume-cicd", "label": "Resume — CI/CD" }
  ],
  "highlight": {
    "node_ids": ["project:deploy-pipeline", "tech:github-actions"],
    "edge_ids": ["e:project-uses-gha"]
  },
  "camera": {
    "mode": "fit_path",
    "focus_node_ids": ["project:deploy-pipeline", "tech:github-actions"],
    "region": "projects"
  },
  "accuracy": {
    "accuracy_confidence": 0.86,
    "web_accuracy_confidence": 0.72,
    "stage_a": {
      "claims_total": 4,
      "supported": 3,
      "contradicted": 0,
      "not_in_graph": 1,
      "stripped_hard_claims": 1
    },
    "stage_b": {
      "ran": true,
      "per_claim": [
        { "claim_id": "c1", "tag": "CORROBORATED" },
        { "claim_id": "c2", "tag": "UNSEEN_ON_WEB" }
      ],
      "evidence_urls": ["https://github.com/example/repo"]
    }
  },
  "fallback": false
}
```

Notes:

- `web_accuracy_confidence` is `null` when Stage B is skipped (ineligible intent, quota, or offline/mock).
- `accuracy_confidence` is the blended score (graph support rate ± optional web score). When Stage B is null, blend = Stage A only.
- `fallback: true` when retrieval was empty or all hard claims were stripped — answer should be the configured CTA, not invented prose.
- `highlight` / `camera` drive the knowledge space after completion (path lighting + fly-to / fit / region). Omit or no-op when the client has WebGL disabled.
- Streaming: tokens may arrive on an SSE channel; `accuracy`, `highlight`, and `camera` are sent on a final event.

## `GET /api/graph`

Return the client scene payload (nodes/edges with `kind`, `region`, optional totem/emoji markers). May be static seed in early milestones.

### Errors

| Status | Meaning |
| --- | --- |
| 429 | RPM/TPM or Stage B budget exceeded |
| 400 | Malformed body |
| 503 | Upstream LLM unavailable and no mock path |

## `POST /api/feedback`

Usefulness only. Never treated as a factual correctness signal.

### Request

```json
{
  "message_id": "…",
  "helpful": true,
  "comment": "optional short note"
}
```

### Response

```json
{ "ok": true }
```

Logged fields (see [data.md](./data.md)): prompt, intent, retrieved refs, answer, thumbs, visitor key, timestamps. Validity telemetry is stored separately from this usefulness log.

## `GET /api/health`

Liveness/readiness for the API process and (later) dependency checks for graph/vector stores.

## Later

- Admin knowledge ingest / graph seed refresh
- Eval harness trigger for golden claim suites (CI-oriented, not public)
