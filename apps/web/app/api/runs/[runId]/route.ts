import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params;
    const run = await prisma.testRun.findUnique({
      where: { id: runId },
      include: {
        model: true,
        benchmark: true,
      },
    });

    if (!run) {
      return NextResponse.json({ error: "TestRun not found" }, { status: 404 });
    }

    return NextResponse.json(run);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
