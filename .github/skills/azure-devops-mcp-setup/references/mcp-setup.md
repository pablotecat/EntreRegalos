# Azure DevOps MCP server setup

Configuration of the `microsoft/azure-devops-mcp` server required by this skill. The **local (stdio) mode** is the only setup this skill supports: it works in every supported MCP client, requires no app registration, and authenticates with a browser prompt on first tool call.

## Local server

The local server runs the official npm package `@azure-devops/mcp` as a `stdio` process. For this skill, load only the domains it needs:

- `core` — project and team lookups (always include `core`).
- `work-items` — `wit_work_item` / `wit_work_item_write` for field discovery and generic work-item updates.
- `test-plans` — `testplan_*` and `testplan_test_*_write` for Test Plans / Suites / Cases CRUD.

Authentication is **interactive by default**: on the first Azure DevOps tool call, the server opens a browser for sign-in. Use the account that has access to the target organization. No `--authentication` argument is required for this default flow; alternative auth methods (Azure CLI, managed identity, bearer-token env var, PAT) are documented in the upstream [Getting Started guide](https://github.com/microsoft/azure-devops-mcp/blob/main/docs/GETTINGSTARTED.md#authentication).

Prerequisites: **Node.js 20 or later** on the machine that runs the MCP client. The first run downloads and caches the package (~50 MB) per workspace.

## Detect your MCP client

The configuration file location and shape differ per client. Detect which client is in use by checking for these filesystem markers (project-local first, then user-global):

| Client | Marker (project-local) | Marker (user-global) |
|---|---|---|
| Visual Studio Code | `.vscode/` | — |
| Cursor | `.cursor/` | — |
| Kilo Code | `.kilocode/` | — |
| OpenCode | `opencode.json` in project root | `~/.config/opencode/opencode.json` (macOS/Linux), `%APPDATA%\opencode\opencode.json` (Windows) |
| Codex | — | `~/.codex/config.toml` |
| Claude Code | — | invoked via `claude` CLI |
| Claude Desktop | — | `claude_desktop_config.json` (open via *Settings → Developer → Edit Config*) |
| GitHub Copilot CLI | — | `~/.copilot/mcp-config.json` |
| Visual Studio 2022 | `.mcp.json` in solution folder | — |

If multiple markers are present, prefer the project-local one of the client the user is actually running. If you cannot detect the client, ask the user which one they are using before writing any config.

## Local server config by client

Every block below uses the same args: `["-y", "@azure-devops/mcp", "{org}", "-d", "core", "work-items", "test-plans"]`. Replace `{org}` with the Azure DevOps organization slug resolved with the user in step 1 of the first-run flow (no `https://`, no `dev.azure.com/`). Use the server key `ado` (canonical in the upstream config). Do **not** use `${input:ado_org}` promptString placeholders: VS Code Agent Host does not support them, and embedding the literal org keeps the config portable across clients.

### Visual Studio Code

Create or edit `.vscode/mcp.json` in the project root:

```jsonc
{
  "servers": {
    "ado": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "{org}", "-d", "core", "work-items", "test-plans"]
    }
  }
}
```

Start the `ado` server from the VS Code MCP view. Agents using VS Code Agent Host cannot read `${input:...}` prompts, which is why the org is embedded as a literal string here.

### Cursor

Create or edit `.cursor/mcp.json` in the project root:

```jsonc
{
  "mcpServers": {
    "ado": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "{org}", "-d", "core", "work-items", "test-plans"]
    }
  }
}
```

Open *Cursor Settings → Tools & Integrations* and confirm the `ado` server is enabled.

### Kilo Code (project)

Create or edit `.kilocode/mcp.json` in the project root with the same shape as Cursor. On Windows Command Prompt, wrap `npx` with `cmd /c` to avoid process-spawn issues:

```jsonc
{
  "mcpServers": {
    "ado": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@azure-devops/mcp", "{org}", "-d", "core", "work-items", "test-plans"]
    }
  }
}
```

Kilo Code also supports global config via *Agent Behaviour → MCP Servers → Edit Global MCP*; the project file is preferred because it is version-controllable.

### OpenCode

Edit `opencode.json` (project root) or `~/.config/opencode/opencode.json`. OpenCode takes the command as a single flat array, not split into `command` + `args`:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "ado": {
      "type": "local",
      "command": ["npx", "-y", "@azure-devops/mcp", "{org}", "-d", "core", "work-items", "test-plans"],
      "enabled": true
    }
  }
}
```

### Codex

Run the Codex CLI to register the server (preferred — handles the TOML file):

```bash
codex mcp add azure-devops -- npx -y @azure-devops/mcp {org} -d core work-items test-plans
```

Or edit `~/.codex/config.toml` directly:

```toml
[mcp_servers.ado]
command = "npx"
args = ["-y", "@azure-devops/mcp", "{org}", "-d", "core", "work-items", "test-plans"]
```

### Claude Code

Register the server via the Claude CLI:

```bash
claude mcp add --transport stdio ado -- npx -y @azure-devops/mcp {org} -d core work-items test-plans
```

Verify with `claude mcp list`.

### Claude Desktop

Open *Settings → Developer → Edit Config* to open `claude_desktop_config.json`, and add:

```jsonc
{
  "mcpServers": {
    "ado": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "{org}", "-d", "core", "work-items", "test-plans"]
    }
  }
}
```

Completely quit and restart Claude Desktop after saving.

### GitHub Copilot CLI

Edit `~/.copilot/mcp-config.json`:

```jsonc
{
  "mcpServers": {
    "ado": {
      "command": "npx",
      "args": ["-y", "@azure-devops/mcp", "{org}", "-d", "core", "work-items", "test-plans"],
      "tools": ["*"]
    }
  }
}
```

### Visual Studio 2022

Create or edit `.mcp.json` in the solution folder with the same shape as the VS Code block. Requires Visual Studio 2022 version 17.14 or later, or Visual Studio 2026.

## First-run flow

Follow this flow on the first use of the skill in a workspace — before invoking any ADO operation:

1. **Resolve the organization with the user.** Ask for the Azure DevOps organization slug (`{org}`), confirm it has no protocol or `dev.azure.com/` prefix, and confirm the user has access. This value is embedded as a literal in the config.
2. **Detect the MCP client** per the *Detect your MCP client* table above. Report which client you detected to the user.
3. **Check whether the local `ado` server is already configured.** Open the client's config file (per the table) and look for a server entry whose command/args contain `@azure-devops/mcp`. If a server `ado` (or another server running `@azure-devops/mcp`) already exists and points at the same organization, skip writing — do not duplicate or overwrite working config. If it points at a different organization, surface the conflict to the user and let them decide.
4. **Write or merge the config** using the matching block from *Local server config by client*. Preserve any other servers already present in the file. Create the parent directory if it does not exist. If the file already exists with valid JSON, parse it, add the `ado` server, and re-serialize — do not blow away unrelated entries.
5. **Instruct the user to restart the MCP client.** Most clients do not hot-reload MCP config: VS Code, Cursor, Kilo Code, Claude Desktop, Codex, Visual Studio, and GitHub Copilot CLI all require a restart (or, for VS Code, starting the server from the MCP view). OpenCode and Claude Code pick up CLI-registered servers without a full restart, but restarting is still the safe default. State explicitly: *restart your client for the config to take effect*.
6. **Verify connectivity** per the *Connectivity verification* section below before running any skill operation.

Do not improvise config outside the per-client blocks in this file. If the user's client is not listed, report the gap and fall back to the upstream [Getting Started guide](https://github.com/microsoft/azure-devops-mcp/blob/main/docs/GETTINGSTARTED.md).

## Connectivity verification

After the client has restarted (and the server is running), verify it responds before using the skill:

- Open the chat in agent mode and ask: `"List ADO projects"`.
- The expected tool is `mcp_ado_core_list_projects` (the `core` domain is always loaded). If it returns the user's project list, the skill is usable.
- If a browser sign-in prompt appears, complete it with the account that has access to the organization, then retry.
- If auth errors persist after sign-in, the account has no access to that organization — ask the user to confirm the slug and the account.

Only after `list_projects` returns data, proceed with the `SKILL.md` workflow.

## Troubleshooting

- **Browser does not open on first call:** the client may have started the server but suppressed the interactive prompt. Restart the client, trigger a read-only call (`list_projects`), and complete the sign-in. If it still fails, switch to an alternative auth method documented in the upstream guide (`--authentication azcli` if you have an active `az login`, or `--authentication env` for `DefaultAzureCredential`).
- **HTTP 401/403 after sign-in:** the signed-in account does not have access to the organization. Confirm the org slug and sign in with the correct account.
- **Tools do not appear:** restart the client after writing the config. In VS Code, Command Palette → `MCP: List Servers` should show `ado` as `running`; if not, start it manually.
- **Wrong domain loaded:** re-check the `-d core work-items test-plans` segment of the args. Omitting `-d` loads all domains (works, but bloats the tool list and may hit client tool limits).
- **`npx` not found:** Node.js 20+ is not on the PATH. Install it from <https://nodejs.org/> and restart the client.
- **Server key conflict:** if the user already has another server named `ado` serving a different purpose, do not silently overwrite. Report the conflict and let the user choose a different key (the key does not affect the tool prefix the package exposes).
