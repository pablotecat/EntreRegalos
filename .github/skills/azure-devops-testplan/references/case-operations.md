# Test Case operations

Detail of each CRUD operation on Test Cases. Assumes `SKILL.md` (universal steps + branch table) and `toolset.md` (general tool mapping) have been read.

## list cases

- **Tool:** `testplan` / `list_cases`.
- **Args:** `project`, `plan_id`, optional `suite_id`.
- **Return:** array of Test Cases with `id`, `name` (title), and reference to the parent suite.
- **Typical use:** "what cases does plan X have" or "what cases are in suite Y of plan Z".

## create case

- **Tool:** `testplan_test_case_write` / `create`.
- **Minimum args:** `project`, `title`. Optional and project-dependent: `areaPath`, `iterationPath`, `priority`, `description`, and any custom fields the project's process defines.
- **Confirmation required:** yes (creates a persistent artefact).
- **Limitation:** the `create` tool creates the Test Case work item with a title and fields but **without structured steps**. To include steps, run `update_steps` afterwards. Each step is a discrete record with an `action` and an `expectedResult`, rendered as a numbered checklist by the Test Plans UI.
- **To add it to a suite:** after creating, run `testplan_test_suite_write / add_test_cases` (see `suite-operations.md`).
- **Field names are project-specific** — discover them via "Field discovery" below before creating or updating.

## Field discovery (before creating or updating cases)

Azure DevOps allows custom fields per process and project. Do not assume hardcoded field names. Before creating or updating Test Cases:

1. Call `wit_work_item` with action `get_type`, passing `project` and `workItemType: "Test Case"`. The response includes the field list for that work item type (system and custom fields).
2. From the returned field list, identify the fields the project expects (title, area path, iteration path, priority, custom fields, etc.).
3. Ask the user for the values of any non-default fields the project expects (area path, iteration path, priority, custom fields, etc.). Do not assume default values without confirming with the user.

This rule is universal across Azure DevOps: work item types and states vary per project. Do not assume hardcoded type or state names.

## get (one specific case)

- **Tool:** `wit_work_item` / `get` (a Test Case is a work item).
- **Args:** `id` (work item id of the TC).
- **Return:** fields of the work item including title, area, state, description — but structured steps may come serialised in a special field; check the field corresponding to the `Test Case` type in the project.

## update steps

- **Tool:** `testplan_test_case_write` / `update_steps`.
- **Args:** `project`, `test_case_id`, `steps[]`.
- **Structure of `steps[]`:** follows the format expected by the Test Management REST API — an array of steps, each with `action` (what is done) and `expectedResult` (what is expected). The Test Plans UI renders these as a numbered checklist that can be passed/failed individually during a test run.
- **Source format is not assumed to be Gherkin.** Sources may be a structured markdown document, an Excel/CSV file, or another Azure DevOps Test Plan. If the source uses Given/When/Then (or any other prefix convention), preserve the prefix as part of the `action` text — e.g. `**Given** the user accesses...` — but do not require it. Plain numbered steps ("1. Log in. 2. Open the dashboard.") are equally valid; map each to a separate `action`, and set `expectedResult` from the expected outcome of that step if the source provides one. See "Operation: import test cases from external sources" below for the full mapping guidance.

## update other fields

- **Tool:** `wit_work_item_write` / `update`.
- **Args:** `id`, `fields` (title, area, priority, etc.).
- **Confirmation required:** yes.
- **Do not use this tool for steps** — `update_steps` is the correct path to preserve the structured step format (one `action`/`expectedResult` pair per step). Using `wit_work_item_write / update` with text in `Description`/`ReproSteps` dumps all steps as a single text blob and loses the per-step structure (the same problem `az boards work-item create` with `--type "Test Case"` has).

## delete

To delete a Test Case, load and follow `references/delete-instructions.md`. The toolset exposes no `delete_case` tool, and deletion is the highest-risk write operation in this skill.

---

## Operation: import test cases from external sources

This is the "high-level" operation that supports the main use case: uploading externally-defined test cases into an existing Test Plan. It is not a consumer agent or a technical hook — the user decides when to invoke it from chat.

### Supported sources

- **Structured markdown document** — each test case block contains a test ID, a status, and numbered steps with expected results. Steps may or may not use a Given/When/Then convention; plain numbered steps are equally valid.
- **Excel or CSV file** — rows represent test cases; columns map to test case fields. The agent must inspect the headers, infer the mapping (title, steps, expected result, area, iteration, etc.), and confirm it with the user before creating anything.
- **Another Azure DevOps Test Plan** — read the source plan's suites and cases (via `testplan / list_cases` or `wit_work_item / get`), then recreate them in the target plan/suite.

### Prerequisites

- The target IDs already resolved with the user: `project`, `plan_id`, `suite_id` (the target suite must exist — if not, create it first with `suite-operations.md / create`).
- For each TC: the project-specific fields discovered via Field discovery above (area path, iteration path, custom fields, etc.). Do not assume default values without confirming with the user.

### Operation steps

1. **Parse or read the source**. For each Test Case, extract:
   - A test identifier (if present) — use it as a prefix of the TC `title` in ADO (e.g. `[TEST-registration_001a] Human title of the TC`) to preserve traceability when the user has no cross-link tooling.
   - A status, if present (Ready / Provisional / Blocked) — if not `Ready`, **pause and inform the user**; provisional TCs can be imported but it is recommended to resolve them first. Ask for explicit confirmation before proceeding.
   - Original ID, covered acceptance criteria, suite/area (if present) — put them in the `description` of the TC or in a custom field according to the project's process.
   - Prerequisites (if present) — concatenate them as a preface of the `action` of the first step (a "Preconditions" step) or as the `description` of the TC.
   - Numbered steps (list 1..N) — each step becomes an element of `steps[]`. Steps may or may not use a Given/When/Then (Gherkin) convention; plain numbered steps are equally valid.
     - `action` = the step text. If the source uses a prefix convention (Given/When/Then, or any other), preserve it as part of the text — e.g. `**Given** the user accesses...` — but do not require or assume a specific convention.
     - `expectedResult` = the expected outcome of that step if the source provides one. If the source folds the expected result into the last step (e.g. a final `Then` step with a "nuclear expected result"), put it in the `expectedResult` of that step; do not duplicate it in the `action`.
     - Steps marked as provisional/undefined: the `action` must contain the marker and the reason; the `expectedResult` remains empty or with the "provisional written action" from the source.
   - For Excel/CSV sources: map columns to fields based on the header inspection and the user-confirmed mapping.
   - For another Test Plan source: read each TC via `wit_work_item / get` and extract its fields and steps.

2. **Confirm the import plan with the user** before creating anything: number of TCs to create, how many are provisional (if any), target suite. Ask for explicit confirmation (reuse the pattern of universal step 3 of the `SKILL.md`).

3. **Create each Test Case:**
   - For each parsed TC, call `testplan_test_case_write / create` with `project`, `title` (with test ID prefix if available), and the project-specific fields discovered earlier.
   - Collect the `id` returned by each call.

4. **Update the steps** of each created TC:
   - Call `testplan_test_case_write / update_steps` with the `test_case_id` and the `steps[]` mapped in step 1.
   - If `steps[]` is empty (TC without steps, anomaly), inform the user and skip that TC.

5. **Associate the TCs with the target suite:**
   - Collect all the `test_case_id` created in step 3.
   - Call `testplan_test_suite_write / add_test_cases` with `project`, `plan_id`, `suite_id`, `test_case_ids[]`.

6. **Report to the user:**
   - N TCs created (with work item IDs).
   - N provisional TCs (if any — list with IDs and reasons to resolve later).
   - Target suite with the total associated TCs.
   - Portal link: `https://dev.azure.com/{org}/{project}/_testPlans?planId={plan_id}`.

### Errors and continuation

- If `update_steps` fails for a specific TC, **do NOT abort everything**: the TC already exists as a work item. Report to the user which TCs were left without steps, continue with the rest, and leave a list of IDs for manual review.
- If `add_test_cases` fails for a fraction of IDs, retry only with the IDs that failed; the ones that were associated remain valid.
- If the source does not follow any of the supported formats (no parseable structure, no recognisable columns, no readable Test Plan), **stop and inform the user** — do not improvise parsing over unknown formats.
