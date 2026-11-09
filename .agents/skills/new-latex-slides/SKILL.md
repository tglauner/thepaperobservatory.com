---
name: new-latex-slides
description: Create a new Beamer slide project from the Architecture Library with tgir, teciem, or name_only logo selection, the shared slide style, and a verified PDF. Use for new LaTeX decks or slide starters, not native PowerPoint or Google Slides work.
---

# New LaTeX Slides

## Inputs

Example invocation: `$new-latex-slides name_only` followed by the subject,
audience, destination, author, and desired length. The brand word is an argument
in the user's prompt, not a shell command.

Accept exactly `tgir`, `teciem`, or `name_only`. Use an explicit project or user
preference if the argument is omitted; otherwise ask which brand is intended.
An unknown value needs correction rather than a silent default.

The argument changes only the logo. Use the same layout, theme, typography,
footer arrangement, content, and author details for all three choices. Choose
author, affiliation, email, and distribution from the actual brief independently
of branding; `name_only` displays the author name without any logo or invented
organization. Branding does not select a topic or deployment environment.

## Create the deck

1. Read applicable `AGENTS.md` and `MEMORY.md`, detect the host OS, and resolve
   the target. When invoked in the Architecture Library, use a separate project
   destination. Use `python3` on macOS/Linux and `py -3` on Windows.
2. Locate the library from the resolved skill's ancestors, a user-provided
   library path, or `ARCHITECTURE_LIBRARY_ROOT`. Verify
   `scripts/architecture_manager.py` and `docs/latex/shared/` exist there.
   A copied skill alone is not a template bundle. If the library is unavailable,
   ask for its local location rather than creating a substitute theme.
3. Apply the selected brand, replacing the example paths with the resolved ones:

   ```bash
   python3 scripts/architecture_manager.py apply lecture --brand name_only --target "../research-slides"
   ```

   Use `py -3` on Windows and an absolute manager path outside the library.
   Preserve existing files; reconcile skipped files individually. Do not add
   `--force` simply to overwrite a customized deck.
4. Author `docs/latex/main.tex` using Beamer at `aspectratio=169`, the canonical
   `shared/template_tgir_beamer.sty`, and `\PublicationBrand{...}`. The shared
   style supports all three brands despite its historical filename. Use its
   author/affiliation/email setters; never add a second logo with a local
   `\includegraphics`, `\logo`, or title graphic.
5. Build the requested narrative for its audience. Reuse the starter's title,
   evidence, interpretation, and decision frames when useful; change the topic
   and length to match the brief. Keep mathematical details, diagrams, and
   tables content-specific. Split crowded frames rather than shrinking global
   typography or redefining the theme. Ground factual claims and citations in
   supplied or verified sources. For a starter-only request, retain the clearly
   illustrative content.

## Validate and hand off

Compile from the target's `docs/latex` directory:

```bash
mkdir -p build
pdflatex -interaction=nonstopmode -halt-on-error -jobname=research_slides -output-directory=build main.tex
pdflatex -interaction=nonstopmode -halt-on-error -jobname=research_slides -output-directory=build main.tex
mv build/research_slides.pdf ../research_slides.pdf
```

Use PowerShell `New-Item -ItemType Directory -Force build` and `Move-Item` on
Windows. Inspect the rendered title, content, and outline frames for clipping,
logo placement, footer content, and readability. Check that `name_only` has no
logo on any frame. Treat missing requested logo assets as a build issue; do not
fall back to another brand.

Keep compiler output in `docs/latex/build/`, final `<name>_slides.pdf` in `docs/`,
and the status subsystem entirely in root `status/`. Verify the root `README.md`, generated files and
private material remain excluded from git. Record the selected brand and build
command in root `MEMORY.md`; return source/PDF links and any actual validation
limits. Creating a deck does not publish or distribute it.
