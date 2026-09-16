# Knowledge inventory

What goes into the graph (and later the vector corpus). This is the content plan the scene and intents answer from. Facts here must be true before they ship — Stage A will treat the graph as source of truth.

**Status:** MVP inventory sketched with **placeholder slots**. Replace placeholders with Rebecca’s real data before calling the MVP “content-complete.”

## MVP content principle

Ship a **small, fully connected, fully accurate** graph — not a large half-true one.

- Prefer fewer nodes with correct edges over breadth with gaps.
- Every hard fact a visitor might ask (employer, title, dates, “built X with Y”) must be an explicit graph edge or it will be stripped / fallbacked.
- Vector/RAG docs are **post-MVP** except optional short blurbs stored as node `summary` fields for generation context.

## MVP graph budget (target)

| Kind | MVP count | Region | Notes |
| --- | --- | --- | --- |
| `Person` | 1 | about / experience | Rebecca (center) |
| `Organization` | 2–4 | experience | Employers / clients worth naming |
| `Role` | 2–4 | experience | Title + rough date range |
| `Project` | 3–5 | projects | Showcase set only |
| `Tech` | 8–15 | projects | Only techs linked to MVP projects/roles |
| `Domain` | 2–3 | projects / music | e.g. DevOps, MusicProduction |
| `Media` | 2–4 | music | Recent mixes / releases visitors can ask about |
| `Document` | 0 (MVP) | — | Resume/blog chunks come in Enhancement 1 |

**Edges (MVP):** `HAS_ROLE`, `AT`, `BUILT`, `USES_TECH`, `RELATES_TO`, `PUBLISHED` — only where true.

Rough total: **~25–40 nodes**, **~40–70 edges**. Enough for a readable 3D space; small enough to curate by hand.

## MVP entity checklist (fill before build)

### Person
- [ ] Display name, short bio blurb (`summary`)
- [ ] Public links allowlist candidates (site, GitHub, …) for later Stage B

### Experience (Roles + Orgs)
For each role:
- [ ] Org name
- [ ] Title
- [ ] Start / end (or present)
- [ ] 2–4 tech or domain edges that are fair to claim
- [ ] One sentence outcome/focus (`summary`) — no confidential detail

### Projects
For each project:
- [ ] Name + one-line pitch
- [ ] `BUILT` from Person
- [ ] `USES_TECH` list (accurate)
- [ ] Optional `RELATES_TO` domain
- [ ] Public URL if any (GitHub, live site)
- [ ] Whether Stage B may corroborate (`public: true|false`)

### Music / media
For each mix/track:
- [ ] Title, year/approx date
- [ ] Platform link if public
- [ ] Genre/tags as domain or keywords
- [ ] Short description (no rights-sensitive samples claims)

### Contact / meta
- [ ] Preferred contact CTA text (email form link, etc.) — static config, not free LLM invention

## Explicitly out of MVP knowledge

| Content | Why deferred |
| --- | --- |
| Full resume PDF chunked into vectors | Needs RAG pipeline (Enhancement 1) |
| Blog corpus / long-form posts | Same |
| Mix transcripts / audio embeddings | Heavy; music nodes + summaries first |
| Exhaustive job history | Keep 2–4 roles; expand later |
| Private / NDA project details | Never; graph is public-facing |
| Fine-grained date disputes / awards lists | Add when curated |

## Seed file shape (implementation target)

Checked-in JSON (or SQLite seed) consumed by `GET /api/graph` and retrieval:

```text
{
  "nodes": [
    {
      "id": "person:rebecca",
      "kind": "Person",
      "label": "Rebecca …",
      "region": "experience",
      "summary": "…",
      "emoji": null,
      "totem": "person"
    }
  ],
  "edges": [
    {
      "id": "e:rebecca-built-projectx",
      "source": "person:rebecca",
      "target": "project:x",
      "rel": "BUILT"
    }
  ]
}
```

MVP generation context = neighborhood of selected / retrieved nodes (summaries + edge labels). No separate vector DB required for MVP.

## Golden questions (MVP eval set)

Curate **8–12** questions the seed must answer well. Examples of shape (replace with real topics once inventory is filled):

1. Experience with a core tech on an MVP project (e.g. CI/CD)
2. What did you build on Project X?
3. Which tools for deployment on Project Y?
4. Play / describe a recent mix
5. Where have you worked / recent role
6. Off-topic probe → redirect
7. Unknown tech not in graph → fallback CTA
8. Selected-node question (visitor clicks a project, asks “what stack?”)

Expected answers are defined by graph neighborhoods — later Stage A turns these into claim suites.

## Enhancement content waves

| Wave | Add |
| --- | --- |
| E1 | Resume + 2–3 project READMEs into vector index; hybrid retrieval |
| E2 | Full(er) role history; more projects/tech; blog posts |
| E3 | Mix notes/transcripts; richer media metadata |
| E4 | Ingest tooling + Stage B allowlist URLs tied to public nodes |

## Ownership

- **Rebecca:** fill checklist with real facts; approve public vs private.
- **Spec/impl:** keep schema, regions, and budgets aligned with [data.md](./data.md) and [interaction.md](./interaction.md).

Until the checklist is filled, implementation may use a clearly labeled **demo seed** (`demo: true` in file metadata) that must not be presented as live biography.
