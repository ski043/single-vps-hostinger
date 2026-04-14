import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    source: "self-hosted Route Handler",
    node: process.version,
  });
}
