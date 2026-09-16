"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { postChat } from "@/lib/api";
import { useSpaceStore } from "@/store/space-store";

export function ChatDock() {
  const [text, setText] = useState("");
  const selectedIds = useSpaceStore((s) => s.selectedIds);
  const messages = useSpaceStore((s) => s.messages);
  const chatLoading = useSpaceStore((s) => s.chatLoading);
  const chatError = useSpaceStore((s) => s.chatError);
  const conversationId = useSpaceStore((s) => s.conversationId);
  const graph = useSpaceStore((s) => s.graph);
  const clearSelection = useSpaceStore((s) => s.clearSelection);
  const applyChatResult = useSpaceStore((s) => s.applyChatResult);
  const setChatLoading = useSpaceStore((s) => s.setChatLoading);
  const setChatError = useSpaceStore((s) => s.setChatError);

  const selectedLabels =
    graph?.nodes.filter((n) => selectedIds.includes(n.id)).map((n) => n.label) ??
    [];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const message = text.trim();
    if (!message || chatLoading) return;
    setText("");
    setChatLoading(true);
    try {
      const result = await postChat({
        message,
        selected_node_ids: selectedIds,
        conversation_id: conversationId,
      });
      applyChatResult(message, result);
    } catch (err) {
      setChatError(err instanceof Error ? err.message : "Chat request failed");
    }
  }

  return (
    <aside className="pointer-events-auto flex h-full max-h-[min(100%,640px)] w-full max-w-md flex-col border border-[#d7cfc0]/25 bg-[#f4efe4]/92 text-[#1c2428] shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
      <header className="border-b border-[#1c2428]/10 px-4 py-3">
        <p className="font-[family-name:var(--font-display)] text-lg tracking-tight">
          Atlas Chat
        </p>
        <p className="text-xs text-[#4a555c]">
          Grounded on the demo graph. Select nodes, then ask.
        </p>
        {selectedLabels.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {selectedLabels.map((label) => (
              <Badge key={label} variant="secondary" className="rounded-sm">
                {label}
              </Badge>
            ))}
            <button
              type="button"
              className="text-[11px] underline"
              onClick={clearSelection}
            >
              clear
            </button>
          </div>
        )}
      </header>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-[#4a555c]">
              Try “What is your experience with CI/CD?” or select Neon Freight and
              ask about recent mixes.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "user"
                  ? "ml-6 rounded-sm bg-[#1c2428] px-3 py-2 text-sm text-[#f4efe4]"
                  : "mr-4 whitespace-pre-wrap rounded-sm bg-white/70 px-3 py-2 text-sm"
              }
            >
              {m.intent && (
                <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-[#6a757c]">
                  {m.intent}
                  {m.fallback ? " · fallback" : ""}
                </span>
              )}
              {m.content}
            </div>
          ))}
          {chatError && (
            <p className="text-sm text-red-700">Error: {chatError}</p>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={onSubmit} className="flex gap-2 border-t border-[#1c2428]/10 p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask the knowledge space…"
          className="rounded-sm border-[#1c2428]/20 bg-white/80"
          disabled={chatLoading}
        />
        <Button type="submit" disabled={chatLoading} className="rounded-sm">
          {chatLoading ? "…" : "Ask"}
        </Button>
      </form>
    </aside>
  );
}
