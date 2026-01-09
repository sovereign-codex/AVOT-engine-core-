/**
 * Council Vote
 *
 * Evaluates multiple AVOT results and determines approval
 * based on quorum and voting policy.
 *
 * This module is deterministic and policy-light by design.
 * Guardian veto hooks are scaffolded for future use.
 */

export interface VoteInput {
  avot_id: string;
  approved: boolean;
  weight?: number;
  reason?: string;
}

export interface CouncilVoteConfig {
  quorum: number;
  policy: "majority";
  steward_veto?: boolean;
}

export interface VoteResult {
  approved: boolean;
  approved_ids: string[];
  rejected_ids: string[];
  reason: string;
}

export function councilVote(
  votes: VoteInput[],
  config: CouncilVoteConfig,
): VoteResult {
  if (votes.length === 0) {
    return {
      approved: false,
      approved_ids: [],
      rejected_ids: [],
      reason: "No votes provided",
    };
  }

  const approvals = votes.filter(v => v.approved);
  const rejections = votes.filter(v => !v.approved);

  // --- Quorum check ---
  if (approvals.length < config.quorum) {
    return {
      approved: false,
      approved_ids: approvals.map(v => v.avot_id),
      rejected_ids: rejections.map(v => v.avot_id),
      reason: `Quorum not met (${approvals.length}/${config.quorum})`,
    };
  }

  // --- Majority policy ---
  if (config.policy === "majority") {
    if (approvals.length <= rejections.length) {
      return {
        approved: false,
        approved_ids: approvals.map(v => v.avot_id),
        rejected_ids: rejections.map(v => v.avot_id),
        reason: "Majority vote failed",
      };
    }
  }

  // --- Steward veto (future hook) ---
  if (config.steward_veto) {
    const veto = votes.find(v =>
      v.reason?.toLowerCase().includes("veto"),
    );
    if (veto) {
      return {
        approved: false,
        approved_ids: approvals.map(v => v.avot_id),
        rejected_ids: rejections.map(v => v.avot_id),
        reason: `Steward veto by ${veto.avot_id}`,
      };
    }
  }

  return {
    approved: true,
    approved_ids: approvals.map(v => v.avot_id),
    rejected_ids: rejections.map(v => v.avot_id),
    reason: "Council vote approved",
  };
}