# Risk Observatory paper site

Follow the root `../../AGENTS.md`, `../../MEMORY.md`, and shared architecture/workflow guidance. This folder owns the complete first-paper website and original `ssrn-2150877.pdf`; preserve its supplied hash and mathematical behavior.

- Read this folder's `MEMORY.md`, `README.md`, and `docs/paper-analysis.md` for source-specific context.
- Base URL is `/risk-on-off/`; use `import.meta.env.BASE_URL` for paper and public-asset links.
- The source is a 50-slide presentation; source links use physical PDF pages matching the slide numbers.
- Original tests read common privacy/status configuration from the workspace root. App source, content, numerical tests and PDF provenance remain local to this folder.
- The root status lifecycle is shared. Do not add a second status subsystem or external notification.
