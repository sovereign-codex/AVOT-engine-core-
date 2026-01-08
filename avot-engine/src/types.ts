export type AvotStatus = "active" | "inactive" | "draft";

export type NodeType =
  | "input"
  | "reasoning"
  | "memory_lookup"
  | "generation"
  | "ethics_check"
  | "resonance_eval"
  | "tone_script_eval"
  | "output"
  | "council_route"
  | "avot_call"
  | "council_vote"
  | "council_merge";

export interface AvotIdentity {
  avot_id: string;
  name: string;
  title?: string;
  version: string;
  author?: string;
  lineage?: string;
  status: AvotStatus;
  tags?: string[];
}

export interface AvotIntent {
  purpose: string;
  resonance_signature?: string;
  scope?: string[];
}

export interface Ethics {
  codices: string[];
  constraints: string[];
}

export interface ResonanceConfig {
  enabled: boolean;
  framework?: "HTFL" | "ToneScript" | string;
  baseline_signature?: string;
  coherence_threshold: number;
  failure_policy: "soften" | "pause" | "fallback";
}

export interface Cognition {
  engine: "abstract-llm" | string;
  preferred_models?: string[];
  temperature?: number;
  reasoning_style?: string;
  fallback_behavior?: string;
}

export interface MemoryConfig {
  short_term?: "session" | "none";
  long_term?: {
    type: string;
    location: string;
    retention_policy?: string;
  };
}

export interface NodeDef {
  type: NodeType;
  description?: string;
  prompt?: string;
  resonance_hint?: string;
  sources?: string[];
  codex?: string;
  expected_signature?: string;
  threshold?: number;
  script_ref?: string;
  mode?: "interpret" | "emit" | "analyze";
  format?: string;
  requires_coherence?: boolean;

  // council + orchestration fields (scaffold)
  target?: any;
  input_map?: Record<string, string>;
  participants?: string[];
  method?: "quorum" | "majority" | "weighted_majority" | "steward_veto";
  quorum?: number;
  policy?: "majority";
  steward_veto?: boolean;
  strategy?: string;
  inputs?: string[];
}

export interface LogicGraph {
  entry: string;
  nodes: Record<string, NodeDef>;
  flow: string[];
}

export interface Permissions {
  external_network: "restricted" | "unrestricted" | "none";
  file_write: boolean;
  autonomous_actions: boolean;
}

export interface AvotDsl {
  identity: AvotIdentity;
  intent: AvotIntent;
  ethics: Ethics;
  resonance?: ResonanceConfig;
  cognition: Cognition;
  memory?: MemoryConfig;
  logic: LogicGraph;
  interfaces?: Record<string, any>;
  permissions: Permissions;
}

export interface CompiledGraph {
  entry: string;
  nodes: Record<string, NodeDef>;
  edges: Array<[string, string]>;
}

export interface Manifest {
  avot_id: string;
  name: string;
  version: string;
  status: AvotStatus;
  intent: AvotIntent;
  ethics: Ethics;
}

export interface RuntimeConfig {
  cognition: Cognition;
  memory?: MemoryConfig;
  resonance?: ResonanceConfig;
  permissions: Permissions;
  ethics?: Ethics;
}
