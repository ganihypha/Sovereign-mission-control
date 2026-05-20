-- SparkMind Sovereign — Seed Data
-- Seeds: anticipated DEC-0001..DEC-0010, 42 gaps, week-0 sprint, baseline health

-- ─── Seed Decisions (anticipated per FULL-SPRINT §09) ─────────
INSERT OR IGNORE INTO decisions (dec_id, title, date, status, lane, severity, cites, context_md, decision_md, consequences_md) VALUES
('DEC-0001', 'Lock Close-Out Trilogy as canonical (v7.0/v2.0/v1.0)', '2026-05-20', 'ACCEPTED', 'META', 'P0',
  '["MASTER-ARCHITECT-PROMPT v7.0 §00","HARDENING-REPORT-v6-to-v7.md"]',
  '3 versi doctrine drift (v5.0 3-brand vs v6.0 4-brand vs v7.0 hardened). Need single source of truth.',
  'Lock trilogy v7.0/v2.0/v1.0 sebagai canonical baseline. All sessions paste v7.0 quick-start.',
  'All future session bootstrap MUST use v7.0. Older docs marked SUPERSEDED. DEC-0002 follows.'),
('DEC-0002', 'Cloudflare Workers Paid Plan activation', '2026-05-20', 'PROPOSED', 'F', 'P0',
  '["MASTER-ARCHITECT-PROMPT v7.0 §1.3","FULL-SPRINT-PLAN v1.0 Week 0 D3"]',
  'Free plan = 10ms CPU per request. KK AI Stylist + NU Murattal R2 streaming need 30ms.',
  'Enable Workers Paid Plan ($5/mo) untuk all 4 sub-brands.',
  '$5/mo fixed + usage tiers. Enables D1, Queues, AI inference at production scale.'),
('DEC-0003', 'BK multi-tenant Pattern B (single D1 + tenant_id) D0–D30', '2026-05-26', 'PROPOSED', 'E', 'P0',
  '["MASTER-CONSOLIDATED v2.0 §03.2","FULL-SPRINT-PLAN v1.0 LANE E D10"]',
  'Pattern A = D1-per-tenant (clean isolation, costly). Pattern B = single D1 + tenant_id row-scoping (cheap).',
  'Pick Pattern B untuk MVP (D0–D30). Re-evaluate Pattern A jika tenant > 100.',
  'Faster MVP. Need WHERE tenant_id = ? mandatory di SEMUA queries. Risk: cross-tenant leak jika lupa filter.'),
('DEC-0004', 'BK PG primary: Duitku, fallback: Xendit', '2026-06-02', 'PROPOSED', 'E', 'P0',
  '["DOC-X v1.0 §4","FULL-SPRINT-PLAN v1.0 LANE E D18"]',
  'Duitku = better local UMKM rate (1.5%). Xendit = better DX + faster verify.',
  'Duitku QRIS primary BK, Xendit standby fallback via @sparkmind/pg-router.',
  'Need dual-vendor compliance (constraint #7). Xendit also used for NU donation.'),
('DEC-0005', 'BK production cutover D25', '2026-06-13', 'PROPOSED', 'E', 'P0',
  '["FULL-SPRINT-PLAN v1.0 §02 Week 3"]',
  'Need green smoke test 24h + 3 demo tenants + Duitku live before cutover.',
  'Cutover BK ke production `barberkas.sparkmind.web.id` di D25 setelah smoke pass.',
  'Live revenue starts. Rollback plan: keep staging URL active 7 days.');

-- ─── Seed Gaps (42 tracked) ────────────────────────────────────
INSERT OR IGNORE INTO gaps (gap_id, description, category, deadline_day, severity, lane) VALUES
-- Foundation (5)
('GAP-Z1', 'Shared identity package (@sparkmind/auth)', 'foundation', 10, 'P0', 'F'),
('GAP-Z2', 'Shared payments dual-PG (@sparkmind/pg-router)', 'foundation', 14, 'P0', 'F'),
('GAP-Z3', 'Shared UI tokens (@sparkmind/ui-kit)', 'foundation', 11, 'P1', 'F'),
('GAP-Z4', 'Monorepo CI/CD baseline', 'foundation', 7, 'P0', 'F'),
('GAP-Z8', '@sparkmind/curator-os package skeleton', 'foundation', 15, 'P1', 'F'),
-- BarberKas (8)
('GAP-BK-1', 'Tenant onboarding pipeline (signup → claim → seed)', 'barberkas', 12, 'P0', 'E'),
('GAP-BK-2', 'Isolation middleware production-grade', 'barberkas', 15, 'P0', 'E'),
('GAP-BK-3', 'Duitku QRIS integration (live keys)', 'barberkas', 18, 'P0', 'E'),
('GAP-BK-4', 'Customer DB per-tenant UI', 'barberkas', 20, 'P1', 'E'),
('GAP-BK-5', 'Subscription billing (Duitku recurring)', 'barberkas', 24, 'P0', 'E'),
('GAP-BK-6', 'Fonnte WhatsApp reminder integration', 'barberkas', 26, 'P1', 'E'),
('GAP-BK-7', 'BK production cutover', 'barberkas', 25, 'P0', 'E'),
('GAP-BK-8', 'Multi-tenant isolation tests', 'barberkas', 24, 'P0', 'E'),
-- KuratorKas (8)
('GAP-KK-1', 'Subdomain + Worker init', 'kuratorkas', 17, 'P0', 'K'),
('GAP-KK-2', 'Reverse-extract from BK (auth, tenant, pg-router)', 'kuratorkas', 20, 'P0', 'K'),
('GAP-KK-3', 'AI Stylist Curator MVP (Workers AI binding)', 'kuratorkas', 24, 'P0', 'K'),
('GAP-KK-4', 'Content Curator (IG caption gen)', 'kuratorkas', 29, 'P0', 'K'),
('GAP-KK-5', 'Marketplace Curator (Shopee sync)', 'kuratorkas', 38, 'P0', 'K'),
('GAP-KK-6', 'Pricing + Trend Curator complete', 'kuratorkas', 45, 'P0', 'K'),
('GAP-KK-7', 'KK production cutover', 'kuratorkas', 46, 'P0', 'K'),
('GAP-KK-8', 'KK alpha cohort enrollment (10 UMKM)', 'kuratorkas', 48, 'P1', 'K'),
-- PaceLokal (8)
('GAP-PL-1', 'Subdomain + Worker init', 'pacelokal', 15, 'P0', 'B'),
('GAP-PL-2', 'Verify-Stub MVP production-grade', 'pacelokal', 22, 'P0', 'B'),
('GAP-PL-3', 'Sunday Run Generator (cluster + route picker)', 'pacelokal', 26, 'P0', 'B'),
('GAP-PL-4', 'Leaderboard + R2 GPX', 'pacelokal', 30, 'P0', 'B'),
('GAP-PL-5', 'Strava webhook live', 'pacelokal', 32, 'P1', 'B'),
('GAP-PL-6', 'Race directory MVP', 'pacelokal', 31, 'P1', 'B'),
('GAP-PL-7', 'Premium tier scaffold (Rp 49K/bulan)', 'pacelokal', 33, 'P1', 'B'),
('GAP-PL-8', 'WhatsApp-first onboarding production', 'pacelokal', 42, 'P0', 'B'),
-- Nurani.OS (9)
('GAP-NU-1', 'Subdomain + Worker init', 'nurani', 30, 'P0', 'N'),
('GAP-NU-2', 'Quran reader MVP (30 juz indexed)', 'nurani', 36, 'P0', 'N'),
('GAP-NU-3', 'Murattal R2 streaming live', 'nurani', 38, 'P0', 'N'),
('GAP-NU-4', 'Tadarus group MVP', 'nurani', 45, 'P0', 'N'),
('GAP-NU-5', 'Dhikr counter', 'nurani', 41, 'P1', 'N'),
('GAP-NU-6', 'Bookmark + last-read sync (KV)', 'nurani', 39, 'P1', 'N'),
('GAP-NU-7', 'Privacy doctrine page', 'nurani', 34, 'P1', 'N'),
('GAP-NU-8', 'NU+Muhammadiyah dual content review', 'nurani', 49, 'P0', 'N'),
('GAP-NU-9', 'Public preview + alpha enrollment', 'nurani', 60, 'P0', 'N'),
-- Cross-Brand & Eng (4)
('GAP-Z5', 'Root domain doctrine + 4-sub-brand showcase', 'cross-brand', 52, 'P1', 'F'),
('GAP-Z6', 'Cross-brand observability (CF Analytics 4 datasets)', 'cross-brand', 48, 'P2', 'F'),
('GAP-Z7', 'Cross-brand persona surface (1-user-4-personas)', 'cross-brand', 45, 'P1', 'F'),
('GAP-D', 'Engineering discipline (CI/CD, tests, decision-log)', 'cross-brand', 15, 'P1', 'F');

-- ─── Seed Health Snapshot (baseline D3 = 2026-05-20) ──────────
INSERT OR IGNORE INTO health_snapshots
  (snapshot_date, sprint_day, cross_brand, barberkas, kuratorkas, pacelokal, nurani_os, engineering_discipline, pg_router, doctrine, composite, status, notes)
VALUES
  ('2026-05-20', 3, 25, 45, 0, 10, 5, 40, 30, 65, 28, 'RED', 'Baseline D3 — trilogy locked, foundation not started, KK/PL/NU empty.');

-- ─── Seed Sprint Day D2-D7 (Foundation Week) ──────────────────
INSERT OR IGNORE INTO sprint_progress (sprint_day, week, date, lane_focus_am, lane_focus_pm, status, notes_md) VALUES
(2, 0, '2026-05-19', 'F', 'F', 'done', 'Drop Close-Out Trilogy ke repo (docs/closeout-trilogy/) + DEC-0001'),
(3, 0, '2026-05-20', 'F', 'F', 'in-progress', 'Claim 4 subdomain di Cloudflare DNS + enable Workers Paid Plan'),
(4, 0, '2026-05-21', 'F', 'F', 'pending', 'Scaffold monorepo final structure (pnpm workspace + Turborepo)'),
(5, 0, '2026-05-22', 'F', 'F', 'pending', 'Scaffold 6 shared packages skeleton + CI/CD baseline'),
(6, 0, '2026-05-23', 'F', 'F', 'pending', '@sparkmind/core v0.1 + @sparkmind/auth v0.1'),
(7, 0, '2026-05-24', 'F', 'F', 'pending', 'Sabtu Founder Review — Week 0 wrap');

-- ─── Seed Example Handoff (the trilogy session) ───────────────
INSERT OR IGNORE INTO handoffs (session_id, previous_ai, handoff_date, doctrine_version, sprint_day, composite_health, health_status, lane_focus, lane_status, last_delta, blocking_issues, next_tasks, citations, invocation_hint, raw_block) VALUES
('2026-05-19-2230-closeout-trilogy', 'Genspark Super Agent', '2026-05-19T22:30:00+07:00', 'v7.0', 3, 28, 'RED', 'META',
 '{"F":"active","E":"paused","K":"not-started","B":"not-started","N":"not-started"}',
 'Generated MASTER-ARCHITECT v6.0/v7.0, SESSION-HANDOFF v2.0, FULL-SPRINT v1.0. No commits pushed yet.',
 '[{"id":"BLOCK-001","title":"DNS 4 subdomain belum claim","severity":"P0","lane":"F","eta":"D3"},{"id":"BLOCK-002","title":"GAP-Z1 shared identity belum scaffold","severity":"P0","lane":"F","eta":"D10"},{"id":"BLOCK-003","title":"GAP-Z2 shared payments belum wire","severity":"P0","lane":"F","eta":"D14"}]',
 '[{"id":"TASK-1","title":"Drop Close-Out Trilogy ke repo","lane":"F","cite":"MASTER-ARCHITECT v7.0 §06.1"},{"id":"TASK-2","title":"Claim 4 subdomain di Cloudflare DNS","lane":"F","cite":"MASTER-CONSOLIDATED v2.0 §01.2"},{"id":"TASK-3","title":"Scaffold monorepo struktur final","lane":"F","cite":"MASTER-ARCHITECT v7.0 §28.1"}]',
 '["MASTER-ARCHITECT-PROMPT v7.0 §01 (4-sub-brand context)","FULL-SPRINT PLAN v1.0 §02 (parallel lane definition)","DOC-AUDIT v2.0 §3.4 (gap matrix anchor)","DOC-K (KuratorKas PRD v2.0) §4 (5-module MVP)"]',
 '@Sovereign-Architect v7.0\nResume from: SESSION-HANDOFF v2.0 (2026-05-19-2230)\nLane focus: F (Foundation)\nNext task: TASK-1 (drop trilogy ke repo + DEC-0001)\nCycle: full',
 '[HANDOFF-START] SPARKMIND SOVEREIGN — SESSION HANDOFF v2.0 ... [HANDOFF-END]');
