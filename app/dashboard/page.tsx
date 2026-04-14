import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/sign-in");
  }

  return (
    <main className="min-h-dvh bg-background">
      <section className="mx-auto w-full max-w-4xl px-6 py-20 md:px-8 md:py-28">
        <div className="space-y-4 border border-border p-8">
          <p className="font-heading text-sm text-muted-foreground">
            Dashboard
          </p>
          <h1 className="font-heading text-4xl font-semibold text-balance">
            Welcome, {session.user.name}.
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Your authenticated area is ready. The full dashboard can grow from
            here once you decide what hosting data, deployments, or server
            controls you want to expose.
          </p>
        </div>
      </section>
    </main>
  );
}
