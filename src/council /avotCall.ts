/**
 * AVOT Call Adapter
 *
 * Executes a compiled AVOT graph with provided input.
 * This module intentionally does NOT:
 * - perform routing
 * - perform voting
 * - perform merging
 * - write to ledgers
 *
 * It is a thin execution boundary.
 */

import { CompiledGraph, RuntimeConfig } from "../types.js";
import { executeGraph } from "../runtime/executor.js";
import { RuntimeDeps } from "../runtime/nodeHandlers.js";

export interface AvotCallInput {
  avot_id: string;
  graph: CompiledGraph;
  runtime: RuntimeConfig;
  input: any;
}

export interface AvotCallResult {
  avot_id: string;
  result: any;
  trace: any[];
  resonance?: any;
  ethics_flags?: string[];
}

export async function callAvot(
  call: AvotCallInput,
  deps: RuntimeDeps,
): Promise<AvotCallResult> {
  const { avot_id, graph, runtime, input } = call;

  const { state, result } = await executeGraph(
    avot_id,
    graph,
    runtime,
    deps,
    input,
  );

  return {
    avot_id,
    result,
    trace: state.trace,
    resonance: state.resonance,
    ethics_flags: state.ethics_flags,
  };
}
