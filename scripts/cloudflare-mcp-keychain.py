"""Supply Cloudflare MCP authentication directly from macOS Keychain to Codex."""
import json
import os
import pwd
import subprocess
import sys

SERVICE = 'codex-cloudflare-mcp'


def main():
    account = pwd.getpwuid(os.getuid()).pw_name
    result = subprocess.run(
        ['/usr/bin/security', 'find-generic-password', '-a', account, '-s', SERVICE, '-w'],
        capture_output=True, text=True,
    )
    token = result.stdout.strip() if result.returncode == 0 else ''
    if not token or any(character.isspace() for character in token):
        print('Cloudflare token is missing or invalid in macOS Keychain. Follow docs/cloudflare-agent-setup.md.', file=sys.stderr)
        return 1
    # Only the MCP client should invoke this helper; never print its output in chat or logs.
    print(json.dumps({'Authorization': 'Bearer ' + token}))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
