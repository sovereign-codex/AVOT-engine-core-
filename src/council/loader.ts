/**
 * Council Scroll Loader
 *
 * Loads a .council.scroll YAML file and converts it into a
 * CouncilDefinition suitable for execution by the orchestrator.
 *
 * This loader is intentionally permissive and minimal.
 * Validation can be layered later.
 */

import fs from "node:fs";
import YAML from "yaml";
import { CouncilDefinition } from "./orchestrator.js";

/**
 * Load a council definition from disk.
 *
 * This function reads a YAML scroll file, performs very light shape
 * validation, and normalizes the structure into the expected
 * {@link CouncilDefinition} format.
 */
export function loadCouncilFromFile(path: string): CouncilDefinition {
  const raw = fs.readFileSync(path, "utf8");
  const parsed = YAML.parse(raw);

  if (!parsed?.members || !Array.isArray(parsed.members)) {
    throw new Error("Invalid council scroll: missing members[]");
  }

  // If vote configuration is absent, use sensible defaults.
  const vote = parsed?.vote ?? {};

  return {
    members: parsed.members.map((m: any) => ({
      avot_id: m.avot_id,
      domain: m.domain,
      weight: m.weight ?? 1,
    })),
    routing: parsed.routing
      ? {
          // Provide a default routing strategy based on whether rules exist.
          strategy: parsed.routing.strategy ?? (parsed.routing.rules ? "rules" : "fallback"),
          rules: parsed.routing.rules ?? [],
          fallback: parsed.routing.fallback,
        }
      : undefined,
    vote: {
      quorum: vote.quorum ?? 1,
      policy: vote.policy ?? "majority",
      steward_veto: vote.steward_veto ?? false,
    },
  };
}