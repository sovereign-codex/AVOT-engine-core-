/**
 * Council Router
 *
 * Determines which AVOT(s) should receive a task based on:
 * - declared council routing rules
 * - simple keyword matching
 * - explicit fallback
 *
 * This module is intentionally simple and deterministic.
 * LLM / classifier routing can be layered on later.
 */

export interface CouncilMember {
  avot_id: string;
  role?: string;
  domain?: string;
  weight?: number;
}

export interface RoutingRule {
  if_contains: string[];
  send_to: string;
}

export interface CouncilRoutingConfig {
  strategy: "domain_router" | "simple";
  rules?: RoutingRule[];
  fallback?: string;
}

export interface CouncilDefinition {
  members: CouncilMember[];
  routing?: CouncilRoutingConfig;
}

export interface RouteResult {
  avot_id: string;
  reason: string;
}

export function routeCouncilRequest(
  council: CouncilDefinition,
  input: string,
): RouteResult {
  const text = input.toLowerCase();

  // --- 1. Rule-based routing (keywords) ---
  if (council.routing?.rules) {
    for (const rule of council.routing.rules) {
      for (const token of rule.if_contains) {
        if (text.includes(token.toLowerCase())) {
          return {
            avot_id: rule.send_to,
            reason: `Matched routing rule on keyword '${token}'`,
          };
        }
      }
    }
  }

  // --- 2. Domain-based routing (member domain match) ---
  for (const member of council.members) {
    if (member.domain && text.includes(member.domain.toLowerCase())) {
      return {
        avot_id: member.avot_id,
        reason: `Matched member domain '${member.domain}'`,
      };
    }
  }

  // --- 3. Fallback ---
  if (council.routing?.fallback) {
    return {
      avot_id: council.routing.fallback,
      reason: "Fallback routing",
    };
  }

  // --- 4. Absolute fallback: first member ---
  if (council.members.length > 0) {
    return {
      avot_id: council.members[0].avot_id,
      reason: "Defaulted to first council member",
    };
  }

  throw new Error("Council has no members to route to.");
}