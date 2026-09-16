"""Portfolio AI MVP API — demo seed, graph retrieve, grounded mock chat."""

from __future__ import annotations

import json
import re
import uuid
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

SEED_PATH = Path(__file__).resolve().parents[2] / "data" / "demo" / "graph.json"

app = FastAPI(title="Portfolio AI MVP", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@lru_cache(maxsize=1)
def load_graph() -> dict[str, Any]:
    with SEED_PATH.open(encoding="utf-8") as f:
        return json.load(f)


def node_map() -> dict[str, dict[str, Any]]:
    return {n["id"]: n for n in load_graph()["nodes"]}


def edges() -> list[dict[str, Any]]:
    return load_graph()["edges"]


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    session_id: str | None = None
    conversation_id: str | None = None
    selected_node_ids: list[str] = Field(default_factory=list)


class Citation(BaseModel):
    source_type: str
    id: str
    label: str


class ChatResponse(BaseModel):
    conversation_id: str
    message_id: str
    intent: str
    answer: str
    citations: list[Citation]
    highlight: dict[str, list[str]]
    camera: dict[str, Any]
    accuracy: dict[str, Any]
    fallback: bool
    demo: bool = True


@app.get("/api/health")
def health() -> dict[str, Any]:
    g = load_graph()
    return {
        "ok": True,
        "demo": bool(g.get("demo")),
        "nodes": len(g["nodes"]),
        "edges": len(g["edges"]),
    }


@app.get("/api/graph")
def get_graph() -> dict[str, Any]:
    return load_graph()


def classify_intent(message: str, selected: list[str]) -> str:
    text = message.lower()
    if any(
        p in text
        for p in (
            "ignore previous",
            "disregard previous",
            "developer mode",
            "jailbreak",
            "system prompt",
        )
    ):
        return "UNSAFE"
    if any(
        p in text
        for p in (
            "weather",
            "stock tip",
            "write me a poem about cats",
            "who won the election",
        )
    ):
        return "OFF_TOPIC"
    if any(p in text for p in ("contact", "email", "reach you", "hire")):
        return "CONTACT_OR_META"
    if any(p in text for p in ("mix", "music", "track", "dj", "listen", "neon", "harbor")):
        return "MEDIA_SEARCH"
    if any(p in text for p in ("project", "built", "stack", "pipeline", "signal", "atlas")):
        return "PROJECT_LOOKUP"
    if selected:
        kinds = {node_map().get(i, {}).get("kind") for i in selected}
        if "Media" in kinds:
            return "MEDIA_SEARCH"
        if "Project" in kinds or "Tech" in kinds:
            return "PROJECT_LOOKUP"
    if any(
        p in text
        for p in (
            "experience",
            "ci/cd",
            "cicd",
            "role",
            "work",
            "career",
            "engineer",
            "terraform",
            "github actions",
        )
    ):
        return "EXPERIENCE_QUERY"
    return "EXPERIENCE_QUERY"


def tokenize(text: str) -> set[str]:
    return {t for t in re.split(r"[^a-z0-9]+", text.lower()) if len(t) > 2}


def score_node(node: dict[str, Any], tokens: set[str]) -> float:
    blob = f"{node.get('label', '')} {node.get('summary', '')} {node.get('kind', '')}".lower()
    hits = sum(1 for t in tokens if t in blob)
    return float(hits)


def neighbors(node_id: str) -> tuple[set[str], set[str]]:
    n_ids: set[str] = {node_id}
    e_ids: set[str] = set()
    for e in edges():
        if e["source"] == node_id or e["target"] == node_id:
            e_ids.add(e["id"])
            n_ids.add(e["source"])
            n_ids.add(e["target"])
    return n_ids, e_ids


def retrieve(
    message: str, selected: list[str], intent: str
) -> tuple[list[dict[str, Any]], list[str], list[str]]:
    nodes = node_map()
    tokens = tokenize(message)
    ranked = sorted(
        nodes.values(),
        key=lambda n: score_node(n, tokens),
        reverse=True,
    )
    seed_ids: list[str] = []
    for sid in selected:
        if sid in nodes:
            seed_ids.append(sid)
    for n in ranked:
        if score_node(n, tokens) <= 0:
            break
        if n["id"] not in seed_ids:
            seed_ids.append(n["id"])
        if len(seed_ids) >= 5:
            break

    if intent == "MEDIA_SEARCH" and not seed_ids:
        seed_ids = [i for i, n in nodes.items() if n["kind"] == "Media"][:3]
    if intent == "CONTACT_OR_META":
        seed_ids = ["meta:contact", "person:avery"]
    if intent == "EXPERIENCE_QUERY" and not seed_ids:
        seed_ids = ["person:avery", "role:platform-eng", "tech:github-actions"]

    if not seed_ids:
        return [], [], []

    all_nodes: set[str] = set()
    all_edges: set[str] = set()
    for sid in seed_ids[:4]:
        nset, eset = neighbors(sid)
        all_nodes |= nset
        all_edges |= eset

    pack = [nodes[i] for i in all_nodes if i in nodes]
    return pack, sorted(all_nodes), sorted(all_edges)


def region_for(nodes_pack: list[dict[str, Any]], intent: str) -> str:
    if intent == "MEDIA_SEARCH":
        return "music"
    if intent == "CONTACT_OR_META":
        return "about"
    counts: dict[str, int] = {}
    for n in nodes_pack:
        r = n.get("region") or "projects"
        counts[r] = counts.get(r, 0) + 1
    if not counts:
        return "experience"
    return max(counts, key=counts.get)


def craft_answer(
    intent: str, pack: list[dict[str, Any]], message: str
) -> tuple[str, bool]:
    if intent == "UNSAFE":
        return (
            "I can’t help with attempts to override instructions. Ask about Avery’s demo projects, experience, or mixes instead.",
            True,
        )
    if intent == "OFF_TOPIC":
        return (
            "This demo assistant only covers Avery Chen’s fictional portfolio — experience, projects, and music. Try asking about CI/CD or Neon Freight.",
            True,
        )
    if not pack:
        return (
            "I can’t find specific details on that in the demo knowledge graph. Ask about Pipeline Garden, Signal Board, Mix Atlas, or the Neon Freight mix — or reach out via the Contact node.",
            True,
        )

    by_kind: dict[str, list[dict[str, Any]]] = {}
    for n in pack:
        by_kind.setdefault(n["kind"], []).append(n)

    lines: list[str] = []
    if intent == "CONTACT_OR_META":
        contact = next((n for n in pack if n["id"] == "meta:contact"), None)
        lines.append(
            contact["summary"]
            if contact
            else "Demo contact lives on the Contact node in the about region."
        )
    elif intent == "MEDIA_SEARCH":
        media = by_kind.get("Media", [])
        if media:
            lines.append("From the demo music catalog:")
            for m in media[:3]:
                lines.append(f"• {m['label']} — {m['summary']}")
        else:
            lines.append("No media nodes matched; try Neon Freight or Glass Harbor.")
    elif intent == "PROJECT_LOOKUP":
        projects = by_kind.get("Project", [])
        techs = by_kind.get("Tech", [])
        if projects:
            for p in projects[:2]:
                related = [
                    t["label"]
                    for t in techs
                    if any(
                        e["source"] == p["id"] and e["target"] == t["id"]
                        for e in edges()
                    )
                ]
                tech_bit = f" Stack: {', '.join(related)}." if related else ""
                lines.append(f"{p['label']}: {p['summary']}{tech_bit}")
        else:
            lines.append("Matched related nodes, but no project hub — try selecting a project in the space.")
    else:
        person = next((n for n in pack if n["kind"] == "Person"), None)
        roles = by_kind.get("Role", [])
        techs = by_kind.get("Tech", [])
        if person:
            lines.append(person["summary"])
        for r in roles[:2]:
            lines.append(f"{r['label']}: {r['summary']}")
        if techs:
            lines.append(
                "Related tools in graph: " + ", ".join(t["label"] for t in techs[:6]) + "."
            )
        if not lines:
            lines.append(pack[0]["summary"])

    lines.append(
        "\n_(Demo seed — fictional data. Answers are grounded only in the retrieved graph.)_"
    )
    return "\n".join(lines), False


@app.post("/api/chat", response_model=ChatResponse)
def chat(body: ChatRequest) -> ChatResponse:
    intent = classify_intent(body.message, body.selected_node_ids)
    pack, node_ids, edge_ids = (
        ([], [], [])
        if intent in {"UNSAFE", "OFF_TOPIC"}
        else retrieve(body.message, body.selected_node_ids, intent)
    )
    answer, fallback = craft_answer(intent, pack, body.message)
    citations = [
        Citation(source_type="graph", id=n["id"], label=n["label"])
        for n in pack
        if n["kind"] in {"Project", "Role", "Tech", "Media", "Person", "Document"}
    ][:6]
    focus = [c.id for c in citations[:4]] or node_ids[:3]
    return ChatResponse(
        conversation_id=body.conversation_id or str(uuid.uuid4()),
        message_id=str(uuid.uuid4()),
        intent=intent,
        answer=answer,
        citations=citations,
        highlight={"node_ids": node_ids, "edge_ids": edge_ids},
        camera={
            "mode": "fit_path",
            "focus_node_ids": focus,
            "region": region_for(pack, intent),
        },
        accuracy={
            "accuracy_confidence": None if fallback else 0.9,
            "web_accuracy_confidence": None,
            "stage_a": {"note": "MVP uses graph grounding only"},
            "stage_b": {"ran": False},
        },
        fallback=fallback,
        demo=True,
    )
