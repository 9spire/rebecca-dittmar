"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { ChatDock } from "@/components/chat-dock";
import { fetchGraph } from "@/lib/api";
import { useSpaceStore } from "@/store/space-store";

const KnowledgeSpace = dynamic(
  () =>
    import("@/components/knowledge-space").then((m) => m.KnowledgeSpace),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 grid place-items-center bg-[#1A1A30] text-[#e7e4f2]/80">
        Loading knowledge space…
      </div>
    ),
  },
);

export function PortfolioShell() {
  const setGraph = useSpaceStore((s) => s.setGraph);
  const setGraphError = useSpaceStore((s) => s.setGraphError);
  const graph = useSpaceStore((s) => s.graph);
  const graphError = useSpaceStore((s) => s.graphError);
  const requestViewReset = useSpaceStore((s) => s.requestViewReset);

  useEffect(() => {
    let cancelled = false;
    fetchGraph()
      .then((g) => {
        if (!cancelled) setGraph(g);
      })
      .catch((err) => {
        if (!cancelled) {
          setGraphError(err instanceof Error ? err.message : "Failed to load graph");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [setGraph, setGraphError]);

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[#1A1A30] text-[#e7e4f2]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1d4a4e,_transparent_56%),radial-gradient(ellipse_at_bottom_right,_#3a2150,_transparent_48%),linear-gradient(to_bottom,_#24243c,_#1A1A30_46%,_#121228)]" />

      <KnowledgeSpace />

      <div className="pointer-events-none absolute right-5 top-5 z-20 md:right-8 md:top-7">
        <button
          type="button"
          onClick={requestViewReset}
          className="pointer-events-auto rounded-md border border-[#00CED1]/40 bg-[#1A1A30]/50 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-[#00CED1] backdrop-blur-sm"
        >
          Reset view
        </button>
      </div>

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 px-5 pb-8 pr-32 pt-5 md:px-8 md:pt-7">
        <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight md:text-6xl">
          Avery Atlas
        </p>
        <p className="mt-2 max-w-xl text-sm text-[#e7e4f2]/75 md:text-base">
          Demo knowledge space — orbit, select nodes, ask the grounded assistant.
        </p>
        {graph?.demo && (
          <p className="mt-2 inline-block border border-[#00CED1]/40 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-[#00CED1]">
            Demo seed · fictional
          </p>
        )}
      </header>

      <div className="pointer-events-none absolute bottom-0 right-0 z-10 w-full p-3 md:bottom-4 md:right-4 md:w-auto">
        <ChatDock />
      </div>

      {(graphError || !graph) && (
        <div className="pointer-events-none absolute left-5 top-28 z-10 max-w-sm text-sm text-[#00CED1] md:left-8">
          {graphError
            ? `Graph API offline: ${graphError}`
            : "Connecting to graph…"}
        </div>
      )}
    </main>
  );
}
