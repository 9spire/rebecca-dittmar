# Quotas and visitor identity

Abuse control for a public portfolio assistant: identify visitors well enough to enforce limits, track both request and token budgets, and keep Stage B web corroboration genuinely “light touch.”

## Multi-layered visitor identity

Do not rely on a single identifier (mobile IP rotation and cookie clearing defeat that).

Compose a **visitor key** from:

| Signal | Role | Weakness |
| --- | --- | --- |
| Client IP heuristics | Coarse bucket; catch naive scripts | CGNAT, mobile rotation, VPNs |
| Browser cookie | Stable anonymous id when retained | Cleared or blocked |
| Session state | Short-lived continuity within a tab/session | Ends with session |

Gateway derives the composite key server-side. Clients may send a `session_id` for threading, but it is never the sole quota key.

Document privacy expectations: anonymous portfolio usage analytics/limits, not authenticated accounts (auth is out of scope for v0).

## Token-aware and request-based quotas

Track both:

- **RPM** — raw requests per visitor window (stops chatty scripts).
- **TPM** — token consumption ceilings per visitor window (stops heavy multi-turn / agent-style loops).

When either ceiling is hit → `429` with a clear retry hint. Count tokens for classification, generation, verification, and (when run) Stage B judge calls toward TPM.

## Sliding window / token bucket

Prefer sliding window or token bucket over fixed calendar windows so bursts are smoothed and edge-of-window floods are harder.

v0: in-process structures suitable for a single API instance. Later: Redis (or equivalent) for multi-instance enforcement.

## Stage B budget (web corroboration)

Stage B touches the internet and must stay selective:

- Separate **low** cap on Stage B runs per visitor window (and optionally global QPS).
- If the Stage B budget is exhausted, still return the Stage A–validated answer with `web_accuracy_confidence: null` and `stage_b.ran: false`.
- Do not fail the whole chat solely because web corroboration is unavailable.

## Abuse cases to design against

- Cookie clearing → fall back toward IP + session heuristics; tighten limits on weak identity.
- Mobile IP rotation → cookie/session continuity matters; avoid permanent bans on shared IPs.
- Multi-turn agent loops → TPM + conversation-length soft caps.
- Stage B amplification → dedicated budget so corroboration cannot be used as a free open proxy.
