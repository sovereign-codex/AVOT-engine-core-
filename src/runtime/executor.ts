/**
 * Minimal Graph Executor (Linear Path MVP)
 *
 * This executor runs a compiled graph in a deterministic, linear fashion.
 * It is intentionally simple:
 * - single input
 * - single execution path
 * - no branching
 *
 * This is sufficient to unblock:
 * - CLI execution
 * - AVOT runs
 * - Council orchestration
 * - Test harness scenarios
 */

import { StubLlm } from "./adapters/llm.js";
import { StubMemory } from "./adapters/memory.js";
import { StubResonance } from "./adapters/resonance.js";

export interface ExecutionInput {
  query: string;
}

export interface ExecutionResult {
  result: any;
  resonance: {
    score: number;
    signature: string;
  };
  ethics_flags: string[];
  trace: {
    steps: string[];
  };
}

export interface ExecutionDeps {
  llm: StubLlm;
  memory: StubMemory;
  resonance: StubResonance;
}

/**
 * Execute a compiled graph.
 *
 * NOTE:
 * - `graph` is currently unused beyond existence checks.
 * - This will evolve later into a real node-based executor.
 */
export async function executeGraph(
  graph: any,
  input: ExecutionInput,
  deps: ExecutionDeps,
): Promise<ExecutionResult> {
  // --- Trace initialization ---
  const traceSteps: string[] = [];

  traceSteps.push("executor:start");

  // --- Input normalization ---
  const prompt = input.query;
  traceSteps.push("input:normalized");

  // --- LLM call (stubbed) ---
  const llmResponse = await deps.llm.generate({ prompt });
  traceSteps.push("llm:generated");

  // --- Memory write (stubbed) ---
  await deps.memory.write({
    key: "last_response",
    value: llmResponse.text,
  });
  traceSteps.push("memory:written");

  // --- Resonance evaluation (stubbed) ---
  const resonanceResult = await deps.resonance.evaluate({
    text: llmResponse.text,
  });
  traceSteps.push("resonance:evaluated");

  // --- Ethics evaluation (minimal, deterministic) ---
  const ethics_flags: string[] = [];
  if (prompt.toLowerCase().includes("harm")) {
    ethics_flags.push("potential_harm_detected");
    traceSteps.push("ethics:flagged");
  } else {
    traceSteps.push("ethics:clear");
  }

  traceSteps.push("executor:end");

  // --- Final result ---
  return {
    result: {
      text: llmResponse.text,
    },
    resonance: {
      score: resonanceResult.score,
      signature: resonanceResult.signature,
    },
    ethics_flags,
    trace: {
      steps: traceSteps,
    },
  };
}
