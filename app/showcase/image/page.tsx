import Image from "next/image";
import Link from "next/link";

export default function ImageDemo() {
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
            next/image
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-20 md:px-8 md:py-28">
        <div className="space-y-12">
          <div className="space-y-4">
            <p className="font-heading text-sm text-muted-foreground">
              Image Optimization
            </p>
            <h1 className="font-heading text-4xl font-semibold text-balance md:text-5xl">
              Self-hosted{" "}
              <span className="text-primary">image optimization</span>.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground text-pretty">
              The images below are served through the built-in{" "}
              <code className="text-foreground">next/image</code> optimizer.
              They are resized, converted to modern formats, and cached
              automatically, all on the VPS.
            </p>
          </div>

          <div className="grid gap-px md:grid-cols-2">
            <div className="border border-border p-8 space-y-4">
              <p className="font-heading text-sm text-muted-foreground">
                Optimized local asset
              </p>
              <div className="flex items-center justify-center bg-muted p-8">
                <Image
                  src="/file.svg"
                  alt="File icon"
                  width={120}
                  height={120}
                  priority
                />
              </div>
              <p className="text-sm text-muted-foreground">
                <code className="text-foreground">/file.svg</code> served via{" "}
                <code className="text-foreground">{"<Image>"}</code> with
                automatic optimization.
              </p>
            </div>

            <div className="border border-border p-8 space-y-4">
              <p className="font-heading text-sm text-muted-foreground">
                Optimized local asset
              </p>
              <div className="flex items-center justify-center bg-muted p-8">
                <Image
                  src="/window.svg"
                  alt="Window icon"
                  width={120}
                  height={120}
                  priority
                />
              </div>
              <p className="text-sm text-muted-foreground">
                <code className="text-foreground">/window.svg</code> served via{" "}
                <code className="text-foreground">{"<Image>"}</code> with
                automatic optimization.
              </p>
            </div>
          </div>

          <div className="border border-border p-8 space-y-3">
            <p className="font-heading text-sm text-muted-foreground">
              How to verify
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-muted-foreground">
              <li>
                Open DevTools and inspect the image requests in the Network tab.
              </li>
              <li>
                Notice the images are served from{" "}
                <code className="text-foreground">/_next/image?url=...</code>{" "}
                with format and size parameters.
              </li>
              <li>
                The optimized versions are cached in{" "}
                <code className="text-foreground">.next/cache/images</code> on
                the server.
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
                Image optimization is not platform-exclusive. It works in
                standalone mode on any Node host.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                Optimized images are cached on disk, so repeated requests are
                fast.
              </li>
              <li className="flex gap-2">
                <span className="text-primary shrink-0">&bull;</span>
                No third-party image CDN is required.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
