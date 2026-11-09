---
name: project-quality-check
description: Review a project's architecture conventions, configuration, documentation, artifact handling, and relevant build or test results. Use when asked for a project quality check or starter-conformance audit; report findings without automatically fixing files.
---

# Project Quality Check

Example invocation: `$project-quality-check review this Teciem project`.
Honor a narrower requested scope. Treat this as a read-only review of source and
configuration; do not apply starters, reformat, update memory, install dependencies,
or remediate findings unless the user also requested those changes.

## Establish the project type

Read applicable `AGENTS.md`, root `MEMORY.md`, architecture, and relevant workflow
or runbook files. Detect OS, project root, working-tree changes, actual manifests,
and documented commands. Determine whether the project is a TGIR app, Teciem app,
source-grounded RAG system, LaTeX paper/deck, or another type. Do not infer the
entity from logo choice alone.
Choose checks from that evidence rather than blindly running `npm` or `pytest`.

For an explicit starter comparison, locate the Architecture Library from a user
path, `ARCHITECTURE_LIBRARY_ROOT`, or a skill ancestor containing
`scripts/architecture_manager.py` and the relevant starter tree. Verify the source;
copied skills do not imply that the manager exists inside the target. Run its
read-only `audit` for the matching supported profile. For example, with verified
`ARCHITECTURE_LIBRARY_ROOT` and `PROJECT_ROOT` variables on macOS/POSIX:

```bash
python3 "$ARCHITECTURE_LIBRARY_ROOT/scripts/architecture_manager.py" audit teciem-app --target "$PROJECT_ROOT"
```

Use `py -3` and PowerShell variables on Windows. Select the profile from the
manager's `--help`; for branded slides add `--brand`, and for a white paper add
`--white-paper --brand`. Do not invent a new profile name for a variant. If the
library is unavailable, continue the project-local review and report the
comparison as not performed. A `DIFFERENT_FILE` result indicates adaptation to
inspect, not an automatic defect; audit completion is not proof of quality.

## Check applicable conventions

- Confirm a durable root `MEMORY.md`, shared `AGENTS.md`, appropriate tool-specific
  adapters, and useful local build/test documentation. For deployable apps, check
  the documented target procedure too.
- Check that `.env`, `.env.*`, `confidential/`, secrets, generated PDFs/Word
  files, and compiler output are excluded from git while `.env.example` remains
  available. `confidential/` is private working material, not an automatic
  ingestion queue. Inspect tracked paths and ignore rules; do not open private
  material unrelated to the review or print secret values.
- For TGIR apps, verify Dropbox and existing DigitalOcean droplet defaults against
  the project's actual decisions. For Teciem, verify SharePoint/OneDrive and SCE
  internal-only deployment; do not impose TGIR infrastructure or account defaults.
- For app code, inspect relevant admin access and retry behavior where implemented.
  Run documented checks only for components that exist and can be exercised locally.
- For RAG, verify that root `INBOX/` is the sole intentional private ingestion
  queue; `confidential/` is not ingested without an explicit import; and no
  competing `confidential/INBOX/` path exists. Verify Git exclusions for `INBOX/`,
  processed/failed source copies, canonical database data, indexes, and audit
  records. Confirm that preserved sources plus SQLite are canonical, the index is
  rebuildable, and external model, messaging, storage, and cloud-processing
  boundaries are documented. For a non-RAG profile, report an unignored Inbox as
  a finding only when one exists; do not require an Inbox by default.
- For LaTeX, check shared-style use, the requested logo variant, PDFs directly in
  `docs/` with `_article.pdf`/`_slides.pdf` names, and compiler output in
  `docs/latex/build/`. A `name_only` document must have no branding logo. All status
  subsystem files are the exception and belong exclusively under root `status/`.
- Validate relevant JSON/configuration. If running builds, tests, or TeX compilation
  is appropriate, inspect their commands first and keep generated outputs in the
  project's ignored locations. A review does not authorize external mutations.

## Report

Lead with concrete findings ordered by impact, with file locations and evidence.
Separate actual defects from intentional starter differences and optional
improvements. List checks that passed, failed, or were unavailable, including
commands needed to reproduce a failure. Missing tools are an unperformed check,
not a passing result. If no actionable findings remain, say so and state the
validation coverage and any meaningful limitation.
