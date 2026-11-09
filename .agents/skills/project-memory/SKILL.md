---
name: project-memory
description: Read, update, or compact root MEMORY.md so verified project decisions, commands, constraints, and open follow-ups survive independent chats. Use for explicit project-memory work or durable context updates after an authorized task.
---

# Project Memory

Example invocations: `$project-memory record the verified setup commands` and
`$project-memory compact this project's memory`.

Read applicable `AGENTS.md` and root `MEMORY.md` first. Shared agent rules belong
in `AGENTS.md`; memory records project facts and decisions and cannot override
those rules. Use the request to choose the scope:

- **Read:** Summarize the relevant current context without editing files.
- **Update:** Add or correct durable facts established by the user or verified
  during authorized work. Create a missing root `MEMORY.md` when a write is requested.
- **Compact:** Merge duplicates, remove superseded facts, and shorten repetition
  while preserving decisions, rationale, operating constraints, and unresolved work.

## What to retain

Keep the shortest useful record of architecture choices, entity/deployment
boundaries, exact recurring commands with their working directories, required
environment names without values, stable file locations, known recurring pitfalls,
and open follow-ups. Distinguish implemented facts from planned work. Include a
date or source pointer when it helps assess a changing fact; do not add a session
diary or repeat information already clear in a linked canonical document.

Check proposed notes against relevant source files, manifests, documented commands,
test results, and explicit user decisions. Do not promote assumptions, stale
starter examples, untested commands, or failed checks into established facts.
Resolve conflicts using current evidence and record uncertainty when evidence is
insufficient. Keep explicit user decisions even if implementation is still pending,
clearly marking their state.

## Edit and verify

Preserve a useful existing structure. For new memory, use brief sections for
constraints, decisions, commands, and open follow-ups only as needed. Use focused
edits, re-read the result, and inspect the diff for accidental loss. During
compression, remove a resolved follow-up only after verifying its resolution or
its transfer to the project's maintained tracker or canonical documentation.

Never store secrets, credential values, private exports, raw logs, or transient
debugging chatter. Do not read unrelated private files to enrich memory. Do not
rewrite `AGENTS.md`, application code, other repositories, or global memory as a
side effect of this skill.

Report what was added, corrected, or compressed, and any unresolved factual
conflict. For a read-only request, report the requested context only. A memory
edit needs a content/diff check; do not run application builds or tests solely
because prose in `MEMORY.md` changed.
