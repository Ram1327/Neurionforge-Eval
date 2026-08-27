import React from "react";
import Link from "next/link";
import { prisma } from "../../lib/db";
import { Badge } from "../../components/ui/Badge";

export const dynamic = "force-dynamic";

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" stroke="var(--color-accent)" strokeWidth="1.6" />
      <path d="M13 27V13L20 17.5V13L27 17.5V27" stroke="var(--color-paper)" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

export default async function ModelsIndexPage() {
  const models = await prisma.model.findMany({
    include: {
      testRuns: {
        where: { status: "completed" },
        include: { benchmark: true },
        orderBy: { runAt: "desc" },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 60px" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: "1px solid rgba(238,245,241,0.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <BrandMark />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--color-paper)" }}>NeurionForge</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-spark)", background: "rgba(31,223,166,0.12)", border: "1px solid rgba(31,223,166,0.28)", padding: "2px 8px", borderRadius: 999 }}>Eval</span>
        </Link>
        <div style={{ display: "flex", gap: 18, fontSize: 13.5 }}>
          <Link href="/" style={{ color: "rgba(238,245,241,0.5)", textDecoration: "none" }}>Leaderboard</Link>
          <span style={{ color: "var(--color-paper)" }}>Models</span>
          <Link href="/run" style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>Run Eval →</Link>
        </div>
      </header>

      <div style={{ margin: "40px 0 30px" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--color-accent)", display: "block", marginBottom: 6 }}>REGISTRY</span>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em" }}>Evaluated Models</h1>
        <p style={{ color: "var(--color-steel)", fontSize: 14, marginTop: 6 }}>All models with empirical Measured test runs and correlation data.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
        {models.map((m) => {
          const runCount = m.testRuns.length;
          const avgScore = runCount > 0 ? (m.testRuns.reduce((acc, r) => acc + (r.score || 0), 0) / runCount).toFixed(1) : null;

          return (
            <Link
              key={m.id}
              href={`/models/${encodeURIComponent(m.slug)}`}
              style={{
                background: "#111416",
                border: "1px solid rgba(238,245,241,0.08)",
                borderRadius: 14,
                padding: 20,
                textDecoration: "none",
                color: "inherit",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                transition: "all 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--color-paper)", margin: 0 }}>{m.name}</h3>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--color-steel)" }}>{m.provider}</span>
                </div>
                {avgScore ? (
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, color: "var(--color-measured)" }}>{avgScore}%</span>
                    <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 9.5, color: "var(--color-steel)" }}>Avg Score</span>
                  </div>
                ) : (
                  <Badge variant="pending" />
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(238,245,241,0.06)", paddingTop: 12 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-steel)" }}>
                  {runCount} {runCount === 1 ? "run" : "runs"} recorded
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "var(--color-accent)" }}>Inspect Evidence →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
