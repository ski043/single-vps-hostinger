import Link from "next/link";

import { addEntry, getEntries } from "./actions";
import { GuestbookForm } from "./guestbook-form";

export const dynamic = "force-dynamic";

export default async function ActionsDemo() {
  const entries = await getEntries();

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
            Server Actions
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-20 md:px-8 md:py-28">
        <div className="space-y-12">
          <div className="space-y-4">
            <p className="font-heading text-sm text-muted-foreground">
              Server Actions
            </p>
            <h1 className="font-heading text-4xl font-semibold text-balance md:text-5xl">
              A guestbook powered by{" "}
              <span className="text-primary">Server Actions</span>.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              Submit a message using a form bound to a Server Action. The action
              runs on the server, mutates state, and calls{" "}
              <code className="text-foreground">revalidatePath</code> to refresh
              the page with the new entry.
            </p>
          </div>

          <div className="border border-border p-8 space-y-6">
            <p className="font-heading text-sm text-muted-foreground">
              Sign the guestbook
            </p>
            <GuestbookForm action={addEntry} />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-heading text-sm text-muted-foreground">
                Entries ({entries.length})
              </p>
              {entries.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Stored in memory and resets on container restart
                </p>
              )}
            </div>

            {entries.length === 0 ? (
              <div className="border border-border border-dashed p-8 text-center">
                <p className="text-muted-foreground">
                  No entries yet. Be the first to sign the guestbook.
                </p>
              </div>
            ) : (
              <div className="space-y-px">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-border p-6 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-heading text-sm font-semibold">
                        {entry.name}
                      </p>
                      <p className="font-mono text-xs tabular-nums text-muted-foreground">
                        {entry.createdAt}
                      </p>
                    </div>
                    <p className="text-muted-foreground">{entry.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <p className="font-heading text-sm text-muted-foreground">
              What this proves
            </p>
            <ul className="space-y-2 text-muted-foreground text-pretty">
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                Server Actions work on a self-hosted VPS.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                The mutation flow does not require a separate REST client or SPA
                fetch layer.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                Forms and server mutations behave as expected in standalone
                Docker deploys.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
