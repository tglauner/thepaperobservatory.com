---
name: new-rag-system
description: Start a local-first, source-grounded RAG system from the Architecture Library, or audit and adopt that starter in an existing project.
---

# New RAG System

Example invocation: `$new-rag-system create a private source-grounded research system in this folder.`
Use the requested project path and purpose. Resolve a missing target from the
workspace or named parent folder; ask only when it cannot be determined.

## Locate and assess the starter

Read applicable `AGENTS.md` files and an existing target's `MEMORY.md`. Detect
the host OS. Locate the Architecture Library from an explicit path,
`ARCHITECTURE_LIBRARY_ROOT`, or a skill ancestor that contains both
`scripts/architecture_manager.py` and `apps_rag/`; verify those paths before
using it. A copied skill does not mean the manager is present in the target.
If no valid library is available, request its location rather than inventing a
starter.

Read `apps_rag/ARCHITECTURE.md` and applicable target guidance. For an existing
project, inspect its architecture, manifests, and working-tree changes, then run
the read-only audit before proposing adoption:

```bash
python3 "$ARCHITECTURE_LIBRARY_ROOT/scripts/architecture_manager.py" audit rag-system --target "$PROJECT_ROOT"
```

Preserve existing behavior, data boundaries, and project-specific decisions.
Do not apply the starter merely to inspect an existing project.

## Apply and tailor

For a new target, preview the exact changes before applying:

```bash
python3 "$ARCHITECTURE_LIBRARY_ROOT/scripts/architecture_manager.py" apply rag-system --target "$PROJECT_ROOT" --dry-run
python3 "$ARCHITECTURE_LIBRARY_ROOT/scripts/architecture_manager.py" apply rag-system --target "$PROJECT_ROOT"
```

On Windows use `py -3` and PowerShell environment variables with the same
manager arguments. Never use `--force` to resolve a collision. For an existing
target, merge only the requested, reviewed adoption changes.

Keep the system ownership-neutral and local-first. Preserve raw source
traceability and make preserved sources plus the canonical SQLite database the
durable records. Treat vector and keyword indexes as rebuildable accelerators,
not canonical data. Ensure all of the following remain outside Git: `INBOX/`,
processed/failed source copies, databases, indexes, audit data, `.env`,
credentials, and `confidential/` material. Root `INBOX/` is the single
intentional private ingestion queue. Keep other private working material in
`confidential/` and do not ingest it unless the user explicitly requests an
import; never create a competing `confidential/INBOX/` path.

Document every external boundary before enabling it: model or embedding APIs,
messaging integrations, cloud storage, and any other cloud processing. State
what data can leave the local machine, under what action, and how the boundary
is configured. Keep high-stakes interpretation separate from canonical sourced
facts and retain citations, uncertainty, and review states.

The copied material is an architecture scaffold, not an implemented RAG
application. If implementation is requested, build only that requested scope;
otherwise distinguish planned components from working commands.

## Verify and hand off

Confirm the RAG paths and Git exclusions, source-to-record traceability,
database-before-index ordering, and reindex path. Parse changed JSON and run
the implemented project's relevant tests; do not claim app tests for a
documentation-only scaffold. Document exact local install, initialization,
ingestion, query, reindex, backup, and test commands that are actually
implemented. Report the target, changes, validation, any remaining audit
differences, and every external-data boundary.

Creating or adopting a starter does not authorize GitHub publication, deployment,
provisioning, external data transmission, or any cloud integration.
