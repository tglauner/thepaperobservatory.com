# First launch: Cloudflare website and DigitalOcean analytics

## Authorization and scope

Tim requested one coordinated deployment of the static website to Cloudflare and the existing visitor collector/dashboard changes to DigitalOcean. That authorization includes the required service restart and domain wiring once account access and ownership are available; do not ask again merely because this spans a later turn. Account creation, email verification, domain purchase and registrar authentication remain owner actions. No paid hosting or additional backend is needed. Domain registration/renewal is a separate owner expense.

The website stays on Cloudflare Pages Free. The existing TGIR collector and dashboard stay on the current DigitalOcean droplet. Do not move the collector to Cloudflare, create a Worker/database, or point `tglauner.com` at the new website.

## Deployment progress — 2026-11-10

Account registration, domain purchase, deployment OAuth and initial Pages publishing are complete. DigitalOcean analytics has been configured and verified. The apex domain is Active with SSL enabled; browser interactions and production visitor collection passed. Some resolvers may retain old negative DNS entries while initial registration propagates. The setup steps below remain as reference, rather than new requests for owner action.

## Owner steps

1. Open https://dash.cloudflare.com/sign-up, create an account and verify the email address.
2. Confirm ownership of `thepaperobservatory.com` and which registrar manages it. The deployment preflight returned DNS NXDOMAIN, which does not establish registration/availability. If not owned, purchase it through the owner’s chosen registrar; alternatively launch first on the free assigned `pages.dev` hostname.
3. For the final root domain, use Cloudflare’s domain onboarding to add `thepaperobservatory.com` on the Free plan. Adding the domain to DNS is separate from creating a Pages project. Preserve existing email and verification DNS records if any exist. Do not add or move `tglauner.com`.
4. Cloudflare supplies two authoritative nameservers. At the domain registrar, replace this domain’s nameservers with those exact values. Let the agent know the registrar if help with its controls is needed. If DNSSEC is enabled, follow the registrar/Cloudflare migration procedure before changing delegation.
5. In a Mac Terminal, authorize the deployment CLI:

   ```bash
   npx --yes wrangler@4.158.0 login
   ```

   Approve the browser request for the new Cloudflare account. Do not paste passwords, API tokens or OAuth callback URLs into chat. Then check:

   ```bash
   npx --yes wrangler@4.158.0 whoami
   ```

6. Tell the agent that login is complete and identify the registrar. The agent handles release creation, the analytics changes, Pages/custom-domain setup where account permissions permit, and verification. DNS/TLS activation can take additional provider propagation time.

A manually managed initial Pages upload uses Wrangler OAuth. Future unattended GitHub deployments additionally need a scoped Cloudflare Pages API token and account ID stored directly as GitHub `production` environment secrets; never send the token through chat. Keep `CLOUDFLARE_DEPLOY_ENABLED` unset until those secrets are configured. The initial release does not depend on unattended deployment setup.

## Prepared release

- Website source: `9d6bede3c11b4f54231c6fe633456c9830e322c3`.
- Successful cloud build: https://github.com/tglauner/thepaperobservatory.com/actions/runs/42747011869.
- Immutable `public-site` artifact was downloaded into ignored `.cloud-output/launch-9d6bede/dist/` and passed the public-file scanner (149 static files). Re-download if the local directory is absent; never publish the workspace root.
- The analytics repository has a manual `paper-observatory` widget prepared locally. Merge only that widget into the current production directory; preserve every existing manual and discovered registration.
- SSH access to the existing droplet is available. Read-only preflight found the live collector healthy and its source modules identical to the checked local source.
- **Live unit is `visitor-analytics.service`.** `visitor-collector.service` and `collector.service` are failed legacy units. The old generic deployment script targets the wrong unit; do not invoke it for this launch.
- The live collector’s existing nonsecret allowed-origin value is `tglauner.com,localhost,127.0.0.1,course-xva-essentials.tglauner.com`. Re-read the effective value immediately before changing it and append the new domain; never replace it with a guessed list.
- The existing protected administrator configuration at `/etc/visitor-collector-admin.env` must be attached to the correct live unit as part of this rollout. Verify anonymous reporting requests return 401. Do not read, print, regenerate or commit those existing credentials.

## Agent rollout procedure

1. Verify `wrangler whoami`, the intended account and domain ownership. Reuse a project if it already exists; otherwise create `thepaperobservatory` with production branch `main` using the pinned Wrangler CLI. Record the actual assigned `pages.dev` hostname; it may differ if the name is taken.
2. Verify the artifact belongs to the source commit and scan it again:

   ```bash
   gh run download 42747011869 --repo tglauner/thepaperobservatory.com --name public-site --dir .cloud-output/launch-9d6bede/dist
   node scripts/cloud-verify.mjs .cloud-output/launch-9d6bede/dist
   ```

   Reuse the already-downloaded directory instead of downloading over it. Build changes require a fresh passing CI artifact.
3. Take a private backup of the production widget JSON and any launch-specific unit drop-in/origin configuration before editing. Leave the analytics database, `.env`, admin credential file, existing service definition and Apache configuration intact.
4. Merge the single manual widget. Add the new domain to the effective origin list in a dedicated late-loaded environment file, preserving every current domain. If the release initially uses `pages.dev`, allow only the actual assigned project hostname, never the whole `pages.dev` domain.
5. Add a drop-in for **`visitor-analytics.service`** loading the existing protected admin environment and the dedicated origin environment. Keep the admin credentials on the server. Run `systemctl daemon-reload` and `systemctl restart visitor-analytics.service`; verify loopback `/healthz` and anonymous `/api/sites` returning 401. Roll back the changed files and restart the same unit if validation fails. No Apache reload is needed for these collector-only changes.
6. Verify allowed CORS without recording a visit:

   ```bash
   curl -i -X OPTIONS https://tglauner.com/collect \
     -H 'Origin: https://thepaperobservatory.com' \
     -H 'Access-Control-Request-Method: POST' \
     -H 'Access-Control-Request-Headers: content-type'
   ```

   Require HTTP 200 and the matching allowed-origin header. Recheck current TGIR and course origin preflights for regressions.
7. Upload the verified website:

   ```bash
   npx --yes wrangler@4.158.0 pages deploy .cloud-output/launch-9d6bede/dist --project-name thepaperobservatory --branch main --commit-hash 9d6bede3c11b4f54231c6fe633456c9830e322c3
   ```

8. Add the apex custom domain to that Pages project and wait for active DNS and HTTPS. Add `www` only if desired and configured. Test the library, both paper routes, supporting pages, source links and actual interactions. Confirm tracker loading and successful collection through a genuine browser visit; identify the verification traffic instead of claiming it is organic traffic.
9. Verify the authenticated dashboard includes The Paper Observatory. Record the deployment ID/URL, source commit, service unit, verification results and backup reference in project memory without credentials or visitor data.

## Rollback

Restore only the backed-up widget/origin/drop-in files and restart `visitor-analytics.service` if collector validation fails. Preserve all visitor data and existing sites. For an established Pages project, retain the previous production release and use Pages rollback if the new release fails. For a first release there is no previous website release; report that limit rather than inventing a rollback target. A failed or incomplete DNS/TLS setup is not a successful custom-domain launch.

## Official setup references

- https://developers.cloudflare.com/fundamentals/account/create-account/
- https://developers.cloudflare.com/fundamentals/manage-domains/add-site/
- https://developers.cloudflare.com/workers/wrangler/commands/general/#login
- https://developers.cloudflare.com/pages/get-started/direct-upload/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
