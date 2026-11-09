---
name: design-ssrn-paper
description: Analyze an SSRN document and design or build its initial interactive educational companion for The Paper Observatory, using the project's shared layout, cloud workflow and source-evidence standards.
---

# Design an SSRN paper companion

Turn an SSRN PDF or canonical SSRN URL into a complete, source-grounded Paper Observatory exhibit. The audience is strong undergraduates and early PhD students. Finance is the editorial center; admit other subjects when a manipulable visual explanation teaches something unusually well.

## Establish the project and model

Locate the `thepaperobservatory.com` repository and read its `AGENTS.md`, `MEMORY.md`, `docs/architecture/ARCHITECTURE.md` and `docs/architecture/AI_WORKFLOWS.md`. A personal installation of this skill is only an entry point; make changes in the repository, not in the personal skill directory.

The owner's current initial-design preference is **GPT-6.1 Sol, Ultra reasoning** (`gpt-6.1-sol`, `ultra`). Use that configuration when the cloud agent supports it. A skill cannot change its own host model: record the actual model and reasoning setting, do not claim a switch that did not happen, and report an unavailable requested model rather than silently substituting one for the initial design. Routine mechanical build/test work need not use the most expensive model.

Run generation in the repository's cloud workspace or authorized cloud agent and build in cloud CI. Local preview is a supported verification and fallback tool, not the publishing authority. Use `../app_architecture` when available; in cloud checkouts follow the project's recorded Architecture Library revision and adoption record. Never replace project instructions wholesale or inject the DigitalOcean server starter into this user-selected Cloudflare static site. A standards refresh requires the architecture manager's read-only audit, semantic integration and at least 20 named checks, alongside normal app tests.

## Read the source before choosing the visual

Acquire the authorized document into its paper folder. A URL alone is not the paper: obtain and inspect the actual source, and report inaccessible content rather than inventing it. Preserve the original bytes privately, record SHA-256, title, authors, SSRN ID, version/date and canonical URL, and distinguish physical PDF pages from printed page numbers. Read equations, figures, appendices and qualifications; render equation-heavy pages when extraction is ambiguous.

Write `papers/<slug>/docs/paper-analysis.md` with a claim-to-page evidence map, notation/conventions, exact examples that can be reconstructed, assumptions and limitations. Do not equate SSRN availability with permission to redistribute its PDF. Keep originals out of the public repository and cloud artifact by default; use canonical source links unless a recorded license or authorization permits redistribution.

Select the paper on the strength of its teachable mechanism, not merely topic or popularity. A suitable non-finance exception has a meaningful interactive variable, an observable consequence and an explainable limitation. Explain its connection to the library's learning goals.

## Design and implement the initial layout

Read [the exhibit contract](references/exhibit-contract.md) before implementation. Inspect the current homepage and one existing companion. Reuse the shared brand/navigation, source/evidence patterns, learning-depth controls and course/channel pathways. Keep the scientific diagram specific to the paper rather than cloning every exhibit.

Develop the central visual and usable controls first, then build the explanation around it. Foundation makes the mechanism understandable before formal notation; Advanced supplies derivations, identification assumptions, boundary cases and seminar questions. Reveal information without hiding essential caveats. Label paper findings, exact reconstructions, synthetic examples and new teaching extensions at their point of use.

Use local SVG/canvas/HTML for interactive diagrams and deterministic numerical functions outside rendering. Generate bitmap assets only when they add educational value. Keep independent per-paper state namespaces, explicit units, valid parameter ranges, accessible alternatives, reset behavior and graceful errors. Respect keyboard use, focus, contrast, touch layouts and reduced motion.

## Include the sustainable learning pathway

Use the repository's verified course and channel configuration. Course offers must match the lesson and disclose a commercial or affiliate relationship where applicable. Reserve ads away from experiment controls and source citations. Load Google ads only through the configured, approved advertising/consent integration; never invent publisher IDs or ask visitors to click ads. Unconfigured accounts and offers stay absent rather than appearing as fake live links.

Create a source-grounded short-form pack when requested: one central question, a visual demonstration, one qualification and a canonical exhibit CTA for TikTok, Instagram Reels and YouTube Shorts; a carousel/thread may use the same evidence. Clearly label synthetic media as required by the destination. Drafting a pack does not authorize posting to an account. See `docs/monetization.md` for current business priorities and platform references.

## Verify and deliver

Test the central mechanism with analytical identities, source examples and useful limiting cases. Run root `npm run check` and targeted browser checks for the new exhibit and existing routes. Check source links, Foundation/Advanced views, reset, keyboard and mobile behavior, reduced motion, console errors and the cloud-built artifact. Do not add tests that only mirror wording or implementation details.

Record source hash, actual model/reasoning, generator version or commit, job ID, test/build outcome and artifact reference. Retries should update the same paper/job identity rather than duplicate catalog entries. Never put private PDFs, credentials, generated status output or paid model keys into the public repository or site.

Deliver the finished paper folder, registered library link, evidence analysis and a reviewable cloud branch/PR preview. Publish to Cloudflare only within the user's actual session authorization; complete the concrete implementation and checks before requesting any missing final approval. Never claim a repository, deployment, ad approval or social account exists until verified. Follow `docs/cloud-publishing.md` for current commands and release rollback.
