# Intents

Instead of a monolithic chatbot that guesses what the visitor wants, every query is classified into a typed intent and routed to a specialized handler.

## Intent catalog (v0)

| Intent | Purpose | Stage B web corroboration |
| --- | --- | --- |
| `EXPERIENCE_QUERY` | Roles, skills, CI/CD, career narrative | Eligible (high-stakes) |
| `PROJECT_LOOKUP` | Named projects, tech used, outcomes | Eligible when the project is public |
| `MEDIA_SEARCH` | Mixes, tracks, creative work | Stage A only by default |
| `CONTACT_OR_META` | How to reach / about the assistant | No |
| `OFF_TOPIC` | Outside portfolio scope | No — redirect |
| `UNSAFE` | Injection, jailbreak, abuse | No — refuse |

This list is extensible. New intents require: BAML enum value, slot schema, handler, retrieval strategy, and Stage B eligibility flag.

## BAML contract (sketch)

Structured generation returns a strict schema — not free-form JSON from a chat prompt.

```text
enum Intent {
  EXPERIENCE_QUERY
  PROJECT_LOOKUP
  MEDIA_SEARCH
  CONTACT_OR_META
  OFF_TOPIC
  UNSAFE
}

class IntentClassification {
  intent Intent
  confidence float           @description("0..1 model confidence in the intent")
  slots IntentSlots
  needs_clarification bool
  clarification_question string | null
  requires_web_corroboration bool  @description("Derived from intent/risk; orchestrator may override")
}

class IntentSlots {
  entities string[]          @description("People, employers, project names")
  tech_names string[]
  media_keywords string[]
  time_range string | null   @description("e.g. 2022-2024")
  free_text_focus string | null
}
```

Exact BAML syntax will live in `baml_src/` when implementation starts. The contract above is the semantic target.

## Routing rules

1. Validate/parse the BAML result (reject malformed output; optionally retry once).
2. If `UNSAFE` → input-guardrail refusal path; do not retrieve portfolio knowledge.
3. If `OFF_TOPIC` → narrow-scope redirect; do not invent answers.
4. If `needs_clarification` and confidence below threshold → ask the clarification question.
5. Otherwise dispatch to the handler for `intent`:
   - **Graph queries** for relational facts (tech used on a project, roles, relationships).
   - **Vector search** for semantic prose (blog posts, narrative experience, transcripts).
   - **Media catalog** for mixes/tracks metadata.
6. Set `requires_web_corroboration` true for eligible high-stakes intents when hard factual claims are expected; Stage B still respects its own quota budget.

## Handler responsibilities

| Handler | Retrieves | Must not |
| --- | --- | --- |
| Experience | Graph role/skill edges + resume/blog vectors | Invent employers, dates, or titles |
| Project | Graph project→tech/domain + project docs | Claim tools not linked in graph |
| Media | Media nodes + optional transcript vectors | Fabricate track lists |
| Contact/meta | Static config | Expose private contact data not in config |

Routing is **not** undifferentiated generative chat. Generation happens only after retrieval, inside the response generator, under grounding rules in [safety.md](./safety.md) and [data.md](./data.md).
