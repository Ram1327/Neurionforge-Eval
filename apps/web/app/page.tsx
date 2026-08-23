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

// ── Signal-green ambient canvas (from design reference) ──────────────────────
function ForgeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    if (!canvas || reduceMotion) return;

    const ctx = canvas.getContext("2d")!;
    const COUNT = 46;
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
        r: Math.random() * 1.6 + 0.4,
        speed: Math.random() * 0.4 + 0.15,
        drift: (Math.random() - 0.5) * 0.3,
        hue: Math.random() > 0.5 ? "31,223,166" : "184,255,232",
        alpha: Math.random() * 0.5 + 0.15,
        flicker: Math.random() * Math.PI * 2,
      };
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      const grad = ctx.createRadialGradient(
        width * 0.5, height * 0.95, 0,
        width * 0.5, height * 0.95, Math.max(width, height) * 0.55
      );
      grad.addColorStop(0, "rgba(31,223,166,0.09)");
      grad.addColorStop(1, "rgba(31,223,166,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.flicker += 0.05;
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

// ── Leaderboard sample data ──────────────────────────────────────────────────
const LEADERBOARD = [
  { name: "GPT-5",            reasoning: 94.1, coding: 96.3, math: 93.8, overall: 94.7, type: "projected" },
  { name: "Claude 4 Sonnet",  reasoning: 92.4, coding: 94.1, math: 91.5, overall: 92.7, type: "projected" },
  { name: "Gemini 2.5 Pro",   reasoning: 91.8, coding: 92.7, math: 93.1, overall: 92.5, type: "projected" },
  { name: "Qwen2.5-72B",      reasoning: 85.2, coding: 87.0, math: 82.4, overall: 84.9, type: "measured" },
  { name: "Llama 3.3-70B",    reasoning: 82.1, coding: 83.4, math: 79.6, overall: 81.7, type: "measured" },
  { name: "Your Model",       reasoning: null, coding: null, math: null, overall: null, type: "run" },
];

// ── Phase roadmap data ───────────────────────────────────────────────────────
const PHASES = [
  { num: "Phase 0", label: "Next",    title: "Foundations",        items: ["Monorepo + Next.js shell", "Prisma / Supabase schema", "Provider client wrappers"] },
  { num: "Phase 1", label: "Planned", title: "Core Loop",           items: ["Reasoning / Coding / Math tests", "Bring-your-own-key runs", "Local models via tunnel URL"] },
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
      { threshold: 0.12 }
    );
    sections.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <ForgeCanvas />
      {/* Grain overlay */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none",
          opacity: 0.035, mixBlendMode: "overlay",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="page">
        {/* ── HEADER ── */}
        <header className="site-header">
          <a href="https://neurionforge.com" className="brand" aria-label="NeurionForge home">
            <BrandMark />
            <span className="brand-word">NeurionForge</span>
            <span className="brand-tag">Eval</span>
          </a>

          <nav className="nav-pill" aria-label="Primary">
            <a href="https://neurionforge.com" className="nav-link">Home</a>
            <a href="https://aistudio.neurionforge.com" className="nav-link">AI Studio</a>
            <a href="https://eval.neurionforge.com" className="nav-link is-active">Evaluation</a>
            <a href="https://agency.neurionforge.com" className="nav-link">Agency</a>
          </nav>

          <a href="#run" className="btn-signin">Run a model</a>
        </header>

        <main>
          {/* ── HERO ── */}
          <section className="hero">
            <div className="eyebrow anim">
              <span className="dot" />
              <span>STATION 02 — AI EVALUATION</span>
            </div>

            <div className="trust-pill anim" style={{ ["--d" as string]: ".12s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              </svg>
              <span>Projected &amp; Measured — Transparent Methodology</span>
            </div>

            <h1 className="headline">
              <span className="line anim" style={{ ["--d" as string]: ".2s" }}>We Built The Tests.</span>
              <span className="line anim accent" style={{ ["--d" as string]: ".34s" }}>See How Frontier Stacks Up.</span>
            </h1>

            <p className="subhead anim" style={{ ["--d" as string]: ".46s" }}>
              Projected scores for frontier models we can&apos;t afford to run at scale,
              measured scores for anything you run yourself — your API key, your local model,
              your dataset.
            </p>

            <div className="hero-cta anim" style={{ ["--d" as string]: ".58s" }}>
              <a href="#run" className="btn-primary">Run your own model</a>
              <a href="#leaderboard" className="btn-ghost">View the leaderboard</a>
            </div>

            <div className="scroll-cue anim" style={{ ["--d" as string]: ".74s" }} aria-hidden="true">
              <span />
            </div>
          </section>

          {/* ── LEADERBOARD ── */}
          <section id="leaderboard" className="leaderboard" data-reveal>
            <div className="section-head">
              <h2 className="anim">The Leaderboard</h2>
              <p className="anim" style={{ ["--d" as string]: ".08s" }}>
                Projected for frontier models. Measured for anything run through NeurionForge directly.
              </p>
              <div className="legend anim" style={{ ["--d" as string]: ".14s" }}>
                <span className="legend-item">
                  <i className="badge-dot badge-measured" />
                  <span>Measured — run directly on our tests</span>
                </span>
                <span className="legend-item">
                  <i className="badge-dot badge-projected" />
                  <span>Projected — estimated from public scores</span>
                </span>
              </div>
            </div>

            <div className="table-wrap anim" style={{ ["--d" as string]: ".2s" }}>
              <div className="table-caption">
                Sample data — live results coming in Phase 1
              </div>
              <table className="lb-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Reasoning</th>
                    <th>Coding</th>
                    <th>Math</th>
                    <th>Overall</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {LEADERBOARD.map((row) => (
                    <tr key={row.name}>
                      <td className="model-cell">{row.name}</td>
                      <td>{row.reasoning ?? "—"}</td>
                      <td>{row.coding ?? "—"}</td>
                      <td>{row.math ?? "—"}</td>
                      <td>{row.overall ?? "—"}</td>
                      <td>
                        {row.type === "measured" && (
                          <span className="badge badge-measured">✓ Measured</span>
                        )}
                        {row.type === "projected" && (
                          <span className="badge badge-projected">~ Projected</span>
                        )}
                        {row.type === "run" && (
                          <a href="#run" className="badge badge-run">Run it →</a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <a href="#methodology" className="methodology-link anim" style={{ ["--d" as string]: ".26s" }}>
              How projection works →
            </a>
          </section>

          {/* ── RUN YOUR MODEL ── */}
          <section id="run" className="core-loop" data-reveal>
            <div className="section-head">
              <h2 className="anim">Run Your Own Model</h2>
              <p className="anim" style={{ ["--d" as string]: ".08s" }}>
                Three steps. Your key or your hardware — nothing runs on ours.
              </p>
            </div>

            <div className="steps">
              <div className="step-line" aria-hidden="true">
                <div className="step-line-base" />
                <div className="step-line-fill" />
              </div>

              {[
                {
                  num: "01", title: "Select Model",
                  desc: "Popular models, or your own — provider API, local endpoint, or a custom OpenAI-compatible URL.",
                  chips: ["Provider API", "Local Model", "Custom API"],
                },
                {
                  num: "02", title: "Select Benchmark",
                  desc: "One of our standard categories, or a dataset you upload with your own scoring criteria.",
                  chips: ["Reasoning", "Coding", "Custom Dataset"],
                },
                {
                  num: "03", title: "Run Evaluation",
                  desc: "Results come back scored, broken down per question, and marked Measured — permanently, publicly comparable.",
                  chips: ["Per-question detail", "Shareable link"],
                },
              ].map((step, i) => (
                <article
                  key={step.num}
                  className="step anim"
                  style={{ ["--d" as string]: `${i * 0.08}s` }}
                >
                  <span className="step-num">{step.num}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                  <div className="chip-row">
                    {step.chips.map(c => <span key={c} className="chip">{c}</span>)}
                  </div>
                </article>
              ))}
            </div>

            <div className="source-note anim" style={{ ["--d" as string]: ".24s" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L20 6V12C20 17 16.5 20.5 12 22C7.5 20.5 4 17 4 12V6L12 2Z"
                  stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
              <span>API keys stay in your browser session — never stored on our servers.</span>
            </div>
          </section>

          {/* ── METHODOLOGY ── */}
          <section id="methodology" className="methodology" data-reveal>
            <div className="section-head">
              <h2 className="anim">How Projection Works</h2>
              <p className="anim" style={{ ["--d" as string]: ".08s" }}>
                No black box — the formula and its inputs are public.
              </p>
            </div>

            <div className="method-grid">
              {[
                {
                  n: "1", title: "Calibrate",
                  desc: "We run our own tests directly on open-weight models we can afford — that's our Measured calibration set.",
                },
                {
                  n: "2", title: "Correlate",
                  desc: "Those same models have known public scores (GPQA, SWE-bench, AIME). We fit a transparent weighted formula between the two.",
                },
                {
                  n: "3", title: "Project",
                  desc: "Frontier models' public scores go into that formula. Out comes a Projected score, with a confidence range — never false precision.",
                },
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
            <div className="section-head">
              <h2 className="anim">Evaluation Categories</h2>
              <p className="anim" style={{ ["--d" as string]: ".08s" }}>
                Focused on what&apos;s still hard, not what&apos;s already saturated.
              </p>
            </div>
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
            <div className="section-head">
              <h2 className="anim">The Build Path</h2>
              <p className="anim" style={{ ["--d" as string]: ".08s" }}>
                Six phases — the projection engine only ships once there&apos;s real calibration data to earn it.
              </p>
            </div>

            <div className="track">
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
        <footer className="site-footer">
          <div className="footer-brand">
            <span className="brand-word small">NeurionForge</span>
            <span className="footer-copy">© 2026 NeurionForge. All rights reserved.</span>
          </div>
          <nav className="footer-links" aria-label="Products">
            <a href="https://neurionforge.com">Home</a>
            <a href="https://aistudio.neurionforge.com">AI Studio</a>
            <a href="https://agency.neurionforge.com">Agency</a>
            <a href="mailto:hello@neurionforge.com">Contact</a>
          </nav>
          <div className="footer-meta">neurionforge.com &nbsp;·&nbsp; Transparent By Default</div>
        </footer>
      </div>

      {/* ── PAGE-LEVEL STYLES ── */}
      <style>{`
        /* Layout container */
        .page {
          position: relative; z-index: 2;
          max-width: 1180px; margin: 0 auto;
          padding: 0 clamp(18px, 4vw, 40px);
        }

        /* Header */
        .site-header {
          display: flex; align-items: center; gap: clamp(14px, 2.4vw, 28px);
          padding: clamp(18px, 3vh, 28px) 0;
        }
        .brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .brand-word {
          font-family: var(--font-display); font-weight: 700; font-size: 19px;
          letter-spacing: 0.01em; color: var(--color-paper);
        }
        .brand-word.small { font-size: 16px; }
        .brand-tag {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.04em;
          color: var(--color-spark); background: rgba(31,223,166,0.14);
          border: 1px solid rgba(31,223,166,0.3); padding: 4px 9px;
          border-radius: 999px; margin-left: 2px;
        }
        .nav-pill {
          display: flex; align-items: center; gap: clamp(4px, 1vw, 10px);
          background: rgba(15,21,18,0.6); border: 1px solid rgba(238,245,241,0.08);
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          border-radius: 999px; padding: 6px; margin-left: auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.35);
        }
        .nav-link {
          font-family: var(--font-mono); font-size: 12.5px; letter-spacing: 0.02em;
          color: var(--color-paper); opacity: 0.55; padding: 9px 15px;
          border-radius: 999px; transition: opacity 0.25s, background 0.25s;
          white-space: nowrap;
        }
        .nav-link:hover { opacity: 0.85; }
        .nav-link.is-active {
          opacity: 1; background: rgba(31,223,166,0.14); color: var(--color-spark);
        }
        .btn-signin {
          font-family: var(--font-mono); font-size: 12.5px; letter-spacing: 0.02em;
          color: var(--color-paper); background: var(--color-iron-2);
          border: 1px solid rgba(238,245,241,0.1); padding: 11px 18px;
          border-radius: 999px; transition: background 0.25s, transform 0.25s, border-color 0.25s;
          flex-shrink: 0;
        }
        .btn-signin:hover { background: #223328; border-color: rgba(31,223,166,0.4); transform: translateY(-1px); }

        /* Hero */
        .hero {
          min-height: 80vh; min-height: 80dvh; display: flex; flex-direction: column;
          align-items: center; justify-content: center; text-align: center;
          padding: 6vh 0 4vh;
        }
        .eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.14em;
          color: var(--color-steel); margin-bottom: 16px;
        }
        .dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--color-accent); box-shadow: 0 0 10px var(--color-accent);
          display: inline-block;
        }
        .trust-pill {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 12.5px; color: var(--color-spark);
          background: rgba(31,223,166,0.1); border: 1px solid rgba(31,223,166,0.3);
          padding: 8px 16px; border-radius: 999px; margin-bottom: clamp(20px, 3vh, 30px);
        }
        .headline {
          font-family: var(--font-display); font-weight: 800; line-height: 0.98;
          letter-spacing: -0.01em; text-transform: uppercase;
          font-size: clamp(30px, 5.8vw, 68px); max-width: 19ch;
        }
        .headline .line { display: block; overflow: hidden; }
        .headline .accent {
          color: var(--color-accent-2);
          text-shadow: 0 0 40px rgba(31,223,166,0.45);
        }
        .subhead {
          margin-top: clamp(18px, 3vh, 28px); max-width: 600px;
          font-size: clamp(15px, 1.6vw, 17.5px); line-height: 1.6; color: var(--color-paper-dim);
        }
        .hero-cta {
          margin-top: clamp(26px, 4vh, 38px); display: flex; gap: 14px;
          flex-wrap: wrap; justify-content: center;
        }
        .btn-primary {
          font-family: var(--font-sans); font-weight: 600; font-size: 14.5px;
          color: var(--color-ink); background: var(--color-paper);
          padding: 14px 26px; border-radius: 999px;
          box-shadow: 0 0 0 1px rgba(31,223,166,0.25), 0 0 26px rgba(31,223,166,0.35), 0 0 56px rgba(31,223,166,0.14);
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .btn-primary:hover { transform: translateY(-2px) scale(1.02); }
        .btn-ghost {
          font-family: var(--font-sans); font-weight: 600; font-size: 14.5px;
          color: var(--color-paper); background: transparent;
          border: 1px solid rgba(238,245,241,0.22); padding: 13px 24px; border-radius: 999px;
          transition: border-color 0.25s, background 0.25s, transform 0.25s;
        }
        .btn-ghost:hover { border-color: rgba(31,223,166,0.55); background: rgba(31,223,166,0.08); transform: translateY(-2px); }
        .scroll-cue {
          margin-top: clamp(40px, 6vh, 64px); width: 22px; height: 34px;
          border: 1.5px solid rgba(238,245,241,0.3); border-radius: 12px;
          display: flex; justify-content: center; padding-top: 6px;
        }
        .scroll-cue span {
          width: 3px; height: 7px; border-radius: 2px; background: var(--color-accent-2);
          animation: cueMove 1.8s ease-in-out infinite;
        }
        @keyframes cueMove { 0%, 100% { transform: translateY(0); opacity: 1; } 60% { transform: translateY(8px); opacity: 0.2; } }

        /* Section head */
        .section-head { text-align: center; margin-bottom: clamp(30px, 5vh, 50px); }
        .section-head h2 {
          font-family: var(--font-display); font-weight: 800; text-transform: uppercase;
          font-size: clamp(24px, 3.4vw, 40px); letter-spacing: -0.01em;
        }
        .section-head p { margin-top: 10px; color: var(--color-steel); font-size: 14.5px; }
        .legend { display: flex; justify-content: center; gap: 20px; margin-top: 18px; flex-wrap: wrap; }
        .legend-item { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 11.5px; color: var(--color-steel); }
        .badge-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
        .badge-dot.badge-measured { background: var(--color-measured); box-shadow: 0 0 6px var(--color-measured); }
        .badge-dot.badge-projected { background: var(--color-projected); box-shadow: 0 0 6px var(--color-projected); border: 1px dashed rgba(245,185,66,0.6); }

        /* Leaderboard */
        .leaderboard { padding: clamp(40px, 8vh, 90px) 0 clamp(20px, 4vh, 40px); text-align: center; }
        .table-wrap {
          border: 1px solid rgba(238,245,241,0.08); border-radius: 18px; overflow: hidden;
          background: rgba(15,21,18,0.5); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        }
        .table-caption {
          font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--color-projected); background: rgba(245,185,66,0.08);
          border-bottom: 1px dashed rgba(245,185,66,0.3); padding: 8px 16px; text-align: left;
        }
        .lb-table { font-size: 13.5px; }
        .lb-table th {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase;
          color: var(--color-steel); text-align: left; padding: 14px 16px;
          border-bottom: 1px solid rgba(238,245,241,0.08);
        }
        .lb-table td { padding: 14px 16px; border-bottom: 1px solid rgba(238,245,241,0.06); color: var(--color-paper-dim); text-align: left; }
        .lb-table tr:last-child td { border-bottom: none; }
        .model-cell { color: var(--color-paper); font-weight: 600; }
        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: var(--font-mono); font-size: 11px; padding: 5px 11px;
          border-radius: 999px; white-space: nowrap;
        }
        .badge-measured { color: var(--color-measured); background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3); }
        .badge-projected { color: var(--color-projected); background: rgba(245,185,66,0.08); border: 1px dashed rgba(245,185,66,0.45); }
        .badge-run { color: var(--color-ink); background: var(--color-accent); border: 1px solid var(--color-accent); font-weight: 600; transition: transform 0.2s; }
        .badge-run:hover { transform: translateX(2px); }
        .methodology-link {
          display: inline-block; margin-top: 22px;
          font-family: var(--font-mono); font-size: 12.5px; color: var(--color-spark);
          border-bottom: 1px solid rgba(184,255,232,0.3); padding-bottom: 2px;
          transition: border-color 0.25s;
        }
        .methodology-link:hover { border-color: var(--color-spark); }

        /* Core loop steps */
        .core-loop { padding: clamp(50px, 9vh, 100px) 0 clamp(20px, 4vh, 40px); }
        .steps { position: relative; display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(18px, 2.6vw, 28px); }
        .step-line { position: absolute; top: -22px; left: 0; width: 100%; height: 3px; border-radius: 3px; overflow: hidden; }
        .step-line-base { position: absolute; inset: 0; background: var(--color-iron-2); }
        .step-line-fill { position: absolute; inset: 0 auto 0 0; width: 0; background: linear-gradient(90deg, var(--color-accent), var(--color-spark)); transition: width 1.3s cubic-bezier(0.22,1,0.36,1); }
        .in-view .step-line-fill { width: 100%; }
        .step {
          background: linear-gradient(180deg, rgba(27,42,34,0.55), rgba(15,21,18,0.55));
          border: 1px solid rgba(238,245,241,0.08); border-radius: 18px;
          padding: clamp(20px, 2.6vw, 26px); backdrop-filter: blur(10px);
          transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        .step:hover { border-color: rgba(31,223,166,0.4); transform: translateY(-4px); box-shadow: 0 18px 40px rgba(0,0,0,0.35), 0 0 30px rgba(31,223,166,0.12); }
        .step-num { font-family: var(--font-mono); font-size: 12px; color: var(--color-steel); letter-spacing: 0.06em; }
        .step h3 { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; font-size: 21px; margin: 10px 0; }
        .step p { color: var(--color-paper-dim); font-size: 13.5px; line-height: 1.55; min-height: 3.6em; }
        .chip-row { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 14px; }
        .chip { font-family: var(--font-mono); font-size: 10.5px; color: var(--color-accent-2); background: rgba(31,223,166,0.08); border: 1px solid rgba(31,223,166,0.22); padding: 5px 10px; border-radius: 999px; }
        .source-note { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: clamp(24px, 4vh, 34px); font-family: var(--font-mono); font-size: 12px; color: var(--color-steel); }
        .source-note svg { color: var(--color-accent-2); flex-shrink: 0; }

        /* Methodology */
        .methodology { padding: clamp(40px, 8vh, 90px) 0 clamp(20px, 4vh, 40px); }
        .method-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(16px, 2vw, 22px); }
        .method-card { background: rgba(15,21,18,0.5); border: 1px solid rgba(238,245,241,0.08); border-radius: 18px; padding: clamp(20px, 2.4vw, 26px); text-align: center; }
        .method-step { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 50%; font-family: var(--font-mono); font-size: 14px; color: var(--color-ink); background: var(--color-accent); margin-bottom: 16px; }
        .method-card h3 { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; font-size: 19px; margin-bottom: 10px; }
        .method-card p { color: var(--color-paper-dim); font-size: 13.5px; line-height: 1.6; }

        /* Categories */
        .categories { padding: clamp(30px, 6vh, 60px) 0; }
        .category-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
        .category-pill { font-family: var(--font-mono); font-size: 12.5px; color: var(--color-paper); padding: 10px 18px; border-radius: 999px; border: 1px solid rgba(238,245,241,0.12); background: rgba(31,223,166,0.05); }
        .category-pill.is-hold { color: var(--color-steel); border-style: dashed; background: transparent; }

        /* Roadmap */
        .roadmap { padding: clamp(50px, 9vh, 100px) 0 clamp(20px, 4vh, 40px); }
        .track { position: relative; height: 3px; border-radius: 3px; margin-bottom: clamp(28px, 4vh, 40px); overflow: hidden; }
        .track-base { position: absolute; inset: 0; background: var(--color-iron-2); }
        .track-fill { position: absolute; inset: 0 auto 0 0; width: 0; background: linear-gradient(90deg, var(--color-accent), var(--color-spark)); transition: width 1.3s cubic-bezier(0.22,1,0.36,1); }
        .in-view .track-fill { width: 16%; }
        .phases { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(18px, 2.6vw, 28px); }
        .phase { background: rgba(15,21,18,0.5); border: 1px solid rgba(238,245,241,0.08); border-radius: 18px; padding: clamp(20px, 2.6vw, 26px); }
        .phase-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .phase-num { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; color: var(--color-steel); }
        .phase h3 { font-family: var(--font-display); font-weight: 700; text-transform: uppercase; font-size: 21px; margin-bottom: 14px; }
        .phase li { font-size: 13.5px; color: var(--color-paper-dim); padding: 8px 0; border-top: 1px solid rgba(238,245,241,0.07); }
        .phase li:first-child { border-top: none; }
        .tag { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 999px; border: 1px solid transparent; text-transform: uppercase; flex-shrink: 0; }
        .tag-next { color: var(--color-next); background: rgba(31,223,166,0.1); border-color: rgba(31,223,166,0.3); }
        .tag-planned { color: var(--color-steel); background: rgba(138,147,163,0.1); border-color: rgba(138,147,163,0.25); }
        .tag-stretch { color: var(--color-projected); background: rgba(245,185,66,0.08); border-color: rgba(245,185,66,0.3); }

        /* Tech strip */
        .tech-strip { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: clamp(30px, 5vh, 50px); padding: 18px 22px; background: rgba(15,21,18,0.55); border: 1px solid rgba(238,245,241,0.08); border-radius: 14px; }
        .tech-line { font-family: var(--font-mono); font-size: 13px; color: var(--color-paper-dim); display: flex; align-items: center; gap: 10px; }
        .tech-prompt { color: var(--color-accent-2); }
        .tech-highlight { color: var(--color-spark); }
        .tech-stack { font-family: var(--font-mono); font-size: 12px; color: var(--color-steel); }

        /* Footer */
        .site-footer { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 14px; padding: 26px 0 40px; margin-top: clamp(20px, 4vh, 40px); border-top: 1px solid rgba(238,245,241,0.08); }
        .footer-brand { display: flex; flex-direction: column; gap: 4px; }
        .footer-copy { font-size: 12.5px; color: var(--color-steel); }
        .footer-links { display: flex; gap: clamp(14px, 2.5vw, 26px); flex-wrap: wrap; }
        .footer-links a { font-family: var(--font-mono); font-size: 12.5px; color: var(--color-paper-dim); transition: color 0.25s; }
        .footer-links a:hover { color: var(--color-spark); }
        .footer-meta { font-family: var(--font-mono); font-size: 12px; color: var(--color-steel); }

        /* Entrance animations */
        .anim { opacity: 0; transform: translateY(20px); animation: reveal 0.85s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: var(--d, 0s); }
        @keyframes reveal { from { opacity: 0; transform: translateY(20px); filter: blur(6px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        [data-reveal] .anim { animation: none; opacity: 0; transform: translateY(20px); }
        [data-reveal].in-view .anim { animation: reveal 0.85s cubic-bezier(0.22,1,0.36,1) forwards; animation-delay: var(--d, 0s); }

        @media (prefers-reduced-motion: reduce) {
          .anim, [data-reveal] .anim { animation: none !important; opacity: 1 !important; transform: none !important; filter: none !important; }
          .scroll-cue span { animation: none; }
          .track-fill, .step-line-fill { transition: none; }
          html { scroll-behavior: auto; }
        }

        /* Responsive */
        @media (max-width: 860px) {
          .steps, .phases { grid-template-columns: 1fr; }
          .step-line, .track { display: none; }
          .method-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .nav-pill, .btn-signin { display: none; }
          .headline { max-width: 13ch; }
          .hero { min-height: 86vh; min-height: 86dvh; }
          .tech-strip { flex-direction: column; align-items: flex-start; }
          .lb-table { font-size: 12px; }
          .lb-table th, .lb-table td { padding: 10px; }
        }
        @media (max-width: 640px) {
          .table-wrap { overflow-x: auto; }
          .lb-table { min-width: 560px; }
        }
        @media (max-width: 420px) {
          .headline { font-size: clamp(28px, 9vw, 42px); letter-spacing: -0.02em; }
        }
      `}</style>
    </>
  );
}
