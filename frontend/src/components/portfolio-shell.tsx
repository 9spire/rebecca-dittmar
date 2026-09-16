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
      <div className="absolute inset-0 grid place-items-center bg-[#0e1418] text-[#f3efe6]/80">
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
    <main className="relative h-dvh w-full overflow-hidden bg-[#0e1418] text-[#f3efe6]">
      <KnowledgeSpace />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(240,215,160,0.08),_transparent_55%),linear-gradient(to_bottom,_rgba(14,20,24,0.15),_rgba(14,20,24,0.55))]" />

      <header className="pointer-events-none absolute left-0 right-0 top-0 z-10 px-5 pb-8 pt-5 md:px-8 md:pt-7">
        <p className="font-[family-name:var(--font-display)] text-4xl leading-none tracking-tight md:text-6xl">
          Avery Atlas
        </p>
        <p className="mt-2 max-w-xl text-sm text-[#c8d0d4] md:text-base">
          Demo knowledge space — orbit, select nodes, ask the grounded assistant.
        </p>
        {graph?.demo && (
          <p className="mt-2 inline-block border border-[#f0d7a0]/40 px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-[#f0d7a0]">
            Demo seed · fictional
          </p>
        )}
      </header>

      <div className="pointer-events-none absolute bottom-0 right-0 z-10 w-full p-3 md:bottom-4 md:right-4 md:w-auto">
        <ChatDock />
      </div>

      {(graphError || !graph) && (
        <div className="pointer-events-none absolute left-5 top-28 z-10 max-w-sm text-sm text-[#f0d7a0] md:left-8">
          {graphError
            ? `Graph API offline: ${graphError}`
            : "Connecting to graph…"}
        </div>
      )}
    </main>
  );
}
