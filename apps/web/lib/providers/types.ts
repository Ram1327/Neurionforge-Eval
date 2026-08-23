/**
 * NeurionForge Eval — LLM Provider Types
 *
 * All provider wrappers share these interfaces.
 * API keys are NEVER stored server-side — they are passed per-call from client session memory.
 */

export type ProviderType = "openai" | "anthropic" | "gemini" | "openrouter" | "ollama";

export interface ProviderConfig {
  /** BYOK: Bring Your Own Key. Never stored in DB or server logs. */
  apiKey: string;
  /** The model identifier string (e.g. "gpt-4o", "claude-3-5-sonnet-20241022") */
  model: string;
  /**
   * Optional custom base URL for local/self-hosted models.
   * Used by the Ollama/OpenAI-compatible wrapper.
   */
  baseUrl?: string;
}

export interface CompletionRequest {
  prompt: string;
  systemPrompt?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface CompletionResponse {
  output: string;
  /** Number of input tokens (prompt tokens) */
  inputTokens: number;
  /** Number of output tokens (completion tokens) */
  outputTokens: number;
  /** Wall-clock latency from request start to response received, in milliseconds */
  latencyMs: number;
  /** The model string echoed back from the provider */
  model: string;
  /** The provider type that handled this request */
  provider: ProviderType;
}

export class ProviderError extends Error {
  constructor(
    public readonly provider: ProviderType,
    public readonly statusCode: number | null,
    message: string
  ) {
    super(`[${provider}] ${message}`);
    this.name = "ProviderError";
  }
}
