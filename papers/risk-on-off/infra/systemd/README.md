# Static delivery

This project has no application process or systemd unit. Apache serves the built `dist/` directory directly when deployment is explicitly requested. See `docs/architecture/ARCHITECTURE.md` for the release and rollback boundary.
