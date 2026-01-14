/**
 * Council Orchestrator
 *
 * Executes a council decision flow:
 * 1. Route request
 * 2. Call AVOT(s)
 * 3. Vote
 * 4. Merge approved outputs
 *
 * This module assumes AVOTs are already compiled.
 */

import { routeCouncilRequest } from "./router.js";
import { callAvot } from "./avotCall.js";
import { councilVote, CouncilVoteConfig, VoteInput } from "./vote.js";
import { councilMerge, MergeResult } from "./merge.js";
import { RuntimeDeps } from "../runtime/nodeHandlers.js";
import { CompiledGraph, RuntimeConfig } from "../types.js";

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
    /**
     * "rules" = apply rules list first, else fallback
     * "fallback" = ignore rules and always use fallback
     */
    strategy: "rules" | "fallback";
    rules?: { if_contains: string[]; send_to: string }[];
    fallback?: string;
  };
  vote: CouncilVoteConfig;
}

/**
 * Normalized council execution result.
 * This shape is stable and safe for integration.
 */
export interface CouncilExecutionResult {
  approved: boolean;
  output: any | null;
  sources: string[];
  details: Record<string, any>;
  reason: string;
}

export async function runCouncil(
  council: CouncilDefinition,
  avots: CompiledAvot[],
  input: string,
  deps: RuntimeDeps,
): Promise<CouncilExecutionResult> {
  // --- 1. Route ---
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

  // --- 2. Call AVOT ---
  const callResult = await callAvot(
    {
      avot_id: targetAvot.avot_id,
      graph: targetAvot.graph,
      runtime: targetAvot.runtime,
      input: { query: input },
    },
    deps,
  );

  // --- 3. Prepare votes ---
  const votes: VoteInput[] = [
    {
      avot_id: callResult.avot_id,
      approved: !callResult.ethics_flags?.length,
      reason: callResult.ethics_flags?.length
        ? "Ethics flags present"
        : "No ethics violations",
    },
  ];

  // --- 4. Vote ---
  const voteResult = councilVote(votes, council.vote);

  if (!voteResult.approved) {
    return {
      approved: false,
      output: null,
      sources: voteResult.approved_ids,
      details: {},
      reason: voteResult.reason,
    };
  }

  // --- 5. Merge ---
  const merged: MergeResult = councilMerge(
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
    output: merged.output ?? null,
    sources: merged.sources ?? [],
    details: (merged.details ?? {}) as Record<string, any>,
    reason: "Council approved and merged output",
  };
}
