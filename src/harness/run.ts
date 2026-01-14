/**
 * AVOT Engine Test Harness
 *
 * Mobile‑friendly scenario runner.
 * Loads a scenario JSON and executes a council run.
 */

import fs from "node:fs";
import path from "node:path";

import { parseScrollFile } from "../dsl/parse.js";
import { normalizeAvot } from "../dsl/normalize.js";
import { validateAvot } from "../dsl/validate.js";
import { compileAvot } from "../compile/compileAvot.js";

import { loadCouncilFromFile } from "../council/loader.js";
import { runCouncil } from "../council/orchestrator.js";

import { StubLlm } from "../runtime/adapters/llm.js";
import { StubMemory } from "../runtime/adapters/memory.js";
import { StubResonance } from "../runtime/adapters/resonance.js";

/**
 * Load a test scenario by name.
 * Scenarios live in the top‑level harness/scenarios folder.
 */
function loadScenario(name: string) {
  const file = path.join(
    process.cwd(),
    "harness",
    "scenarios",
    `${name}.json`,
  );
  if (!fs.existsSync(file)) {
    throw new Error(`Scenario not found: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

/**
 * Execute the scenario.
 */
async function run() {
  const scenarioName = process.argv[2];
  if (!scenarioName) {
    console.error("Usage: node dist/harness/run.js <scenario-name>");
    process.exit(1);
  }

  const scenario = loadScenario(scenarioName);

  // Load the council scroll
  const council = loadCouncilFromFile(scenario.council);

  // Compile each AVOT scroll
  const compiledAvots = scenario.avots.map((file: string) => {
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

  // Provide stubbed dependencies
  const deps = {
    llm: new StubLlm(),
    memory: new StubMemory(),
    resonance: new StubResonance(),
  };

  // Run the council orchestration
  const result = await runCouncil(
    council,
    compiledAvots,
    scenario.input,
    deps,
  );

  console.log(
    JSON.stringify(
      {
        scenario: scenario.name,
        result,
      },
      null,
      2,
    ),
  );
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
