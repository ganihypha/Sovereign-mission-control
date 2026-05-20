# 🛡️ SparkMind Sovereign — Mission Control v7.0 HARDENED

> **Trilogy execution dashboard** untuk SparkMind Sovereign Ecosystem.  
> Owner: **Reza Estes / Haidar** · Doctrine date: 2026-05-20  
> Anchor: **MASTER-ARCHITECT-PROMPT v7.0** + **SESSION-HANDOFF v2.0** + **FULL-SPRINT-PLAN v1.0**

---

## 🎯 Project Overview

- **Name**: SparkMind Sovereign — Mission Control
- **Goal**: Single source of truth untuk eksekusi 60-day sprint **4-sub-brand parallel** (BarberKas · KuratorKas · PaceLokal · Nurani.OS) di bawah mother brand **SparkMind**.
- **Anchor doctrine**: Close-Out Trilogy v7.0/v2.0/v1.0 (HARDENED · Genspark-AI-Dev-native)
- **Stack lock**: 100% Cloudflare-native (Workers + Pages + D1 + R2 + KV) — NO Supabase, NO Vercel, NO Firebase.

---

## ✅ Currently Completed Features

### 🏛️ Doctrine Layer (read-only, single source of truth)
- **DOCTRINE_META** — v7.0 HARDENED, supersedes v6.0
- **4 SUB_BRANDS** (BarberKas P0 · KuratorKas P1 · PaceLokal P2 · Nurani.OS P3) with subdomain, lane, KPI
- **6 SHARED_PACKAGES** (`@sparkmind/core`, `auth`, `pg-router`, `ui-kit`, `curator-os`, `analytics`)
- **16 CONSTRAINTS** hardcoded (stack lock, 4-brand lock, dual-PG mandate, etc.)
- **DRIFT_SIGNALS** + **WEAKNESSES** (13 categorized)
- **8 SPRINT_WEEKS** (D0 → D60)
- **RISK_CHECKLIST** (20-item — §31)
- **AIDEV 4 Pillars** (Intent · Comprehension · Defense · Selection)
- **HEALTH_PILLARS** (8 weighted pillars → composite score)
- **LANE_ROTATION** (Senin–Minggu rotation map)

### 🔄 Session Handoff Manager (SESSION-HANDOFF v2.0)
- CRUD handoffs with full 12-section schema
- Auto session_id generation (`YYYY-MM-DD-HHMM-{lane}-session`)
- Paste-ready `[HANDOFF-START]...[HANDOFF-END]` block generator
- Preview without DB write
- Seeded: `2026-05-19-2230-closeout-trilogy` (the genesis handoff)

### ⚖️ Decision Log (DEC-NNNN per v7.0 §06)
- CRUD with status (PROPOSED · ACCEPTED · SUPERSEDED · REJECTED)
- Auto next-id generator (`DEC-NNNN` zero-padded)
- YAML+Markdown export
- Filter by status / lane
- Seeded: DEC-0001 (lock trilogy) · DEC-0002 (Workers Paid Plan) · DEC-0003 (BK Pattern B) · DEC-0004 (Duitku+Xendit) · DEC-0005 (BK D25 cutover)

### 🏁 Sprint Tracker (60-day D2 → D60)
- Sprint progress per-day (week, lane focus AM/PM, status)
- **42 gap matrix** (foundation:5, BK:8, KK:8, PL:8, NU:9, cross:4)
- Health snapshots with auto composite score (8 weighted pillars)
- PATCH endpoints for status updates
- Seeded D2–D7 (Week 0 foundation)

### 🛡️ Doctrine Hardener / Audit
- **Risk checklist runner** — 20-item interactive → verdict (SAFE TO MERGE · HOLD MERGE · NEEDS REVIEW)
- **Doctrine self-audit** — constraint pass/fail + drift signal raised
- **Hardener scan** — input prompt/doctrine snippet → weakness regex scan, severity-tagged findings (OK/INFO/WARN/CRIT)
- All runs persisted in `audit_runs` table

### 🧙 Prompt Builder (5-Layer AIDEV per §30)
- Generates paste-ready system prompt for Genspark AI Developer
- Auto-injects scope (cross/BK/KK/PL/NU), lane, sprint day, deploy target, citations
- Layer 1 Context · 2 Constraints · 3 Spec · 4 Acceptance · 5 Output Format
- Optional save to prompt library

### 📊 Aggregated Dashboard
- `/api/dashboard` — composite handoff count, decision counts by status, gap counts by status, latest health snapshot, sprint day counts.

---

## 🌐 Functional URI Reference

### Public Pages
| URI | Method | Description |
|---|---|---|
| `/` | GET | SPA shell with 9 tabs (Overview · Doctrine · Sprint · Gaps · Handoffs · Decisions · Prompt Builder · Hardener · Artifacts) |

### Health / Aggregate
| URI | Method | Description |
|---|---|---|
| `/api/health` | GET | Service health + doctrine version + trilogy status |
| `/api/dashboard` | GET | Aggregate stats (handoffs · decisions · gaps · health · sprint) |

### Doctrine (read-only)
| URI | Method | Returns |
|---|---|---|
| `/api/doctrine/meta` | GET | DOCTRINE_META |
| `/api/doctrine/version` | GET | Version + status + trilogy list |
| `/api/doctrine/sub-brands` | GET | 4 sub-brands |
| `/api/doctrine/sub-brands/:id` | GET | Single brand (id: barberkas \| kuratorkas \| pacelokal \| nurani) |
| `/api/doctrine/packages` | GET | 6 shared packages |
| `/api/doctrine/constraints` | GET | 16 constraints |
| `/api/doctrine/drift-signals` | GET | Drift signal catalog |
| `/api/doctrine/weaknesses` | GET | 13 weaknesses |
| `/api/doctrine/sprint` | GET | 8-week sprint plan |
| `/api/doctrine/artifacts` | GET | Trilogy artifact pointers |
| `/api/doctrine/aidev-pillars` | GET | 4 AIDEV pillars |
| `/api/doctrine/risk-checklist` | GET | 20-item risk checklist |
| `/api/doctrine/health-pillars` | GET | 8 health pillars |
| `/api/doctrine/cost-targets` | GET | Cost-per-brand targets |
| `/api/doctrine/cadence` | GET | Daily/weekly cadence + lane rotation |
| `/api/doctrine/snapshot` | GET | All-in-one bootstrap snapshot |

### Handoffs (SESSION-HANDOFF v2.0)
| URI | Method | Body / Params |
|---|---|---|
| `/api/handoffs` | GET | List recent 100 |
| `/api/handoffs/:session_id` | GET | Single handoff with parsed JSON fields |
| `/api/handoffs` | POST | Create (returns `raw_block` paste-ready) |
| `/api/handoffs/preview` | POST | Preview block without DB write |
| `/api/handoffs/:session_id` | DELETE | Delete |

### Decisions (DEC-NNNN)
| URI | Method | Description |
|---|---|---|
| `/api/decisions?status=&lane=` | GET | List filtered |
| `/api/decisions/:dec_id` | GET | Single decision |
| `/api/decisions` | POST | Create (requires `dec_id` + `title`) |
| `/api/decisions/:dec_id` | PATCH | Update |
| `/api/decisions/util/next-id` | GET | Next `DEC-NNNN` id |
| `/api/decisions/:dec_id/export` | GET | YAML+Markdown export |

### Sprint
| URI | Method | Description |
|---|---|---|
| `/api/sprint/days` | GET | All sprint days |
| `/api/sprint/days/:day` | GET / PATCH | Single day |
| `/api/sprint/weeks` | GET | Doctrine sprint weeks |
| `/api/sprint/gaps?category=&status=` | GET | Gap matrix |
| `/api/sprint/gaps/:gap_id` | PATCH | Update gap status |
| `/api/sprint/health` | GET | Health snapshots |
| `/api/sprint/health` | POST | Add snapshot (auto-composite) |

### Prompt Builder
| URI | Method | Body |
|---|---|---|
| `/api/prompt/build` | POST | `{ scope, task, lane, sprint_day, cites, save }` → built prompt |
| `/api/prompt/library` | GET | Saved prompts list |
| `/api/prompt/library/:prompt_id` | GET | Single saved prompt |

### Audit / Hardener
| URI | Method | Body |
|---|---|---|
| `/api/audit/risk-check` | POST | `{ target, passed_ids:[], failed_ids:[] }` → verdict |
| `/api/audit/doctrine-self-audit` | POST | `{ check_constraints:{id:bool}, check_drift:{id:bool} }` |
| `/api/audit/hardener-scan` | POST | `{ text, target }` → regex weakness scan |
| `/api/audit/runs?category=` | GET | List audit runs |
| `/api/audit/runs/:run_id` | GET | Run detail |

### Artifacts (static downloads at `/static/artifacts/`)
- `SPARKMIND-CLOSE-OUT-TRILOGY-v1.0.zip`
- `SPARKMIND-AI-DEV-HANDOFF-v1.0.zip`
- `SPARKMIND-SOVEREIGN-MASTER-CONSOLIDATED-BUNDLE-v2.0.zip`
- `MASTER-ARCHITECT-PROMPT-v5.0-FULL-BUNDLE.pdf`

---

## 📦 Data Architecture

### Models (D1 SQLite tables)
1. **handoffs** — Session handoffs (v2.0 12-section schema)
2. **decisions** — DEC-NNNN log (per v7.0 §06)
3. **sprint_progress** — D2–D60 per-day status
4. **gaps** — 42 gaps tracking (P0/P1/P2 by category)
5. **audit_runs** — Risk checklist + doctrine self-audit + hardener scans
6. **prompts** — 5-Layer AIDEV prompt library
7. **health_snapshots** — Composite Sovereign Health Score per-pillar history

### Storage Services
- **Cloudflare D1** (SQLite) — `sparkmind-sovereign-production` (binding: `DB`)
- **Static assets** — `public/static/*` served via `hono/cloudflare-workers` `serveStatic`

### Data Flow
```
[Browser SPA] —fetch—> [Hono API /api/*] —D1Database—> [Cloudflare D1]
                  └─> /static/* (assets + artifact zips)
```

---

## 👤 User Guide

### Tab Navigation (top bar)
1. **Overview** — composite stats, latest health, gap heat map
2. **Doctrine** — 4 sub-brands, 16 constraints, drift signals
3. **Sprint** — 60-day calendar D2 → D60, founder-review Saturdays
4. **Gaps** — 42 gap matrix with category filter
5. **Handoffs** — create / view / paste `[HANDOFF]` blocks
6. **Decisions** — DEC-NNNN log, propose / accept / supersede
7. **Prompt Builder** — generate `@Sovereign-Architect v7.0` prompts for next Genspark session
8. **Hardener** — run risk checklist + doctrine self-audit + paste-prompt scan
9. **Artifacts** — download Close-Out Trilogy bundles

### Typical Session Flow (per v7.0 §06)
1. **Bootstrap** — open Mission Control → load latest handoff → copy invocation hint into new Genspark session
2. **Execute** — work on TASK-N from handoff
3. **Log decisions** — irreversible choices → POST `/api/decisions` with DEC-NNNN
4. **Update gaps** — PATCH `/api/sprint/gaps/:gap_id` `status=resolved` when shipped
5. **Snapshot health** — POST `/api/sprint/health` end-of-day
6. **Close session** — POST `/api/handoffs` → copy `raw_block` → paste into next session

---

## 🚀 Deployment

### Local Development (sandbox)
```bash
cd /home/user/webapp
npm install                                                    # deps installed
npm run build                                                  # vite build → dist/_worker.js
npx wrangler d1 migrations apply sparkmind-sovereign-production --local
npx wrangler d1 execute sparkmind-sovereign-production --local --file=./seed.sql
pm2 start ecosystem.config.cjs                                 # daemon at :3000
curl http://localhost:3000/api/health                          # smoke test
```

### Production (Cloudflare Pages)
```bash
npm run build
npx wrangler d1 create sparkmind-sovereign-production          # one-time, copy db_id into wrangler.jsonc
npx wrangler d1 migrations apply sparkmind-sovereign-production
npx wrangler pages project create sparkmind-sovereign --production-branch main --compatibility-date 2026-04-13
npx wrangler pages deploy dist --project-name sparkmind-sovereign
```

### Status
- **Platform**: Cloudflare Pages (planned) — sandbox preview active
- **Local URL**: see service URL printed by sandbox
- **Tech Stack**: Hono 4.12 + Vite 6 + Cloudflare Workers + D1 + TypeScript strict + TailwindCSS (CDN) + Font Awesome (CDN)
- **Bundle size**: ~96 KB `_worker.js`
- **Last Updated**: 2026-05-20

---

## ❌ Features Not Yet Implemented

1. **Interactive UI for prompt builder layers** (currently API-only; SPA wires `/api/prompt/build`)
2. **Diff viewer** between doctrine versions (v5/v6/v7)
3. **GitHub integration** — auto-create issue per gap
4. **Cloudflare Analytics overlay** on health snapshots
5. **Multi-user auth** (currently single-operator: Haidar)
6. **Markdown editor inline** for decision context/decision/consequences
7. **Sprint Gantt visualization** (currently flat list)
8. **Mobile-optimized handoff paste** (works but no PWA install yet)

---

## 🔜 Recommended Next Steps

### Immediate (next session)
1. ✅ ~~Restore webapp from zip~~ (done)
2. ✅ ~~Build + PM2 + smoke test~~ (done)
3. ✅ ~~Push to GitHub~~ (in progress)
4. 🔄 **Deploy to Cloudflare Pages** with real D1 database id
5. 🔄 **Wire Cloudflare D1 production** + apply migrations remote
6. 🔄 **Add custom domain** `sovereign.sparkmind.web.id` (or similar)

### Week 0 Foundation (D3–D7)
- Claim 4 subdomains in Cloudflare DNS (BK/KK/PL/NU)
- Activate Workers Paid Plan ($5/mo) → unlocks 30ms CPU for KK AI Stylist
- Scaffold monorepo Turborepo + 6 shared packages skeletons
- Wire `@sparkmind/auth` v0.1 + `@sparkmind/pg-router` v0.1
- D7 Sabtu Founder Review

### Mid-sprint (D8–D30)
- BK production cutover D25 (per DEC-0005)
- KK Worker init D17 + AI Stylist MVP D24
- PL Worker init D15 + Verify-Stub D22
- All gaps with deadline ≤ D30 → resolved

### Late sprint (D31–D60)
- NU full launch (Quran reader + Murattal R2 + tadarus)
- Cross-brand observability dashboard
- D60 target: Composite Sovereign Health ≥ 78/100 GREEN

---

## 🏛️ Doctrine Reference

- **MASTER-ARCHITECT-PROMPT v7.0 HARDENED** — `public/static/artifacts/` (PDF) + `/api/doctrine/snapshot`
- **SESSION-HANDOFF v2.0** — 12-section template (route at `/api/handoffs`)
- **FULL-SPRINT-PLAN v1.0** — 60-day sprint with parallel lanes (route at `/api/sprint/weeks`)
- **Repository**: https://github.com/ganihypha/Sovereign-mission-control
- **Mother brand**: https://www.sparkmind.web.id/

---

**Sovereign. Parallel. Hardened.**

— Reza Estes / Haidar · Sovereign AI Dev  
2026-05-20 · Sprint D3/D60
