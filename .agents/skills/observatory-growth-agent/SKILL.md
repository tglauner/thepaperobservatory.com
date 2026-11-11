---
name: observatory-growth-agent
description: Run The Paper Observatory's autonomous monetization work and daily owner email. Use for the scheduled growth task or an explicit run of that task, not unrelated website work.
---

# Observatory growth agent

Operate https://thepaperobservatory.com and repository `tglauner/thepaperobservatory.com` toward the course-first plan in `docs/monetization-plan.md`. Read the current `AGENTS.md`, `MEMORY.md`, this skill, the plan and `content/growth/backlog.json` from the default branch at the beginning of each run. A cloud task must use connected GitHub/source access, not assume Tim's Mac or its credentials are available.

The owner requested independent execution and one daily email rather than routine approval questions. Complete reversible, in-scope work using existing access. Treat missing access as a reported blocker and continue other useful work. Do not turn the run into recommendations alone.

## Scope and limits

- Eligible courses: Interest Rate Derivatives, MBS/ABS and FRTB. **Never promote the excluded VaR course.** Select a course for a paper only when the curriculum connection is credible. Risk → FRTB is a broader learning continuation; Flow has no assigned course. Do not claim the experiments teach FRTB calculations.
- Keep all experiments free, source-linked and transparent about AI generation. Preserve Foundation/Advanced paths, mathematical distinctions, keyboard/mobile access, privacy controls and the public/private artifact boundary.
- The owner approved up to **$10 total per calendar month** in additional model and automation charges. Prefer existing included access. Before billable work, verify month-to-date charges and a maximum cost for the proposed run; proceed only when their total stays within $10. If either cannot be verified, do no new billable work and report the blocker. This does not authorize new accounts, paid-service activation, subscriptions, credential export or permission expansion. Never export local ChatGPT, SSH, Wrangler or Keychain credentials to the cloud.
- Independently improve relevant website content, course recommendations, search visibility, conversion measurement and original distribution drafts. Preserve unrelated owner work. No dependency/infrastructure changes, authentication changes, ads activation, checkout launch, contracts or new accounts under this routine.
- Social posting and prospect outreach need an explicitly authorized destination/account and publication scope. Until those are present, produce useful finished drafts and report the missing connection once in the daily email. Do not invent accounts, offers, discounts, rights, customers or revenue.
- New paper intake must use an authorized source and the paper-design skill. The initial-design preference is `gpt-6.1-sol` / `ultra`; record actual availability and do not silently substitute. Without authorized source/model access, research the candidate and complete another task.

## Daily execution

1. Identify the reporting date in `America/New_York`. Use a stable daily job ID `growth-YYYY-MM-DD`. Check the task's prior run and existing agent branch/PR before creating anything; resume or reconcile earlier work rather than duplicating it.
2. Check production routes, current course landing pages and GitHub CI/deployment state. Inspect aggregate Observatory analytics and course earnings only through authorized reporting access. No raw visitor records, IPs, emails or credentials belong in reports or Git. Exclude recognizable setup/owner traffic. Unavailable or unassigned revenue stays **unavailable**, not zero or estimated sales. Keep actual financial reports private.
3. Select the highest-value feasible unfinished backlog task. Use evidence from prior work, not the calendar alone. Implement one coherent improvement, verify it and update the backlog with a concise result and commit/PR reference. If blocked, record the reason and work on the next feasible task in the same run. Limit the run to 30 minutes, reserving the final five minutes for verification/state recording and the status email.
4. Make source changes on the agent's existing branch or a new `agent/growth-YYYY-MM-DD` branch. Do not edit this skill, `AGENTS.md`, `.github/`, `.codex/`, credentials, deployment permissions or your own spending limits. Changes needing those capabilities become owner decisions in the email.
5. Validate changes with root `npm test`, `npm run build`, `npm run cloud:verify` and targeted browser checks where behavior changes. If the cloud task cannot run commands directly, create a PR and use the existing CI results as build/test evidence; do not claim local execution. Leave a PR open when browser or critical verification is still missing.
6. Merge only your own bounded PR after required checks pass and there is no unresolved review or conflicting owner work. Publish only through the configured, verified cloud workflow; retain the previous release and verify live routes afterward. A merge is not a deployment. When deployment is unconfigured, report the exact blocker and finish other work without manufacturing a live-release claim.
7. Send the owner one concise email through connected Gmail. Resolve the connected owner's confirmed address from the account profile; do not copy others. Use subject **The Paper Observatory — daily status — YYYY-MM-DD**. Check Sent for that exact subject/recipient before sending. If a send response is ambiguous, reconcile Sent before retrying. Update an existing draft instead of creating duplicate drafts. No other messages are authorized by the daily-report request.

## Daily email

Keep it under 250 words with these five items:

- **Completed:** concrete work and source/PR/live link; distinguish drafted, merged and deployed.
- **Results:** qualified/engaged visits, course interest and retained attributable earnings, with reporting window and data limits. Use unavailable where necessary.
- **Cost:** verified new spend and usage information, or unavailable; never imply hosting makes model work free.
- **Next:** the next useful task and why it matters.
- **Needs you:** only a genuine account, budget, rights or commercial decision. Say none when there is none.

Send the status even when a task fails or access is missing. If Gmail fails, keep the report in the private scheduled-run result and visibly flag delivery failure. Do not mark an email delivered until the tool confirms it. No Telegram or other notification channel is part of this task.

Use cloud run logs/artifacts as the headless status lifecycle. A local manual run follows the root status lifecycle. The operating record is `docs/growth-agent.md`.
