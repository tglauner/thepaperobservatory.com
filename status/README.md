# Agent Status Subsystem

The `status/` folder is the one explicit exception to the repository's normal
PDF and LaTeX output rules. Ordinary documents put final PDFs in `docs/` and
compiler output in `docs/latex/build/`; status logic must never use either
location. Keeping the subsystem in one root folder makes each project portable,
auditable, and independent of its document structure.

## Self-contained layout

- `status/status_slide.py` - tracked lifecycle helper
- `status/README.md` - tracked operating contract
- `status/status_slide.tex` - generated Beamer source
- `status/status_slide_state.json` - generated lifecycle state
- `status/status_slides.pdf` - generated PDF opened in VS Code
- `status/status_slides.*` - generated LaTeX compiler byproducts

Only the helper and this README are tracked. Root `.gitignore` ignores every
other file under `status/`, including the visible PDF and all compiler output.
No status source, state, build artifact, or final PDF belongs in `docs/`,
`docs/latex/`, a system temporary directory, or another project folder.

## Lifecycle

Project Codex hooks call the helper at prompt start and turn stop:

```bash
python3 status/status_slide.py hook-start
python3 status/status_slide.py hook-finish
```

The start hook writes and opens a dark `Status: Working` slide. The workspace
Explorer excludes `status/` from auto-reveal, so its folder remains collapsed.
Before the final response, the active agent records an accurate final slide:

```bash
python3 status/status_slide.py finish \
  --status success \
  --bullet "Implemented the requested change" \
  --bullet "Ran relevant validation" \
  --bullet "Recorded the final project status"
```

Use `--status issue` when work is blocked or validation fails. The stop hook
preserves an existing Success/Issue state and replaces stale Working state with
a fallback Issue slide.

Every Codex prompt must open the status PDF in VS Code and record either
`Status: Success` or `Status: Issue` before its final response. GitHub Copilot
does not have this hook mechanism; when it acts as the agent, it should run
`start` at the beginning of material work and `finish --status success|issue`
before completing its response.
