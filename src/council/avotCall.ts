/**
 * AVOT Call Adapter
 *
 * Executes a compiled AVOT graph with provided input.  This module
 * intentionally does NOT:
 *  - perform routing
 *  - perform voting
 *  - perform merging
 *  - write to ledgers
 *
 * It is a thin execution boundary.
 */

import { CompiledGraph, RuntimeConfig } from "../runtime/types.js";
import { executeGraph, ExecutionDeps, ExecutionResult } from "../runtime/executor.js";

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

/**
 * Execute a compiled AVOT.  This adapter unwraps the AVOT call
 * arguments, delegates to the graph executor and then normalizes
 * its result into a stable envelope expected by council orchestration.
 */
export async function callAvot(
  call: AvotCallInput,
  deps: ExecutionDeps,
): Promise<AvotCallResult> {
  const { avot_id, graph, input } = call;
  // executeGraph now accepts (graph, input, deps) and returns an ExecutionResult
  const execResult: ExecutionResult = await executeGraph(graph, input, deps);
  return {
    avot_id,
    result: execResult.result,
    trace: execResult.trace?.steps ?? execResult.trace,
    resonance: execResult.resonance,
    ethics_flags: execResult.ethics_flags,
  };
}