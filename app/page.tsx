import Link from "next/link";

import { HomeNavbar } from "@/components/home-navbar";
import { Button } from "@/components/ui/button";

const features = [
  {
    label: "ISR",
    title: "Incremental Static Regeneration",
    description:
      "Pages regenerate on a timer without a full rebuild. The timestamp proves it — no Vercel required.",
    href: "/showcase/isr",
  },
  {
    label: "Cache",
    title: "Fetch Cache & Revalidation",
    description:
      "Per-fetch caching with configurable TTL. Data stays fast, stays fresh, stays on your box.",
    href: "/showcase/cache",
  },
  {
    label: "Stream",
    title: "Streaming with Suspense",
    description:
      "The shell renders instantly. Slow data streams in progressively — Caddy forwards chunked HTML without flinching.",
    href: "/showcase/streaming",
  },
  {
    label: "Actions",
    title: "Server Actions",
    description:
      "A guestbook that mutates server state from a form. No REST client, no SPA fetch layer, no ceremony.",
    href: "/showcase/actions",
  },
  {
    label: "Image",
    title: "next/image Optimization",
    description:
      "Images resized, converted, and cached on-disk by the built-in optimizer. No third-party CDN needed.",
    href: "/showcase/image",
  },
] as const;

const stack = [
  {
    name: "Hostinger",
    role: "KVM VPS with root access",
    href: "https://hostinger.com/janmarshal",
  },
  {
    name: "Next.js",
    role: "App Router, RSC, standalone output",
  },
  {
    name: "PostgreSQL",
    role: "Your own database, your own data",
  },
  {
    name: "Better Auth",
    role: "Email + social sign-in, sessions",
  },
  {
    name: "Caddy",
    role: "Reverse proxy, automatic HTTPS",
  },
  {
    name: "Docker",
    role: "Reproducible, single-command deploys",
  },
  {
    name: "Prisma",
    role: "Type-safe ORM, migrations",
  },
] as const;

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      <HomeNavbar />

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-8 md:py-36">
            <div className="max-w-3xl space-y-8">
              <div className="space-y-5">
                <p className="font-heading text-sm tracking-wide text-primary">
                  Open-source reference project
                </p>
                <h1 className="font-heading text-5xl font-semibold leading-[1.1] text-balance md:text-7xl">
                  Self-host Next.js like you mean it.
                </h1>
                <p className="max-w-2xl text-xl text-muted-foreground text-pretty md:text-2xl">
                  HostMarshal is a production-grade Next.js app running on a{" "}
                  <a
                    href="https://hostinger.com/janmarshal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    Hostinger VPS
                  </a>{" "}
                  with Docker, Caddy, and Postgres. Every feature Vercel
                  sells — ISR, streaming, image optimization — working on your
                  own server.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/showcase">See the live demos</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/auth/sign-up">Try the auth flow</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Powered by Hostinger strip */}
        <section className="border-b border-border bg-muted/30">
          <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-5 md:px-8">
            <p className="text-sm text-muted-foreground">
              Deployed on{" "}
              <a
                href="https://hostinger.com/janmarshal"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                Hostinger
              </a>
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              {stack.map((item) => (
                <span key={item.name} className="text-sm font-medium">
                  {item.name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Problem / Solution */}
        <section className="border-b border-border">
          <div className="mx-auto grid w-full max-w-6xl gap-16 px-6 py-20 md:grid-cols-2 md:px-8 md:py-28">
            <div className="space-y-6">
              <p className="font-heading text-sm text-muted-foreground">
                The problem
              </p>
              <h2 className="font-heading text-3xl font-semibold text-balance md:text-4xl">
                &ldquo;Self-hosting Next.js is unsupported&rdquo; is a myth.
              </h2>
              <div className="space-y-4 text-muted-foreground text-pretty">
                <p>
                  Most tutorials stop at <code className="text-foreground">npx create-next-app</code>.
                  When it comes to deployment, they hand-wave you toward a
                  managed platform and move on.
                </p>
                <p>
                  You never see how ISR works without Vercel&rsquo;s CDN. You
                  never see how streaming plays with a reverse proxy. You never
                  see auth, database migrations, and Docker compose working
                  together in one repo.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <p className="font-heading text-sm text-primary">
                The solution
              </p>
              <h2 className="font-heading text-3xl font-semibold text-balance md:text-4xl">
                A real app you can deploy, inspect, and learn from.
              </h2>
              <div className="space-y-4 text-muted-foreground text-pretty">
                <p>
                  HostMarshal is not a starter template. It&rsquo;s a running
                  application with auth, a database, and every major App Router
                  feature — deployed to a VPS behind Caddy with Docker Compose.
                </p>
                <p>
                  Each feature has a dedicated demo page that proves it works.
                  Timestamps, live mutations, streamed HTML — all verifiable in
                  your browser.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature demos */}
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8 md:py-28">
            <div className="space-y-12">
              <div className="max-w-2xl space-y-4">
                <p className="font-heading text-sm text-muted-foreground">
                  Live demos
                </p>
                <h2 className="font-heading text-3xl font-semibold text-balance md:text-4xl">
                  Don&rsquo;t take our word for it. Click through and verify.
                </h2>
                <p className="text-lg text-muted-foreground text-pretty">
                  Every feature below has a dedicated page with timestamps, live
                  state, and step-by-step instructions to prove it works
                  self-hosted.
                </p>
              </div>

              <div className="grid gap-px md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, i) => (
                  <Link
                    key={feature.href}
                    href={feature.href}
                    className="group border border-border p-8 transition-colors hover:bg-muted/40"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-primary">
                          {feature.label}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                        {feature.description}
                      </p>
                      <span className="inline-block text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        View demo &rarr;
                      </span>
                    </div>
                  </Link>
                ))}

                {/* Auth card */}
                <Link
                  href="/auth/sign-up"
                  className="group border border-border p-8 transition-colors hover:bg-muted/40"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-muted-foreground">
                        06
                      </span>
                      <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-primary">
                        Auth
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold group-hover:text-primary transition-colors">
                      Better Auth + Postgres
                    </h3>
                    <p className="text-sm text-muted-foreground text-pretty leading-relaxed">
                      Full sign-up/sign-in flow with email and social providers,
                      backed by your own PostgreSQL database. Sessions, not
                      JWTs.
                    </p>
                    <span className="inline-block text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                      Try it &rarr;
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture / Stack */}
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8 md:py-28">
            <div className="space-y-12">
              <div className="max-w-2xl space-y-4">
                <p className="font-heading text-sm text-muted-foreground">
                  The stack
                </p>
                <h2 className="font-heading text-3xl font-semibold text-balance md:text-4xl">
                  Everything runs on a single Hostinger VPS. No vendor lock-in.
                </h2>
              </div>

              <div className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
                {stack.map((item) => {
                  const isHostinger = item.name === "Hostinger";
                  const inner = (
                    <div className="space-y-2">
                      <p className={`font-heading text-lg font-semibold ${isHostinger ? "text-primary" : ""}`}>
                        {item.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.role}
                      </p>
                    </div>
                  );

                  if (isHostinger) {
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="border border-primary/30 bg-primary/5 p-8 transition-colors hover:bg-primary/10"
                      >
                        {inner}
                      </a>
                    );
                  }

                  return (
                    <div
                      key={item.name}
                      className="border border-border p-8"
                    >
                      {inner}
                    </div>
                  );
                })}
              </div>

              <div className="border border-border p-8 md:p-10">
                <div className="grid gap-8 md:grid-cols-[1fr_1px_1fr_1px_1fr]">
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      01 &mdash; Build
                    </p>
                    <p className="text-sm text-muted-foreground text-pretty">
                      Multi-stage Docker build produces a minimal standalone
                      Node image. Prisma generates at build time.
                    </p>
                  </div>
                  <div className="hidden md:block bg-border" />
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      02 &mdash; Route
                    </p>
                    <p className="text-sm text-muted-foreground text-pretty">
                      Caddy sits in front as a reverse proxy with automatic
                      HTTPS. Streaming and WebSocket-friendly.
                    </p>
                  </div>
                  <div className="hidden md:block bg-border" />
                  <div className="space-y-2">
                    <p className="font-mono text-xs text-muted-foreground">
                      03 &mdash; Persist
                    </p>
                    <p className="text-sm text-muted-foreground text-pretty">
                      PostgreSQL stores user data. A Docker volume persists
                      the <code className="text-foreground">.next/cache</code>{" "}
                      for ISR and Data Cache.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hostinger spotlight */}
        <section className="border-b border-border">
          <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-8 md:py-28">
            <div className="grid gap-12 md:grid-cols-[1fr_1px_1fr] md:gap-0">
              <div className="space-y-6 md:pr-12">
                <p className="font-heading text-sm text-primary">
                  Why Hostinger
                </p>
                <h2 className="font-heading text-3xl font-semibold text-balance md:text-4xl">
                  The VPS behind this entire project.
                </h2>
                <div className="space-y-4 text-muted-foreground text-pretty">
                  <p>
                    Everything you see on this site — the auth flow, the
                    streaming demos, the ISR timestamps — is served from a
                    single Hostinger KVM VPS. No serverless functions, no edge
                    network, no hidden infrastructure.
                  </p>
                  <p>
                    Hostinger gives you a real Linux box with root access, solid
                    performance, and pricing that makes self-hosting a no-brainer
                    for side projects and production apps alike.
                  </p>
                </div>
                <div>
                  <Button asChild size="lg">
                    <a
                      href="https://hostinger.com/janmarshal"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get a Hostinger VPS
                    </a>
                  </Button>
                </div>
              </div>

              <div className="hidden md:block bg-border" />

              <div className="space-y-6 md:pl-12">
                <p className="font-heading text-sm text-muted-foreground">
                  What you get
                </p>
                <div className="space-y-4">
                  {[
                    {
                      title: "Full root access",
                      text: "SSH in, install Docker, run whatever you want. It's your server.",
                    },
                    {
                      title: "KVM virtualization",
                      text: "Dedicated resources, not shared containers. Consistent performance under load.",
                    },
                    {
                      title: "Global data centers",
                      text: "Pick a region close to your users. Low latency without a CDN.",
                    },
                    {
                      title: "Affordable pricing",
                      text: "Production-ready VPS plans starting at a few dollars a month.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="border-b border-border pb-4 last:border-b-0 last:pb-0"
                    >
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="mx-auto w-full max-w-6xl px-6 py-24 md:px-8 md:py-36">
            <div className="max-w-3xl space-y-8">
              <div className="space-y-4">
                <h2 className="font-heading text-4xl font-semibold text-balance md:text-5xl">
                  Stop reading tutorials that end at{" "}
                  <code className="text-primary">localhost:3000</code>.
                </h2>
                <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
                  Explore the live demos, sign up to test the auth flow, or
                  grab a{" "}
                  <a
                    href="https://hostinger.com/janmarshal"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                  >
                    Hostinger VPS
                  </a>{" "}
                  and deploy it yourself in minutes.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/showcase">Explore the showcase</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a
                    href="https://hostinger.com/janmarshal"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get a Hostinger VPS
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
