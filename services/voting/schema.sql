CREATE TABLE IF NOT EXISTS ballots (
  voter_hash TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL,
  choices TEXT NOT NULL CHECK (json_valid(choices) AND json_array_length(choices) <= 3),
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS request_limits (
  bucket TEXT PRIMARY KEY,
  hits INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
