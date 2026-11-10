"""Run the shared collector with disposable data and no private configuration."""
import argparse
import json
import os
from pathlib import Path
import sys
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--collector', type=Path, default=Path(__file__).resolve().parents[2] / 'www.tglauner.com' / 'visitor_analytics')
    parser.add_argument('--port', type=int, default=9000)
    args = parser.parse_args()
    if not 1024 <= args.port <= 65535:
        parser.error('--port must be between 1024 and 65535')
    collector = args.collector.resolve()
    if not (collector / 'collector' / 'app.py').is_file():
        parser.error('The shared collector checkout was not found; supply --collector.')
    try:
        import dotenv
        import uvicorn
    except ImportError:
        parser.error('Install the local test dependencies from docs/visitor-analytics.md into .venv.')
    # The shared app normally loads dotenv; this test must never read that file.
    dotenv.load_dotenv = lambda *args, **kwargs: False
    with tempfile.TemporaryDirectory(prefix='observatory-analytics-') as temporary:
        state = Path(temporary)
        (state / 'filters.json').write_text('[]')
        (state / 'widgets.json').write_text(json.dumps({'version': 1, 'manual': [], 'discovered': []}))
        os.environ.update({
            'PYTHON_DOTENV_DISABLED': '1',
            'DATABASE_URL': f'sqlite:///{state / "analytics.sqlite3"}',
            'ALLOWED_ORIGINS': 'localhost,127.0.0.1',
            'MAXMIND_DB': str(state / 'no-geo.mmdb'),
            'REPORTING_FILTERS_PATH': str(state / 'filters.json'),
            'SITE_WIDGETS_PATH': str(state / 'widgets.json'),
            'AGENT_REGISTRY_PATH': str(state / 'registry.json'),
            'AGENT_STATUS_PATH': str(state / 'status.json'),
            'AGENT_PROJECTS_ROOT': str(state),
            'ADMIN_AUTH_ENABLED': 'false',
        })
        sys.path.insert(0, str(collector))
        print(f'[analytics-local] Isolated SQLite database: {state / "analytics.sqlite3"}', flush=True)
        uvicorn.run('collector.app:app', host='127.0.0.1', port=args.port)


if __name__ == '__main__':
    main()
