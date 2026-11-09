---
name: new-tgir-app
description: Start a TG Investments and Research, LLC application using the Architecture Library TGIR starter, with a Dropbox workspace and DigitalOcean deployment defaults. Use for new TGIR apps or explicitly requested starter adoption.
---

# New TGIR App

Example invocation: `$new-tgir-app create a research dashboard in my Dropbox Projects folder`.
Use the requested project path and product brief. Resolve a missing path from the
workspace or a named parent folder; ask only if the target cannot be determined.

## Locate the starter

Read applicable `AGENTS.md` files and existing target `MEMORY.md`. Detect the host
OS before selecting commands. Find the Architecture Library using the explicit
library path, `ARCHITECTURE_LIBRARY_ROOT`, or a skill ancestor containing both
`scripts/architecture_manager.py` and `apps_tgir/`. Verify that location before
using it. A copied skill does not imply that the target contains the manager.
If no source is accessible, request its location without inventing a new starter.

Read the library's `apps_tgir/ARCHITECTURE.md` and applicable workflow files. For
an existing target, inspect its architecture, manifest, and working-tree changes
before adoption. Preserve its files and project-specific decisions; the library
samples describe defaults, not facts about an existing application.

## Apply and tailor

Set `ARCHITECTURE_LIBRARY_ROOT` to the verified library path and `PROJECT_ROOT`
to the resolved target. On macOS/POSIX:

```bash
python3 "$ARCHITECTURE_LIBRARY_ROOT/scripts/architecture_manager.py" apply tgir-app --target "$PROJECT_ROOT" --dry-run
python3 "$ARCHITECTURE_LIBRARY_ROOT/scripts/architecture_manager.py" apply tgir-app --target "$PROJECT_ROOT"
```

On Windows, set `$env:ARCHITECTURE_LIBRARY_ROOT` and `$ProjectRoot`, then use
`py -3` with those variables and the same arguments. Review dry-run destinations
before applying. For an existing project, run `audit tgir-app --target` first and
adopt only the requested files; do not run blanket `apply` merely to audit it.
Never use `--force` to resolve a collision. Merge only changes within the user's
request, preserving existing content.

Use these TGIR defaults when the user has not specified otherwise:

- Local project storage in Dropbox; deployment on an existing DigitalOcean
  droplet, with application files in a named subfolder of `/var/www/html`.
- React/Vite, FastAPI/Uvicorn, SQLite, and the library's Apache/systemd samples.
  Justify PostgreSQL or additional infrastructure by an actual requirement.
- Root `confidential/` excluded from git; secrets and generated files excluded
  too. `confidential/` is private working material, not an ingestion queue; do
  not create an Inbox unless the app deliberately adds a documented RAG subsystem.
  Keep the complete status subsystem under root `status/`.
- Protected admin surfaces and retry-safe jobs when these features are needed.
  Starter demo credentials are development-only, never production credentials.

Tailor copied architecture, environment examples, runbooks, and `MEMORY.md` to
the actual product. Keep instructions in `AGENTS.md` and human setup guidance
in README files. Preserve layered Codex instructions and the thin Copilot adapter.
If the request includes a working application or a first feature, implement that
scope; the copied starter contains architecture and operations samples, not an
already runnable app. If it only asks for scaffolding, describe the result as a
starter and distinguish planned components from implemented ones.

## Verify and hand off

Check the root `README.md`, required guidance, memory, ignored private paths,
and configuration. Parse changed JSON. Derive build and test commands from the implemented stack and run
the relevant checks; do not run app commands against a docs-only scaffold.
Document exact local setup/build/test instructions and the DigitalOcean target
procedure, distinguishing samples from verified server configuration. Record
durable verified decisions in memory. Report the target, created/merged files,
validation, and any missing deployment details. Creating a starter does not by
itself authorize GitHub repository creation, pushing, provisioning, or deployment.
