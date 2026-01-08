import { AvotDsl, CompiledGraph, Manifest, RuntimeConfig } from "../types.js";

export function compileAvot(dsl: AvotDsl): { manifest: Manifest; graph: CompiledGraph; runtime: RuntimeConfig } {
  const manifest: Manifest = {
    avot_id: dsl.identity.avot_id,
    name: dsl.identity.name,
    version: dsl.identity.version,
    status: dsl.identity.status,
    intent: dsl.intent,
    ethics: dsl.ethics,
  };

  const edges: Array<[string, string]> = (dsl.logic.flow || []).map(f => {
    const [a, b] = f.split("->").map(s => s.trim());
    return [a, b];
  });

  const graph: CompiledGraph = {
    entry: dsl.logic.entry,
    nodes: dsl.logic.nodes,
    edges,
  };

  const runtime: RuntimeConfig = {
    cognition: dsl.cognition,
    memory: dsl.memory,
    resonance: dsl.resonance,
    permissions: dsl.permissions,
    ethics: dsl.ethics,
  };

  return { manifest, graph, runtime };
}
