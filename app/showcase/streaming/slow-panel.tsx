async function simulateDelay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function SlowPanel({ delayMs }: { delayMs: number }) {
  await simulateDelay(delayMs);

  const resolvedAt = new Date().toISOString();

  return (
    <div className="border border-border p-8 space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-heading text-sm font-semibold text-primary">
          Streamed in after {delayMs / 1000}s
        </p>
        <p className="font-mono text-sm tabular-nums text-muted-foreground">
          {resolvedAt}
        </p>
      </div>
      <p className="text-muted-foreground text-pretty">
        This section waited {delayMs / 1000} seconds on the server before
        streaming its HTML to the browser. The page shell above was already
        visible while this content was still loading.
      </p>
    </div>
  );
}
