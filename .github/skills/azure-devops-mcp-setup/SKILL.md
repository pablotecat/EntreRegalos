---
name: azure-devops-mcp-setup
description: "Verify or set up the local Azure DevOps MCP server (stdio) for any MCP client or harness. Checks existing connectivity first via mcp_ado_core_list_projects; configures the @azure-devops/mcp server only when it is not already connected. Use to configure for the first time, reconfigure for a different organization, or troubleshoot connection issues. Does not perform Test Plan/Suite/Case operations — use azure-devops-testplan for those."
metadata:
  plugin: pc-quality
  author: "Pablo Otero Catrufo"
---

# Azure DevOps MCP server setup

Configuration and verification of the local `@azure-devops/mcp` server (stdio mode) for any MCP client or harness. The skill is harness-agnostic: it verifies the current connection first and only configures when the server is not already connected. It is reusable across projects — once configured for a client and an organization, it does not need to be repeated unless the organization changes or the server is moved to a different machine.

## When to use

- The user is on their first use of an Azure DevOps MCP-dependent skill or operation and the server's status is unknown.
- The user wants to verify whether the ADO MCP server is already connected (e.g., a workspace inherited a config from a previous setup, or the user is unsure of the current state).
- The user asks to set up, install, or configure the Azure DevOps MCP server for a specific client.
- The user wants to switch the configured server to a different Azure DevOps organization.
- A previously-configured server is no longer responding, tools do not appear, or auth errors are surfacing.
- The user asks which MCP client they are running, or where the config file should go.

## When not to use

- Performing CRUD operations on Test Plans, Test Suites, or Test Cases — that is the `azure-devops-testplan` skill's domain.
- Azure DevOps `az` CLI authentication outside the MCP server context (unless Troubleshooting routes you there as an alternative auth method).
- Configuring a remote (HTTP/SSE) Azure DevOps MCP server. This skill supports local (stdio) mode only; the remote mode is out of scope and not documented here.

## Prerequisites

- **Node.js 20 or later** on the machine that runs the MCP client. The first run downloads and caches the `@azure-devops/mcp` package (~50 MB) per workspace.
- **Git** on the PATH is not required for the server itself, but is commonly present on developer machines.
- The user has access to the target Azure DevOps organization (sign-in happens interactively on the first tool call).

## Workflow

### Step 1: Load the setup reference

Load `references/mcp-setup.md` before doing anything else. It is the single source of truth for client detection, per-client config blocks, the first-run flow, connectivity verification, and troubleshooting. The rest of this `SKILL.md` is an index; the content lives there.

### Step 2: Check current connectivity first

Before touching any config, check whether the MCP server is already connected and responding. This makes the skill harness-agnostic: the check is the same regardless of which MCP client (harness) is running.

List the tools exposed by the ADO MCP server in the current session (typical prefix `mcp_ado_*` on the local stdio server) and look for `mcp_ado_core_list_projects` — the canonical read-only tool of the `core` domain that lists all projects in the configured organization (takes no `project` argument).

- **If `mcp_ado_core_list_projects` is available in the session, invoke it:**
  - **Returns the organization's project list** → the server is already connected and authenticated. Skip to Step 6 (final verification) — no configuration needed.
  - **Returns an error, no projects, or a connectivity failure** → the server is registered but not working. Proceed to Step 3 (resolve org), then Step 5 to configure or Step 7 to troubleshoot.
- **If `mcp_ado_core_list_projects` is not available in the session** → the server is not registered in the current client. Proceed to Step 3 (resolve org), then Step 5 to configure.

Do not assume the server is unconfigured. A workspace that was set up in a previous session may already have a working `ado` server — verifying first avoids redundant writes and restarts.

### Step 3: Resolve the organization with the user

Ask for the Azure DevOps organization slug (`{org}`), confirm it has no `https://` or `dev.azure.com/` prefix, and confirm the user has access. This value is embedded as a literal in the config file — do not use `${input:ado_org}` promptString placeholders (VS Code Agent Host does not support them).

### Step 4: Detect the MCP client

Follow the *Detect your MCP client* table in `references/mcp-setup.md` (project-local markers first, then user-global markers). Report which client you detected to the user. If multiple markers are present, ask which client the user is actually running before writing.

### Step 5: Configure (only if Step 2 showed the server is not connected)

Follow the *First-run flow* section of `references/mcp-setup.md`, end to end:

1. Resolve the org (Step 3 above).
2. Detect the client (Step 4 above).
3. Check whether a local `ado` server is already configured in that client's config file — if yes and pointing at the same org, skip writing (the problem is auth/connectivity, go to Step 7 troubleshooting); if pointing at a different org, surface the conflict to the user and let them decide.
4. If not configured, write or merge the matching per-client config block (preserving any other servers already present — parse, add `ado`, re-serialize; do not blow away unrelated entries).
5. Instruct the user to restart the MCP client for the config to take effect.
6. Proceed to Step 6 (final verification).

Do not improvise config outside the per-client blocks in `references/mcp-setup.md`. If the user's client is not listed there, report the gap and fall back to the upstream [Getting Started guide](https://github.com/microsoft/azure-devops-mcp/blob/main/docs/GETTINGSTARTED.md) linked from that reference.

### Step 6: Final connectivity verification (mandatory)

Regardless of whether config was written in Step 5 or skipped in Step 2, perform a final end-to-end verification that the server is connected and responding:

1. List the ADO MCP tools available in the session and confirm `mcp_ado_core_list_projects` is present (typical prefix `mcp_ado_*` on the local stdio server).
2. Invoke `mcp_ado_core_list_projects`. It must return the organization's project list.
   - If a browser sign-in prompt appears, complete it with the account that has access to the organization, then retry.
   - If auth errors persist after sign-in, the account has no access to that organization — confirm the slug and the account with the user.
3. **Only after `mcp_ado_core_list_projects` returns data**, report setup complete to the user. State the organization and the number of projects returned as proof of the connection.

This final check is the single source of truth that the setup succeeded — do not report success based solely on having written the config file.

### Step 7: Troubleshoot (if Step 6 fails)

If the final verification fails, load the *Troubleshooting* section of `references/mcp-setup.md` — it covers the common failure modes (browser does not open, HTTP 401/403 after sign-in, tools do not appear, wrong domain loaded, `npx` not found, server key conflict) and their documented fixes.

## References

| Reference | When to load it |
|---|---|
| `references/mcp-setup.md` | **Always** on every setup run. Single source of truth for local server config, client detection, per-client config blocks, first-run flow, connectivity verification, and troubleshooting. |

## Validation

- [ ] Current connectivity was checked first (Step 2) before touching any config — `mcp_ado_core_list_projects` was invoked if available in the session.
- [ ] If the server was already connected (Step 2 returned projects), no config was written and the flow jumped directly to Step 6 final verification.
- [ ] If configuration was needed, the Azure DevOps organization slug was resolved with the user (no protocol, no `dev.azure.com/` prefix).
- [ ] If configuration was needed, the MCP client was detected per the marker table in `references/mcp-setup.md`, and the result was reported to the user.
- [ ] If config was written, the per-client block from `references/mcp-setup.md` was used verbatim (only `{org}` substituted), and other servers in the file were preserved; the user was instructed to restart the client.
- [ ] Final connectivity verification (Step 6) confirmed `mcp_ado_core_list_projects` returns the organization's project list before reporting setup complete.
- [ ] If the user's client is not listed in the reference, the gap was reported and the upstream Getting Started guide was surfaced as the fallback.

## Common pitfalls

| Pitfall | Fix |
|---|---|
| Assuming the server is not configured and re-running setup | Always check connectivity first (Step 2) by invoking `mcp_ado_core_list_projects`. A workspace may already have a working `ado` server from a previous session — redundant writes and restarts waste the user's time. |
| Embedding `${input:ado_org}` in `.vscode/mcp.json` | Do not use promptString placeholders — VS Code Agent Host cannot read them. Embed the org as a literal string. See `references/mcp-setup.md` (Visual Studio Code block). |
| Assuming `.vscode/mcp.json` is the only config location | Detection depends on the client: VS Code → `.vscode/mcp.json`, Cursor → `.cursor/mcp.json`, OpenCode → `opencode.json`, Codex → `~/.codex/config.toml`, Claude Code → CLI-registered, Claude Desktop → `claude_desktop_config.json`, GitHub Copilot CLI → `~/.copilot/mcp-config.json`, Visual Studio 2022 → `.mcp.json` in solution folder, Kilo Code → `.kilocode/mcp.json`. Detect the client per `references/mcp-setup.md` before writing. |
| Blowing away unrelated servers when merging config | Parse the existing file, add only the `ado` server, re-serialize — preserve every other entry already present. |
| Omitting the `-d core work-items test-plans` segment on args | Without `-d`, the server loads all domains, which bloats the tool list and may hit client tool limits. Always include the filtered domain segment. |
| Restarting only the chat instead of the client | Most clients do not hot-reload MCP config — restart the full client (or, for VS Code, start/stop the `ado` server from the MCP view). OpenCode and Claude Code pick up CLI-registered servers without a full restart, but restarting is still the safe default. |
