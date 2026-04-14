import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-dvh">
      <Button asChild className="absolute top-5 left-5 z-10" variant="outline">
        <Link href="/">Go back</Link>
      </Button>
      {children}
    </div>
  );
}
