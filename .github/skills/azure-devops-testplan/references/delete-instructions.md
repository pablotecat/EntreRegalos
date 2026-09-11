# Delete gap — Azure DevOps Test Plans/Suites/Cases

## ⚠️ Risk classification — read this first

**Deletion is the highest-risk write operation in this skill.** It is:

- **Potentially irreversible.** A deleted Test Plan/Suite/Case may not be recoverable, depending on the project's retention policy and the user's permissions.
- **Non-local in effect.** Deleting a parent can orphan children: deleting a Plan can orphan its Suites and Cases; deleting a Suite can orphan its child Suites and leave Cases dangling; deleting a Case can break references in Suites and Plans and corrupt traceability of test runs that reference it.
- **Not undo-able from the MCP.** The MCP has no `undo` / `restore` tool. Once the REST `DELETE` returns 200, the artefact is gone for practical purposes.

**Hard rule: NEVER execute a delete — REST or soft — without explicit, affirmative confirmation from the user for that specific artefact (by ID and name). Treat any ambiguous or stale confirmation as "not confirmed".**

A previous flow that said "delete plan X" earlier in the conversation does not count as confirmation now. Re-confirm every time, with the exact ID and name on the table.

## The gap

The `microsoft/azure-devops-mcp` toolset exposes **no `delete_plan`, `delete_suite`, or `delete_case` tool**. This is a verified gap, not a discovery phase issue. Do not expect it to appear by listing the MCP session's tools; if a `delete_*` ever shows up, prefer it but still apply the confirmation gate below.

Because the gap exists, the only deletion paths available are:

1. **Manual deletion via the web portal** (preferred — safe, auditable).
2. **REST API `DELETE`** outside the MCP (the truly irreversible path — only when the user explicitly insists after being warned).

`wit_work_item_*` tools do NOT delete Test Plans/Suites even though they are backed by work items. Do not improvise deletion with `wit_work_item_*`; the structural entity in the Test Plans UI can survive the work-item deletion and create silent orphans.

## Mandatory workflow before any delete

Always, in order:

1. **Identify the exact target.** Resolve and display: `organization`, `project`, and the `id` AND the `name` of the artefact to delete. For a Suite, also the parent `plan_id`. For a Case, also the parent `suite_id`. If any ID is missing, run `testplan`'s `list_plans` / `list_suites` / `list_cases` first — do not guess.

2. **Surface the orphan risk specific to the entity** (see table below) and explicitly tell the user what gets orphaned or broken.

3. **Present the decision as binary and explicit.** Show the user:

   ```
   About to DELETE (permanent, irreversible):
     entity   : <Test Plan | Test Suite | Test Case>
     name     : <name>
     id       : <id>
     project  : <project>
     orphans  : <what this will break — see table>
   Options (pick one):
     A) Cancel — do nothing.
     B) Manual via web portal — open this link and use the "..." → Delete menu:
        <portal URL>
     C) REST DELETE outside the MCP — irreversible; I will run az devops invoke with your token.
   ```

   Do not default to any option. Do not execute C until the user replies with a clear choice AND repeats or confirms the exact ID.

4. **Execute the chosen path.** Only on explicit confirmation. For path C, show the exact `az devops invoke` command (or HTTP request) you will run before running it, so the user can sanity-check the endpoint and ID one last time.

5. **Report.** State which path was taken, whether the artefact is deleted, and any orphaned children that the user should clean up manually. Include the portal URL of the parent so the user can verify.

## Entity-specific data

### Test Plan

- **Required IDs:** `project`, `id` of the plan.
- **REST DELETE:** `DELETE https://dev.azure.com/{org}/{project}/_apis/test/plans/{id}?api-version=7.1`.
- **Orphan risk:** all suites and Test Cases under the plan; the Test Plans UI may show broken references; every run that referenced the plan is affected.
- **Portal link (path B):** `https://dev.azure.com/{org}/{project}/_testPlans?planId={id}` → menu `... → Delete`.
- **`wit_*` rule:** never use `wit_work_item_*` to delete a plan — the structural entity in the Test Plans UI survives the work-item deletion and creates silent orphans.

### Test Suite

- **Required IDs:** `project`, `plan_id`, `suite_id`. Resolve all three before presenting the decision to the user.
- **REST DELETE:** `DELETE https://dev.azure.com/{org}/{project}/_apis/test/Plans/{plan_id}/suites/{suite_id}?api-version=7.1`.
- **Orphan risk:** child suites become orphans; Test Cases stay as work items but dangle between parent suites; runs that targeted the suite are affected.
- **Portal link (path B):** `https://dev.azure.com/{org}/{project}/_testPlans?planId={plan_id}` → enter the plan → select the suite → menu `... → Delete`.
- **`wit_*` rule:** never use `wit_work_item_*` to delete a suite — the structural entity in the Test Plans UI can survive the work-item deletion and creates silent orphans.

### Test Case

- **Required IDs:** `project` + `id` of the Test Case work item (and, for context to show the user, the parent `plan_id` and `suite_id` where it lives).
- **REST DELETE:** `DELETE https://dev.azure.com/{organization}/{project}/_apis/test/testcases/{testCaseId}?api-version=7.1`.
- **Orphan risk:** breaks references in every suite/plan that contains it; test runs that recorded results against this TC keep a dangling pointer; coverage reports may corrupt.
- **Portal link (path B):** open the TC from the plan/suite → menu `... → Delete`.
- **`wit_*` rule:** never use `wit_work_item_*` to "delete" without going through the confirmation gate — the TC may still be referenced in suites and create orphans.

> `api-version` is illustrative; pin the value the user's org supports at the time of the call. Do not use `api-version=preview` unless the user explicitly asks.

## Execution notes for path C (REST DELETE)

> **Exception to the 'no CLI' rule.** The skill's general guidance says it does not compose `az` CLI commands — everything goes through MCP. However, the MCP toolset has no `delete` tool for Test Plans, Suites, or Cases (verified gap). When the user has been warned about the cost and the irreversibility of deletion, has explicitly chosen path C, and the `az devops` CLI is available and authenticated, invoking `az devops invoke` with a `DELETE` is the documented exception. It is invoked at the explicit user request after the gap has been surfaced, not as a routine operation, and it operates outside the MCP channel. The general 'no CLI' rule still applies to every other operation in this skill.

- Do NOT invent the HTTP path. Take it from the entity data above, substituting the resolved IDs.
- Use `az devops invoke` (preferred, uses the user's existing auth) or, if the user provides an authenticated HTTP client, that client. Do not craft raw `curl` with a manually pasted PAT — PATs must never transit through the agent. If the user has no `az devops` configured and no authenticated client, refuse path C and offer path B (portal).
- Remember the Windows `cmd.exe` 8191-char limit if composing a long `az devops invoke` command: run it via PowerShell or the integrated terminal, not `cmd.exe`.
- After the `DELETE` returns, list the children (suites of the deleted plan, cases of the deleted suite) to confirm what remains and surface orphans explicitly to the user.

## What not to do

- Do not delete based on a summary confirmation ("delete the obsolete stuff") — always per-ID and per-name.
- Do not use `wit_work_item_*` to delete plans or suites — they survive as structural entities in the Test Plans UI and create silent orphans.
- Do not assume the user's earlier confirmation carries over to a different artefact or a later turn. Re-confirm.
- Do not offer "automatic" or "bulk" REST deletion paths — each delete is a separate confirmation.
- Do not run `DELETE` with `destroy=true` (the `wit` work-items endpoint) unless the user requests it and shows they understand it bypasses the recycle bin.
- Do not present setting `State=Closed` as a delete — it is not a delete. If the user asks about it, answer factually but do not route it through this flow.
