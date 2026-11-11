# Daily growth agent

The owner requested independent monetization work and a daily email on 2026-11-10. The agent's durable instructions are [its skill](../.agents/skills/observatory-growth-agent/SKILL.md); its public work queue is [the backlog](../content/growth/backlog.json). Actual visitor details and financial reports stay private.

## Operating settings

- Target: the existing GitHub repository and Cloudflare website.
- Proposed schedule: daily at **09:00 America/New_York**, using a cloud task so the Mac is not required.
- Report: the connected owner's Gmail address; one email per reporting date.
- Initial additional spending limit: **$0**, pending any explicit owner change.
- Course scope: Interest Rate Derivatives, MBS/ABS and FRTB; VaR is excluded.
- Routine work: implement bounded improvements, verify through tests/build/CI/browser checks, complete useful distribution drafts and maintain the backlog. Merge/publish only when the required access and verification actually exist.

## Verified setup state

The instructions and queue are prepared. Scheduling and the first delivered report must be verified before calling the agent active. The current GitHub validation workflow works; automatic Cloudflare deployment is still off. Cloud scheduling is available in the account's web interface; its execution has not yet been verified.

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
