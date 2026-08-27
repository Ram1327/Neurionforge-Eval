import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../lib/db";
import { Badge } from "../../../components/ui/Badge";

export const dynamic = "force-dynamic";

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" stroke="var(--color-accent)" strokeWidth="1.6" />
      <path d="M13 27V13L20 17.5V13L27 17.5V27" stroke="var(--color-paper)" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decodedSlug = decodeURIComponent(id);

  const model = await prisma.model.findUnique({
    where: { slug: decodedSlug },
    include: {
      testRuns: {
        include: { benchmark: true },
        orderBy: { runAt: "desc" },
      },
    },
  });

  if (!model) {
    notFound();
  }

  const completedRuns = model.testRuns.filter((r) => r.status === "completed");
  const overallAvg =
    completedRuns.length > 0
      ? (completedRuns.reduce((acc, r) => acc + (r.score || 0), 0) / completedRuns.length).toFixed(1)
      : null;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 60px", color: "var(--color-paper)", fontFamily: "var(--font-sans)" }}>
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 0", borderBottom: "1px solid rgba(238,245,241,0.07)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <BrandMark />
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 19, color: "var(--color-paper)" }}>NeurionForge</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-spark)", background: "rgba(31,223,166,0.12)", border: "1px solid rgba(31,223,166,0.28)", padding: "2px 8px", borderRadius: 999 }}>Eval</span>
        </Link>
        <div style={{ display: "flex", gap: 18, fontSize: 13.5 }}>
          <Link href="/" style={{ color: "rgba(238,245,241,0.5)", textDecoration: "none" }}>Leaderboard</Link>
          <Link href="/models" style={{ color: "rgba(238,245,241,0.5)", textDecoration: "none" }}>Models</Link>
          <Link href="/run" style={{ color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>Run Eval →</Link>
        </div>
      </header>

      {/* Model Title Card */}
      <div style={{ margin: "40px 0 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
        <div>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--color-accent)", display: "block", marginBottom: 6 }}>MODEL SPECIFICATION</span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0 }}>{model.name}</h1>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-steel)" }}>Provider: {model.provider}</span>
            <span style={{ color: "rgba(238,245,241,0.2)" }}>·</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-steel)" }}>Source: {model.sourceType}</span>
          </div>
        </div>

        {overallAvg && (
          <div style={{ background: "#090c0a", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 12, padding: "12px 20px", textAlign: "right" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "var(--color-steel)", display: "block" }}>COMPOSITE MEASURED</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "var(--color-measured)" }}>{overallAvg}%</span>
          </div>
        )}
      </div>

      {/* Evidence Table */}
      <div style={{ background: "#111416", border: "1px solid rgba(238,245,241,0.08)", borderRadius: 16, overflow: "hidden", marginBottom: 40 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(238,245,241,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, textTransform: "uppercase", letterSpacing: "0.04em", fontFamily: "var(--font-mono)" }}>Empirical Test Runs</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-steel)" }}>{model.testRuns.length} recorded runs</span>
        </div>

        {model.testRuns.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--color-steel)", fontSize: 13.5 }}>
            No evaluations have been run on this model yet.
            <div style={{ marginTop: 14 }}>
              <Link href="/run" style={{ background: "var(--color-paper)", color: "var(--color-ink)", padding: "8px 16px", borderRadius: 6, fontWeight: 600, textDecoration: "none", fontSize: 13 }}>
                Run First Evaluation →
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(238,245,241,0.06)", color: "var(--color-steel)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                  <th style={{ padding: "12px 20px" }}>BENCHMARK</th>
                  <th style={{ padding: "12px 16px" }}>SCORE</th>
                  <th style={{ padding: "12px 16px" }}>AVG LATENCY</th>
                  <th style={{ padding: "12px 16px" }}>THROUGHPUT</th>
                  <th style={{ padding: "12px 16px" }}>STATUS</th>
                  <th style={{ padding: "12px 20px" }}>EVIDENCE</th>
                </tr>
              </thead>
              <tbody>
                {model.testRuns.map((run) => (
                  <tr key={run.id} style={{ borderBottom: "1px solid rgba(238,245,241,0.04)" }}>
                    <td style={{ padding: "14px 20px", fontWeight: 600 }}>{run.benchmark.name}</td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", fontWeight: 700, color: run.score !== null ? "var(--color-measured)" : "var(--color-steel)" }}>
                      {run.score !== null ? `${run.score.toFixed(1)}%` : "—"}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", color: "var(--color-steel)" }}>
                      {run.latencyAvgMs ? `${run.latencyAvgMs} ms` : "—"}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "var(--font-mono)", color: "var(--color-steel)" }}>
                      {run.throughputTps ? `${run.throughputTps} tps` : "—"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <Badge variant={run.status === "completed" ? "measured" : run.status === "failed" ? "failed" : "running"} />
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--color-steel)" }}>
                        {new Date(run.runAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center" }}>
        <Link href="/run" style={{ display: "inline-flex", background: "var(--color-accent)", color: "var(--color-ink)", padding: "12px 24px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 14 }}>
          Run New Evaluation on {model.name} ⚡
        </Link>
      </div>
    </div>
  );
}
