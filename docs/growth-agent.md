# Daily growth agent

The owner requested independent monetization work and a daily email on 2026-11-10. The agent's durable instructions are [its skill](../.agents/skills/observatory-growth-agent/SKILL.md); its public work queue is [the backlog](../content/growth/backlog.json). Actual visitor details and financial reports stay private.

## Operating settings

- Target: the existing GitHub repository and Cloudflare website.
- Approved schedule: daily at **09:00 America/New_York**, using a cloud task so the Mac is not required. Saved-task verification is pending.
- Report: the connected owner's Gmail address; one email per reporting date.
- Approved additional spending ceiling: **$10 per calendar month** for model and automation charges; prefer included access. Verify current charges and the next run's maximum cost before billable work. Unknown cost means no new billable work.
- Course scope: Interest Rate Derivatives, MBS/ABS and FRTB; VaR is excluded.
- Routine work: implement bounded improvements, verify through tests/build/CI/browser checks, complete useful distribution drafts and maintain the backlog. Merge/publish only when the required access and verification actually exist.

## Verified setup state

The skill passed its validator and an independent behavioral dry-run. The owner approved activation and the $10 monthly ceiling. The cloud task prompt is prepared in ChatGPT's Scheduled interface; saved-task verification is pending. A first status email for 2026-11-10 was sent through connected Gmail and confirmed in the owner's inbox. This verifies email delivery from setup, not a scheduled cloud run.

The $10 ceiling is an operating rule, not a provider-enforced billing limit. No additional paid integration is currently configured.

The first work item is live: source `892c0def3a1a4e8b43669c19c903cc0c4b1fd8c7`, CI run `42937071048`, immutable release https://575361ab.thepaperobservatory.pages.dev. VaR is absent from the course library; Risk explicitly recommends FRTB and Flow has no course recommendation. Validation passed 141 tests, all three builds, 23 cloud source/publication checks, the 149-file publication scan and local/live Chrome checks. The previous release remains available for rollback.

Automatic Cloudflare deployment is still off. The initial change was published from the verified CI artifact using the existing local authentication. A future scheduled cloud run cannot reuse that local authentication.

Missing integrations do not authorize copying credentials out of local storage. The cloud task needs its own approved deployment/reporting access to publish releases or read protected analytics. The connected Gmail integration can send the owner's report without supplying a Gmail credential to GitHub Actions. Social accounts and Udemy revenue-report access are not currently configured for this agent.

## Run and stop

Use **ChatGPT → Scheduled** to inspect the saved prompt, schedule and run history, choose **Run now**, or pause the task. A successful first run must show completed work and confirmed Gmail delivery; a saved schedule alone proves neither.

For local verification, ask Codex to run `$observatory-growth-agent`. For source changes, validate from the repository root:

```bash
npm test
npm run build
npm run cloud:verify
```

Reports distinguish drafts, commits, merges and live deployments. They must label missing traffic/revenue/cost data as unavailable. Publication uses the existing [cloud runbook](cloud-publishing.md), with the previous Cloudflare release retained for rollback. Pause the task before changing its operating scope or replacing its connected accounts.
