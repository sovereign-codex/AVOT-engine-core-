/**
 * Council Orchestrator
 *
 * Executes a council decision flow:
 * 1. Route request
 * 2. Call AVOT
 * 3. Vote
 * 4. Merge approved outputs
 *
 * This module is the FINAL boundary between
 * runtime execution and external consumers.
 */

import { routeCouncilRequest } from "./router.js";
import { callAvot } from "./avotCall.js";
import { councilVote, CouncilVoteConfig, VoteInput } from "./vote.js";
import { councilMerge } from "./merge.js";

import { RuntimeDeps } from "../runtime/nodeHandlers.js";
import { CompiledGraph, RuntimeConfig } from "../types.js";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface CompiledAvot {
  avot_id: string;
  graph: CompiledGraph;
  runtime: RuntimeConfig;
}

export interface CouncilDefinition {
  members: {
    avot_id: string;
    domain?: string;
    weight?: number;
  }[];

  routing?: {
    strategy: "rules" | "fallback";
    rules?: {
      if_contains: string[];
      send_to: string;
    }[];
    fallback?: string;
  };

  vote: CouncilVoteConfig;
}

/**
 * Normalized council execution result.
 * This shape is STABLE and safe for CLI, API, and Archivist use.
 */
export interface CouncilExecutionResult {
  approved: boolean;
  output: any | null;
  sources: string[];
  details: Record<string, any>;
  reason: string;
}

/* ------------------------------------------------------------------ */
/* Execution                                                           */
/* ------------------------------------------------------------------ */

export async function runCouncil(
  council: CouncilDefinition,
  avots: CompiledAvot[],
  input: string,
  deps: RuntimeDeps,
): Promise<CouncilExecutionResult> {
  /* ---------------- Route ---------------- */

  const route = routeCouncilRequest(council, input);

  const targetAvot = avots.find(a => a.avot_id === route.avot_id);
  if (!targetAvot) {
    return {
      approved: false,
      output: null,
      sources: [],
      details: {},
      reason: `No compiled AVOT found for ${route.avot_id}`,
    };
  }

  /* ---------------- Execute ---------------- */

  const callResult = await callAvot(
    {
      avot_id: targetAvot.avot_id,
      graph: targetAvot.graph,
      runtime: targetAvot.runtime,
      input: { query: input },
    },
    deps,
  );

  /* ---------------- Vote ---------------- */

  const votes: VoteInput[] = [
    {
      avot_id: callResult.avot_id,
      approved: !callResult.ethics_flags?.length,
      reason: callResult.ethics_flags?.length
        ? "Ethics flags present"
        : "No ethics violations",
    },
  ];

  const voteResult = councilVote(votes, council.vote);

  if (!voteResult.approved) {
    return {
      approved: false,
      output: null,
      sources: voteResult.approved_ids,
      details: {
        votes,
      },
      reason: voteResult.reason,
    };
  }

  /* ---------------- Merge ---------------- */

  const merged = councilMerge(
    [
      {
        avot_id: callResult.avot_id,
        result: callResult.result,
        resonance: callResult.resonance,
      },
    ],
    { primary: callResult.avot_id },
  );

  return {
    approved: true,
    output: merged.output,
    sources: merged.sources,
    details: merged.details ?? {},
    reason: "Council approved and merged output",
  };
}