import { NodeDef, RuntimeConfig } from "../types.js";
import { ExecState } from "./context.js";
import { LlmAdapter } from "./adapters/llm.js";
import { MemoryAdapter } from "./adapters/memory.js";
import { ResonanceAdapter } from "./adapters/resonance.js";

export interface RuntimeDeps {
  llm: LlmAdapter;
  memory: MemoryAdapter;
  resonance: ResonanceAdapter;
}

export async function runNode(
  nodeId: string,
  node: NodeDef,
  input: any,
  state: ExecState,
  runtime: RuntimeConfig,
  deps: RuntimeDeps,
): Promise<any> {
  switch (node.type) {
    case "input":
      return input;

    case "reasoning": {
      const out = await deps.llm.complete(node.prompt ?? "", { temperature: runtime.cognition.temperature });
      return { analysis: out, extracted: input };
    }

    case "memory_lookup": {
      const query = typeof input === "string" ? input : JSON.stringify(input);
      const hits = await deps.memory.search(query, node.sources ?? []);
      state.memory_refs.push(...hits);
      return { hits };
    }

    case "generation": {
      const context = JSON.stringify({ input, memory_refs: state.memory_refs.slice(-6) }, null, 2);
      const prompt = `${node.prompt ?? ""}\n\nContext:\n${context}`;
      const out = await deps.llm.complete(prompt, { temperature: runtime.cognition.temperature });
      return { draft: out };
    }

    case "ethics_check": {
      const text = typeof input === "string" ? input : JSON.stringify(input);
      const constraints = new Set((runtime.ethics?.constraints ?? []).map(s => s.toLowerCase()));
      if (constraints.has("no_weaponization") && text.toLowerCase().includes("weapon")) {
        state.ethics_flags.push("no_weaponization");
        return { allowed: false, reason: "Ethics constraint: no_weaponization", input };
      }
      return { allowed: true, input };
    }

    case "resonance_eval": {
      const expected = node.expected_signature;
      const result = await deps.resonance.eval(expected);
      state.resonance ??= { trace: [] };
      state.resonance.current_score = result.score;
      state.resonance.trace.push({ node: nodeId, score: result.score, signature: result.signature });
      const threshold = node.threshold ?? runtime.resonance?.coherence_threshold ?? 0.72;
      return { ok: result.score >= threshold, ...result, threshold };
    }

    case "output": {
      if (node.requires_coherence && runtime.resonance?.enabled) {
        const score = state.resonance?.current_score ?? 0;
        const thr = runtime.resonance.coherence_threshold;
        if (score < thr) {
          const policy = runtime.resonance.failure_policy;
          if (policy === "pause") return { paused: true, message: "Coherence below threshold; pausing.", score, thr };
          if (policy === "fallback") return { message: "Fallback to LLM-only mode.", output: input };
          return { message: "Softened output due to low coherence.", output: input };
        }
      }
      return { output: input };
    }

    default:
      throw new Error(`Unhandled node type: ${node.type}`);
  }
}
