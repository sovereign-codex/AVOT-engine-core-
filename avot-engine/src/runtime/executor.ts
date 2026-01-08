import { CompiledGraph, RuntimeConfig } from "../types.js";
import { ExecState, newState } from "./context.js";
import { runNode, RuntimeDeps } from "./nodeHandlers.js";

export async function executeGraph(
  avot_id: string,
  graph: CompiledGraph,
  runtime: RuntimeConfig,
  deps: RuntimeDeps,
  input: any,
): Promise<{ state: ExecState; result: any }> {
  const state = newState(avot_id);

  const nextMap = new Map<string, string[]>();
  for (const [a, b] of graph.edges) {
    nextMap.set(a, [...(nextMap.get(a) ?? []), b]);
  }

  let current: string | undefined = graph.entry;
  let payload: any = input;

  const visited = new Set<string>();
  while (current) {
    if (visited.has(current)) throw new Error(`Cycle detected at node '${current}'. (Add loop policy in v2.)`);
    visited.add(current);

    const node = graph.nodes[current];
    const out = await runNode(current, node, payload, state, runtime, deps);
    state.trace.push({ node: current, type: node.type, input: payload, output: out });

    payload = out;
    const next = nextMap.get(current) ?? [];
    current = next[0];
    if (!current) break;
  }

  return { state, result: payload };
}
