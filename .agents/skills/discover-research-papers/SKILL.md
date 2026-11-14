---
name: discover-research-papers
description: Find, verify, read and prioritize research papers for The Paper Observatory, with citation provenance and source-grounded concepts for visual explanations and experiments. Use for research discovery, reading queues and expanding the exhibit pipeline; use design-ssrn-paper for implementing a selected companion.
---

# Discover papers for The Paper Observatory

Produce two distinct results: a scholarly list ordered by the requested citation measure, and an editorial ranking of what visitors could learn through experiments. Citation popularity is not exhibit quality.

Work in this repository. Read root `AGENTS.md`, `MEMORY.md`, `docs/architecture/ARCHITECTURE.md` and `docs/architecture/AI_WORKFLOWS.md`. The audience is strong undergraduates and early PhD students. Record the actual research/design model and reasoning setting when available; the owner's initial-design preference is `gpt-6.1-sol` / `ultra`, but a skill cannot switch its runtime.

## Set a reproducible search contract

Use the user's sources, topics, dates and count. When omitted, start with SSRN, substantive **finance AND AI**, the preceding five calendar years through the user's local current date, and 100 papers. AI includes machine learning, deep learning, NLP and generative AI when they materially enter the financial question, method or result. Crypto, blockchain, digitization and generic AI economics do not qualify merely by association.

State exact inclusive dates and date basis. Default to earliest public release of the work, retaining first SSRN posting and later publication/revision dates separately; a recently revised old paper does not become new. A year-only or conflicting date at the cutoff is uncertain. Do not silently substitute journal publication date for first release. If the user means citations *received within* the window rather than papers released within it, change the measure and query explicitly.

## Extend sources without blending unlike evidence

Keep the discovery workflow source-agnostic and add one adapter per requested source. Each adapter must map:

- canonical work identity, source-specific ID, URL and version relationships;
- the source's eligibility rules and evidence for the earliest public release;
- query, filters, pagination, coverage and known omissions;
- legitimate full-text locations and source-version identity; and
- the citation provider, counted entity, metric definition, snapshot and missing-value behavior.

Do not silently combine citation counts from different providers, count a preprint and its publication twice, or compare unlike measures as if they were one ranking. Keep source-specific rankings separate unless a documented, defensible normalization is explicitly requested. SSRN remains the discovery universe until the user broadens it; an author's or publisher's copy of the same work may supply reading access without broadening that universe.

## Retrieve and verify

Use primary-source metadata/documentation and available research APIs. Inspect existing `scripts/research/` helpers and their `--help` before extending them. The initial adapter is `scripts/research/discover_openalex.py`; it retrieves **OpenAlex candidates with an SSRN location**, not a definitive global SSRN ranking. Inspect its generated provenance and unresolved date fields. Use resumable caches, stable IDs, bounded retries and recorded failures. Do not create accounts, buy data or call paid models merely to fill the list.

Record queries, filters, pagination, timestamps, provider coverage and eligibility decisions. Search across financial applications and AI terminology, then inspect substantive relevance. Preserve exclusions/uncertainties and reasons. A keyword match alone is a screening lead.

Resolve SSRN IDs/DOI aliases and group preprint, revised and published versions by identifier evidence plus title/author checks. Preserve ambiguous matches. Never add citation counts across versions/providers. Name the provider and counted entity for every count; distinguish downloads, views, readers and references from citations. Missing counts are `null`, never invented zeroes. Sort one consistent measure descending with a stated tie-break; keep unknown counts outside the verified ranking.

Claim **top N within the defined index/query** only when pagination and coverage justify it. Otherwise use **citation-ranked candidate list**, state the actual shortfall/coverage, and retain verified results. Neither an index query nor an SSRN topic list establishes a global top 100. Do not fabricate entries or relax topics/dates to reach 100.

## Read before recommending

Acquire actual full text from canonical SSRN, an author, an institutional repository or the publisher where permitted. Metadata, abstracts and secondary summaries are discovery aids; do not label them as a paper read. Respect access controls, record barriers and try legitimate alternative versions.

Use [the research record](references/research-record.md) for evidence/statuses. Preserve PDF bytes and hash privately. Batch downloads/extractions belong in ignored `.cloud-input/<run-id>/` with cleanup/expiry; do not check full texts or copied abstracts into public reports. For an implementation selection, transfer the original private source/evidence into its own `papers/<slug>/` structure under the companion skill. Source availability is not redistribution permission.

Read the research question, mechanism/model, data, identification or evaluation method, principal results, equations/figures and qualifications that affect the proposed lesson. Inspect appendices and render equation-heavy pages when needed. Record source version, physical PDF pages/printed-page mapping and an evidence map for the actual claims. Distinguish a focused full-text review from reading every section.

A definitive exhibit recommendation needs full-text review. Inaccessible or abstract-only records retain **provisional** editorial scores and a next reading action. Report how many were actually reviewed. Downloading or extracting 100 files does not mean reading 100 papers.

## Design the learning experience

Read [the exhibit rubric](references/exhibit-rubric.md). Find the misconception a visitor can correct, the smallest manipulable mechanism, its visible consequence and a transfer question. Explore genuinely different visual metaphors for leading candidates before choosing. Prefer a surprising, intelligible experiment over a dashboard that only restates results.

Give reviewed candidates paper-specific concepts and caveats, developing deeper briefs for the leaders or the count requested. Connect **prediction → manipulation → visible consequence → explanation → transfer**. Specify controls/outcomes, why they teach the mechanism, supporting pages and what is a new teaching extension. Include a boundary case that prevents a seductive false lesson. Different papers may warrant different experiences; the sequence is a design test, not a mandatory page template.

Score editorial applicability independently of citation count. Preserve component scores, rationale, confidence, access/reproduction needs and reading status. Propose an achievable first exhibit and a varied learning sequence. For empirical papers distinguish association, prediction and causation; identify fitted results, illustrative samples, simulations and paper findings explicitly.

Plan Foundation intuition and Advanced assumptions/math, accessible controls, reduced motion, reset and deterministic behavior. Prefer local SVG/canvas/HTML and browser calculations. Avoid requiring an API, training job, data subscription or large model when a faithful small reconstruction teaches the point. Disclose simplifications that change the setting or conclusion.

## Save, validate and hand off

Save under `docs/research/<topic>-<as-of-date>/`: a readable list/report, normalized records, method/provenance, applicability ranking and leading briefs. Use original summaries and source links. Preserve auditable evidence locations without committing private sources. The [research record](references/research-record.md) defines the minimum fields and how provider-specific output maps to them.

For the existing SSRN/OpenAlex record shape, build the citation and editorial CSVs with `python3 scripts/research/build_ssrn_exhibit_register.py --research-dir docs/research/<topic>-<as-of-date> --limit 100`; keep its output labeled as candidates unless source coverage and eligibility justify a stronger claim.

Check uniqueness, eligibility, date bounds, count provenance, ordering/ties, reading-status truthfulness, ranking completeness and record/brief links. Exercise changed retrieval helpers on a small real query and meaningful failure cases. A research-only change needs these checks; application changes require root `npm test`, `npm run build` and browser checks under the project contract.

Update `MEMORY.md` with durable research locations, verified commands and limits. Deliver actual counts, strongest concepts and unresolved gaps. Continue to [design-ssrn-paper](../design-ssrn-paper/SKILL.md) when implementation is requested; discovery does not authorize publication, social posting or paid services.
