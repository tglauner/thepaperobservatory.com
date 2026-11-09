# GitHub Copilot Project Adapter

- Read and follow the root `AGENTS.md`; it is the shared project contract for
  Codex and GitHub Copilot.
- Read root `MEMORY.md` before material work and update it only with durable,
  non-secret context.
- Detect the operating system before choosing commands. On Windows, use
  PowerShell-native commands and Windows paths. On macOS or Linux, use POSIX
  shell commands and paths.
- For Python on Windows, use `.venv\Scripts\python.exe` when the environment
  exists and `py -3` to create it. On macOS or Linux, use `.venv/bin/python`
  when it exists and `python3` to create it. The environment directory is
  always `.venv/`.
- Read matching workflows under `docs/agent-workflows/` and matching skills
  under `.agents/skills/` before performing specialized work.
- `.codex/` contains Codex-only configuration and hooks. Do not run or rewrite
  Codex status hooks from GitHub Copilot unless the user explicitly requests
  work on that integration.
- Read `.env`, `confidential/`, keys, credential files, or secret files when
  relevant to an authorized build, test, diagnosis, or operation. Never print
  secret values, place them in responses or logs, copy them into tracked files,
  or commit them. Do not inspect private material when it is unrelated.
- Preserve existing project changes, run the narrowest relevant validation,
  and report changed files, validation results, and rollback steps.

## Cloud generation

The repository-specific cloud/model/publication contract is in root `AGENTS.md`. For an initial SSRN companion use `.agents/skills/design-ssrn-paper/SKILL.md`; cloud execution must record its actual model and reasoning setting. Headless cloud jobs use run logs and final status/artifact references instead of requiring a local VS Code/LaTeX status slide. Keep `.cloud-input/` private and transient.

## Status Slide Workflow (Copilot)

GitHub Copilot does not have automatic hooks. Run status commands manually:

1. **At the start of material work** (not quick questions), run:
   ```bash
   python3 status/status_slide.py start
   ```

2. **Before your final response**, run:
   ```bash
   python3 status/status_slide.py finish --status success --no-notify --bullet "First outcome" --bullet "Second outcome" --bullet "Third outcome"
   ```
   Use `--status issue` if work is blocked or incomplete.

External notifications are disabled by default. Do not enable or send them unless the user explicitly requests it; use `--no-notify` for final status commands.

The status subsystem is the exception to ordinary document output rules: its
helper, generated TeX, state, compiler byproducts, and final PDF all remain
inside project-root `status/`. Never place status artifacts under `docs/` or
`docs/latex/build/`.
