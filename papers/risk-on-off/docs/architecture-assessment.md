# Architecture adoption assessment

Date: 2026-11-08. Profile: `tgir-app`.

## Inputs and safe refresh

The target and `../app_architecture` are sibling directories. The library contains `scripts/architecture_manager.py` and was clean on branch `main`, tracking `origin/main`. A `git pull --ff-only` completed with “Already up to date.” The adopted library revision is `73db307deded2c1cba0ce0b58fd761216b3d470b`.

The target initially contained the supplied `ssrn-2150877.pdf` and was not a Git repository. No existing application, secrets, or user changes were overwritten. The original PDF was preserved. No `.env`, credentials, or confidential content were inspected.

Executed manager operations:

```bash
python3 ../app_architecture/scripts/architecture_manager.py info
python3 ../app_architecture/scripts/architecture_manager.py audit tgir-app --target .
python3 ../app_architecture/scripts/architecture_manager.py apply tgir-app --target . --dry-run
python3 ../app_architecture/scripts/architecture_manager.py apply tgir-app --target .
python3 ../app_architecture/scripts/architecture_manager.py audit tgir-app --target .
```

The pre-integration audit reported 28 missing managed files, 22 missing directories, zero type conflicts, and zero symlinks requiring review. The manager was applied without `--force`.

## Architecture choice

Use the library's React/Vite frontend and project conventions with a deliberate static adaptation. All exhibits calculate in the browser. There is no current API, mutable server state, job pipeline, admin interface, credential requirement, or database. Omitting FastAPI, SQLite, demo login, jobs, and a worker makes this version complete with less infrastructure. If a future feature needs a database, the user's explicit global preference is PostgreSQL on the existing droplet, which takes precedence over the library's SQLite default.

The current release stays local. Later static delivery fits the existing DigitalOcean droplet and Apache; no extra instance or paid service is needed. Only built public files may be served. No commit, push, remote repository creation, or deployment was performed.

## Managed files and semantic adaptations

The manager added agent instructions, durable memory, workflow guides and scoped skills, Codex/VS Code/Copilot adapters, privacy ignore rules, architecture documentation, infrastructure reference directories, and the self-contained status helper.

Intentional differences from the stock profile:

| Managed path | Reason |
| --- | --- |
| `AGENTS.md` | Project-specific educational accuracy, browser accessibility, static runtime, local-only scope, notification consent, validation, and root-agent status lifecycle. |
| `MEMORY.md` | Durable local architecture, source provenance, commands, and library revision. |
| `README.md` | Application-specific install/run/test guidance, maintained by the site implementation owner. |
| `docs/architecture/ARCHITECTURE.md` | Actual React/Vite static system, no backend or database, paper/simulation boundary, future Apache static delivery and rollback. |
| `docs/architecture/IMPLEMENTATION_PLAN.md` | Educational delivery acceptance criteria rather than the starter's unrelated CRUD, admin, jobs, and price-change tasks. |
| `docs/architecture/AI_WORKFLOWS.md` | Research accuracy, local interactive exhibits, accessibility, source checks, and static release workflow. |
| `docs/agent-workflows/CODEX_WORKFLOWS.md` | Uses native frontend test/build commands, honors user authorization, requires no external notification, and leaves final root status to the root agent. |
| `docs/agent-workflows/TASK_BRIEF_SAMPLE.md` | Complete relevant example for extending an educational exhibit. |
| `.codex/config.toml` | Inherits the active session's model, approvals, sandbox, and network policy instead of pinning an obsolete model or conflicting policy. |
| `.codex/hooks.json` | Local project-relative status commands work before Git initialization; notifications disabled for automatic hooks. |
| `.env.example` | No runtime secrets or unused backend settings; notification default is false. |
| `.github/copilot-instructions.md` | Final status explicitly skips notifications. |
| `.gitignore` | Adds local dependencies, builds, `.venv`, caches, and QA output while preserving all privacy and status rules. |
| `infra/apache/web-application.conf.sample` | Valid static-directory include using the concrete intended deployment path; no assumed domain, certificate, API, or backend service. |
| `infra/systemd/web-application.service.sample` | Intentionally omitted because a static website has no application daemon; `infra/systemd/README.md` explains the boundary. |
| `status/status_slide.py` | Telegram notifications default to disabled; all other shared lifecycle behavior retained. |

The scoped skill adapters, VS Code settings, and status README remain stock. Remaining managed-file differences are intentional adaptations, not unresolved merges. The one intentionally missing managed service file is not required by this architecture; no directory, symlink, or type conflict remains. The final read-only audit after application documentation was completed reports 28 reference files: 12 identical, 15 intentionally adapted, and 1 intentionally omitted systemd service sample. All 23 reference directories exist; zero symlinks require review and zero type conflicts remain.

## Validation record

Preliminary integration checks completed successfully:

1. Manager `info` recognized macOS and the sibling library.
2. Initial read-only audit completed.
3. Dry-run apply completed without modifying the target.
4. Non-forced apply completed.
5. Post-merge read-only audit completed without type conflicts or symlinks requiring review.
6. `.codex/hooks.json` parsed as JSON.
7. `.vscode/settings.json` parsed as JSON.
8. `.codex/config.toml` parsed as TOML.
9. `status/status_slide.py` compiled as Python syntax.
10. Status Working Beamer PDF compiled and opened in VS Code with notifications disabled.

Native baseline `npm test` first passed 38/38 mathematical tests. After adding the architecture/privacy/content suite, `npm test` passed 56/56 tests (38 mathematical and 18 architecture/content), with zero failures or skipped tests, on Node v22.22.1. This exceeds the 20-test integration floor. The site implementation owner separately records the production build and browser outcomes in the application README or QA record; these supplement the native tests. JSON, TOML, and status syntax validation were executed directly as recorded above.

## Rollback

Before any remote repository exists, rollback is local file removal limited to files added for this build. Preserve the original source PDF and unrelated user files. Architecture-only rollback removes the newly copied `.agents/`, `.codex/`, `.github/`, `.vscode/`, `status/`, architecture/workflow docs, infrastructure reference files, `AGENTS.md`, `MEMORY.md`, `.env.example`, and this assessment, and removes only the architecture-added `.gitignore` rules. Do not remove application source or private content as part of architecture-only rollback. No remote or production rollback is needed because neither was changed.

## Individual native test results

Executed `npm test` on 2026-11-08. All 56 named tests passed; no test depends on an existing `dist/` directory. The supplied PDF SHA-256 is `e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de`, matching the public copy.

### tests/architecture.test.js — 18 passed

- PASS — original 50-page source PDF retains its supplied content hash
- PASS — public paper is a byte-identical copy of the preserved source
- PASS — public assets contain no secret, private, database, or status files
- PASS — public assets cannot follow symlinks outside their publication boundary
- PASS — browser inputs do not import private material or expose workstation paths
- PASS — scripts, styles, and images are local runtime assets
- PASS — local educational exhibits have no runtime data-service dependency
- PASS — privacy ignore rules retain only the environment example
- PASS — dependencies, built files, and generated status stay untracked
- PASS — status output paths remain inside the root status subsystem
- PASS — status hooks parse as JSON, work before Git setup, and disable notifications
- PASS — local example configuration requires no credentials or external notifications
- PASS — project scripts provide local preview, native tests, and a static build
- PASS — glossary has unique terms and complete undergraduate and graduate explanations
- PASS — quiz choices, correct indices, feedback, and source references form valid questions
- PASS — paper evidence entries have complete attribution within the 50-page source
- PASS — further reading uses explicit HTTPS scholarly links and author attribution
- PASS — model limitations have unique readable titles and explanatory text

### tests/math.test.js — 38 passed

- PASS — dot products and matrix-vector products follow linear algebra
- PASS — normalization preserves direction and creates a unit vector
- PASS — normalization rejects vectors without a direction
- PASS — linear algebra rejects dimension mismatch and nonfinite numbers
- PASS — clamp handles boundaries and rejects reversed intervals
- PASS — two-asset risk follows the law of cosines covariance formula
- PASS — perfect positive correlation removes diversification for equal volatilities
- PASS — perfect negative correlation permits exact cancellation
- PASS — independent equal-volatility assets reduce portfolio volatility by sqrt(n)
- PASS — variance is quadratic in portfolio size
- PASS — variance handles zero weights and rejects asymmetric matrices
- PASS — Jacobi eigenvalues solve a known correlated 2D example
- PASS — Jacobi eigenvectors are orthonormal and satisfy Vz = lambda z
- PASS — Jacobi handles repeated eigenvalues without inventing variance
- PASS — Jacobi handles 1D and very small covariance magnitudes
- PASS — synthetic universe has an exact positive-definite orthonormal decomposition
- PASS — risk shares conserve portfolio variance in the orthogonal basis
- PASS — a pure eigenvector puts all risk in one component
- PASS — component risk shares ignore eigenvector sign choice and portfolio scale
- PASS — risk shares explicitly reject zero risk
- PASS — effective bets handles concentrated, equal, and zero shares
- PASS — presentation normalized entropy equals (effective bets - 1)/(n - 1)
- PASS — entropy is invariant to component order and increases with evenness
- PASS — entropy rejects signed contributions, missing mass, and invalid values
- PASS — equal-risk weights actually equalize component variance shares
- PASS — all sign choices of DRP equalize risk, exposing nonuniqueness
- PASS — equal-risk construction rejects singular covariance and invalid signs
- PASS — doubling first eigenvalue doubles pure-PC variance and multiplies volatility by sqrt(2)
- PASS — a doubled single eigenvalue raises equal-risk portfolio variance by 1/n
- PASS — rotation shocks preserve orthogonality while changing the covariance basis
- PASS — zero-angle unit shock reproduces the original covariance
- PASS — shocks reject negative variance and nonfinite rotations
- PASS — correlation matrix removes volatility units and has a unit diagonal
- PASS — invalid equicorrelations and undefined correlations are rejected
- PASS — simulation is reproducible for a fixed seed and responsive to a different seed
- PASS — large simulated Gaussian sample approaches supplied covariance
- PASS — simulation handles singular PSD covariance and rejects indefinite matrices
- PASS — reconstruction rejects nonorthonormal bases and negative eigenvalues

## Final built-artifact checks

Executed read-only against the completed Vite `dist/` build on 2026-11-08:

1. PASS — All seven local asset references in built `index.html` resolve to files.
2. PASS — Built HTML contains no remote runtime resources.
3. PASS — Build output excludes environment, private, status, dependency, source-workspace, credential, database, and source-map files.
4. PASS — Built artifacts contain no symlinks crossing the publication boundary.
5. PASS — Root source PDF retains the supplied SHA-256 recorded above.
6. PASS — Public reading-copy PDF matches that SHA-256.
7. PASS — Built reading-copy PDF matches that SHA-256.
8. PASS — All 59 CSS font/image URL references resolve locally.
9. PASS — Built CSS requires no remote font/image service.
10. PASS — All four relative built JavaScript chunk references resolve.
11. PASS — Final architecture audit completed with only the intentional differences documented above: 12 identical, 15 adapted, one omitted service, no missing directories, no symlink-review findings, and no type conflicts.

The built output contains separate application, React runtime, math-typesetting, and bundler runtime JavaScript assets plus local styles/fonts. Direct artifact checks do not replace the final browser checks recorded by the application owner.
