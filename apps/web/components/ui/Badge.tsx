import React from "react";

export type BadgeVariant = "measured" | "projected" | "pending" | "running" | "failed";

export function Badge({ variant }: { variant: BadgeVariant }) {
  const configs = {
    measured: {
      label: "? Measured",
      color: "var(--color-measured)",
      bg: "rgba(52,211,153,0.08)",
      border: "1px solid rgba(52,211,153,0.25)",
    },
    projected: {
      label: "~ Projected",
      color: "var(--color-projected)",
      bg: "rgba(245,185,66,0.07)",
      border: "1px dashed rgba(245,185,66,0.35)",
    },
    pending: {
      label: "Pending",
      color: "var(--color-steel)",
      bg: "rgba(139,153,146,0.07)",
      border: "1px solid rgba(139,153,146,0.2)",
    },
    running: {
      label: "? Running",
      color: "var(--color-accent)",
      bg: "rgba(31,223,166,0.07)",
      border: "1px solid rgba(31,223,166,0.25)",
    },
    failed: {
      label: "? Failed",
      color: "#f87171",
      bg: "rgba(248,113,113,0.07)",
      border: "1px solid rgba(248,113,113,0.25)",
    },
  };

  const c = configs[variant] || configs.pending;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        letterSpacing: "0.04em",
        color: c.color,
        background: c.bg,
        border: c.border,
        padding: "4px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {c.label}
    </span>
  );
}
