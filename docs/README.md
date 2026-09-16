# Portfolio AI Assistant

Living specifications for an intent-routed portfolio web app: a **React Three Fiber knowledge space** paired with chat, FastAPI orchestration, BAML structured intents, hybrid graph + vector retrieval, and a machine validity stack (claim ledger + light allowlisted web confidence).

**Status:** specs first. No application runtime yet.

## Docs

Start here: [docs/architecture/overview.md](docs/architecture/overview.md)

| Doc | Contents |
| --- | --- |
| [overview.md](docs/architecture/overview.md) | Layers, request path, validity summary |
| [interaction.md](docs/architecture/interaction.md) | R3F knowledge space + chat↔graph loop |
| [intents.md](docs/architecture/intents.md) | Intent catalog and BAML shape |
| [data.md](docs/architecture/data.md) | Graph, vectors, telemetry, web allowlist |
| [safety.md](docs/architecture/safety.md) | Defenses + Stages A/B validity |
| [quotas-identity.md](docs/architecture/quotas-identity.md) | Visitor keys, RPM/TPM, Stage B budget |
| [api.md](docs/architecture/api.md) | Chat / feedback / graph / health sketches |
| [roadmap.md](docs/architecture/roadmap.md) | Implementation milestones |

## Design highlights

- **Knowledge space first** — bespoke R3F world (regions, totems, camera fly-tos); chat dock is coupled, not a lone chatbot page.
- **Intent routing** — classify queries and dispatch to specialized handlers instead of one undifferentiated chat loop.
- **Hybrid knowledge** — graph for relationships; vectors for semantic prose.
- **Validity without relying on visitors** — Stage A graph-checked claims always; Stage B optional allowlisted web corroboration returns accuracy confidence.
- **Feedback ≠ truth** — thumbs measure usefulness only.

## Local run

Not applicable until Milestone 1 (scaffold). See the roadmap for the build order.
