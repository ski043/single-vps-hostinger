import Link from "next/link";

export const revalidate = 15;

export default function ISRDemo() {
  const builtAt = new Date().toISOString();

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
          <span className="font-heading text-sm font-semibold">ISR</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-20 md:px-8 md:py-28">
        <div className="space-y-12">
          <div className="space-y-4">
            <p className="font-heading text-sm text-muted-foreground">
              Incremental Static Regeneration
            </p>
            <h1 className="font-heading text-4xl font-semibold text-balance md:text-5xl">
              This page regenerates every{" "}
              <span className="text-primary">15 seconds</span>.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              The timestamp below is baked into the HTML at build/regeneration
              time. Refreshing the page may return the cached version until the
              revalidation window passes, then the next request triggers a
              background regeneration.
            </p>
          </div>

          <div className="border border-border p-8 space-y-6">
            <div className="space-y-2">
              <p className="font-heading text-sm text-muted-foreground">
                Generated at
              </p>
              <p className="font-mono text-2xl tabular-nums">{builtAt}</p>
            </div>

            <div className="border-t border-border pt-6 space-y-3">
              <p className="font-heading text-sm text-muted-foreground">
                How to verify
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Note the timestamp above.</li>
                <li>Refresh the page immediately. The timestamp stays the same (cached).</li>
                <li>Wait at least 15 seconds, then refresh again.</li>
                <li>The first refresh after 15s still shows the old page (stale-while-revalidate), but the next one shows a new timestamp.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-heading text-sm text-muted-foreground">
              What this proves
            </p>
            <ul className="space-y-2 text-muted-foreground text-pretty">
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                ISR works on a self-hosted VPS without Vercel&rsquo;s infrastructure.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                The persisted <code className="text-foreground">.next/cache</code> Docker volume keeps regenerated pages across container restarts.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                <code className="text-foreground">export const revalidate = 15</code> is all the configuration required.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
