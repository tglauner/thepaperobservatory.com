"""Configure a token-free Codex MCP entry; the token remains in macOS Keychain."""
import argparse
import datetime
import json
import os
from pathlib import Path
import re
import shlex
import shutil
import sys
import tempfile
import tomllib

URL = 'https://mcp.cloudflare.com/mcp'


def updated_config(original, helper_command):
    previous = tomllib.loads(original)
    current = previous.get('mcp_servers', {}).get('cloudflare', {})
    if current.get('url', URL) != URL:
        raise ValueError('The existing cloudflare entry points elsewhere; no configuration changed.')
    entry = {'url': URL, 'http_headers_helper': helper_command}
    # Replace only this server and its sub-tables, preserving all unrelated configuration.
    remaining = re.sub(r'(?ms)^\[mcp_servers\.cloudflare(?:\.[^\]]*)?\][^\n]*\n.*?(?=^\[|\Z)', '', original)
    result = remaining.rstrip() + '\n\n[mcp_servers.cloudflare]\n' + '\n'.join(f'{key} = {json.dumps(value)}' for key, value in entry.items()) + '\n'
    expected = dict(previous)
    expected['mcp_servers'] = {**previous.get('mcp_servers', {}), 'cloudflare': entry}
    if tomllib.loads(result) != expected:
        raise ValueError('Configuration preservation check failed; no configuration changed.')
    return result


def self_test():
    original = 'model = "keep-me"\n[mcp_servers.other]\nurl = "https://example.com/mcp"\n[mcp_servers.cloudflare]\nurl = "https://mcp.cloudflare.com/mcp"\n[mcp_servers.cloudflare.oauth]\nclient_id = "old-flow"\n[profiles.local]\nmodel = "keep-this-too"\n'
    command = '/usr/local/bin/python3 "/a path/helper.py"'
    updated = updated_config(original, command)
    parsed = tomllib.loads(updated)
    assert parsed['model'] == 'keep-me'
    assert parsed['profiles']['local']['model'] == 'keep-this-too'
    assert parsed['mcp_servers']['other']['url'] == 'https://example.com/mcp'
    assert parsed['mcp_servers']['cloudflare']['http_headers_helper'] == command
    assert updated_config(updated, command) == updated
    assert tomllib.loads(updated_config('', command))['mcp_servers']['cloudflare']['url'] == URL
    try:
        updated_config('[mcp_servers.cloudflare]\nurl="https://another.example/mcp"\n', command)
    except ValueError:
        pass
    else:
        raise AssertionError('A conflicting server must be preserved.')
    print('7 configuration preservation and idempotency checks passed; no credentials accessed.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if sys.platform != 'darwin':
        parser.error('This Keychain configuration is for macOS.')
    root = Path(os.environ.get('CODEX_HOME', Path.home() / '.codex'))
    config = root / 'config.toml'
    helper = root / 'bin' / 'cloudflare-mcp-keychain.py'
    if config.is_symlink() or helper.is_symlink():
        parser.error('A managed configuration/helper symlink needs review before editing.')
    original = config.read_text() if config.exists() else ''
    python = shutil.which('python3') or sys.executable
    command = shlex.join([python, str(helper)])
    updated = updated_config(original, command)
    root.mkdir(parents=True, exist_ok=True)
    helper.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(Path(__file__).with_name('cloudflare-mcp-keychain.py'), helper)
    helper.chmod(0o700)
    if config.exists():
        stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        backup = config.with_name('config.toml.before-cloudflare-token.' + stamp)
        shutil.copyfile(config, backup)
        backup.chmod(0o600)
    descriptor, temporary = tempfile.mkstemp(dir=root)
    try:
        with os.fdopen(descriptor, 'w') as output:
            output.write(updated)
        os.chmod(temporary, 0o600)
        os.replace(temporary, config)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    print('Cloudflare MCP configured to read only the codex-cloudflare-mcp Keychain item.')
    print('No token was read, stored in configuration, or sent to a service.')


if __name__ == '__main__':
    main()
