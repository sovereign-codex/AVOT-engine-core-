import { AvotDsl, CompiledGraph, Manifest, RuntimeConfig } from "../runtime/types.js";

/**
 * Compile an AVOT DSL document into an executable form.
 *
 * Given a fully parsed, normalized and validated AVOT DSL object this
 * helper produces three artefacts:
 *  - a manifest describing the AVOT's identity and intent
 *  - a compiled graph suitable for execution
 *  - a runtime configuration controlling execution behaviours
 */
export function compileAvot(dsl: AvotDsl): {
  manifest: Manifest;
  graph: CompiledGraph;
  runtime: RuntimeConfig;
} {
  const manifest: Manifest = {
    avot_id: dsl.identity.avot_id,
    name: dsl.identity.name,
    version: dsl.identity.version,
    status: dsl.identity.status,
    intent: dsl.intent,
    ethics: dsl.ethics,
  };

  // Build an explicit edge list from the flow strings.  Annotate
  // intermediate variables to avoid implicit `any` errors under
  // noImplicitAny.
  const edges: Array<[string, string]> = (dsl.logic.flow || []).map((f: string) => {
    const [a, b] = f.split("->").map((s: string) => s.trim());
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