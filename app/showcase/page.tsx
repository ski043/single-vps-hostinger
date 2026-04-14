import Link from "next/link";

import { HomeNavbar } from "@/components/home-navbar";

const demos = [
  {
    title: "ISR (Incremental Static Regeneration)",
    href: "/showcase/isr",
    description:
      "A page that regenerates on a timer. The visible timestamp proves ISR works with a persisted .next/cache on the VPS.",
  },
  {
    title: "Fetch Cache & Revalidation",
    href: "/showcase/cache",
    description:
      "A server component fetches from a local Route Handler with a revalidation interval. The data timestamp proves the Next.js Data Cache works self-hosted.",
  },
  {
    title: "Streaming with Suspense",
    href: "/showcase/streaming",
    description:
      "The page shell renders immediately while a slow async section streams in later. Proves the VPS + Caddy stack can serve progressive HTML.",
  },
  {
    title: "Server Actions",
    href: "/showcase/actions",
    description:
      "A guestbook powered by a Server Action. Mutations and UI updates happen without a separate REST client or SPA fetch layer.",
  },
  {
    title: "next/image Optimization",
    href: "/showcase/image",
    description:
      "Local images served through the built-in image optimizer. Proves image optimization is not platform-exclusive.",
  },
] as const;

export default function ShowcaseHub() {
  return (
    <div className="min-h-dvh bg-background">
      <HomeNavbar />

      <main>
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl space-y-8 px-6 py-20 md:px-8 md:py-28">
            <div className="space-y-4">
              <p className="font-heading text-sm text-muted-foreground">
                Next.js Feature Showcase
              </p>
              <h1 className="max-w-3xl font-heading text-5xl font-semibold text-balance md:text-6xl">
                Modern App Router features, running on{" "}
                <span className="text-primary">your VPS</span>.
              </h1>
              <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
                Each page below demonstrates a specific Next.js capability
                working in a self-hosted Docker + Caddy setup. No managed
                platform required.
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
            {demos.map((demo, i) => (
              <Link
                key={demo.href}
                href={demo.href}
                className="group flex items-start justify-between gap-8 border-b border-border py-8 last:border-b-0"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-heading text-sm text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-heading text-xl font-semibold group-hover:text-primary transition-colors">
                      {demo.title}
                    </h2>
                  </div>
                  <p className="max-w-xl text-muted-foreground text-pretty pl-9">
                    {demo.description}
                  </p>
                </div>
                <span className="mt-1 shrink-0 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  View demo &rarr;
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8 md:py-28">
          <div className="max-w-3xl space-y-4">
            <p className="font-heading text-sm text-muted-foreground">
              Self-hosting proof
            </p>
            <h2 className="font-heading text-3xl font-semibold text-balance md:text-4xl">
              Every demo above runs inside the same standalone Docker container
              behind Caddy.
            </h2>
            <p className="text-lg text-muted-foreground text-pretty">
              ISR and Data Cache rely on a persisted{" "}
              <code className="text-foreground">.next/cache</code> volume.
              Streaming works because Caddy forwards chunked responses. Server
              Actions execute in the same Node process. Nothing here requires
              Vercel.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
