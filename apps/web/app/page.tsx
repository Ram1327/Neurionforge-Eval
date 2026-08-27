"use client";

import { useEffect, useRef } from "react";

// ── NeurionForge brand SVG mark ──────────────────────────────────────────────
function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
        stroke="var(--color-accent)"
        strokeWidth="1.6"
      />
      <path
        d="M13 27V13L20 17.5V13L27 17.5V27"
        stroke="var(--color-paper)"
        strokeWidth="1.8"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Signal-green ambient canvas ──────────────────────────────────────────────
function ForgeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext("2d")!;
    const COUNT = 36;
    let width = 0, height = 0, dpr = 1;
    let raf: number;

    interface Particle {
      x: number; y: number; r: number; speed: number;
      drift: number; hue: string; alpha: number; flicker: number;
    }
    let particles: Particle[] = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeParticle(initial: boolean): Particle {
      return {
        x: Math.random() * width,
        y: initial ? Math.random() * height : height + Math.random() * 60,
        r: Math.random() * 1.2 + 0.3,
        speed: Math.random() * 0.3 + 0.1,
        drift: (Math.random() - 0.5) * 0.25,
        hue: Math.random() > 0.5 ? "31,223,166" : "184,255,232",
        alpha: Math.random() * 0.35 + 0.1,
        flicker: Math.random() * Math.PI * 2,
      };
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createRadialGradient(
        width * 0.5, height * 0.85, 0,
        width * 0.5, height * 0.85, Math.max(width, height) * 0.5
      );
      grad.addColorStop(0, "rgba(31,223,166,0.05)");
      grad.addColorStop(1, "rgba(31,223,166,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.flicker += 0.04;
        const flick = (Math.sin(p.flicker) + 1) / 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${(p.alpha * (0.5 + flick * 0.5)).toFixed(3)})`;
        ctx.fill();
        if (p.y < -10) Object.assign(p, makeParticle(false));
      }
      raf = requestAnimationFrame(tick);
    }

    resize();
    particles = Array.from({ length: COUNT }, () => makeParticle(true));
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed", inset: 0, zIndex: 0,
        pointerEvents: "none", width: "100%", height: "100%",
      }}
    />
  );
}

// ── Model dex card data ──────────────────────────────────────────────────────
interface DexEntry {
  rank: string;
  name: string;
  provider: string;
  overall: number | null;
  reasoning: number | null;
  coding: number | null;
  math: number | null;
  type: "projected" | "measured" | "run";
  topStat?: string; // name of highest stat
}

const DEX: DexEntry[] = [
  {
    rank: "Rank 01", name: "GPT-5", provider: "OpenAI",
    overall: 94.7, reasoning: 94.1, coding: 96.3, math: 93.8,
    type: "projected", topStat: "Coding",
  },
  {
    rank: "Rank 02", name: "Claude 4 Sonnet", provider: "Anthropic",
    overall: 92.7, reasoning: 92.4, coding: 94.1, math: 91.5,
    type: "projected", topStat: "Coding",
  },
  {
    rank: "Rank 03", name: "Gemini 2.5 Pro", provider: "Google",
    overall: 92.5, reasoning: 91.8, coding: 92.7, math: 93.1,
    type: "projected", topStat: "Math",
  },
  {
    rank: "Rank 04", name: "Qwen2.5-72B", provider: "Alibaba",
    overall: 84.9, reasoning: 85.2, coding: 87.0, math: 82.4,
    type: "measured", topStat: "Coding",
  },
  {
    rank: "Rank 05", name: "Llama 3.3-70B", provider: "Meta",
    overall: 81.7, reasoning: 82.1, coding: 83.4, math: 79.6,
    type: "measured", topStat: "Coding",
  },
  {
    rank: "Your Model", name: "Your Model", provider: "Run it yourself",
    overall: null, reasoning: null, coding: null, math: null,
    type: "run",
  },
];

// Stat bar component
function StatBar({ label, value, max = 100, highlight }: { label: string; value: number | null; max?: number; highlight?: boolean }) {
  const pct = value !== null ? Math.round((value / max) * 100) : 0;
  return (
    <div className="stat-row">
      <span className={`stat-label${highlight ? " stat-highlight" : ""}`}>{label}</span>
      <div className="stat-track">
        <div
          className={`stat-fill${highlight ? " stat-fill-highlight" : ""}`}
          style={{ width: value !== null ? `${pct}%` : "0%" }}
        />
      </div>
      <span className={`stat-value${highlight ? " stat-highlight" : ""}`}>
        {value !== null ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

// Premium Dex card
function ModelCard({ entry }: { entry: DexEntry }) {
  if (entry.type === "run") {
    return (
      <div className="dex-slot">
        <p className="rank-label">{entry.rank}</p>
        <figure className="model-card card-run" aria-label="Run your own model">
          <div className="card-run-inner">
            <p className="card-run-hint">Test your own endpoint</p>
            <h3 className="card-run-name">Your Model</h3>
            <p className="card-run-sub">Any provider · BYOK · Local</p>
            <a href="/run" className="card-run-btn">Run it →</a>
          </div>
        </figure>
      </div>
    );
  }

  const isProjected = entry.type === "projected";
  const stats = [
    { label: "Reasoning", value: entry.reasoning },
    { label: "Coding",    value: entry.coding },
    { label: "Math",      value: entry.math },
  ];

  return (
    <div className="dex-slot">
      <p className="rank-label">{entry.rank}</p>
      <figure
        className={`model-card${isProjected ? " card-projected" : " card-measured"}`}
        aria-label={`${entry.name} by ${entry.provider} — ${isProjected ? "Projected" : "Measured"}, overall ${entry.overall}`}
      >
        {/* Card header */}
        <div className="card-header">
          <div className="card-identity">
            <div className={`model-icon${isProjected ? " icon-projected" : " icon-measured"}`}>
              {entry.name.charAt(0)}
            </div>
            <div>
              <h3 className="card-name">{entry.name}</h3>
              <p className="card-provider">{entry.provider}</p>
            </div>
          </div>
          <div className="card-overall-wrap">
            <p className="card-overall-label">Overall</p>
            <p className="card-overall">
              <span className="card-overall-num">{entry.overall?.toFixed(1)}</span>
              <span className="card-overall-denom">/100</span>
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="card-stats">
          <div className="card-stats-header">
            <span>Base Stats</span>
            <span className={`card-curated-tag${isProjected ? " tag-proj" : " tag-meas"}`}>
              {isProjected ? "~ Projected" : "✓ Measured"}
            </span>
          </div>
          <div className="stat-list">
            {stats.map(s => (
              <StatBar
                key={s.label}
                label={s.label}
                value={s.value}
                highlight={s.label === entry.topStat}
              />
            ))}
          </div>
        </div>
      </figure>
    </div>
  );
}

// ── Phase roadmap data ───────────────────────────────────────────────────────
const PHASES = [
  { num: "Phase 0", label: "Done",    title: "Foundations",        items: ["Monorepo + Next.js shell", "Prisma / Supabase schema", "Provider client wrappers"] },
  { num: "Phase 1", label: "Next",    title: "Core Loop",           items: ["Reasoning / Coding / Math tests", "Bring-your-own-key runs", "Local models via tunnel URL"] },
  { num: "Phase 2", label: "Planned", title: "Projection Engine",   items: ["Calibration set built", "Formula fit & published", "Homepage leaderboard live"] },
  { num: "Phase 3", label: "Planned", title: "Custom Evaluations",  items: ["Dataset upload", "LLM-judge scoring", "Shareable result links"] },
  { num: "Phase 4", label: "Planned", title: "Local Connector",     items: ["Dedicated connector app", "Remaining categories", "Agent testing stays on hold"] },
  { num: "Phase 5", label: "Stretch", title: "Verified Frontier",   items: ["Funded, periodic real runs", "Projected → Measured, model by model"] },
];

const CATEGORIES = [
  "Reasoning", "Coding", "Mathematics", "Knowledge",
  "Instruction Following", "Long Context", "Structured Output",
  "Tool Calling", "Safety",
];

// ── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    const sections = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      sections.forEach(el => el.classList.add("in-view"));
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    sections.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <ForgeCanvas />

      {/* Subtle grain */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
          opacity: 0.028, mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="page" style={{ position: "relative", zIndex: 2 }}>
        {/* ── HEADER ── */}
        <header className="site-header">
          <a href="https://neurionforge.com" className="brand" aria-label="NeurionForge home">
            <BrandMark />
            <span className="brand-word">NeurionForge</span>
            <span className="brand-tag">Eval</span>
          </a>

          <nav className="top-nav" aria-label="Primary">
            <a href="https://neurionforge.com" className="nav-lnk">Home</a>
            <a href="https://aistudio.neurionforge.com" className="nav-lnk">AI Studio</a>
            <a href="#leaderboard" className="nav-lnk">Leaderboard</a>
            <a href="#methodology" className="nav-lnk">Methodology</a>
            <a href="https://agency.neurionforge.com" className="nav-lnk">Agency</a>
          </nav>

          <a href="/run" className="btn-run">Run a model →</a>
        </header>

        <div className="header-rule" />

        <main>
          {/* ── HERO ── */}
          <section className="hero">
            <div className="hero-left">
              <p className="eyebrow anim">
                <span className="dot" />
                STATION 02 — AI EVALUATION
              </p>

              <h1 className="headline anim" style={{ ["--d" as string]: ".1s" }}>
                We Built<br />The Tests.<br />
                <span className="headline-accent">See How<br />Frontier<br />Stacks Up.</span>
              </h1>

              <p className="subhead anim" style={{ ["--d" as string]: ".22s" }}>
                Projected scores for frontier models we can&apos;t afford to run at scale.
                Measured scores for anything you run yourself — your key, your local model.
              </p>

              <div className="hero-cta anim" style={{ ["--d" as string]: ".34s" }}>
                <a href="/run" className="btn-primary">Run your own model</a>
                <a href="#leaderboard" className="btn-ghost">View leaderboard</a>
              </div>
            </div>

            {/* Anatomy of a match — right panel */}
            <div className="hero-right anim" style={{ ["--d" as string]: ".18s" }}>
              <p className="anatomy-label">ANATOMY OF A RUN</p>
              <ol className="anatomy-list">
                {[
                  { n: "1", title: "Select model", desc: "Provider API or local endpoint — any OpenAI-compatible URL." },
                  { n: "2", title: "Bring your key", desc: "BYOK. API keys live in your browser session only, never stored on our end." },
                  { n: "3", title: "Choose benchmark", desc: "Reasoning, Coding, Math — or all three in a full battery run." },
                  { n: "4", title: "Get a score", desc: "Per-question breakdown, latency, throughput — stored as a Measured TestRun." },
                  { n: "5", title: "Compare publicly", desc: "Your result goes on the leaderboard, permanently verifiable against ours." },
                ].map(item => (
                  <li key={item.n} className="anatomy-item">
                    <span className="anatomy-num">{item.n}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ── DEX LEADERBOARD ── */}
          <section id="leaderboard" className="dex-section" data-reveal>
            <div className="dex-section-top">
              <div>
                <p className="dex-kicker anim">FRONTIER DEX · SEASON 01</p>
                <h2 className="dex-title anim" style={{ ["--d" as string]: ".06s" }}>The Leaderboard</h2>
                <p className="dex-sub anim" style={{ ["--d" as string]: ".1s" }}>
                  Projected for frontier models. Measured for anything run through NeurionForge directly.
                </p>
              </div>
              <div className="dex-meta anim" style={{ ["--d" as string]: ".12s" }}>
                <span className="legend-item">
                  <i className="badge-dot badge-measured" />
                  Measured — run on our tests
                </span>
                <span className="legend-item">
                  <i className="badge-dot badge-projected" />
                  Projected — from public scores
                </span>
                <span className="dex-count">
                  {DEX.filter(d => d.type !== "run").length} models · 3 labs
                </span>
              </div>
            </div>

            <div className="sample-banner anim" style={{ ["--d" as string]: ".14s" }}>
              Sample data — live results ship in Phase 1
            </div>

            {/* Cards grid */}
            <div className="dex-grid anim" style={{ ["--d" as string]: ".18s" }}>
              {DEX.map(entry => (
                <ModelCard key={entry.rank} entry={entry} />
              ))}
            </div>

            <a href="#methodology" className="how-link anim" style={{ ["--d" as string]: ".24s" }}>
              How projection works →
            </a>
          </section>

          {/* ── METHODOLOGY ── */}
          <section id="methodology" className="method-section" data-reveal>
            <p className="dex-kicker anim">METHODOLOGY · TRANSPARENT BY DEFAULT</p>
            <h2 className="dex-title anim" style={{ ["--d" as string]: ".06s" }}>How Projection Works</h2>
            <p className="dex-sub anim" style={{ ["--d" as string]: ".1s" }}>
              No black box — the formula and its inputs are published.
            </p>

            <div className="method-grid">
              {[
                { n: "1", title: "Calibrate", desc: "We run our own tests on open-weight models we can afford — that's the Measured calibration set." },
                { n: "2", title: "Correlate",  desc: "Those models have published public scores (GPQA, SWE-bench, AIME). We fit a transparent OLS formula between them." },
                { n: "3", title: "Project",    desc: "Frontier models' public scores go into that formula. Out comes a Projected score with an explicit confidence range — never false precision." },
              ].map((card, i) => (
                <article
                  key={card.n}
                  className="method-card anim"
                  style={{ ["--d" as string]: `${i * 0.08}s` }}
                >
                  <span className="method-step">{card.n}</span>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── CATEGORIES ── */}
          <section className="categories" data-reveal>
            <p className="dex-kicker anim">BENCHMARK SUITE</p>
            <h2 className="dex-title anim" style={{ ["--d" as string]: ".06s" }}>Evaluation Categories</h2>
            <p className="dex-sub anim" style={{ ["--d" as string]: ".1s" }}>
              Focused on what&apos;s still hard — not what&apos;s already saturated.
            </p>
            <div className="category-grid">
              {CATEGORIES.map((cat, i) => (
                <span
                  key={cat}
                  className="category-pill anim"
                  style={{ ["--d" as string]: `${i * 0.03}s` }}
                >
                  {cat}
                </span>
              ))}
              <span className="category-pill is-hold anim" style={{ ["--d" as string]: ".27s" }}>
                Agent Testing — On Hold
              </span>
            </div>
          </section>

          {/* ── ROADMAP ── */}
          <section id="roadmap" className="roadmap" data-reveal>
            <p className="dex-kicker anim">ROADMAP</p>
            <h2 className="dex-title anim" style={{ ["--d" as string]: ".06s" }}>The Build Path</h2>
            <p className="dex-sub anim" style={{ ["--d" as string]: ".1s" }}>
              Six phases — the projection engine only ships once there&apos;s real calibration data to earn it.
            </p>

            <div className="track anim" style={{ ["--d" as string]: ".14s" }}>
              <div className="track-base" />
              <div className="track-fill" />
            </div>

            <div className="phases">
              {PHASES.map((phase, i) => (
                <article
                  key={phase.num}
                  className="phase anim"
                  style={{ ["--d" as string]: `${i * 0.06}s` }}
                >
                  <div className="phase-head">
                    <span className="phase-num">{phase.num}</span>
                    <span className={`tag tag-${phase.label.toLowerCase()}`}>{phase.label}</span>
                  </div>
                  <h3>{phase.title}</h3>
                  <ul>
                    {phase.items.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          {/* ── TECH STRIP ── */}
          <section className="tech-strip anim" data-reveal>
            <div className="tech-line">
              <span className="tech-prompt">&gt;_</span>
              <span>
                Projection formula:{" "}
                <span className="tech-highlight">transparent, published weights</span>
              </span>
            </div>
            <div className="tech-stack">Next.js + Inngest + Supabase</div>
          </section>
        </main>

        {/* ── FOOTER ── */}
        <div className="header-rule" style={{ marginTop: "clamp(40px,6vh,64px)" }} />
        <footer className="site-footer">
          <div className="footer-brand">
            <div className="brand">
              <BrandMark size={22} />
              <span className="brand-word" style={{ fontSize: 15 }}>NeurionForge</span>
            </div>
            <span className="footer-copy">Independent benchmarks for AI models — transparent by default.</span>
          </div>
          <nav className="footer-links" aria-label="Products">
            <a href="https://neurionforge.com">Home</a>
            <a href="https://aistudio.neurionforge.com">AI Studio</a>
            <a href="https://agency.neurionforge.com">Agency</a>
            <a href="#methodology">Methodology</a>
            <a href="mailto:hello@neurionforge.com">Contact</a>
          </nav>
          <div className="footer-meta">© 2026 NeurionForge</div>
        </footer>
      </div>

      {/* ── PAGE-LEVEL STYLES ── */}
      <style>{`
        /* ─── Layout ─── */
        .page {
          max-width: 1260px; margin: 0 auto;
          padding: 0 clamp(16px, 4vw, 48px);
        }
        .header-rule { height: 1px; background: rgba(238,245,241,0.07); margin: 0 0; }

        /* ─── Header ─── */
        .site-header {
          display: flex; align-items: center; gap: clamp(12px, 2vw, 24px);
          padding: clamp(16px, 2.5vh, 22px) 0;
        }
        .brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .brand-word {
          font-family: var(--font-display); font-weight: 700; font-size: 19px;
          letter-spacing: 0.01em; color: var(--color-paper);
        }
        .brand-tag {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em;
          color: var(--color-spark); background: rgba(31,223,166,0.12);
          border: 1px solid rgba(31,223,166,0.28); padding: 3px 9px;
          border-radius: 999px;
        }
        .top-nav {
          display: flex; align-items: center; gap: clamp(2px,1vw,6px);
          margin-left: auto;
        }
        .nav-lnk {
          font-family: var(--font-sans); font-size: 13.5px;
          color: rgba(238,245,241,0.5); padding: 8px 14px;
          border-radius: 6px; transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .nav-lnk:hover { color: var(--color-paper); background: rgba(238,245,241,0.05); }
        .btn-run {
          font-family: var(--font-sans); font-weight: 600; font-size: 13.5px;
          color: var(--color-ink); background: var(--color-paper);
          border: 1px solid var(--color-paper); padding: 9px 18px;
          border-radius: 8px; flex-shrink: 0; white-space: nowrap;
          transition: background 0.2s, transform 0.2s;
        }
        .btn-run:hover { background: var(--color-spark); transform: translateY(-1px); }

        /* ─── Hero ─── */
        .hero {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: clamp(32px, 5vw, 72px); padding: clamp(60px,10vh,110px) 0 clamp(40px,7vh,72px);
          align-items: start;
        }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 11.5px; letter-spacing: 0.12em;
          color: var(--color-steel); margin-bottom: 20px;
        }
        .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--color-accent); box-shadow: 0 0 8px var(--color-accent);
          display: inline-block; flex-shrink: 0;
        }
        .headline {
          font-family: var(--font-display); font-weight: 800; line-height: 0.97;
          letter-spacing: -0.01em; text-transform: uppercase;
          font-size: clamp(36px, 5.4vw, 72px); margin-bottom: clamp(18px,3vh,28px);
        }
        .headline-accent { color: var(--color-accent-2); }
        .subhead {
          font-size: clamp(14px, 1.5vw, 16.5px); line-height: 1.65;
          color: var(--color-paper-dim); max-width: 44ch; margin-bottom: clamp(24px,4vh,36px);
        }
        .hero-cta { display: flex; gap: 12px; flex-wrap: wrap; }
        .btn-primary {
          font-family: var(--font-sans); font-weight: 600; font-size: 14px;
          color: var(--color-ink); background: var(--color-paper);
          padding: 13px 24px; border-radius: 8px;
          box-shadow: 0 0 0 1px rgba(31,223,166,0.2), 0 0 22px rgba(31,223,166,0.25);
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .btn-primary:hover { transform: translateY(-2px); }
        .btn-ghost {
          font-family: var(--font-sans); font-weight: 600; font-size: 14px;
          color: var(--color-paper); background: transparent;
          border: 1px solid rgba(238,245,241,0.18); padding: 12px 22px; border-radius: 8px;
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }
        .btn-ghost:hover { border-color: rgba(31,223,166,0.5); background: rgba(31,223,166,0.06); transform: translateY(-2px); }

        /* Anatomy panel */
        .hero-right {
          background: rgba(15,21,18,0.6); border: 1px solid rgba(238,245,241,0.08);
          border-radius: 16px; padding: clamp(20px,2.4vw,28px);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
        }
        .anatomy-label {
          font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.1em;
          color: var(--color-steel); margin-bottom: 18px;
        }
        .anatomy-list { display: flex; flex-direction: column; gap: 0; list-style: none; padding: 0; margin: 0; }
        .anatomy-item {
          display: flex; gap: 14px; padding: 13px 0;
          border-top: 1px solid rgba(238,245,241,0.06);
        }
        .anatomy-item:first-child { border-top: none; }
        .anatomy-num {
          width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-mono); font-size: 12px;
          color: var(--color-ink); background: var(--color-paper);
          margin-top: 1px;
        }
        .anatomy-item strong { display: block; font-size: 13.5px; color: var(--color-paper); margin-bottom: 3px; }
        .anatomy-item p { font-size: 12.5px; color: var(--color-steel); line-height: 1.5; margin: 0; }

        /* ─── Dex Section ─── */
        .dex-section { padding: clamp(50px,9vh,100px) 0 clamp(24px,4vh,40px); }
        .dex-section-top {
          display: flex; justify-content: space-between; align-items: flex-end;
          gap: 20px; flex-wrap: wrap; margin-bottom: 20px;
        }
        .dex-kicker {
          font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.12em;
          color: var(--color-steel); margin-bottom: 8px;
        }
        .dex-title {
          font-size: clamp(22px, 3vw, 36px); font-family: var(--font-display);
          font-weight: 800; text-transform: uppercase; letter-spacing: -0.01em;
          margin-bottom: 8px;
        }
        .dex-sub { font-size: 14px; color: var(--color-steel); margin: 0; }
        .dex-meta {
          display: flex; flex-direction: column; align-items: flex-end; gap: 6px;
          flex-shrink: 0;
        }
        .legend-item {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: var(--font-mono); font-size: 11.5px; color: var(--color-steel);
        }
        .badge-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .badge-dot.badge-measured { background: var(--color-measured); box-shadow: 0 0 5px var(--color-measured); }
        .badge-dot.badge-projected { background: var(--color-projected); }
        .dex-count { font-family: var(--font-mono); font-size: 11.5px; color: rgba(238,245,241,0.3); }
        .sample-banner {
          font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.06em;
          color: var(--color-projected); background: rgba(245,185,66,0.06);
          border: 1px dashed rgba(245,185,66,0.28); border-radius: 6px;
          padding: 7px 14px; margin-bottom: 24px; display: inline-block;
        }

        /* ─── Cards grid ─── */
        .dex-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(12px, 1.6vw, 18px);
          align-items: start;
        }
        .dex-slot { display: flex; flex-direction: column; gap: 8px; }
        .rank-label {
          font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.1em;
          color: rgba(238,245,241,0.3); text-transform: uppercase;
        }

        /* Model card base */
        .model-card {
          display: flex; flex-direction: column;
          background: #111416; border-radius: 14px;
          overflow: hidden; margin: 0;
          transition: transform 0.25s, box-shadow 0.25s;
        }
        .model-card:hover { transform: translateY(-3px); box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

        /* Projected card */
        .card-projected { border: 1px solid rgba(245,185,66,0.18); }
        .card-projected:hover { border-color: rgba(245,185,66,0.35); }

        /* Measured card */
        .card-measured { border: 1px solid rgba(52,211,153,0.18); }
        .card-measured:hover { border-color: rgba(52,211,153,0.4); box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(52,211,153,0.08); }

        /* Card header area */
        .card-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          padding: 16px 16px 14px; gap: 8px;
        }
        .card-identity { display: flex; gap: 10px; align-items: center; min-width: 0; }
        .model-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 800; font-size: 16px;
          color: var(--color-ink);
        }
        .icon-projected { background: linear-gradient(135deg, #f5b942, #e8a030); }
        .icon-measured  { background: linear-gradient(135deg, #34d399, #1fdfa6); }
        .card-name { font-size: 14px; font-weight: 600; color: var(--color-paper); margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-provider { font-family: var(--font-mono); font-size: 11px; color: var(--color-steel); margin: 0; }
        .card-overall-wrap { text-align: right; flex-shrink: 0; }
        .card-overall-label { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.08em; color: var(--color-steel); margin-bottom: 2px; }
        .card-overall { margin: 0; line-height: 1; }
        .card-overall-num { font-family: var(--font-display); font-weight: 800; font-size: 26px; color: var(--color-paper); }
        .card-overall-denom { font-family: var(--font-mono); font-size: 12px; color: var(--color-steel); }

        /* Stats section */
        .card-stats { padding: 12px 16px 16px; border-top: 1px solid rgba(238,245,241,0.06); }
        .card-stats-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 12px;
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.09em;
          color: var(--color-steel); text-transform: uppercase;
        }
        .card-curated-tag {
          font-size: 10px; padding: 2px 8px; border-radius: 999px;
          font-family: var(--font-mono); letter-spacing: 0.04em;
        }
        .tag-proj { color: var(--color-projected); background: rgba(245,185,66,0.08); border: 1px solid rgba(245,185,66,0.2); }
        .tag-meas { color: var(--color-measured); background: rgba(52,211,153,0.08); border: 1px solid rgba(52,211,153,0.2); }
        .stat-list { display: flex; flex-direction: column; gap: 7px; }
        .stat-row { display: grid; grid-template-columns: 80px 1fr 36px; align-items: center; gap: 8px; }
        .stat-label {
          font-family: var(--font-mono); font-size: 11px; color: var(--color-steel);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .stat-track { height: 4px; background: rgba(238,245,241,0.08); border-radius: 2px; overflow: hidden; }
        .stat-fill { height: 100%; border-radius: 2px; background: rgba(238,245,241,0.22); transition: width 0.6s cubic-bezier(0.22,1,0.36,1); }
        .stat-value { font-family: var(--font-mono); font-size: 11px; color: var(--color-steel); text-align: right; }
        .stat-highlight { color: var(--color-paper) !important; font-weight: 600; }
        .stat-fill-highlight { background: linear-gradient(90deg, rgba(31,223,166,0.6), rgba(31,223,166,0.9)); }

        /* Run card */
        .card-run {
          background: rgba(15,21,18,0.4);
          border: 1px dashed rgba(31,223,166,0.25);
          min-height: 200px;
        }
        .card-run-inner {
          display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
          padding: 24px 18px; gap: 6px; height: 100%;
        }
        .card-run-hint { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.08em; color: var(--color-steel); margin: 0; }
        .card-run-name { font-family: var(--font-display); font-weight: 800; font-size: 22px; text-transform: uppercase; margin: 4px 0; }
        .card-run-sub { font-size: 12px; color: var(--color-steel); margin: 0 0 14px; }
        .card-run-btn {
          display: inline-flex; align-items: center;
          font-family: var(--font-mono); font-size: 12.5px; font-weight: 600;
          color: var(--color-ink); background: var(--color-accent);
          padding: 9px 16px; border-radius: 8px;
          transition: transform 0.2s, background 0.2s;
        }
        .card-run-btn:hover { background: var(--color-spark); transform: translateX(2px); }

        .how-link {
          display: inline-block; margin-top: 24px;
          font-family: var(--font-mono); font-size: 12.5px; color: var(--color-spark);
          border-bottom: 1px solid rgba(184,255,232,0.28); padding-bottom: 2px;
          transition: border-color 0.25s;
        }
        .how-link:hover { border-color: var(--color-spark); }

        /* ─── Methodology ─── */
        .method-section { padding: clamp(50px,9vh,100px) 0 clamp(24px,4vh,40px); }
        .method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(14px,2vw,20px); margin-top: 32px; }
        .method-card {
          background: #111416; border: 1px solid rgba(238,245,241,0.07);
          border-radius: 14px; padding: clamp(18px,2.2vw,24px);
          transition: border-color 0.25s, transform 0.25s;
        }
        .method-card:hover { border-color: rgba(31,223,166,0.35); transform: translateY(-3px); }
        .method-step {
          display: inline-flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 50%;
          font-family: var(--font-mono); font-size: 13px;
          color: var(--color-ink); background: var(--color-accent); margin-bottom: 14px;
        }
        .method-card h3 {
          font-family: var(--font-display); font-weight: 700; text-transform: uppercase;
          font-size: 19px; margin-bottom: 10px;
        }
        .method-card p { color: var(--color-paper-dim); font-size: 13.5px; line-height: 1.6; margin: 0; }

        /* ─── Categories ─── */
        .categories { padding: clamp(30px,6vh,60px) 0; }
        .category-grid { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 24px; }
        .category-pill {
          font-family: var(--font-mono); font-size: 12.5px; color: var(--color-paper);
          padding: 9px 17px; border-radius: 999px;
          border: 1px solid rgba(238,245,241,0.1); background: rgba(238,245,241,0.03);
          transition: border-color 0.2s, background 0.2s;
        }
        .category-pill:hover { border-color: rgba(31,223,166,0.4); background: rgba(31,223,166,0.05); }
        .category-pill.is-hold { color: var(--color-steel); border-style: dashed; background: transparent; }

        /* ─── Roadmap ─── */
        .roadmap { padding: clamp(50px,9vh,100px) 0 clamp(24px,4vh,40px); }
        .track { position: relative; height: 2px; border-radius: 2px; margin: 24px 0 32px; overflow: hidden; }
        .track-base { position: absolute; inset: 0; background: rgba(238,245,241,0.08); }
        .track-fill { position: absolute; inset: 0 auto 0 0; width: 0; background: linear-gradient(90deg, var(--color-accent), var(--color-spark)); transition: width 1.4s cubic-bezier(0.22,1,0.36,1); }
        .in-view .track-fill { width: 16%; }
        .phases { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(14px,2vw,20px); }
        .phase {
          background: #111416; border: 1px solid rgba(238,245,241,0.07);
          border-radius: 14px; padding: clamp(18px,2.2vw,24px);
        }
        .phase-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .phase-num { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; color: var(--color-steel); }
        .phase h3 { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; font-size: 19px; margin-bottom: 14px; }
        .phase li { font-size: 13px; color: var(--color-paper-dim); padding: 7px 0; border-top: 1px solid rgba(238,245,241,0.06); }
        .phase li:first-child { border-top: none; }
        .tag { font-family: var(--font-mono); font-size: 10px; letter-spacing: 0.05em; padding: 3px 9px; border-radius: 999px; border: 1px solid transparent; text-transform: uppercase; }
        .tag-done    { color: var(--color-measured); background: rgba(52,211,153,0.1); border-color: rgba(52,211,153,0.3); }
        .tag-next    { color: var(--color-accent); background: rgba(31,223,166,0.1); border-color: rgba(31,223,166,0.3); }
        .tag-planned { color: var(--color-steel); background: rgba(139,153,146,0.08); border-color: rgba(139,153,146,0.22); }
        .tag-stretch { color: var(--color-projected); background: rgba(245,185,66,0.07); border-color: rgba(245,185,66,0.28); }

        /* ─── Tech strip ─── */
        .tech-strip {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
          gap: 12px; margin-top: clamp(30px,5vh,50px); padding: 16px 20px;
          background: rgba(15,21,18,0.5); border: 1px solid rgba(238,245,241,0.07);
          border-radius: 12px;
        }
        .tech-line { font-family: var(--font-mono); font-size: 13px; color: var(--color-paper-dim); display: flex; align-items: center; gap: 10px; }
        .tech-prompt { color: var(--color-accent-2); }
        .tech-highlight { color: var(--color-spark); }
        .tech-stack { font-family: var(--font-mono); font-size: 12px; color: var(--color-steel); }

        /* ─── Footer ─── */
        .site-footer {
          display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
          gap: 14px; padding: 22px 0 36px;
        }
        .footer-brand { display: flex; flex-direction: column; gap: 6px; }
        .footer-copy { font-size: 12px; color: var(--color-steel); }
        .footer-links { display: flex; gap: clamp(12px,2vw,24px); flex-wrap: wrap; }
        .footer-links a { font-size: 13px; color: rgba(238,245,241,0.4); transition: color 0.2s; }
        .footer-links a:hover { color: var(--color-paper); }
        .footer-meta { font-family: var(--font-mono); font-size: 12px; color: rgba(238,245,241,0.2); }

        /* ─── Animations ─── */
        .anim { opacity: 0; transform: translateY(16px); animation: reveal 0.8s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: var(--d, 0s); }
        @keyframes reveal { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        [data-reveal] .anim { animation: none; opacity: 0; transform: translateY(16px); }
        [data-reveal].in-view .anim { animation: reveal 0.8s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: var(--d, 0s); }

        @media (prefers-reduced-motion: reduce) {
          .anim, [data-reveal] .anim { animation: none !important; opacity: 1 !important; transform: none !important; }
          .track-fill { transition: none; }
          html { scroll-behavior: auto; }
        }

        /* ─── Responsive ─── */
        @media (max-width: 1100px) {
          .dex-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 860px) {
          .hero { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .dex-grid { grid-template-columns: repeat(2, 1fr); }
          .method-grid, .phases { grid-template-columns: 1fr; }
          .track { display: none; }
        }
        @media (max-width: 640px) {
          .dex-grid { grid-template-columns: 1fr; }
          .dex-section-top { flex-direction: column; align-items: flex-start; }
          .dex-meta { align-items: flex-start; }
          .top-nav { display: none; }
          .headline { font-size: clamp(34px,10vw,52px); }
        }
        @media (max-width: 420px) {
          .btn-run { display: none; }
          .stat-row { grid-template-columns: 68px 1fr 30px; }
        }
      `}</style>
    </>
  );
}
