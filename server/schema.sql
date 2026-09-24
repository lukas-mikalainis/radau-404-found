CREATE TABLE IF NOT EXISTS posts (
 id TEXT PRIMARY KEY,
 type TEXT NOT NULL CHECK(type IN ('lost','found')),
 title TEXT NOT NULL,
 description TEXT NOT NULL,
 category TEXT NOT NULL,
 location TEXT NOT NULL,
 date TEXT NOT NULL,
 contact TEXT NOT NULL,
 image TEXT,
 status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','returned')),
 manage_hash TEXT NOT NULL,
 is_demo INTEGER NOT NULL DEFAULT 0,
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS posts_type_status ON posts(type,status);
CREATE INDEX IF NOT EXISTS posts_created_at ON posts(created_at);
