---
name: new-teciem-app
description: Start a Teciem application using the Architecture Library Teciem starter, with a SharePoint or OneDrive workspace and internal SCE deployment. Use for new Teciem prototypes or explicitly requested starter adoption.
---

# New Teciem App

Example invocation: `$new-teciem-app create an internal reconciliation prototype in my OneDrive Projects folder`.
Use the requested project path and product brief. Resolve a missing path from the
workspace or a named parent folder; ask only if the target cannot be determined.

## Locate the starter

Read applicable `AGENTS.md` files and existing target `MEMORY.md`. Detect the host
OS and choose host-appropriate commands. Find the
Architecture Library using the explicit library path,
`ARCHITECTURE_LIBRARY_ROOT`, or a skill ancestor containing both
`scripts/architecture_manager.py` and `apps_teciem/`. Verify the source location.
A copied skill does not imply that the target contains the manager. If no source
is accessible, request its location without inventing a new starter.

Read `apps_teciem/ARCHITECTURE.md` from that library. For an existing target, read
its architecture and workflow guidance and inspect its manifests and working-tree
changes. Preserve its project-specific decisions. Keep Teciem's architecture
independent of TGIR; changes in one starter do not propagate to the other.

## Apply and tailor

Set `$env:ARCHITECTURE_LIBRARY_ROOT` to the verified library path and
`$ProjectRoot` to the resolved target. On Windows PowerShell:

```powershell
py -3 "$env:ARCHITECTURE_LIBRARY_ROOT/scripts/architecture_manager.py" apply teciem-app --target "$ProjectRoot" --dry-run
py -3 "$env:ARCHITECTURE_LIBRARY_ROOT/scripts/architecture_manager.py" apply teciem-app --target "$ProjectRoot"
```

On macOS/POSIX, set `ARCHITECTURE_LIBRARY_ROOT` and `PROJECT_ROOT`, then use
`python3` with those variables and the same arguments. Review dry-run destinations
before applying. For an existing project, run `audit teciem-app --target` first
and adopt only the requested files; do not run blanket `apply` merely to audit it.
Never use `--force` to resolve a collision. Merge only changes within the user's
request, preserving existing content.

Apply Teciem's distinct defaults:

- Local workspace synced through SharePoint/OneDrive; Python uses a project
  `.venv/`, with setup instructions appropriate to the detected host.
- React/Vite, FastAPI/Uvicorn, and SQLite unless actual requirements justify a
  different choice. Prefer approved internal storage for application data.
- Deployment exclusively on approved internal SCE servers behind the corporate
  firewall. Do not use DigitalOcean, external cloud VMs, or public exposure.
- Require authentication unless verified network controls restrict access.
  Do not introduce TGIR demo accounts or additional user management by default.
- Root `confidential/` and secrets excluded from git; keep generated artifacts
  local. `confidential/` is private working material, not an ingestion queue;
  do not create an Inbox unless the prototype deliberately adds a documented RAG
  subsystem. Keep the complete status subsystem under root `status/`.

Tailor architecture, environment examples, runbooks, and root `MEMORY.md` to the
actual internal workflow. Keep agent rules in `AGENTS.md` and human setup guidance
in README files. Preserve layered Codex instructions and the thin Copilot adapter.
If the request includes a working app or first feature, implement that scope;
the copied starter is an architecture scaffold, not an already runnable app.
For scaffold-only requests, distinguish planned components from implemented ones.

## Verify and hand off

Check the root `README.md`, copied guidance, root memory, ignored private paths,
and configuration; parse changed JSON. Derive build and test commands from the actual implementation,
using the project `.venv/` for Python. Do not run app tests in a docs-only scaffold.
Document exact local commands and the internal SCE deployment procedure, using
verified server details or explicitly reporting the information still needed.
Do not invent corporate hosts or access controls. Production promotion requires
the separately approved architecture/security plan described by the starter.
Report the target, changes, checks, and any constraints. Starter creation does
not itself authorize GitHub publication, remote access, provisioning, or deployment.
