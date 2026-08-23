import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    product: "neurionforge-eval",
    phase: 0,
    timestamp: new Date().toISOString(),
  });
}
