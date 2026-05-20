-- SparkMind Sovereign Mission Control — Initial Schema
-- Anchor: MASTER-ARCHITECT-PROMPT v7.0 §06 (Decision Log) + SESSION-HANDOFF v2.0 §01

-- ─── Session Handoffs (v2.0 — 12-section structure) ───────────
CREATE TABLE IF NOT EXISTS handoffs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT UNIQUE NOT NULL,           -- YYYY-MM-DD-HHMM-shortname
  previous_ai TEXT,                          -- Claude | Genspark | GPT | Gemini
  operator TEXT DEFAULT 'Haidar',
  handoff_date TEXT NOT NULL,
  doctrine_version TEXT DEFAULT 'v7.0',
  sprint_day INTEGER,
  composite_health INTEGER,
  health_status TEXT,                        -- RED | AMBER | GREEN
  lane_focus TEXT,                           -- F | E | K | B | N | META
  lane_status TEXT,                          -- JSON: { F: "active", E: "paused", ... }
  last_delta TEXT,                           -- markdown
  blocking_issues TEXT,                      -- JSON array
  next_tasks TEXT,                           -- JSON array
  open_decisions TEXT,                       -- JSON array
  citations TEXT,                            -- JSON array
  constitutional_flags TEXT,                 -- JSON
  context_carry_over TEXT,
  invocation_hint TEXT,
  raw_block TEXT,                            -- full paste-ready block
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_handoffs_date ON handoffs(handoff_date DESC);
CREATE INDEX IF NOT EXISTS idx_handoffs_sprint_day ON handoffs(sprint_day);

-- ─── Decision Log (DEC-NNNN per v7.0 §06) ─────────────────────
CREATE TABLE IF NOT EXISTS decisions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dec_id TEXT UNIQUE NOT NULL,               -- DEC-0001
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  owner TEXT DEFAULT 'Haidar',
  status TEXT NOT NULL,                      -- PROPOSED | ACCEPTED | SUPERSEDED | REJECTED
  lane TEXT NOT NULL,                        -- F | E | K | B | N | META
  severity TEXT NOT NULL,                    -- P0 | P1 | P2
  cites TEXT,                                -- JSON array
  supersedes TEXT,                           -- DEC-NNNN | null
  context_md TEXT,
  decision_md TEXT,
  consequences_md TEXT,
  verification_md TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_decisions_status ON decisions(status);
CREATE INDEX IF NOT EXISTS idx_decisions_lane ON decisions(lane);

-- ─── Sprint Progress (D2 → D60 per FULL-SPRINT v1.0) ──────────
CREATE TABLE IF NOT EXISTS sprint_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sprint_day INTEGER UNIQUE NOT NULL,        -- 2..60
  week INTEGER NOT NULL,                     -- 0..8
  date TEXT,
  lane_focus_am TEXT,
  lane_focus_pm TEXT,
  commits TEXT,                              -- JSON array of {hash, msg, lane}
  composite_health INTEGER,
  notes_md TEXT,
  founder_review TEXT,                       -- For Sabtu reviews
  status TEXT DEFAULT 'pending',             -- pending | in-progress | done | skipped
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Gap Tracking (42 gaps per FULL-SPRINT §03) ───────────────
CREATE TABLE IF NOT EXISTS gaps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gap_id TEXT UNIQUE NOT NULL,               -- GAP-Z1, GAP-BK-1, etc.
  description TEXT NOT NULL,
  category TEXT NOT NULL,                    -- foundation | barberkas | kuratorkas | pacelokal | nurani | cross-brand
  deadline_day INTEGER,                      -- D-day
  severity TEXT NOT NULL,                    -- P0 | P1 | P2
  lane TEXT,
  status TEXT DEFAULT 'open',                -- open | in-progress | resolved | blocked
  resolved_at DATETIME,
  resolved_commit TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gaps_status ON gaps(status);
CREATE INDEX IF NOT EXISTS idx_gaps_category ON gaps(category);

-- ─── Audit Log (Risk Checklist runs per §31) ──────────────────
CREATE TABLE IF NOT EXISTS audit_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT UNIQUE NOT NULL,               -- UUID-like
  target TEXT NOT NULL,                      -- e.g. "apps/barberkas" or "doctrine v7.0"
  category TEXT NOT NULL,                    -- risk-checklist | drift-scan | doctrine-self-audit
  total_items INTEGER NOT NULL,
  passed INTEGER NOT NULL,
  failed INTEGER NOT NULL,
  warnings INTEGER DEFAULT 0,
  verdict TEXT NOT NULL,                     -- SAFE TO MERGE | HOLD MERGE | NEEDS REVIEW
  details TEXT,                              -- JSON array of checks
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_target ON audit_runs(target);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_runs(created_at DESC);

-- ─── Prompt Library (5-Layer AIDEV prompts per §30) ───────────
CREATE TABLE IF NOT EXISTS prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt_id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  scope TEXT,                                -- cross | barberkas | kuratorkas | pacelokal | nurani-os | infra
  task TEXT NOT NULL,
  lane TEXT,
  sprint_day INTEGER,
  deploy_target TEXT,                        -- local | cloudflare-staging | cloudflare-production
  cites TEXT,                                -- JSON array
  layer_1_context TEXT,
  layer_2_constraints TEXT,
  layer_3_spec TEXT,
  layer_4_acceptance TEXT,
  layer_5_output TEXT,
  built_prompt TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Sovereign Health Pillars Snapshots ───────────────────────
CREATE TABLE IF NOT EXISTS health_snapshots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  snapshot_date TEXT NOT NULL,
  sprint_day INTEGER,
  cross_brand INTEGER DEFAULT 0,
  barberkas INTEGER DEFAULT 0,
  kuratorkas INTEGER DEFAULT 0,
  pacelokal INTEGER DEFAULT 0,
  nurani_os INTEGER DEFAULT 0,
  engineering_discipline INTEGER DEFAULT 0,
  pg_router INTEGER DEFAULT 0,
  doctrine INTEGER DEFAULT 0,
  composite INTEGER NOT NULL,
  status TEXT NOT NULL,                      -- RED | AMBER | GREEN
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_health_date ON health_snapshots(snapshot_date DESC);
