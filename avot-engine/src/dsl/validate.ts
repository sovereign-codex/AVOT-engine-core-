import { AvotDsl } from "../types.js";

export type Diagnostic = { level: "error" | "warn"; message: string; path?: string };

export function validateAvot(dsl: AvotDsl): Diagnostic[] {
  const diags: Diagnostic[] = [];
  if (!dsl?.identity?.avot_id) diags.push({ level: "error", message: "Missing identity.avot_id", path: "identity.avot_id" });
  if (!dsl?.intent?.purpose) diags.push({ level: "error", message: "Missing intent.purpose", path: "intent.purpose" });
  if (!dsl?.ethics?.codices?.length) diags.push({ level: "error", message: "Missing ethics.codices", path: "ethics.codices" });

  const entry = dsl?.logic?.entry;
  const nodes = dsl?.logic?.nodes || {};
  if (!entry) diags.push({ level: "error", message: "Missing logic.entry", path: "logic.entry" });
  if (entry && !nodes[entry]) diags.push({ level: "error", message: `logic.entry node '${entry}' not found`, path: "logic.entry" });

  const flow = dsl?.logic?.flow || [];
  for (const f of flow) {
    const m = f.split("->").map(s => s.trim());
    if (m.length !== 2) {
      diags.push({ level: "error", message: `Invalid flow edge: '${f}'`, path: "logic.flow" });
      continue;
    }
    const [a, b] = m;
    if (a && !nodes[a]) diags.push({ level: "error", message: `Flow references unknown node '${a}'`, path: "logic.flow" });
    if (b && !nodes[b]) diags.push({ level: "error", message: `Flow references unknown node '${b}'`, path: "logic.flow" });
  }

  const hasOutput = Object.values(nodes).some(n => n.type === "output");
  if (!hasOutput) diags.push({ level: "warn", message: "No output node found (recommended)", path: "logic.nodes" });

  for (const [id, n] of Object.entries(nodes)) {
    if ((n.type === "reasoning" || n.type === "generation") && !n.prompt) {
      diags.push({ level: "warn", message: `Node '${id}' missing prompt`, path: `logic.nodes.${id}.prompt` });
    }
    if (n.type === "resonance_eval" && !n.threshold) {
      diags.push({ level: "warn", message: `Node '${id}' missing threshold (will use global/default)`, path: `logic.nodes.${id}.threshold` });
    }
  }

  return diags;
}
