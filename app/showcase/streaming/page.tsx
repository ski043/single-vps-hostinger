import { Suspense } from "react";
import Link from "next/link";

import { SlowPanel } from "./slow-panel";

function StreamingSkeleton({ label }: { label: string }) {
  return (
    <div className="border border-border border-dashed p-8 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <p className="font-heading text-sm text-muted-foreground">{label}</p>
        <div className="h-4 w-40 bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-muted" />
        <div className="h-4 w-3/4 bg-muted" />
      </div>
    </div>
  );
}

export default function StreamingDemo() {
  const shellRenderedAt = new Date().toISOString();

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-6 md:px-8">
          <Link
            href="/showcase"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Showcase
          </Link>
          <span className="font-heading text-sm text-muted-foreground">/</span>
          <span className="font-heading text-sm font-semibold">Streaming</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-20 md:px-8 md:py-28">
        <div className="space-y-12">
          <div className="space-y-4">
            <p className="font-heading text-sm text-muted-foreground">
              Streaming with Suspense
            </p>
            <h1 className="font-heading text-4xl font-semibold text-balance md:text-5xl">
              Progressive rendering,{" "}
              <span className="text-primary">streamed to you</span>.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              The page shell renders immediately. The slow sections below are
              wrapped in Suspense boundaries and stream in as they resolve on
              the server.
            </p>
          </div>

          <div className="border border-border p-8 space-y-2">
            <p className="font-heading text-sm text-muted-foreground">
              Shell rendered at
            </p>
            <p className="font-mono text-lg tabular-nums">{shellRenderedAt}</p>
            <p className="text-sm text-muted-foreground">
              This section appeared instantly. The panels below are still loading
              on the server.
            </p>
          </div>

          <div className="space-y-4">
            <Suspense
              fallback={
                <StreamingSkeleton label="Loading panel 1 (2 seconds)..." />
              }
            >
              <SlowPanel delayMs={2000} />
            </Suspense>

            <Suspense
              fallback={
                <StreamingSkeleton label="Loading panel 2 (4 seconds)..." />
              }
            >
              <SlowPanel delayMs={4000} />
            </Suspense>
          </div>

          <div className="space-y-3">
            <p className="font-heading text-sm text-muted-foreground">
              What this proves
            </p>
            <ul className="space-y-2 text-muted-foreground text-pretty">
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                Streaming responses work in the self-hosted setup.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                The VPS + Caddy stack can serve progressive HTML and RSC
                payloads.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                Suspense boundaries let you ship fast initial paints while
                slower data sources resolve in the background.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
