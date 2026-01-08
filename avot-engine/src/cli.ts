import { parseScrollFile } from "./dsl/parse.js";
import { validateAvot } from "./dsl/validate.js";
import { normalizeAvot } from "./dsl/normalize.js";
import { compileAvot } from "./compile/compileAvot.js";
import { executeGraph } from "./runtime/executor.js";
import { StubLlm } from "./runtime/adapters/llm.js";
import { StubMemory } from "./runtime/adapters/memory.js";
import { StubResonance } from "./runtime/adapters/resonance.js";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

async function main() {
  const file = process.argv[2];
  const cmd = process.argv[3] ?? "validate";
  const inputStr = getArg("--input") ?? "Demo request";

  if (!file) {
    console.error("Usage: node dist/cli.js <path-to-scroll> <validate|run> [--input <text>]");
    process.exit(1);
  }

  const dsl = normalizeAvot(parseScrollFile(file));
  const diags = validateAvot(dsl);
  const errors = diags.filter(d => d.level === "error");
  diags.forEach(d => console.log(`[${d.level}] ${d.path ?? ""} ${d.message}`));
  if (errors.length) process.exit(1);

  const { manifest, graph, runtime } = compileAvot(dsl);

  if (cmd === "run") {
    const deps = { llm: new StubLlm(), memory: new StubMemory(), resonance: new StubResonance() };
    const { state, result } = await executeGraph(manifest.avot_id, graph, runtime, deps, { query: inputStr });
    console.log(JSON.stringify({ result, resonance: state.resonance, ethics_flags: state.ethics_flags, trace: state.trace }, null, 2));
  } else {
    console.log("OK");
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
