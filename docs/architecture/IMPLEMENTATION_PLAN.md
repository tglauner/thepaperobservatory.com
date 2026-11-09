# Implementation and acceptance — thepaperobservatory.com

## Implemented collection

The workspace has been reorganized around one independent folder per source paper. The original risk visualization is under `papers/risk-on-off/`; the second article and its new visualization are under `papers/stochastic-flow-diagrams/`. Shared architecture, dependencies, privacy controls and status lifecycle remain at the workspace root.

The library homepage links both applications. Root commands install once, launch the local collection and assemble all public builds into `dist/`. Development serves the library on loopback port 5173 with paper proxies to 5174 and 5175; built preview serves the complete collection on port 4173.

The first site preserves its four risk experiments. The second site provides five experiments on network reading, isolated impulses, feedback stability, lag memory and stochastic innovations, plus article evidence, glossary and quiz. Both offer Foundation and Advanced paths and link source pages from the relevant explanations.

The pre-rebrand local migration passed 116 individual native checks and all three builds, plus 70 browser checks covering 16 accessibility views. Those are historical evidence. Rebranding, shared navigation, source-publication rules and cloud integration require a fresh relevant test/build/browser pass.

## Acceptance checks for this collection

1. Original PDFs remain byte-identical in private/local storage. Any cleared published copies match; uncleared PDFs remain excluded from public Git and production output.
2. Each paper owns its source, application, tests, documentation, public assets and generated build.
3. Catalog links, Vite bases, development proxies and built subdirectories agree.
4. First-paper numerical behavior and source qualifications survive the move.
5. The second-paper source matrices and timing convention are reproducible; rates and cumulative effects remain distinct.
6. Synthetic extensions, estimation assumptions and mathematical qualifications are visible near their exhibits.
7. Controls, resets, audience modes, source links, glossary and quiz work at the current URLs with keyboard and mobile access.
8. Fresh installation and root test/build commands work without credentials or a backend.
9. The assembled public artifact excludes private material, source workspace files and generated status output.
10. Local startup, troubleshooting, the direct first-site fallback and future release rollback are documented.

The Architecture Library integration floor remains at least 20 named checks alongside the relevant build and browser checks.

## Adding another paper

Create the next application under its own `papers/<slug>/` folder after analyzing the source. Preserve the original PDF, write its source analysis, and implement complete educational experiments with explicit assumptions. Register the new slug, base, ports, catalog entry and build assembly together. Extend mathematical/source-provenance tests and rerun regressions for existing sites.

Tim supplies content files or runs the documented commands; application code and configuration changes are completed by the coding workflow. The collection has no placeholder paper cards or unfinished application routes.

## Current product expansion

The workspace/folder name is `thepaperobservatory.com`. The entrance presents an AI-generated SSRN learning library with finance as its center and a consistent route to every paper. Shared navigation, source attribution, courses, channels and explanatory pages form one website while paper-specific experiments remain independently owned.

The reusable `design-ssrn-paper` skill defines source intake, evidence, initial design, implementation and cloud validation. Initial design prefers GPT-6.1 Sol with Ultra reasoning. Cloud jobs must record their actual runtime, source hash and commit, and remain retry-safe.

## Cloud release acceptance

Use an open GitHub source repository and cloud builds. Cloudflare is the hosting target. The cloud build must work without private source PDFs or credentials in the checkout. Canonical SSRN links replace unpublished reading copies in production. See `docs/cloud-publishing.md` for the actual deployment state, activation steps and rollback.

Course destinations must be real and related to the learning task. Advertising requires verified publisher/configuration/consent readiness. Social links must identify real owned accounts; draft content does not imply permission to publish it. No fake account, empty sign-up flow or revenue promise belongs in the finished entrance.

Before declaring this expansion complete, run the native suites and all builds, record at least 20 individual passing architecture/integration checks, exercise the entrance/shared routes and regress existing paper controls at desktop/mobile sizes. Verify the built artifact's public boundary and actual repository/deployment state independently of the design copy.
