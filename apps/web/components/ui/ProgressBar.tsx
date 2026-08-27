import React from "react";

interface ProgressBarProps {
  completed: number;
  total: number;
  passed: number;
}

export function ProgressBar({ completed, total, passed }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const passPct = completed > 0 ? Math.round((passed / completed) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      {/* Bar */}
      <div
        style={{
          height: 6,
          background: "rgba(238,245,241,0.08)",
          borderRadius: 3,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--color-accent), var(--color-spark))",
            borderRadius: 3,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      {/* Stats row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-steel)" }}>
          {completed} / {total} items evaluated
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--color-measured)" }}>
          {passed} passed ({passPct}%)
        </span>
      </div>
    </div>
  );
}
