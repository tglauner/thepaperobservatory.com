# Flow Observatory paper site

Follow the root `../../AGENTS.md`, `../../MEMORY.md`, and shared architecture/workflow guidance. This folder owns the complete second-paper website and original `ssrn-2379314.pdf`.

- Read `README.md` and `docs/paper-analysis.md` before modifying a model or source claim.
- Base URL is `/stochastic-flow-diagrams/`; use `import.meta.env.BASE_URL` for public assets. Browser preferences use the `flow-observatory` namespace.
- The PDF has 23 physical pages, with a journal cover first. Printed article page q maps to PDF page q − 19.
- Matrix row = target equation; column = source variable. Compute whole-state synchronous updates, with r0 equal to the imposed shock and later innovations zero for an isolated impulse.
- Separate per-period changes from additive cumulative effects. Use complex eigenvalue modulus for discrete-time stability. A unit spectral radius does not imply one universal steady behavior, and invertibility does not imply diagonalizability.
- Source presets are declared parameter reconstructions. Custom matrices, AR(2) presets and Gaussian outcome bands are teaching extensions, without fitted coefficients, p-values, causal identification or crash probabilities.
- Use direct matrix iteration without assuming diagonalizability. Preserve deterministic seeds and explicit numerical guardrails.
- The root status lifecycle is shared. Do not add a second status subsystem or external notification.
