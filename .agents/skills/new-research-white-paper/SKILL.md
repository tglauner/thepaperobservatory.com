---
name: new-research-white-paper
description: Create a LaTeX research or white-paper project from the Architecture Library, with tgir, teciem, or name_only logo selection, evidence-based content, and a verified PDF. Use for a new paper or paper starter, not ordinary edits to an existing paper.
---

# New Research White Paper

## Inputs

Example invocation: `$new-research-white-paper teciem` followed by the topic,
target project path, author, and available sources. Interpret the word after the
skill name as the brand argument; it is prompt text, not a shell command.

Accept exactly `tgir`, `teciem`, or `name_only`. Infer an omitted value only from
an explicit project or user preference; otherwise ask which brand to use. Reject
an unknown value instead of silently selecting TGIR.

The argument selects only the logo: TGIR logo, Teciem logo, or no logo. Keep the
same paper layout, research structure, and writing workflow for all three.
Author name, affiliation, contact details, topic, and distribution instructions
come from the request or project context independently of the logo. `name_only`
shows the requested author name without adding an organization or logo.

## Create the project

1. Read applicable `AGENTS.md` and `MEMORY.md`; establish the destination and
   detect the operating system. Use `python3` on macOS/Linux and `py -3` on
   Windows. When invoked from the Architecture Library, use a distinct target
   project rather than scaffolding into the library root.
2. Locate the Architecture Library from the resolved skill path's ancestors,
   the user's provided path, or `ARCHITECTURE_LIBRARY_ROOT`. Verify that it
   contains `scripts/architecture_manager.py` and `docs/latex/shared/`.
   Copied skills do not contain the library; if it cannot be found, ask for its
   local location instead of inventing a template or downloading another one.
3. Run the manager from that library with the resolved paths and selected brand:

   ```bash
   python3 scripts/architecture_manager.py apply document --white-paper --brand teciem --target "../research-paper"
   ```

   On Windows use `py -3` with the same arguments. Use a fully qualified manager
   path when running outside the library. Existing files are preserved by
   default; inspect skipped files and integrate needed changes individually.
   Do not add `--force` merely to make the starter match.
4. Work in the target's `docs/latex/main.tex` and
   `docs/latex/shared/research_white_paper_body.tex`. Use the canonical
   `template_tgir_article.sty` for all three variants; its historical filename
   does not imply TGIR branding. Use `\PublicationBrand{...}` and the shared
   author/affiliation/email setters. Keep fonts, margins, colors, headers, and
   title formatting in the shared styles.
5. For a requested paper, replace the sample body with the actual question,
   summary, scope and evidence, method, findings, limitations, recommendation,
   and evidence record. Adapt headings to the user's brief. Cite sources for
   substantive claims, separate evidence from interpretation, and identify
   missing evidence without inventing findings or citations. A request only
   for a starter can retain the clearly illustrative sample.

## Validate and hand off

Compile from the target's `docs/latex` directory, using a descriptive job name:

```bash
mkdir -p build
pdflatex -interaction=nonstopmode -halt-on-error -jobname=research_article -output-directory=build main.tex
pdflatex -interaction=nonstopmode -halt-on-error -jobname=research_article -output-directory=build main.tex
mv build/research_article.pdf ../research_article.pdf
```

Use PowerShell `New-Item -ItemType Directory -Force build` and `Move-Item` on
Windows. Inspect the rendered PDF for the chosen logo, author, readable layout,
and broken references. In `name_only`, verify that no logo appears, including
in the title area. A missing branded asset is a build issue, not permission to
substitute the other organization's logo.

Keep all ordinary compiler output in `docs/latex/build/`, final PDFs directly
in `docs/`, and status output only in root `status/`. Verify the root `README.md`, private material
and generated artifacts are excluded from git. Record the brand, source entry,
and working build command in root `MEMORY.md`; give the user links to the source
and PDF and report unavailable compilation honestly. Creating the paper does
not publish or send it.
