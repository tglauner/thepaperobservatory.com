# Collection migration and artifact QA

Inspected 2026-11-08 16:19 EST after the aggregate build reported completion. This is a read-only inspection of the local build and routing migration, independent of the interactive browser QA.

## Result

All migration and artifact integrity checks passed. Both paper folders retain their required application files, and all source/public/child-build/assembled-build PDF copies match their supplied hashes. All three built HTML entry points exist, and the earlier flat first-paper source/public/test paths are absent.

The published root `dist/` contains no symlinks, private directories, source trees, credential files, agent/status files, package manifests or source configuration. The shared root status helper remains outside the publication artifact.

## PDF provenance

Each row was checked in four locations: original source under `papers/<slug>/`, its `public/paper.pdf`, its child `dist/paper.pdf`, and assembled root `dist/<slug>/paper.pdf`.

| Paper folder | Original | SHA-256 of all four copies |
| --- | --- | --- |
| `risk-on-off` | `ssrn-2150877.pdf` | `e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de` |
| `stochastic-flow-diagrams` | `ssrn-2379314.pdf` | `9d140b75c013124d8267d821412cd6ea7dc1a282d06d16e849f45ed452331e54` |

## Resource resolution

- 16 HTML script/style/icon/image references resolve to local files after applying absolute base prefixes or relative artifact paths.
- 118 CSS font/image references resolve locally; data URIs were excluded from the file-reference count.
- 8 relative static JavaScript import references resolve to local chunks.
- The library and both paper HTML files contain no `/src/`, `@vite` or `node_modules` development references.
- Both paper module scripts use their own base-prefixed `/assets/<hashed>.js` URLs.

## Static preview HTTP checks

The preview on port 4173 served these exact built files byte for byte, with HTTP 200 and the indicated MIME type. Comparing responses with disk output confirms that these paper routes served the built artifact rather than an injected Vite development page.

| Route on `http://127.0.0.1:4173` | Status | MIME type | Bytes |
| --- | ---: | --- | ---: |
| `/` | 200 | `text/html` | 10,544 |
| `/risk-on-off/` | 200 | `text/html` | 1,254 |
| `/stochastic-flow-diagrams/` | 200 | `text/html` | 1,305 |
| `/risk-on-off/paper.pdf` | 200 | `application/pdf` | 1,405,464 |
| `/stochastic-flow-diagrams/paper.pdf` | 200 | `application/pdf` | 2,328,727 |

The development library on port 5173 is a separate user-facing process. This inspection did not alter or stop it.

## Scope

Workspace ownership was checked for `src/`, `public/`, `docs/`, `tests/`, `package.json`, `README.md`, `index.html` and `vite.config.js` in both paper folders. Original root PDF names, first-paper root source/public/index paths and old root numerical/architecture test files were checked for absence. No secret values were read.

These checks establish migration structure, source preservation, static assembly and HTTP/resource integrity. Numerical tests and browser interaction/accessibility results are recorded separately in the workspace QA report. No application, configuration or source file was modified by this inspection.
