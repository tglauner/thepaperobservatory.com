# AI generation and educational application workflows

## SSRN initial design

Use `.agents/skills/design-ssrn-paper/SKILL.md` for a new paper. Work in the cloud repository/agent, preferring GPT-6.1 Sol with Ultra reasoning for initial design. Record actual runtime; instructions alone cannot switch the active model. Build and verify in cloud CI, while retaining local preview for inspection. Produce a source evidence map and a central interactive mechanism before expanding the surrounding explanation.

## Frontend design

Read root `MEMORY.md`, `docs/architecture/ARCHITECTURE.md`, the selected paper's `papers/<slug>/docs/paper-analysis.md`, and the relevant source. Preserve the collection landing page and independent website folders. Choose one coherent visual direction suited to quantitative learning and implement usable exhibits. Expose assumptions, units, and source references where readers need them. Keep the undergraduate path understandable without graduate mathematics and make formal detail available without hiding the main explanation.

Use working controls with accessible names, visible keyboard focus, responsive chart sizing, and reduced-motion support. Prefer local assets and existing components. Include reset and error behavior where the exhibit needs it. Do not add service dependencies for purely local computation.

Validate with `npm test`, `npm run build`, and targeted browser checks at desktop and narrow mobile widths. Check that changing controls changes the educational result, that resets restore stated defaults, and that source links work.

## Research accuracy

Cross-check claims against the selected paper's `docs/paper-analysis.md` and source PDF inside its paper folder. Keep paper results distinct from teaching reconstructions and synthetic simulations. Explain modeling assumptions and limitations close to each exhibit. A teaching model should have tests for its identities and limiting cases. Preserve PDF hashes, correctly map physical pages to printed pages, and keep each site's source links under its own base prefix.

## Security and deployment

Keep secrets, `.env`, `confidential/`, transient `.cloud-input/` source intake and local status output out of public assets. No admin surface exists in the local version. Cloudflare hosting and public GitHub source are owner requirements, superseding the earlier DigitalOcean plan. Follow `docs/cloud-publishing.md`, publish only the assembled artifact and preserve a previous verified release. Keep source PDFs private unless redistribution is cleared, and use canonical SSRN links in production otherwise. AI-generated branding, courses and advertising must be truthful; read `docs/monetization.md`. External notifications, social posting and unrequested paid services require actual authorization.

## Durable context

Update `MEMORY.md` only with stable decisions, verified commands, and recurring operational limits. Keep transient logs and secrets out. Follow the root status lifecycle and keep all its generated files inside `status/`.

## Architecture alignment

Use the sibling `../app_architecture` manager for profile `tgir-app`. Refresh only a clean tracked library with a fast-forward-only pull, audit before applying, never force existing instructions/configuration, and semantically merge relevant differences. Cloudflare and the static collection are explicit project adaptations. Do not add Apache/systemd scaffolding that does not serve this target. Record at least 20 named passing integration checks alongside native builds and browser checks. In a cloud workspace without the sibling checkout, use the recorded adoption revision and project guidance; do not silently fetch or trust an arbitrary replacement.

## Growth content

Generate source-faithful short-form drafts from the same verified evidence as the companion. Use one mechanism, one qualification and a canonical CTA. Connect real course offers to the learning need. Never invent discounts, social handles, revenue or ad approval. Posting to external accounts is a separate action governed by session authorization.

Headless cloud jobs use run IDs, logs, final status and artifact references in place of the local VS Code/LaTeX status slide. Never require a PDF viewer or LaTeX installation to run cloud generation.
