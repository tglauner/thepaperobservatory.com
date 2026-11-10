# Publishing and operations

## Live setup

Initial setup completed **2026-11-10**.

| Component | Verified configuration |
| --- | --- |
| Public source | https://github.com/tglauner/thepaperobservatory.com |
| Website | https://thepaperobservatory.com — Active, SSL enabled |
| Cloudflare Pages | Project `thepaperobservatory`, branch `main` |
| Fallback | https://thepaperobservatory.pages.dev |
| Visitor collection | Existing DigitalOcean collector; [analytics runbook](visitor-analytics.md) |

The first website release used commit `9d6bede3c11b4f54231c6fe633456c9830e322c3`, CI run `42747011869` and deployment `cc9f9890-d2e9-4abe-b7f2-082f8948182b`. Production browser controls and a tagged analytics visit passed.

## Hosting and release boundary

The static site fits **Cloudflare Pages Free**: the verified release contains 149 files, with the largest asset about 0.25 MiB. The [free limits](https://developers.cloudflare.com/pages/platform/limits/) checked during setup were 20,000 files and 25 MiB per file; [static requests are free](https://developers.cloudflare.com/pages/functions/pricing/#static-asset-requests). Domain renewal and optional cloud development/generation are separate costs.

Publish only the assembled artifact. The scanner rejects private paths, PDFs, symlinks, oversized assets, source trees and Functions/Worker entry points. Keep original papers, `.env`, `confidential/`, status output and temporary inputs private. No Cloudflare backend, database or runtime AI call is needed.

## Validate and release

From the workspace root:

```bash
npm run check
npm run cloud:self-check
npm run cloud:verify
```

GitHub `site.yml` tests and builds each PR and `main` push, then retains the verified `public-site` artifact for 14 days. Releases use Wrangler **4.158.0**; MCP is not required. Check `npx --yes wrangler@4.158.0 whoami` before publishing, and use `login` if needed.

For an authorized release, deploy a successful `main` CI artifact:

```bash
(
set -e
run_id=$(gh run list --workflow site.yml --branch main --status success --limit 1 --json databaseId --jq '.[0].databaseId // empty')
test -n "$run_id"
mkdir -p .cloud-output
release_dir=$(mktemp -d ".cloud-output/release-${run_id}.XXXXXX")
gh run download "$run_id" --name public-site --dir "$release_dir"
node scripts/cloud-verify.mjs "$release_dir"
release_sha=$(gh run view "$run_id" --json headSha --jq '.headSha')
npx --yes wrangler@4.158.0 pages deploy "$release_dir" --project-name thepaperobservatory --branch main --commit-hash "$release_sha"
)
```

Record the returned deployment ID and commit. Check HTTPS, the library, both paper routes and controls, SSRN links and collector responses at the live URL. Identify verification visits as test traffic. Remove only that temporary release directory after verification. Reuse the existing project and domain; no new project or paid service is needed.

## Automatic deployment and generation

CI validation is enabled. Automatic deployment is intentionally off. To enable it later, place a scoped Pages API token and account ID in the GitHub `production` environment as `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`, then set `CLOUDFLARE_DEPLOY_ENABLED=true`. Credentials are available only to the deploy step. Never put them in Git or browser assets.

`design-paper.yml` is a separate manual workflow. It needs `OPENAI_API_KEY` in the `paper-generation` environment, an SSRN ID/slug, an authorized public PDF URL and confirmed cloud-analysis rights. It requests `gpt-6.1-sol` / `ultra` without fallback, validates the generated patch without model credentials and opens a draft PR. It does not merge, publish PDFs, activate ads or post socially. A billable generation run has not been exercised during initial setup. See the [design skill](../.agents/skills/design-ssrn-paper/SKILL.md) and workflow for source-intake and review safeguards.

## Rollback

A failed validation must not replace production. Retain the previous Pages release and use **Pages → Deployments → Rollback** when available, then revert the responsible source change through Git. Do not rewrite public history or delete older deployments. The first release has no earlier website release to restore.

Collector configuration backups are listed in the [analytics runbook](visitor-analytics.md). Preserve its database, credentials, existing origins and registrations during any rollback.
