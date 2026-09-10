# Portfolio AI Assistant

Living specifications for an intent-routed portfolio web app: Next.js UI, FastAPI orchestration, BAML structured intents, hybrid graph + vector retrieval, and a machine validity stack (claim ledger + light allowlisted web confidence).

**Status:** specs first. No application runtime yet.

## Docs

Start here: [docs/architecture/overview.md](docs/architecture/overview.md)

| Doc | Contents |
| --- | --- |
| [overview.md](docs/architecture/overview.md) | Layers, request path, validity summary |
| [intents.md](docs/architecture/intents.md) | Intent catalog and BAML shape |
| [data.md](docs/architecture/data.md) | Graph, vectors, telemetry, web allowlist |
| [safety.md](docs/architecture/safety.md) | Defenses + Stages A/B validity |
| [quotas-identity.md](docs/architecture/quotas-identity.md) | Visitor keys, RPM/TPM, Stage B budget |
| [api.md](docs/architecture/api.md) | Chat / feedback / health sketches |
| [roadmap.md](docs/architecture/roadmap.md) | Implementation milestones |

## Design highlights

- **Intent routing** — classify queries (`EXPERIENCE_QUERY`, `PROJECT_LOOKUP`, `MEDIA_SEARCH`, …) and dispatch to specialized handlers instead of one undifferentiated chatbot.
- **Hybrid knowledge** — graph for relationships; vectors for semantic prose.
- **Validity without relying on visitors** — Stage A graph-checked claims always; Stage B optional allowlisted web corroboration returns accuracy confidence.
- **Feedback ≠ truth** — thumbs measure usefulness only.

## Local run

Not applicable until Milestone 1 (scaffold). See the roadmap for the build order.
