"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

import { AtIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { AuthDivider } from "@/components/auth-divider";
import { Button } from "@/components/ui/button";
import { DecorIcon } from "@/components/ui/decor-icon";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";

type AuthMode = "sign-in" | "sign-up";
type SocialProvider = "google" | "github";

type AuthPageProps = {
  mode: AuthMode;
  providers?: Partial<Record<SocialProvider, boolean>>;
};

const copy = {
  "sign-in": {
    eyebrow: "HostMarshal",
    title: "Welcome back",
    description: "Sign in to HostMarshal with your email and password.",
    submitLabel: "Sign in",
    pendingLabel: "Signing in...",
    switchLabel: "Need an account?",
    switchHref: "/auth/sign-up",
    switchCta: "Create one",
  },
  "sign-up": {
    eyebrow: "HostMarshal",
    title: "Create your account",
    description: "Start using HostMarshal with a name, email, and password.",
    submitLabel: "Create account",
    pendingLabel: "Creating account...",
    switchLabel: "Already have an account?",
    switchHref: "/auth/sign-in",
    switchCta: "Sign in",
  },
} as const;

export function AuthPage({ mode, providers }: AuthPageProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<
    "email" | SocialProvider | null
  >(null);

  const content = copy[mode];
  const enabledProviders = (["google", "github"] as const).filter(
    (provider) => providers?.[provider],
  );

  const isSubmittingEmail = pendingAction === "email";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPendingAction("email");

    try {
      if (mode === "sign-up") {
        const { error: signUpError } = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim(),
          password,
          callbackURL: "/",
        });

        if (signUpError) {
          setError(signUpError.message ?? "Could not create your account.");
          return;
        }
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
          rememberMe: true,
          callbackURL: "/",
        });

        if (signInError) {
          setError(signInError.message ?? "Could not sign you in.");
          return;
        }
      }

      router.push("/");
      router.refresh();
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setPendingAction(null);
    }
  }

  async function handleSocialSignIn(provider: SocialProvider) {
    setError(null);
    setPendingAction(provider);

    try {
      const { error: socialError } = await authClient.signIn.social({
        provider,
        callbackURL: "/",
      });

      if (socialError) {
        setError(socialError.message ?? "Could not start social sign-in.");
        setPendingAction(null);
      }
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
      setPendingAction(null);
    }
  }

  return (
    <div className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-6 py-10 md:px-8">
      <div className="relative flex w-full max-w-sm flex-col justify-between p-6 md:p-8">
        <div className="absolute -inset-y-6 -left-px w-px bg-border" />
        <div className="absolute -inset-y-6 -right-px w-px bg-border" />
        <div className="absolute -inset-x-6 -top-px h-px bg-border" />
        <div className="absolute -inset-x-6 -bottom-px h-px bg-border" />
        <DecorIcon position="top-left" />
        <DecorIcon position="bottom-right" />

        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-2">
            <p className="font-heading text-sm text-muted-foreground">
              {content.eyebrow}
            </p>
            <div className="space-y-1">
              <h1 className="font-heading text-3xl font-semibold text-balance">
                {content.title}
              </h1>
              <p className="text-base text-muted-foreground text-pretty">
                {content.description}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <form className="space-y-3" onSubmit={handleSubmit}>
              {mode === "sign-up" ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    Full name
                  </label>
                  <Input
                    autoComplete="name"
                    id="name"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jane Marshall"
                    required
                    value={name}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <InputGroup>
                  <InputGroupInput
                    autoComplete="email"
                    id="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@hostmarshal.com"
                    required
                    type="email"
                    value={email}
                  />
                  <InputGroupAddon align="inline-start">
                    <HugeiconsIcon icon={AtIcon} strokeWidth={2} />
                  </InputGroupAddon>
                </InputGroup>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Input
                  autoComplete={
                    mode === "sign-up" ? "new-password" : "current-password"
                  }
                  id="password"
                  minLength={8}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    mode === "sign-up"
                      ? "Create a strong password"
                      : "Enter your password"
                  }
                  required
                  type="password"
                  value={password}
                />
              </div>

              {error ? (
                <p
                  className="text-sm text-destructive text-pretty"
                  role="alert"
                >
                  {error}
                </p>
              ) : null}

              <Button className="w-full" disabled={pendingAction !== null} size="sm" type="submit">
                {isSubmittingEmail ? content.pendingLabel : content.submitLabel}
              </Button>
            </form>

            {enabledProviders.length > 0 ? (
              <div className="space-y-3">
                <AuthDivider>OR</AuthDivider>
                <div className="grid gap-2 sm:grid-cols-2">
                  {enabledProviders.includes("google") ? (
                    <Button
                      className="w-full"
                      disabled={pendingAction !== null}
                      onClick={() => void handleSocialSignIn("google")}
                      type="button"
                      variant="outline"
                    >
                      <GoogleIcon data-icon="inline-start" />
                      {pendingAction === "google" ? "Redirecting..." : "Google"}
                    </Button>
                  ) : null}
                  {enabledProviders.includes("github") ? (
                    <Button
                      className="w-full"
                      disabled={pendingAction !== null}
                      onClick={() => void handleSocialSignIn("github")}
                      type="button"
                      variant="outline"
                    >
                      <GithubIcon data-icon="inline-start" />
                      {pendingAction === "github" ? "Redirecting..." : "GitHub"}
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          <div className="space-y-3 text-sm text-muted-foreground">
            <p className="text-pretty">
              {content.switchLabel}{" "}
              <Link
                className="font-medium text-foreground underline underline-offset-4"
                href={content.switchHref}
              >
                {content.switchCta}
              </Link>
            </p>
            <p className="text-pretty">
              By continuing, you agree to the HostMarshal{" "}
              <a
                className="underline underline-offset-4 hover:text-foreground"
                href="#"
              >
                Terms of Service
              </a>{" "}
              and{" "}
              <a
                className="underline underline-offset-4 hover:text-foreground"
                href="#"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

const GoogleIcon = (props: React.ComponentProps<"svg">) => (
	<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
		<g>
			<path d="M12.479,14.265v-3.279h11.049c0.108,0.571,0.164,1.247,0.164,1.979c0,2.46-0.672,5.502-2.84,7.669   C18.744,22.829,16.051,24,12.483,24C5.869,24,0.308,18.613,0.308,12S5.869,0,12.483,0c3.659,0,6.265,1.436,8.223,3.307L18.392,5.62   c-1.404-1.317-3.307-2.341-5.913-2.341C7.65,3.279,3.873,7.171,3.873,12s3.777,8.721,8.606,8.721c3.132,0,4.916-1.258,6.059-2.401   c0.927-0.927,1.537-2.251,1.777-4.059L12.479,14.265z" />
		</g>
	</svg>
);

const GithubIcon = (props: React.ComponentProps<"svg">) => (
	<svg fill="currentColor" viewBox="0 0 1024 1024" {...props}>
		<path
			clipRule="evenodd"
			d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
			fill="currentColor"
			fillRule="evenodd"
			transform="scale(64)"
		/>
	</svg>
);
