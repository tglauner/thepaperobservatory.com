# Agent instructions — thepaperobservatory.com

## Project contract

Build **The Paper Observatory** at `thepaperobservatory.com`: a fully AI-generated educational website that turns SSRN papers into interactive explanations for strong undergraduate and early PhD students. Finance is the main focus; include an exceptional paper from another field when visualization offers particular learning value. Use the sibling Architecture Library's `tgir-app` framework with the explicit Cloudflare/static adaptation recorded in `docs/architecture/adoption-2026-11-09.md`.

- Generate new exhibits in cloud workspaces/agents, retain an open GitHub source repository, build in cloud CI and host the static artifact on Cloudflare. Local preview remains supported. These owner instructions supersede the earlier local-only/DigitalOcean publishing choice.
- Initial design preference: **GPT-6.1 Sol with Ultra reasoning** (`gpt-6.1-sol`, `ultra`). Use it when the cloud agent supports it; record the actual model/setting and do not silently claim or substitute an unavailable model. Use leaner execution for routine mechanical work when appropriate.
- For a new SSRN document, use `.agents/skills/design-ssrn-paper/SKILL.md`. Keep AI generation transparent and source attribution explicit.
- Monetization is a first-class requirement: verified related training links, advertising only after configured approval/consent, and source-faithful social discovery. Follow `docs/monetization.md`; do not invent course offers, publisher IDs, social accounts or revenue claims.

- Keep each paper's original PDF, application source, public assets, analysis, tests, README, generated build and screenshots under its own `papers/<slug>/` directory. The first two are `papers/risk-on-off/` and `papers/stochastic-flow-diagrams/`.
- Keep shared architecture/agent guidance, privacy configuration, dependencies, root status lifecycle and collection commands at the workspace root. `collection/` is the landing page; `scripts/` launches and builds the collection.
- Root npm workspaces share dependencies while each paper remains a separate Vite website. Keep each site's base URL, direct development port, proxy prefix and built subdirectory consistent. Never flatten a paper back into the workspace root.
- Add future papers to this collection's existing architecture. The Architecture Library is a sibling of the workspace root; do not treat nested paper folders as separate siblings or reapply an unrelated starter over them.
- Preserve independent browser preference/quiz namespaces for each paper. Provide a visible link back to the paper library.

- Read `MEMORY.md`, `docs/architecture/ARCHITECTURE.md`, and `docs/architecture/AI_WORKFLOWS.md` before material changes.
- Prefer small, readable code, explicit input validation, and lean dependencies.
- Tim does not hand-write code. Complete changes end to end and provide copy/paste commands.
- Assume macOS for user-facing commands. Any Python environment must be `.venv/`.
- Keep temporary cloud source intake in ignored `.cloud-input/`; never commit it or copy it into public output. Expire or remove downloaded/extracted inputs after their authorized job.
- Keep private material in root `confidential/`. Never read unrelated secrets or expose them in logs or generated assets.
- Keep `.env`, `.env.*`, and `confidential/` out of Git; retain only `.env.example`.
- Preserve each original source PDF byte for byte in its local/private source folder. SSRN availability is not a redistribution license: exclude PDFs from public Git and production artifacts by default, unless redistribution rights are recorded. Production source links fall back to canonical SSRN pages. Distinguish paper findings, educational reconstructions, and toy simulations explicitly. Cite physical PDF pages correctly; a journal cover can shift printed page numbers.
- Support keyboard access, visible focus, reduced motion, sufficient contrast, and mobile layouts.
- Do not add a backend, database, admin login, paid data service, analytics, or external-model calls unless a requested feature needs it.
- Cloudflare is the hosting target. Publish only the assembled public artifact through the documented cloud workflow; never expose the source workspace or private source PDFs. Preserve the previous Cloudflare release for rollback. Do not add a database, application server or worker until a concrete feature requires it.
- Public source and cloud hosting are requested for this project. Perform repository/publishing operations within the actual session authorization and report verified state. Do not post to social accounts, send messages, or activate paid services merely because a growth strategy mentions them.

## Workflows and verification

Read `docs/agent-workflows/CODEX_WORKFLOWS.md` and matching `.agents/skills/*/SKILL.md` for the task. Follow the frontend workflow and run root `npm test` plus `npm run build`; these cover the collection and all paper workspaces. Perform targeted browser checks for interactive changes and regressions to existing sites. Architecture integration requires at least 20 individual named passing checks in addition to the native build.

Update root `MEMORY.md` with durable decisions and verified commands, without secrets or transient logs. Explain changed files, validation, material limits, and rollback when relevant.

## Status lifecycle

For local interactive Codex sessions, start the root status lifecycle if the prompt hook did not:

```bash
python3 status/status_slide.py start
```

Before the root agent's final response, generate the final status with three accurate brief bullets:

```bash
python3 status/status_slide.py finish --status success --no-notify --bullet "Implemented educational site" --bullet "Validated build and interactions" --bullet "Local preview ready"
```

Headless cloud generation/CI uses its job/run ID, progress logs and a final success/failure summary with artifact references as the status lifecycle. It does not require VS Code, a local PDF viewer or a LaTeX installation. Local interactive sessions retain the PDF lifecycle above.

Use `--status issue` for incomplete work or failed validation. Child agents leave the root task's Working status active. Do not send Telegram or other external notifications unless the user explicitly asks. Keep the entire status subsystem under root `status/`; track only its helper and README and ignore all generated state, TeX, PDF, and compiler files.
