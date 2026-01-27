# AVOT-engine-core — Execution Contract

AVOT-engine-core is the execution and runtime layer for AVOT systems.

All execution is strictly subordinate to the **Value Kernel v1.0.0**.

---

## Binding Authority

Kernel decisions are final and binding.

The engine must:
- enforce kernel checks before action
- honor HALT, DENY, PAUSE, and ESCALATE outcomes
- default to denial when uncertain

No retry, override, or reinterpretation is permitted.

---

## Prohibited Behavior

AVOT-engine-core SHALL NOT:
- bypass kernel evaluation
- optimize around constraints
- justify violations post hoc
- execute speculative or unsafe actions

---

## Referenced Artifact

- **Value Kernel v1.0.0 (Canonical)**  
  `value-kernel-v1.0.0-canonical.zip`

---

> Execution without obedience is not intelligence.