---
name: azure-devops-testplan
description: "Plain Concepts Quality: create, list, get, update, or import Test Plans, Test Suites, and Test Cases in Azure DevOps via the official Azure DevOps MCP server. Use when managing test artefacts in ADO Test Plans, importing test cases from markdown, Excel/CSV, or another Test Plan, or syncing generated test cases into a test suite. Requires the local Azure DevOps MCP server (stdio) configured and connected."
metadata:
  plugin: pc-quality
  author: "Pablo Otero Catrufo"
---

# Azure DevOps Test Management

CRUD over Azure DevOps Test Plans, Test Suites, and Test Cases through the official `microsoft/azure-devops-mcp` server (local stdio mode). The skill is standalone and usable on-demand; it is not tied to any specific QA pipeline or workflow.

## When to use

- The user asks to create, list, get, or update Test Plans, Test Suites, or Test Cases in Azure DevOps.
- The user wants to import test cases from an external source: a structured markdown document, an Excel/CSV file, or another Azure DevOps Test Plan.
- The user needs to update test case steps while preserving the structured step format (one action/expected-result pair per step, rendered as a pass/fail checklist by the Test Plans UI).
- The user asks to create a Test Suite and add existing Test Cases to it.
- The user asks to sync generated or external test cases into a target Test Suite.

## When not to use

- Managing Azure DevOps boards, work items, iterations, or area paths — out of scope.
- Committing, pushing, branching, or managing pull requests in Azure DevOps repos — out of scope.
- Writing or updating a PR description or linking work items to a PR — out of scope.
- General code-quality review or static analysis — out of scope.

## Prerequisites

Before any operation, verify the Azure DevOps MCP server is connected and responding. Call `mcp_ado_core_list_projects` — the canonical read-only tool of the `core` domain that lists all projects in the configured organization (takes no `project` argument).

- **If it returns the organization's project list**, the MCP is connected; proceed with the Workflow below.
- **If it returns no projects, an error, a tool-not-found message, or any connectivity failure — stop here.** Inform the user that the ADO MCP server is not connected or authenticated, and that the skill cannot run until it is. Do NOT attempt to connect or configure the MCP in this turn — the user will connect it however they prefer. End the turn after informing; the workflow resumes on the user's next message once they confirm the MCP is connected.

The tool name exposed in the current session may differ by client and server version (typical prefix `mcp_ado_*` on the local stdio server). Before invoking, list the tools of the ADO MCP server available in the session and map `mcp_ado_core_list_projects` to the concrete function call you see.

## Workflow

### Step 1: Resolve context

Before any operation, identify and confirm with the user: `organization` (the one configured in your MCP client config), `project` (Azure DevOps project name or ID), and the IDs required by the operation:

| Operation target | Required IDs |
|---|---|
| Test Plan | `project` |
| Test Suite | `project` + `plan_id` (if unknown, run `testplan` / `list_plans` first) |
| Test Case | `project` + `plan_id` + `suite_id` (if unknown, list first) — or `case_id` for get/update |

### Step 2: Discover project-specific fields (before creating or updating cases)

Before creating or updating Test Cases, run the Field discovery flow in `references/case-operations.md`. Concretely: call `wit_work_item` with action `get_type` (passing `project` and `workItemType: "Test Case"`) to retrieve the list of fields available on that work item type. Azure DevOps allows custom fields per process and project, so hardcoded field names cannot be assumed.

### Step 3: Confirm before writing

For operations that create, update, or delete persistent artefacts (create, update, delete, add-cases, import), show the user a plain summary of ALL the changes and actions that will happen and ask for explicit confirmation at once before executing. Read-only operations (list, get) do not require confirmation.

### Step 4: Execute the operation

Invoke the MCP tool(s) according to the entity reference. Consult the matching reference to avoid improvising arguments:

| Entity | Reference |
|---|---|
| Test Plan | `references/plan-operations.md` |
| Test Suite | `references/suite-operations.md` |
| Test Case | `references/case-operations.md` (includes the import operation) |

For the exact tool names and arguments for each operation, consult `references/toolset.md` (which maps to `docs/TOOLSET.md` of the upstream `microsoft/azure-devops-mcp` repository). Tool names in the toolset reference are copied **literal** from `TOOLSET.md`. The local server registers tools with the `mcp_ado_*` prefix (e.g. `mcp_ado_testplan`, `mcp_ado_wit_work_item`); the exact prefix in the session depends on the client and server version, so before invoking, list the tools exposed by the ADO MCP server in the current session and map each reference name to the concrete function call you see.

### Step 5: Report the result

Return a concise summary: created/modified/deleted IDs, links to the Azure DevOps portal when applicable (`https://dev.azure.com/{org}/{project}/_testPlans`), and any warnings or gaps encountered.

## References

| Reference | When to load it |
|---|---|
| `references/toolset.md` | When you need the exact tool names and args for the test-plans domain. Single source — do not duplicate in other references. |
| `references/plan-operations.md` | CRUD operations on Test Plan. |
| `references/suite-operations.md` | CRUD operations on Test Suite. |
| `references/case-operations.md` | CRUD operations on Test Case, including the "import from external sources" operation. |
| `references/delete-instructions.md` | Deletion of Plans/Suites/Cases (verified MCP gap). Loads ALWAYS before executing or suggesting REST DELETE on any of the three entities. |

## Validation

- [ ] The context (organization, project, and the relevant IDs) is confirmed with the user.
- [ ] For write operations, a summary was shown and explicit confirmation was obtained.
- [ ] For case create/update, project-specific fields were discovered before invoking the tool (no hardcoded field names assumed).
- [ ] The MCP tool(s) executed correctly without routing or argument errors.
- [ ] The result was reported to the user with IDs and, where applicable, a portal link.
- [ ] If the requested operation is not supported by the toolset (e.g. `delete`/`remove` gaps), the user was informed of the limitation and offered the alternative documented in the reference.
- [ ] For ALL delete operations (Plan, Suite, Case), `references/delete-instructions.md` was loaded and its workflow followed end to end.

## Common pitfalls

| Pitfall | Fix |
|---|---|
| Updating test case steps via `wit_work_item_write / update` | Use `testplan_test_case_write / update_steps` to preserve the per-step structure — see `references/case-operations.md` (update other fields) for why `wit_work_item_write / update` on `Description`/`ReproSteps` fails. |
| Assuming hardcoded field names without discovery | Azure DevOps allows custom fields per process/project. Always list work item types and fields before creating or updating Test Cases. |
| Importing test cases with non-Ready status | If a source test case has a provisional or blocked status, pause and inform the user before importing. Resolve or explicitly confirm before proceeding. |
| Using `wit_work_item_*` to delete plans/suites/cases | The toolset has no delete tool for these entities — follow `references/delete-instructions.md` for the confirmed gap and the safe deletion paths. |
| Composing long CLI commands on Windows | This skill does not compose `az` CLI commands — everything goes through MCP. The local `npx @azure-devops/mcp` server has no `az` CLI surface; if you ever compose a long shell command, remember the `cmd.exe` 8191-char limit (use PowerShell, not `cmd`). |
