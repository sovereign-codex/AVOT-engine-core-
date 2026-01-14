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
 * {@link CouncilDefinition} format. In particular, the routing
 * configuration now includes a `strategy` field because the
 * orchestrator expects one of two values ("rules" or "fallback").
 */
export function loadCouncilFromFile(path: string): CouncilDefinition {
  const raw = fs.readFileSync(path, "utf8");
  const parsed = YAML.parse(raw);

  if (!parsed?.members || !Array.isArray(parsed.members)) {
    throw new Error("Invalid council scroll: missing members[]");
  }

  if (!parsed?.vote) {
    throw new Error("Invalid council scroll: missing vote configuration");
  }

  return {
    members: parsed.members.map((m: any) => ({
      avot_id: m.avot_id,
      domain: m.domain,
      weight: m.weight ?? 1,
    })),
    routing: parsed.routing
      ? {
          // The orchestrator requires a routing strategy.  If the user
          // explicitly provides one we respect it, otherwise default
          // based on the presence of rules.
          strategy: parsed.routing.strategy ?? (parsed.routing.rules ? "rules" : "fallback"),
          rules: parsed.routing.rules ?? [],
          fallback: parsed.routing.fallback,
        }
      : undefined,
    vote: {
      quorum: parsed.vote.quorum ?? 1,
      policy: parsed.vote.policy ?? "majority",
      steward_veto: parsed.vote.steward_veto ?? false,
    },
  };
}