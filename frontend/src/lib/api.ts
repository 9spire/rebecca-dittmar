export type GraphNode = {
  id: string;
  kind: string;
  label: string;
  region: "experience" | "projects" | "music" | "about" | string;
  summary: string;
  emoji?: string | null;
  totem?: string | null;
  public?: boolean;
};

export type GraphEdge = {
  id: string;
  source: string;
  target: string;
  rel: string;
};

export type GraphPayload = {
  demo: boolean;
  version: number;
  note?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
};

export type ChatResponse = {
  conversation_id: string;
  message_id: string;
  intent: string;
  answer: string;
  citations: { source_type: string; id: string; label: string }[];
  highlight: { node_ids: string[]; edge_ids: string[] };
  camera: {
    mode: string;
    focus_node_ids: string[];
    region?: string;
  };
  accuracy: {
    accuracy_confidence: number | null;
    web_accuracy_confidence: number | null;
  };
  fallback: boolean;
  demo: boolean;
};

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") || "";

export async function fetchGraph(): Promise<GraphPayload> {
  const res = await fetch(`${API_BASE}/api/graph`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Graph fetch failed (${res.status})`);
  return res.json();
}

export async function postChat(input: {
  message: string;
  selected_node_ids: string[];
  conversation_id?: string | null;
}): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Chat failed (${res.status})`);
  return res.json();
}
