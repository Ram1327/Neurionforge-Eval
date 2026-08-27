"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Badge } from "../../components/ui/Badge";

function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M20 2L36 11V29L20 38L4 29V11L20 2Z" stroke="var(--color-accent)" strokeWidth="1.6" />
      <path d="M13 27V13L20 17.5V13L27 17.5V27" stroke="var(--color-paper)" strokeWidth="1.8" strokeLinecap="square" strokeLinejoin="round" />
    </svg>
  );
}

interface ProviderPreset {
  id: "openrouter" | "openai" | "anthropic" | "gemini" | "ollama";
  name: string;
  badge: string;
  defaultModel: string;
  placeholderKey: string;
  keyHelp: string;
  baseUrlRequired?: boolean;
  defaultBaseUrl?: string;
}

const PROVIDERS: ProviderPreset[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    badge: "100+ Models",
    defaultModel: "meta-llama/llama-3.3-70b-instruct",
    placeholderKey: "sk-or-v1-...",
    keyHelp: "Get a key from openrouter.ai/keys",
  },
  {
    id: "openai",
    name: "OpenAI",
    badge: "Frontier",
    defaultModel: "gpt-4o-mini",
    placeholderKey: "sk-proj-...",
    keyHelp: "Get a key from platform.openai.com",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    badge: "Claude",
    defaultModel: "claude-3-5-haiku-20241022",
    placeholderKey: "sk-ant-...",
    keyHelp: "Get a key from console.anthropic.com",
  },
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Flash / Pro",
    defaultModel: "gemini-2.0-flash",
    placeholderKey: "AIzaSy...",
    keyHelp: "Get a key from aistudio.google.com",
  },
  {
    id: "ollama",
    name: "Local / Custom",
    badge: "Ollama / vLLM",
    defaultModel: "llama3.3",
    placeholderKey: "not-needed (or bearer token)",
    keyHelp: "Self-hosted OpenAI-compatible endpoint",
    baseUrlRequired: true,
    defaultBaseUrl: "http://localhost:11434/v1",
  },
];

const BENCHMARKS = [
  {
    slug: "reasoning-v1",
    name: "Logical Reasoning v1",
    category: "Reasoning",
    count: 25,
    method: "MCQ (A/B/C/D)",
    desc: "Syllogisms, analogies, spatial inference, and causal deduction.",
  },
  {
    slug: "math-v1",
    name: "Mathematical Reasoning v1",
    category: "Mathematics",
    count: 25,
    method: "Exact Numeric Match",
    desc: "Arithmetic, algebra, ratios, and geometry problem solving.",
  },
  {
    slug: "coding-v1",
    name: "Coding Completions v1",
    category: "Coding",
    count: 25,
    method: "Exact Output Match",
    desc: "Python program output tracing, algorithms, and data structures.",
  },
];

interface StreamItem {
  itemId: string;
  gradePassed: boolean;
  latencyMs: number;
  error?: string;
}

export default function RunPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [provider, setProvider] = useState<ProviderPreset>(PROVIDERS[0]);
  const [apiKey, setApiKey] = useState("");
  const [modelId, setModelId] = useState(PROVIDERS[0].defaultModel);
  const [baseUrl, setBaseUrl] = useState("");
  const [benchmarkSlug, setBenchmarkSlug] = useState("reasoning-v1");
  const [sampleLimit, setSampleLimit] = useState(25);
  const [temperature, setTemperature] = useState(0);

  // Execution state
  const [runId, setRunId] = useState<string | null>(null);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(25);
  const [passed, setPassed] = useState(0);
  const [currentLatency, setCurrentLatency] = useState(0);
  const [streamLog, setStreamLog] = useState<StreamItem[]>([]);
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [finalLatencyAvg, setFinalLatencyAvg] = useState<number | null>(null);
  const [finalThroughput, setFinalThroughput] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleProviderSelect = (p: ProviderPreset) => {
    setProvider(p);
    setModelId(p.defaultModel);
    if (p.baseUrlRequired && !baseUrl) {
      setBaseUrl(p.defaultBaseUrl || "");
    }
  };

  const startRun = async () => {
    setStep(3);
    setCompleted(0);
    setTotal(sampleLimit);
    setPassed(0);
    setStreamLog([]);
    setErrorMessage(null);
    setFinalScore(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch("/api/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerType: provider.id,
          apiKey: apiKey.trim() || (provider.id === "ollama" ? "local" : ""),
          modelId: modelId.trim(),
          baseUrl: baseUrl.trim() || undefined,
          benchmarkSlug,
          temperature,
          maxSamples: sampleLimit,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response stream available");

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          const line = block.trim();
          if (!line.startsWith("data:")) continue;

          try {
            const data = JSON.parse(line.slice(5).trim());
            if (data.type === "start") {
              setRunId(data.runId);
              setTotal(data.total);
            } else if (data.type === "progress") {
              setCompleted(data.completed);
              setTotal(data.total);
              setPassed(data.passed);
              setCurrentLatency(data.latencyMs);
              setStreamLog((prev) => [
                {
                  itemId: data.itemId,
                  gradePassed: data.gradePassed,
                  latencyMs: data.latencyMs,
                  error: data.error,
                },
                ...prev,
              ]);
            } else if (data.type === "complete") {
              setRunId(data.runId);
              setFinalScore(data.score);
              setFinalLatencyAvg(data.latencyAvgMs);
              setFinalThroughput(data.throughputTps);
              setStep(4);
            } else if (data.type === "error") {
              setErrorMessage(data.message || "An unexpected error occurred");
            }
          } catch {
            // ignore parse chunk
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setErrorMessage(err instanceof Error ? err.message : "Run failed");
      }
    }
  };

  const cancelRun = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setStep(2);
  };

  return (
    <div className="run-page-wrap">
      {/* ── Header ── */}
      <header className="run-header">
        <Link href="/" className="brand-link">
          <BrandMark />
          <span className="brand-title">NeurionForge</span>
          <span className="brand-tag">Eval</span>
        </Link>
        <div className="header-nav">
          <Link href="/" className="nav-item">Leaderboard</Link>
          <Link href="/models" className="nav-item">Models</Link>
          <span className="nav-item active">Run Eval</span>
        </div>
      </header>

      {/* ── Wizard Nav ── */}
      <div className="wizard-stepper">
        {[
          { num: 1, label: "Model & Key" },
          { num: 2, label: "Benchmark" },
          { num: 3, label: "Execution" },
          { num: 4, label: "Results" },
        ].map((s) => (
          <div
            key={s.num}
            className={`step-bubble ${step === s.num ? "active" : step > s.num ? "completed" : ""}`}
          >
            <div className="step-num">{step > s.num ? "✓" : s.num}</div>
            <span className="step-label">{s.label}</span>
          </div>
        ))}
      </div>

      <main className="run-main-container">
        {/* STEP 1: Configure Target Model */}
        {step === 1 && (
          <div className="wizard-card">
            <div className="card-top">
              <span className="kicker">STEP 01</span>
              <h2>Configure Target Model</h2>
              <p>Bring your own API key or connect a local OpenAI-compatible endpoint. Keys remain purely in memory during the execution stream and are never written to any database.</p>
            </div>

            <div className="providers-grid">
              {PROVIDERS.map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => handleProviderSelect(p)}
                  className={`provider-card ${provider.id === p.id ? "selected" : ""}`}
                >
                  <div className="provider-top">
                    <span className="provider-name">{p.name}</span>
                    <span className="provider-badge">{p.badge}</span>
                  </div>
                  <span className="provider-sub">{p.defaultModel}</span>
                </button>
              ))}
            </div>

            <div className="form-fields">
              <div className="field-group">
                <label>
                  Model Identifier
                  <span className="field-hint">Exact model string passed to provider</span>
                </label>
                <input
                  type="text"
                  value={modelId}
                  onChange={(e) => setModelId(e.target.value)}
                  placeholder={provider.defaultModel}
                  className="text-input"
                />
              </div>

              <div className="field-group">
                <label>
                  API Key (BYOK)
                  <span className="field-hint">{provider.keyHelp}</span>
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={provider.placeholderKey}
                  className="text-input"
                />
              </div>

              {(provider.baseUrlRequired || provider.id === "ollama") && (
                <div className="field-group">
                  <label>
                    Custom Base URL
                    <span className="field-hint">OpenAI-compatible /v1 endpoint</span>
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="http://localhost:11434/v1"
                    className="text-input"
                  />
                </div>
              )}
            </div>

            <div className="action-row">
              <Link href="/" className="btn-secondary">Cancel</Link>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!modelId.trim() || (provider.id !== "ollama" && !apiKey.trim())}
                className="btn-primary"
              >
                Continue to Benchmark →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Select Benchmark */}
        {step === 2 && (
          <div className="wizard-card">
            <div className="card-top">
              <span className="kicker">STEP 02</span>
              <h2>Select Benchmark Suite</h2>
              <p>Choose the test battery to evaluate against {modelId}. Each category tests deterministic reasoning capabilities.</p>
            </div>

            <div className="benchmarks-grid">
              {BENCHMARKS.map((b) => (
                <button
                  type="button"
                  key={b.slug}
                  onClick={() => setBenchmarkSlug(b.slug)}
                  className={`benchmark-card ${benchmarkSlug === b.slug ? "selected" : ""}`}
                >
                  <div className="bench-top">
                    <span className="bench-category">{b.category}</span>
                    <span className="bench-count">{b.count} samples</span>
                  </div>
                  <h3 className="bench-title">{b.name}</h3>
                  <p className="bench-desc">{b.desc}</p>
                  <div className="bench-footer">
                    <span className="scoring-tag">Grader: {b.method}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="config-grid">
              <div className="config-item">
                <label>Sample Limit</label>
                <div className="pill-selector">
                  <button
                    type="button"
                    className={`pill-btn ${sampleLimit === 10 ? "active" : ""}`}
                    onClick={() => setSampleLimit(10)}
                  >
                    10 Samples (Quick ~20s)
                  </button>
                  <button
                    type="button"
                    className={`pill-btn ${sampleLimit === 25 ? "active" : ""}`}
                    onClick={() => setSampleLimit(25)}
                  >
                    25 Samples (Full ~50s)
                  </button>
                </div>
              </div>

              <div className="config-item">
                <label>Temperature: {temperature}</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="range-input"
                />
                <span className="field-hint">0.0 is recommended for deterministic reproducibility</span>
              </div>
            </div>

            <div className="action-row">
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={startRun} className="btn-accent">
                Start Measured Evaluation ⚡
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Live Execution */}
        {step === 3 && (
          <div className="wizard-card execution-card">
            <div className="card-top">
              <div className="live-status-pill">
                <span className="pulse-dot" />
                <span>EVALUATION IN PROGRESS</span>
              </div>
              <h2>Evaluating {modelId}</h2>
              <p>Testing against {BENCHMARKS.find((b) => b.slug === benchmarkSlug)?.name}. Streaming response verdicts live...</p>
            </div>

            {errorMessage ? (
              <div className="error-card">
                <h3>Execution Error</h3>
                <p>{errorMessage}</p>
                <div className="action-row" style={{ marginTop: 16 }}>
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                    Back to Config
                  </button>
                  <button type="button" onClick={startRun} className="btn-primary">
                    Retry Run
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="progress-section">
                  <ProgressBar completed={completed} total={total} passed={passed} />
                  <div className="latency-indicator">
                    <span>Recent item latency:</span>
                    <strong>{currentLatency} ms</strong>
                  </div>
                </div>

                <div className="live-log-box">
                  <div className="log-header">
                    <span>Live Verification Feed</span>
                    <span>{streamLog.length} items logged</span>
                  </div>
                  <div className="log-list">
                    {streamLog.map((log) => (
                      <div
                        key={log.itemId}
                        className={`log-entry ${log.gradePassed ? "passed" : "failed"}`}
                      >
                        <span className="log-id">{log.itemId}</span>
                        <span className="log-status">
                          {log.gradePassed ? "✓ PASSED" : "✗ FAILED"}
                        </span>
                        <span className="log-latency">{log.latencyMs}ms</span>
                        {log.error && <span className="log-err">({log.error})</span>}
                      </div>
                    ))}
                    {streamLog.length === 0 && (
                      <div className="log-empty">Dispatching initial prompts to {provider.name}...</div>
                    )}
                  </div>
                </div>

                <div className="action-row">
                  <button type="button" onClick={cancelRun} className="btn-secondary">
                    Cancel Run
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* STEP 4: Final Results */}
        {step === 4 && (
          <div className="wizard-card results-card">
            <div className="card-top">
              <span className="kicker">EVALUATION COMPLETE</span>
              <h2>Evaluation Results</h2>
              <p>Model: <strong>{modelId}</strong> ({provider.name}) on {BENCHMARKS.find((b) => b.slug === benchmarkSlug)?.name}</p>
            </div>

            <div className="score-hero">
              <div className="score-main">
                <span className="score-num">{finalScore?.toFixed(1)}%</span>
                <span className="score-label">Measured Accuracy</span>
              </div>
              <div className="score-details-grid">
                <div className="metric-box">
                  <span className="metric-lbl">Passed</span>
                  <span className="metric-val">{passed} / {total}</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">Avg Latency</span>
                  <span className="metric-val">{finalLatencyAvg ?? 0} ms</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">Throughput</span>
                  <span className="metric-val">{finalThroughput ?? 0} tps</span>
                </div>
                <div className="metric-box">
                  <span className="metric-lbl">Evidence Tier</span>
                  <div style={{ marginTop: 4 }}>
                    <Badge variant="measured" />
                  </div>
                </div>
              </div>
            </div>

            <div className="action-row" style={{ marginTop: 24 }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                Run Another Test
              </button>
              <Link href={`/models/${encodeURIComponent(modelId)}`} className="btn-primary">
                View Model Evidence Page →
              </Link>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .run-page-wrap {
          min-height: 100vh;
          background: var(--color-ink);
          color: var(--color-paper);
          font-family: var(--font-sans);
          padding: 0 24px 60px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .run-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 0;
          border-bottom: 1px solid rgba(238, 245, 241, 0.07);
        }

        .brand-link {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .brand-title {
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 19px;
          color: var(--color-paper);
        }

        .brand-tag {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-spark);
          background: rgba(31, 223, 166, 0.12);
          border: 1px solid rgba(31, 223, 166, 0.28);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .header-nav {
          display: flex;
          gap: 18px;
          font-size: 13.5px;
        }

        .nav-item {
          color: rgba(238, 245, 241, 0.5);
          text-decoration: none;
          transition: color 0.2s;
        }

        .nav-item:hover,
        .nav-item.active {
          color: var(--color-paper);
        }

        .wizard-stepper {
          display: flex;
          justify-content: space-between;
          margin: 32px 0 40px;
          position: relative;
        }

        .step-bubble {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.4;
          transition: opacity 0.2s;
        }

        .step-bubble.active {
          opacity: 1;
        }

        .step-bubble.completed {
          opacity: 0.85;
        }

        .step-num {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-size: 12px;
          background: rgba(238, 245, 241, 0.08);
          color: var(--color-paper);
        }

        .step-bubble.active .step-num {
          background: var(--color-accent);
          color: var(--color-ink);
          font-weight: 700;
        }

        .step-bubble.completed .step-num {
          background: var(--color-measured);
          color: var(--color-ink);
        }

        .step-label {
          font-family: var(--font-mono);
          font-size: 12px;
          letter-spacing: 0.04em;
        }

        .wizard-card {
          background: #111416;
          border: 1px solid rgba(238, 245, 241, 0.08);
          border-radius: 16px;
          padding: clamp(24px, 4vw, 36px);
        }

        .card-top {
          margin-bottom: 28px;
        }

        .kicker {
          font-family: var(--font-mono);
          font-size: 10.5px;
          letter-spacing: 0.12em;
          color: var(--color-accent);
          display: block;
          margin-bottom: 6px;
        }

        .card-top h2 {
          font-family: var(--font-display);
          font-size: clamp(24px, 3.2vw, 32px);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          margin-bottom: 8px;
        }

        .card-top p {
          color: var(--color-steel);
          font-size: 14px;
          line-height: 1.6;
        }

        .providers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }

        .provider-card {
          background: rgba(238, 245, 241, 0.03);
          border: 1px solid rgba(238, 245, 241, 0.08);
          border-radius: 12px;
          padding: 14px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .provider-card:hover {
          border-color: rgba(31, 223, 166, 0.4);
          background: rgba(31, 223, 166, 0.04);
        }

        .provider-card.selected {
          border-color: var(--color-accent);
          background: rgba(31, 223, 166, 0.08);
        }

        .provider-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 6px;
        }

        .provider-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-paper);
        }

        .provider-badge {
          font-family: var(--font-mono);
          font-size: 9.5px;
          color: var(--color-steel);
          background: rgba(238, 245, 241, 0.06);
          padding: 2px 6px;
          border-radius: 4px;
        }

        .provider-sub {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-steel);
          display: block;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .form-fields {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 32px;
        }

        .field-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field-group label {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--color-paper);
          display: flex;
          justify-content: space-between;
        }

        .field-hint {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-steel);
          font-weight: normal;
        }

        .text-input {
          background: #090c0a;
          border: 1px solid rgba(238, 245, 241, 0.12);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--color-paper);
          font-family: var(--font-mono);
          font-size: 13.5px;
          outline: none;
          transition: border-color 0.2s;
        }

        .text-input:focus {
          border-color: var(--color-accent);
        }

        .benchmarks-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        .benchmark-card {
          background: rgba(238, 245, 241, 0.03);
          border: 1px solid rgba(238, 245, 241, 0.08);
          border-radius: 12px;
          padding: 18px;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .benchmark-card:hover {
          border-color: rgba(31, 223, 166, 0.4);
        }

        .benchmark-card.selected {
          border-color: var(--color-accent);
          background: rgba(31, 223, 166, 0.06);
        }

        .bench-top {
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .bench-category {
          color: var(--color-accent);
        }

        .bench-count {
          color: var(--color-steel);
        }

        .bench-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-paper);
          margin: 0;
        }

        .bench-desc {
          font-size: 12.5px;
          color: var(--color-steel);
          line-height: 1.5;
          margin: 0;
        }

        .bench-footer {
          margin-top: auto;
          padding-top: 8px;
        }

        .scoring-tag {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--color-paper-dim);
          background: rgba(238, 245, 241, 0.06);
          padding: 3px 8px;
          border-radius: 4px;
        }

        .config-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
          padding-top: 20px;
          border-top: 1px solid rgba(238, 245, 241, 0.06);
        }

        .config-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .config-item label {
          font-size: 13px;
          font-weight: 600;
        }

        .pill-selector {
          display: flex;
          gap: 8px;
        }

        .pill-btn {
          flex: 1;
          background: rgba(238, 245, 241, 0.04);
          border: 1px solid rgba(238, 245, 241, 0.1);
          border-radius: 6px;
          padding: 8px 12px;
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--color-steel);
          cursor: pointer;
        }

        .pill-btn.active {
          background: rgba(31, 223, 166, 0.12);
          border-color: var(--color-accent);
          color: var(--color-spark);
        }

        .range-input {
          accent-color: var(--color-accent);
        }

        .action-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
        }

        .btn-primary {
          background: var(--color-paper);
          color: var(--color-ink);
          font-weight: 600;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: transform 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--color-spark);
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .btn-accent {
          background: var(--color-accent);
          color: var(--color-ink);
          font-weight: 700;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: transform 0.2s;
        }

        .btn-accent:hover {
          background: var(--color-spark);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: transparent;
          color: var(--color-steel);
          border: 1px solid rgba(238, 245, 241, 0.14);
          font-size: 13.5px;
          padding: 11px 20px;
          border-radius: 8px;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s;
        }

        .btn-secondary:hover {
          color: var(--color-paper);
          border-color: rgba(238, 245, 241, 0.3);
        }

        .live-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-accent);
          background: rgba(31, 223, 166, 0.1);
          border: 1px solid rgba(31, 223, 166, 0.25);
          padding: 4px 10px;
          border-radius: 999px;
          margin-bottom: 12px;
        }

        .pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          box-shadow: 0 0 8px var(--color-accent);
        }

        .progress-section {
          background: #090c0a;
          border: 1px solid rgba(238, 245, 241, 0.06);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .latency-indicator {
          margin-top: 12px;
          display: flex;
          justify-content: space-between;
          font-family: var(--font-mono);
          font-size: 11.5px;
          color: var(--color-steel);
        }

        .live-log-box {
          background: #090c0a;
          border: 1px solid rgba(238, 245, 241, 0.06);
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          padding: 10px 16px;
          background: rgba(238, 245, 241, 0.03);
          border-bottom: 1px solid rgba(238, 245, 241, 0.06);
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-steel);
        }

        .log-list {
          max-height: 220px;
          overflow-y: auto;
          padding: 8px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .log-entry {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-mono);
          font-size: 12px;
          padding: 4px 0;
        }

        .log-id {
          color: var(--color-steel);
          width: 50px;
        }

        .log-entry.passed .log-status {
          color: var(--color-measured);
        }

        .log-entry.failed .log-status {
          color: #f87171;
        }

        .log-latency {
          color: var(--color-steel);
          margin-left: auto;
        }

        .log-err {
          color: #f87171;
          font-size: 11px;
        }

        .log-empty {
          color: var(--color-steel);
          font-family: var(--font-mono);
          font-size: 12px;
          padding: 16px 0;
          text-align: center;
        }

        .error-card {
          background: rgba(248, 113, 113, 0.06);
          border: 1px solid rgba(248, 113, 113, 0.25);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .error-card h3 {
          color: #f87171;
          margin-bottom: 6px;
        }

        .score-hero {
          background: #090c0a;
          border: 1px solid rgba(52, 211, 153, 0.2);
          border-radius: 16px;
          padding: clamp(24px, 4vw, 36px);
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 28px;
          align-items: center;
        }

        .score-main {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          border-right: 1px solid rgba(238, 245, 241, 0.06);
        }

        .score-num {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: clamp(48px, 6vw, 64px);
          color: var(--color-measured);
          line-height: 1;
        }

        .score-label {
          font-family: var(--font-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          color: var(--color-steel);
          margin-top: 8px;
        }

        .score-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .metric-box {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .metric-lbl {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--color-steel);
        }

        .metric-val {
          font-family: var(--font-mono);
          font-size: 18px;
          font-weight: 600;
          color: var(--color-paper);
        }

        @media (max-width: 640px) {
          .wizard-stepper {
            display: none;
          }
          .config-grid {
            grid-template-columns: 1fr;
          }
          .score-hero {
            grid-template-columns: 1fr;
          }
          .score-main {
            border-right: none;
            border-bottom: 1px solid rgba(238, 245, 241, 0.06);
          }
        }
      `}</style>
    </div>
  );
}
