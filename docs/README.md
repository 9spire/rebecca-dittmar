# Portfolio AI Assistant

Living specifications for an intent-routed portfolio web app: a **React Three Fiber knowledge space** paired with chat, FastAPI orchestration, BAML structured intents, hybrid graph + vector retrieval, and a machine validity stack (claim ledger + light allowlisted web confidence).

**Status:** specs first. Delivery is **MVP → enhancements** ([roadmap.md](architecture/roadmap.md)). No application runtime yet.

## Docs

Start here: [architecture/overview.md](architecture/overview.md)

| Doc | Contents |
| --- | --- |
| [overview.md](architecture/overview.md) | Layers, request path, validity summary |
| [roadmap.md](architecture/roadmap.md) | MVP cut, exit criteria, enhancement waves |
| [knowledge.md](architecture/knowledge.md) | Graph content inventory (fill checklist) |
| [interaction.md](architecture/interaction.md) | R3F knowledge space + chat↔graph loop |
| [intents.md](architecture/intents.md) | Intent catalog and BAML shape |
| [data.md](architecture/data.md) | Graph, vectors, telemetry, web allowlist |
| [safety.md](architecture/safety.md) | Defenses + Stages A/B validity |
| [quotas-identity.md](architecture/quotas-identity.md) | Visitor keys, RPM/TPM, Stage B budget |
| [api.md](architecture/api.md) | Chat / feedback / graph / health sketches |

## Design highlights

- **MVP first** — 3D space + grounded graph chat; RAG, Stage A/B, quotas, feedback come after.
- **Knowledge space** — bespoke R3F world; chat dock is coupled, not a lone chatbot page.
- **Intent routing** — specialized handlers instead of one undifferentiated chat loop.
- **Validity without relying on visitors** — graph grounding now; claim ledger + web confidence later.
- **Feedback ≠ truth** — thumbs (later) measure usefulness only.

## Local run

Not applicable until MVP scaffold. See the roadmap.
