"use client";

import { create } from "zustand";
import type { ChatResponse, GraphPayload } from "@/lib/api";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  intent?: string;
  fallback?: boolean;
};

type SpaceState = {
  graph: GraphPayload | null;
  graphError: string | null;
  selectedIds: string[];
  highlightNodeIds: string[];
  highlightEdgeIds: string[];
  focusNodeIds: string[];
  focusRegion: string | null;
  conversationId: string | null;
  messages: ChatMessage[];
  chatLoading: boolean;
  chatError: string | null;
  viewResetId: number;
  setGraph: (graph: GraphPayload) => void;
  setGraphError: (error: string | null) => void;
  toggleSelect: (id: string) => void;
  clearSelection: () => void;
  applyChatResult: (userText: string, result: ChatResponse) => void;
  setChatLoading: (loading: boolean) => void;
  setChatError: (error: string | null) => void;
  requestViewReset: () => void;
};

export const useSpaceStore = create<SpaceState>((set, get) => ({
  graph: null,
  graphError: null,
  selectedIds: [],
  highlightNodeIds: [],
  highlightEdgeIds: [],
  focusNodeIds: [],
  focusRegion: null,
  conversationId: null,
  messages: [],
  chatLoading: false,
  chatError: null,
  viewResetId: 0,
  setGraph: (graph) => set({ graph, graphError: null }),
  setGraphError: (graphError) => set({ graphError }),
  toggleSelect: (id) => {
    const selected = get().selectedIds;
    if (selected.includes(id)) {
      set({ selectedIds: selected.filter((x) => x !== id) });
    } else {
      set({ selectedIds: [...selected, id].slice(-5) });
    }
  },
  clearSelection: () => set({ selectedIds: [] }),
  applyChatResult: (userText, result) =>
    set((state) => ({
      conversationId: result.conversation_id,
      messages: [
        ...state.messages,
        { id: `u-${result.message_id}`, role: "user", content: userText },
        {
          id: result.message_id,
          role: "assistant",
          content: result.answer,
          intent: result.intent,
          fallback: result.fallback,
        },
      ],
      highlightNodeIds: result.highlight.node_ids,
      highlightEdgeIds: result.highlight.edge_ids,
      focusNodeIds: result.camera.focus_node_ids,
      focusRegion: result.camera.region ?? null,
      chatLoading: false,
      chatError: null,
    })),
  setChatLoading: (chatLoading) => set({ chatLoading }),
  setChatError: (chatError) => set({ chatError, chatLoading: false }),
  requestViewReset: () => set((state) => ({ viewResetId: state.viewResetId + 1 })),
}));
