# Test Suite operations

Detail of each CRUD operation on Test Suites. Assumes `SKILL.md` (universal steps + branch table) and `toolset.md` (general tool mapping) have been read.

## Required context

Every operation on suites requires `project` + `plan_id`. If the user does not know them, run `testplan / list_plans` first.

## list suites

- **Tool:** `testplan` / `list_suites`.
- **Args:** `project`, `plan_id`.
- **Return:** tree/list of suites in the plan with `id`, `name`, `suite_type` (StaticSuite, RequirementTestSuite, etc.), `parent_id`.
- **Typical use:** "what suites does plan X have". Return a table.

## create suite

- **Tool:** `testplan_test_suite_write` / `create`.
- **Args:** `project`, `plan_id`, `suite_type` (typically `StaticSuite` for a new generic suite), `name`, `parent_suite_id` (if a sub-suite; if root, omit or use the implicit plan-parent id).
- **Confirmation required:** yes.
- **Important suite types:**
  - **`StaticSuite`** (most common): a suite where you add TCs manually. The expected type for importing TCs from a document.
  - **`RequirementTestSuite`**: groups TCs by a Requirement work item. Not typically used for importing loose TCs.
  - **`QueryBasedSuite`**: a suite based on a WIQL query.
- If the user does not specify a type, suggest `StaticSuite` and confirm.

## get (one specific suite)

- **There is no direct get-by-id tool** in `testplan_test_suite_*`. Workaround:
  1. `testplan` / `list_suites` with `project`, `plan_id`.
  2. Filter by `name` or `id` in memory.

## add cases to suite

- **Tool:** `testplan_test_suite_write` / `add_test_cases`.
- **Args:** `project`, `plan_id`, `suite_id`, `test_case_ids[]` (array of already-created Test Case IDs).
- **Confirmation required:** yes.
- **Important:** this tool does NOT create the Test Cases — it only associates them with the suite. The TCs must already exist (created via `testplan_test_case_write/create` or already present). To create TCs and associate them with a suite in one go, chain: `testplan_test_case_write/create` for each TC → then `add_test_cases` with the resulting IDs. This is the closing pattern of the "import test cases from external sources" flow.

## update

- **Tool:** `wit_work_item_write` / `update` (a "typical" suite is partly managed as a work item of a certain type; structural properties of the suite such as `parent_id` or `suite_type` are not changed via `wit_work_item_write / update`).
- **Real limitation:** the toolset does not provide a clean tool to re-parent suites or change their type. To rename or change `areaPath`, `wit_work_item_write / update` may suffice. To restructure, fall back to the portal.

## delete

To delete a Test Suite, load and follow `references/delete-instructions.md`. The toolset exposes no `delete_suite` tool, and deletion is the highest-risk write operation in this skill.
