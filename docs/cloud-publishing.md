# Cloud generation and publication

The Paper Observatory targets **https://thepaperobservatory.com**, with a public GitHub repository, cloud-generated paper companions and a static Cloudflare Pages website. Cloud hosting overrides this project's earlier DigitalOcean deployment choice. The inherited Architecture Library standards still govern source ownership, privacy, reproducible builds, evidence, accessibility and verification.

## Current state

Cloud configuration and the workflows below are implemented. A read-only check on 2026-11-09 found GitHub CLI access for `tglauner`; Cloudflare Wrangler reported that no Cloudflare account was authenticated. No Cloudflare resource, custom domain or deployment was created by this work. The cloud model workflow has not been invoked with a billable API key. The requested model configuration is preserved exactly; successful account access is not assumed.

The public MVP source repository is [tglauner/thepaperobservatory.com](https://github.com/tglauner/thepaperobservatory.com). The repository excludes source PDFs unless explicit redistribution permission is established. Local originals remain intact; production links point to each paper's SSRN source page.

## Free hosting assessment — 2026-11-09

The current MVP fits **Cloudflare Pages Free**. At the MVP release, the verified public build contained 149 files totaling 3,576,389 bytes (3.41 MiB); its largest file is 259,112 bytes (0.25 MiB). All educational calculations run in the visitor's browser. There are no Pages Functions, Workers, database, storage service or runtime AI calls in the Cloudflare site. Subsequent visitor analytics integration uses the existing TGIR collector separately; see [visitor analytics](visitor-analytics.md).

Cloudflare's [Pages limits](https://developers.cloudflare.com/pages/platform/limits/) allow 20,000 files per Free site, 25 MiB per file, 500 builds per month and 100 custom domains. Its [static asset pricing](https://developers.cloudflare.com/pages/functions/pricing/#static-asset-requests) makes static requests free and unlimited. We build in GitHub Actions and upload only `dist/`; do not also enable a second automatic Cloudflare Git build pipeline.

The publication scanner enforces the free file-count and per-file size limits and rejects Functions/advanced Worker entry points. CI runs the scanner's boundary checks before building. Future features must be reassessed before adding billed services or exceeding these limits. This is an expectation under the current published plan, not a guarantee that provider terms will never change.

Website hosting is expected to cost $0/month. Domain registration/renewal and optional AI generation or Codespaces usage are separate from hosting; none are required to serve this MVP. No paid Cloudflare service is needed or enabled. Deployment stays disabled until the Cloudflare account and deployment secrets are configured below.

## Development in the cloud

Open the public repository in GitHub Codespaces. `.devcontainer/devcontainer.json` installs the locked Node dependencies with `npm ci`, forwards the library's port 5173 and supports the same commands as a local checkout:

```bash
npm start
npm run check
```

The source contains no runtime model call. Visitors use static, deterministic educational applications, without paying model inference costs per visit. Model calls occur during design, in a separate cloud job. A local preview remains available for review and troubleshooting.

## Public site builds

`.github/workflows/site.yml` runs on pull requests and pushes to `main`. It installs Node 22 dependencies without package lifecycle scripts, runs all native tests and production builds with `PAPER_PUBLIC_BUILD=true`, and runs `scripts/cloud-verify.mjs` before storing the immutable `public-site` artifact for 14 days.

The build copies `infra/cloudflare/_headers` into the public artifact. It sets conservative MIME, referrer, framing, device-permission and HTTPS headers without a Content Security Policy that would unexpectedly break configured Google ads or local font assets.

The publication check rejects private/source directories, environment files, credential/database/document files, symlinks, source maps, PDFs and assets exceeding the Cloudflare Pages per-file limit. Only `dist/` is uploaded. A rejected artifact is never deployed.

Pull requests build without Cloudflare or model credentials. There is no `pull_request_target` trigger. Every third-party action is pinned to a reviewed commit, and CLI versions are explicit.

For the owner’s first account setup and coordinated DigitalOcean analytics rollout, follow [First launch](first-launch.md). The live analytics unit was verified as `visitor-analytics.service`; older inherited service-name examples must not be used for this launch.

## Connect Cloudflare

The production project name is `thepaperobservatory`, with production branch `main`. An authorized agent can perform initial setup after account access is available:

```bash
npx --yes wrangler@4.158.0 login
npx --yes wrangler@4.158.0 whoami
npx --yes wrangler@4.158.0 pages project create thepaperobservatory --production-branch main
```

Project creation is a one-time operation. If the project already exists, inspect and reuse it rather than recreate it. The checked-in `infra/cloudflare/wrangler.jsonc` describes the same static `dist/` output for Wrangler use.

Create the GitHub `production` environment and store `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` as its secrets. Scope the API token to Cloudflare Pages editing in the intended account. Keep the token out of local command history, Git and public logs. Add the repository variable `CLOUDFLARE_DEPLOY_ENABLED=true` after setup. The deploy job remains disabled until that variable is set; once enabled, missing credentials cause a clear error.

After a successful build on `main`, a separate job downloads the verified artifact and invokes the pinned Wrangler CLI. Only that deployment step receives Cloudflare credentials. It does not check out or execute application source. Use a protected `production` environment if a human release gate is desired.

Add `thepaperobservatory.com` and any chosen `www` hostname through the Cloudflare Pages project's Custom domains settings. Domain registration/ownership, DNS and TLS must be verified before claiming the public site is live; a local folder name does not register a domain. Do not use Wrangler's temporary preview account for the production domain.

To deploy a previously verified artifact manually after authorization:

```bash
npx --yes wrangler@4.158.0 pages deploy dist --project-name thepaperobservatory --branch main
```

## Generate an initial paper website

`.github/workflows/design-paper.yml` is a trusted, manual-only workflow on `main`. It uses the repo-scoped `$design-ssrn-paper` skill and the existing shared catalog and layout. It does not allow public issue comments or fork PRs to spend model credits.

Create a GitHub `paper-generation` environment and put `OPENAI_API_KEY` in that environment's secrets. Set an environment review gate if desired. The workflow supplies the secret only to the official Codex action's protected proxy; it never exports the key as a job-level variable. Do not copy a personal ChatGPT/Codex `auth.json` into a public repository or runner.

Run **Design an SSRN paper in the cloud** in GitHub Actions, entering:

- The numeric SSRN abstract ID and a lowercase paper slug.
- A public HTTPS URL to an authorized, text-readable PDF. A SSRN landing page is not a PDF URL. If SSRN returns an access challenge, supply a permitted accessible copy; the workflow does not bypass access controls.
- Confirmation that the document may be supplied to the cloud model for analysis. This confirmation does not grant PDF republication rights.

The source helper rejects credential-bearing URLs, private/loopback IP targets, non-PDF responses, oversized input and unreadable extraction. It accepts public IPv4 DNS destinations, follows at most three validated HTTPS redirects and downloads at most 20 MiB. Download URLs are not printed or copied into the public provenance record. `poppler-utils` extracts the source into ignored `.cloud-input/`, alongside a SHA-256 and a stable job reference. Source files remain on the ephemeral runner and are excluded from uploaded artifacts and Git.

The official Codex action is pinned with **`gpt-6.1-sol` and `ultra`**, using CLI 0.167.0. Ultra is a Codex model/client option; direct API reasoning settings are not interchangeable. The account/provider must support the exact request. If it fails, the workflow stops and reports the provider error; there is no silent fallback to another model or effort. ChatGPT subscription access does not by itself configure API-key billing or entitlement.

Generation has read-only GitHub permissions, workspace-only file access and dropped sudo privileges. The model cannot publish. A trusted collector accepts changes only to the new paper, its social draft pack, the paper catalog, entrance UI and package manifests. It rejects policy, workflow, monetization configuration, other-paper changes, symlinks, PDFs and private paths.

A fresh validation job without model credentials checks and applies the patch, installs dependencies, runs the test/build commands and verifies the publication boundary. It saves a 14-day preview artifact. A third job with GitHub write permissions creates an `ai/ssrn-<id>-<run-id>` branch and a **draft** PR. A retry leaves an existing review branch unchanged. The workflow does not auto-merge, activate ads or post to social accounts. Repository Settings > Actions must allow GitHub Actions to create pull requests for the final step to succeed; otherwise the validated artifact remains available for an authorized agent to apply.

The generation job times out after 90 minutes; it does not loop or repeatedly spend model credits after an error. Retry only after inspecting the failure reason. Review mathematical identities, source references, model provenance, screenshots, learning value, course relevance and source-rights handling before merging.

## Verification and rollback

On 2026-11-09, an isolated public-checkout simulation excluded every PDF, private directory and installed dependency, then ran a fresh `npm ci --ignore-scripts`, all 127 tests, all three builds and the publication scanner successfully. The scanner accepted 146 intended static files, including nested paper assets, local fonts and Cloudflare headers. A separate HTTPS/PDF-extraction check reached the insufficient-text guard for a deliberately tiny public test PDF. This verifies the implemented path without claiming that a billable model run or owned-account Cloudflare deployment has occurred.

```bash
node scripts/cloud-source.mjs --self-test
node scripts/cloud-verify.mjs --self-test
npm run check
PAPER_PUBLIC_BUILD=true npm run build
node scripts/cloud-verify.mjs
```

After publication, verify HTTPS, the library, both paper routes, source links and browser console behavior at the real public URL. Cloudflare's deployment result and assigned URL are the authority for whether publication occurred.

A failed build never replaces the current release. Use Cloudflare Pages' rollback control to restore the prior successful production deployment, then revert the responsible source change through GitHub. Do not rewrite public Git history or delete previous production deployments as part of ordinary rollback. A failed paper-design run leaves `main` and the live website unchanged.

## Primary references

- [Cloudflare Pages CLI commands](https://developers.cloudflare.com/workers/wrangler/commands/pages/).
- [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).
- [Official Codex GitHub Action](https://learn.chatgpt.com/docs/github-action).
- [Codex non-interactive mode and API-key boundaries](https://learn.chatgpt.com/docs/non-interactive-mode).
- [Codex model and reasoning selection](https://learn.chatgpt.com/docs/models?surface=cli).
