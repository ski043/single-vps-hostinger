"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function HomeNavbar() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    function onScroll() {
      setHasScrolled(window.scrollY > 8);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await authClient.signOut();
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-border transition-colors duration-200",
        hasScrolled
          ? "bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/70"
          : "bg-background",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:px-8">
        <Link className="font-heading text-2xl font-semibold text-balance" href="/">
          Host<span className="text-primary">Marshal</span>
        </Link>

        {isPending ? null : (
          <div className="flex items-center gap-3">
            <Button asChild size="sm" variant="ghost">
              <Link href="/showcase">Showcase</Link>
            </Button>
            {session?.user ? (
              <>
                {session.user.name ? (
                  <p className="hidden text-sm text-muted-foreground md:block">
                    Signed in as{" "}
                    <span className="text-foreground">{session.user.name}</span>
                  </p>
                ) : null}
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button
                  disabled={isSigningOut}
                  onClick={() => void handleSignOut()}
                  size="sm"
                  type="button"
                >
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="sm" variant="outline">
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
