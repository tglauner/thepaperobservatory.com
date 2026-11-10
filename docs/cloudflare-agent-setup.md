# Cloudflare agent connection: manual token setup

The website and DigitalOcean visitor collection are already deployed. This setup enables the additional Cloudflare MCP tools in Codex; it is not required to keep the website online.

Cloudflare OAuth repeatedly returned `invalid_request` with “This authorization was not started in this browser; start again”. Cloudflare’s published OAuth implementation emits that message when its temporary browser-binding cookie is missing. The cause of the missing cookie was not established. Both Codex CIMD and DCR registration were attempted. Do not disable browser security, forge a binding cookie or repeat the failing login indefinitely.

Cloudflare explicitly supports API tokens for this MCP server. The Mac configuration now uses a local header helper, so a desktop-launched Codex session does not depend on environment variables exported in a terminal.

## Owner steps

1. Open https://dash.cloudflare.com/profile/api-tokens and select **Create Token**, then the custom-token option.
2. Name it **Codex — Paper Observatory** and add these permissions:

   | Category | Permission | Access |
   | --- | --- | --- |
   | Account | Cloudflare Pages | Edit |
   | Account | Account Settings | Read |
   | Zone | Zone | Read |
   | Zone | DNS | Edit |

3. Limit Account Resources to your intended Cloudflare account and Zone Resources to **thepaperobservatory.com**. Leave Client IP Address Filtering empty: Cloudflare’s MCP server does not support tokens with that restriction.
4. Review the summary, create the token and copy it. Use an API token, rather than the Global API Key.
5. On this Mac, run the following command in Terminal. Its final `-w` prompts for the token without placing the token in shell history or a process argument:

   ```bash
   security add-generic-password -U -a "$USER" -s codex-cloudflare-mcp -w
   ```

   Paste the token at the password prompt and press Return. Do not paste it into chat or run the header helper directly; its output is exclusively for the MCP client.
6. Restart Codex (or the host app) so it loads the registered Cloudflare server and installed skills. If Keychain asks, approve access to this specific stored item. In a new session, request: **Use the Cloudflare MCP tools to list my Pages projects.**

The setup is not verified as authenticated until that tool call succeeds. Do not run `codex mcp login cloudflare` for this token-based connection; that restarts the failing OAuth flow.

## Installed local configuration

- 22 Cloudflare skills are installed under `~/.codex/skills/`.
- `~/.codex/config.toml` points `cloudflare` at `https://mcp.cloudflare.com/mcp` using `http_headers_helper`.
- `~/.codex/bin/cloudflare-mcp-keychain.py` reads only the `codex-cloudflare-mcp` item for the current macOS user and returns an Authorization header directly to the MCP client. It does not log the token.
- No token is stored in this repository, `.env`, or the Codex config. The local config backup is private and mode 600.

Reinstall the token-free helper/configuration if needed:

```bash
python3 scripts/configure-cloudflare-mcp.py --self-test
python3 scripts/configure-cloudflare-mcp.py
```

The installer uses Python 3.11+ standard libraries, preserves all other Codex configuration and verifies TOML integrity before replacing the one server entry. It never reads Keychain or any credential value. A private config backup is created before changes. It does not alter the running website, collector or GitHub deployment secrets.

For a rollback, restore the private `config.toml.before-cloudflare-token.*` backup made by the installer. Revoke the token in Cloudflare if the connection is no longer wanted. Remove only this Keychain item through Keychain Access if needed.

## Official references

- [Cloudflare MCP API-token authentication](https://github.com/cloudflare/mcp#option-2-api-token)
- [Create Cloudflare API tokens](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)
- [Cloudflare token permissions](https://developers.cloudflare.com/fundamentals/api/reference/permissions/)
- [Codex HTTP MCP authentication and header helpers](https://learn.chatgpt.com/docs/extend/mcp?surface=cli)
