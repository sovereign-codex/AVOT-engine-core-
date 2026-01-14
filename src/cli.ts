import { parseScrollFile } from "./dsl/parse.js";
import { validateAvot } from "./dsl/validate.js";
import { normalizeAvot } from "./dsl/normalize.js";
import { compileAvot } from "./compile/compileAvot.js";
import { executeGraph, ExecutionDeps, ExecutionResult } from "./runtime/executor.js";

import { StubLlm } from "./runtime/adapters/llm.js";
import { StubMemory } from "./runtime/adapters/memory.js";
import { StubResonance } from "./runtime/adapters/resonance.js";

import { loadCouncilFromFile } from "./council/loader.js";
import { runCouncil } from "./council/orchestrator.js";

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 ? process.argv[idx + 1] : undefined;
}

function printUsage() {
  console.log(`
    Usage:

      Validate an AVOT:
        node dist/cli.js <avot.scroll> validate

      Run an AVOT:
        node dist/cli.js <avot.scroll> run --input "text"

      Run a Council:
        node dist/cli.js council run <council.scroll> <avot1.scroll> 
  [avot2.scroll ...] --input "text"
    `);
}

async function runSingleAvot(file: string, input: string) {
  const dsl = normalizeAvot(parseScrollFile(file));
  const diags = validateAvot(dsl);
  const errors = diags.filter(d => d.level === "error");

  diags.forEach(d => console.log(`[${d.level}] ${d.path ?? ""} \n${d.message}`));
  if (errors.length) process.exit(1);

  const { manifest, graph, runtime } = compileAvot(dsl);

  const deps: ExecutionDeps = {
    llm: new StubLlm(),
    memory: new StubMemory(),
    resonance: new StubResonance(),
  };

  // Execute the graph.  The executor now only accepts three arguments:
  // (graph, input, deps) and returns an ExecutionResult.
  const execResult: ExecutionResult = await executeGraph(
    graph,
    { query: input },
    deps,
  );

  console.log(
    JSON.stringify(
      {
        result: execResult.result,
        resonance: execResult.resonance,
        ethics_flags: execResult.ethics_flags,
        trace: execResult.trace,
      },
      null,
      2,
    ),
  );
}

async function runCouncilCommand(args: string[]) {
  const councilFile = args[0];
  const avotFiles = args.slice(1).filter(a => !a.startsWith("--"));

  const input = getArg("--input") ?? "Demo request";

  if (!councilFile || avotFiles.length === 0) {
    console.error("Council run requires a council scroll and at least one AVOT scroll.");
    printUsage();
    process.exit(1);
  }

  // Load council
  const council = loadCouncilFromFile(councilFile);

  // Compile AVOTs
  const compiledAvots = avotFiles.map(file => {
    const dsl = normalizeAvot(parseScrollFile(file));
    const diags = validateAvot(dsl);
    const errors = diags.filter(d => d.level === "error");
    if (errors.length) {
      console.error(`Validation failed for ${file}`);
      errors.forEach(e => console.error(e.message));
      process.exit(1);
    }
    const { manifest, graph, runtime } = compileAvot(dsl);
    return {
      avot_id: manifest.avot_id,
      graph,
      runtime,
    };
  });

  const deps: ExecutionDeps = {
    llm: new StubLlm(),
    memory: new StubMemory(),
    resonance: new StubResonance(),
  };

  const result = await runCouncil(council, compiledAvots, input, deps);
  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    printUsage();
    process.exit(0);
  }

  // Council mode
  if (args[0] === "council") {
    if (args[1] !== "run") {
      printUsage();
      process.exit(1);
    }
    await runCouncilCommand(args.slice(2));
    return;
  }

  // Single AVOT mode
  const file = args[0];
  const cmd = args[1] ?? "validate";
  const input = getArg("--input") ?? "Demo request";

  if (cmd === "validate") {
    const dsl = normalizeAvot(parseScrollFile(file));
    const diags = validateAvot(dsl);
    diags.forEach(d => console.log(`[${d.level}] ${d.path ?? ""} \n${d.message}`));
    process.exit(diags.some(d => d.level === "error") ? 1 : 0);
  }

  if (cmd === "run") {
    await runSingleAvot(file, input);
    return;
  }

  printUsage();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});