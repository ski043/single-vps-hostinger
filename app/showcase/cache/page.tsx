import Link from "next/link";
import { connection } from "next/server";

async function getTimeData() {
  const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/showcase/time`, {
    next: { revalidate: 10 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch time data");
  }

  return res.json() as Promise<{
    timestamp: string;
    source: string;
    node: string;
  }>;
}

export default async function CacheDemo() {
  await connection();

  const data = await getTimeData();
  const fetchedAt = new Date().toISOString();

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
          <span className="font-heading text-sm font-semibold">
            Fetch Cache
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-20 md:px-8 md:py-28">
        <div className="space-y-12">
          <div className="space-y-4">
            <p className="font-heading text-sm text-muted-foreground">
              Data Cache & Revalidation
            </p>
            <h1 className="font-heading text-4xl font-semibold text-balance md:text-5xl">
              Cached fetch with{" "}
              <span className="text-primary">10-second revalidation</span>.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              This server component fetches from a local Route Handler using{" "}
              <code className="text-foreground">
                {"fetch(..., { next: { revalidate: 10 } })"}
              </code>
              . The result is cached by the Next.js Data Cache and refreshed in
              the background.
            </p>
          </div>

          <div className="grid gap-px md:grid-cols-2">
            <div className="border border-border p-8 space-y-2">
              <p className="font-heading text-sm text-muted-foreground">
                Data from Route Handler
              </p>
              <p className="font-mono text-lg tabular-nums">
                {data.timestamp}
              </p>
              <p className="text-sm text-muted-foreground">
                Source: {data.source}
              </p>
              <p className="text-sm text-muted-foreground">
                Node: {data.node}
              </p>
            </div>

            <div className="border border-border p-8 space-y-2">
              <p className="font-heading text-sm text-muted-foreground">
                Page rendered at
              </p>
              <p className="font-mono text-lg tabular-nums">{fetchedAt}</p>
              <p className="text-sm text-muted-foreground">
                Compare these two timestamps to see caching in action.
              </p>
            </div>
          </div>

          <div className="border border-border p-8 space-y-3">
            <p className="font-heading text-sm text-muted-foreground">
              How to verify
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              <li>
                The Route Handler at{" "}
                <code className="text-foreground">/api/showcase/time</code>{" "}
                always returns a fresh timestamp.
              </li>
              <li>
                But this page caches the fetch result for 10 seconds.
              </li>
              <li>
                Refresh immediately. The data timestamp stays the same.
              </li>
              <li>
                After 10 seconds, the next request triggers a background
                revalidation and the data timestamp updates.
              </li>
            </ol>
          </div>

          <div className="space-y-3">
            <p className="font-heading text-sm text-muted-foreground">
              What this proves
            </p>
            <ul className="space-y-2 text-muted-foreground text-pretty">
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                The Next.js Data Cache works self-hosted, not just on Vercel.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                Route Handlers and cached fetches work together on the VPS.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                This is per-fetch caching, not whole-page ISR, so different
                data sources can have different revalidation intervals.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
