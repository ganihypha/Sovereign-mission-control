// ═══════════════════════════════════════════════════════════════
// SPARKMIND SOVEREIGN — DOCTRINE DATA (Single Source of Truth)
// Anchor: MASTER-ARCHITECT-PROMPT v7.0 + SESSION-HANDOFF v2.0 + FULL-SPRINT v1.0
// ═══════════════════════════════════════════════════════════════

export const DOCTRINE_META = {
  version: 'v7.0',
  codename: '@Sovereign-Architect v7.0-HARDENED',
  status: 'HARDENED · GENSPARK-AI-DEV-NATIVE',
  date: '2026-05-20',
  owner: 'Reza Estes / Haidar — Sovereign AI Dev',
  motherBrand: 'SparkMind',
  motherUrl: 'https://www.sparkmind.web.id/',
  repo: 'github.com/ganihypha/Sovereign',
  supersedes: 'v6.0 (2026-05-19)',
  hardener: 'Genspark AI Developer audit pass',
  subBrandCount: 4,
  executionMode: 'PARALLEL',
  constraints: 16,
  driftSignals: 22,
  antiPatterns: 22,
  sprintWindow: 'D2 (2026-05-19) → D60 (2026-07-17)',
  sprintDays: 60,
  cycleLayers: 7,
  trilogy: [
    'MASTER-ARCHITECT-PROMPT v7.0',
    'SESSION-HANDOFF v2.0',
    'FULL-SPRINT-PLAN v1.0',
  ],
} as const

export const SUB_BRANDS = [
  {
    id: 'barberkas',
    name: 'BarberKas',
    icon: 'fa-cut',
    color: 'blue',
    accent: '#3b82f6',
    priority: 'P0',
    lane: 'E',
    laneCode: 'EDGE',
    subdomain: 'barberkas.sparkmind.web.id',
    monorepoPath: 'apps/barberkas/',
    positioning: 'Capster utama — Multi-tenant SaaS POS untuk barbershop',
    tagline: 'Multi-tenant POS · Capster Edge',
    scoreNow: 45,
    scoreTarget: 88,
    lifespan: 'D2 → D16 build, D17–D60 hardening',
    revenue: 'Rp 99K/199K/399K per tenant/bulan',
    primaryPG: 'Duitku QRIS',
    secondaryPG: 'Xendit (fallback)',
    revenueTargetD60: 'Rp 1–3 juta/bulan recurring',
    topGaps: ['GAP-BK-1', 'GAP-BK-2', 'GAP-BK-3', 'GAP-BK-5'],
    description: 'Existing code base ada (Hono + Supabase + Fonnte). NEEDS MIGRATION ke D1 per §29.',
    keyFeatures: [
      'Multi-tenant subdomain routing (<tenant>.barberkas...)',
      'Pattern B isolation (tenant_id row-scoping)',
      'POS transaction (cash/QRIS)',
      'Subscription billing (Duitku recurring)',
      'Fonnte WhatsApp reminder',
    ],
    stack: ['Hono', 'D1', 'KV', 'Duitku', 'Fonnte', 'R2'],
  },
  {
    id: 'kuratorkas',
    name: 'KuratorKas',
    icon: 'fa-palette',
    color: 'purple',
    accent: '#a855f7',
    priority: 'P1',
    lane: 'K',
    laneCode: 'KURATOR',
    subdomain: 'kuratorkas.sparkmind.web.id',
    monorepoPath: 'apps/kuratorkas/',
    positioning: 'Sister-brand — AI Stylist + POS UMKM fashion (Curator.OS)',
    tagline: 'Curator.OS · 5-Module AI · Sister Lane',
    scoreNow: 0,
    scoreTarget: 70,
    lifespan: 'D17 → D45 build (paralel BK hardening)',
    revenue: 'Rp 149K/299K/499K per UMKM/bulan',
    primaryPG: 'Duitku QRIS (reused dari BK)',
    secondaryPG: 'Xendit',
    revenueTargetD60: 'Rp 500K–1.5 juta/bulan recurring (10–25 UMKM)',
    topGaps: ['GAP-KK-1', 'GAP-KK-2', 'GAP-KK-3', 'GAP-KK-5'],
    description: 'Reverse-extract ≥80% dari BarberKas (auth, tenant, PG, ui-kit). 5-module Curator.OS MVP.',
    keyFeatures: [
      'AI Stylist Curator (Workers AI vision)',
      'Content Curator (IG caption gen)',
      'Marketplace Curator (Shopee/Tokopedia/TikTok)',
      'Pricing Curator (dynamic price suggest)',
      'Trend Curator (TikTok/IG scraping)',
    ],
    stack: ['Hono', 'D1', 'R2', 'Workers AI', '@sparkmind/curator-os'],
  },
  {
    id: 'pacelokal',
    name: 'PaceLokal',
    icon: 'fa-running',
    color: 'emerald',
    accent: '#10b981',
    priority: 'P2',
    lane: 'B',
    laneCode: 'BANYUMAS',
    subdomain: 'pacelokal.sparkmind.web.id',
    monorepoPath: 'apps/pacelokal/',
    positioning: 'Hobby — Hyperlocal running OS Banyumas Raya',
    tagline: 'Banyumas Running OS · Hyperlocal Defense',
    scoreNow: 10,
    scoreTarget: 81,
    lifespan: 'D15 → D28 build',
    revenue: 'Premium Rp 49K/bulan + race sponsorship',
    primaryPG: 'Free MVP, premium scaffold',
    secondaryPG: 'Duitku (premium)',
    revenueTargetD60: 'Rp 0 (free MVP), premium scaffolded',
    topGaps: ['GAP-PL-1', 'GAP-PL-2', 'GAP-PL-3', 'GAP-PL-8'],
    description: 'Defensibility: Strava blind-spot hyperlocal (Banyumas) + WhatsApp-first onboarding.',
    keyFeatures: [
      'Verify-Stub MVP (no Strava dependency)',
      'Sunday Run Generator (cluster + route picker)',
      'Banyumas route catalog (R2 GPX)',
      'Leaderboard per-kabupaten',
      'WhatsApp-first onboarding (Fonnte)',
    ],
    stack: ['Hono', 'D1', 'R2', 'Strava webhook', 'Fonnte'],
  },
  {
    id: 'nurani-os',
    name: 'Nurani.OS',
    icon: 'fa-mosque',
    color: 'amber',
    accent: '#f59e0b',
    priority: 'P3',
    lane: 'N',
    laneCode: 'NURANI',
    subdomain: 'nurani.os.sparkmind.web.id',
    monorepoPath: 'apps/nurani-os/',
    positioning: 'Devotion — Tadarus-first Pan-Islamic platform (untuk Ibu)',
    tagline: 'Tadarus-First · Pan-Islamic · Ramadhan 1448H Runway',
    scoreNow: 5,
    scoreTarget: 72,
    lifespan: 'D30 → D60 preview (production: Ramadhan 1448H Feb 2027)',
    revenue: 'Donation (Xendit) + Premium Tadarus',
    primaryPG: 'Xendit (donation primary)',
    secondaryPG: 'Duitku (premium)',
    revenueTargetD60: 'Rp 0 (preview only, donation infra ready)',
    topGaps: ['GAP-NU-1', 'GAP-NU-2', 'GAP-NU-3', 'GAP-NU-9'],
    description: 'D60 = preview only. Production target: Ramadhan 1448H (Feb 2027). NU + Muhammadiyah neutral.',
    keyFeatures: [
      'Quran reader (30 juz indexed)',
      'Murattal R2 streaming (5 qari)',
      'Tadarus group (invite link)',
      'Dhikr counter (KV-backed)',
      'No-tracking privacy doctrine',
    ],
    stack: ['Hono', 'D1', 'R2 (Murattal)', 'KV', 'Xendit donation'],
  },
] as const

export const SHARED_PACKAGES = [
  { name: '@sparkmind/core', icon: 'fa-cube', purpose: 'Types, Result monad, env schema, error taxonomy', consumers: 'ALL', status: 'planned', priority: 1 },
  { name: '@sparkmind/auth', icon: 'fa-fingerprint', purpose: 'Magic-link, JWT, sessions, D1 schema', consumers: 'ALL', status: 'planned', priority: 1 },
  { name: '@sparkmind/pg-router', icon: 'fa-credit-card', purpose: 'Duitku/Xendit dual-PG adapter + StubAdapter', consumers: 'BK, KK, NU', status: 'planned', priority: 1 },
  { name: '@sparkmind/ui-kit', icon: 'fa-palette', purpose: 'Shared React components, dark theme tokens', consumers: 'ALL', status: 'planned', priority: 2 },
  { name: '@sparkmind/analytics', icon: 'fa-chart-line', purpose: 'CF Analytics Engine wrapper, privacy-first', consumers: 'ALL (4 datasets)', status: 'planned', priority: 2 },
  { name: '@sparkmind/curator-os', icon: 'fa-robot', purpose: 'Multi-agent AI runtime untuk KuratorKas', consumers: 'KK primary, extensible', status: 'planned', priority: 3 },
] as const

export const CONSTRAINTS = [
  { id: 1, text: 'Stack Lock 100% Cloudflare', critical: true, category: 'stack' },
  { id: 2, text: 'Repo Lock monorepo SSOT (Sparkmind-Sovereign)', critical: true, category: 'repo' },
  { id: 3, text: 'No-Tracking, No-Ads-Default (especially Nurani.OS)', critical: false, category: 'privacy' },
  { id: 4, text: 'Halal-by-Default lintas-stack', critical: true, category: 'identity' },
  { id: 5, text: 'NU + Muhammadiyah Dual-Acceptance (Nurani.OS)', critical: false, category: 'identity' },
  { id: 6, text: 'Public-Safe Doctrine (no PII Nurul/family)', critical: true, category: 'privacy' },
  { id: 7, text: 'Dual-PG Mandatory (Duitku + Xendit)', critical: true, category: 'payment' },
  { id: 8, text: 'Monorepo SSOT — 4 apps minimum', critical: true, category: 'repo' },
  { id: 9, text: 'Single-Operator Scalable', critical: false, category: 'ops' },
  { id: 10, text: 'Revenue-First (path-to-revenue mandatory)', critical: false, category: 'business' },
  { id: 11, text: 'Public-Safe Artifact (no secret leak)', critical: true, category: 'security' },
  { id: 12, text: 'Cost-Aware monthly review', critical: false, category: 'cost' },
  { id: 13, text: '4-Sub-Brand Lock', critical: true, category: 'identity' },
  { id: 14, text: 'Priority Order Lock (BK→KK→PL→NU)', critical: true, category: 'identity' },
  { id: 15, text: 'AIDEV Pillar 4-Stack Mandatory (Direction+Comprehension+Defense+Selection)', critical: true, category: 'discipline', newInV7: true },
  { id: 16, text: 'Smoke Test Before Commit', critical: true, category: 'discipline', newInV7: true },
] as const

export const DRIFT_SIGNALS = [
  // Stack drift (1-5)
  { id: 1, group: 'Stack drift', text: 'Proposal stack non-Cloudflare tanpa sitasi override' },
  { id: 2, group: 'Stack drift', text: 'Multi-repo split (violate monorepo SSOT)' },
  { id: 3, group: 'Stack drift', text: 'Pattern require tim > 1 operator' },
  { id: 4, group: 'Stack drift', text: 'Revenue path = nol' },
  { id: 5, group: 'Stack drift', text: 'Output tanpa sitasi 29-doc anchor' },
  // Identity drift (6-9)
  { id: 6, group: 'Identity drift', text: 'Halal violation (terutama Nurani.OS)' },
  { id: 7, group: 'Identity drift', text: 'PII leak (Nurul / family / private mission)' },
  { id: 8, group: 'Identity drift', text: 'Single-PG lock-in (must dual: Duitku + Xendit)' },
  { id: 9, group: 'Identity drift', text: 'Auto-expand scope ke sub-brand yang tidak diminta' },
  // 4-Brand drift (10-12)
  { id: 10, group: '4-Brand drift', text: 'Skip KuratorKas dari diagram/list (drift 4→3 sub-brand)' },
  { id: 11, group: '4-Brand drift', text: 'Re-order priority tanpa override eksplisit Haidar' },
  { id: 12, group: '4-Brand drift', text: 'Treat Nurani.OS sebagai P1 (drift to v1.0 ordering)' },
  // Execution mode drift (13-15)
  { id: 13, group: 'Execution drift', text: 'Sequential execution mode dianggap default (LOCK = PARALLEL)' },
  { id: 14, group: 'Execution drift', text: 'KK ditunda ke "later phase" (DRIFT — KK paralel BK D17+)' },
  { id: 15, group: 'Execution drift', text: 'Skip reverse-extract dari BK ke KK' },
  // Citation drift (16-19)
  { id: 16, group: 'Citation drift', text: 'Cite doc tanpa version number atau section' },
  { id: 17, group: 'Citation drift', text: 'Sandbag refusal (refuse padahal task valid)' },
  { id: 18, group: 'Citation drift', text: 'Output tanpa Layer-0 Preflight block' },
  { id: 19, group: 'Citation drift', text: 'Push commit tanpa conventional commit message format' },
  // NEW v7.0 (20-22)
  { id: 20, group: 'AIDEV drift (v7.0)', text: 'Over-planning trap: > 50% response di L0–L3', newInV7: true },
  { id: 21, group: 'AIDEV drift (v7.0)', text: 'AIDEV pillar bypass: skip risk checklist (Pilar 3) atau comprehension check', newInV7: true },
  { id: 22, group: 'AIDEV drift (v7.0)', text: 'Stack regression: propose Supabase/external SaaS untuk existing BK code', newInV7: true },
] as const

export const WEAKNESSES = [
  { id: 1, severity: 'CRITICAL', title: 'Tidak ada Genspark AI Dev mode binding', fix: '§27 Genspark Dev Mode Bridge', section: 27 },
  { id: 2, severity: 'CRITICAL', title: 'Tidak ada bootstrap script executable', fix: '§28 (3 scripts paste-ready)', section: 28 },
  { id: 3, severity: 'CRITICAL', title: 'Stack drift: BK existing pakai Supabase', fix: '§29 Migration Plan + shim', section: 29 },
  { id: 4, severity: 'HIGH', title: '10-layer cycle terlalu verbose', fix: '§03 simplified ke 7-layer EXECUTE cycle', section: 3 },
  { id: 5, severity: 'HIGH', title: 'Tidak ada acceptance criteria template per task', fix: '§30 5-Layer AIDEV Prompt Stack', section: 30 },
  { id: 6, severity: 'CRITICAL', title: 'Tidak ada risk gate sebelum merge', fix: '§31 20-item Risk Checklist', section: 31 },
  { id: 7, severity: 'HIGH', title: 'Tidak ada production deployment SOP', fix: '§32 Cloudflare Pages Deploy SOP', section: 32 },
  { id: 8, severity: 'CRITICAL', title: 'Tidak ada secrets management protocol', fix: '§33 .dev.vars + wrangler secrets', section: 33 },
  { id: 9, severity: 'MEDIUM', title: 'Tidak ada cost guardrails per Worker', fix: '§34 Cost Gate + monthly review', section: 34 },
  { id: 10, severity: 'HIGH', title: 'Tidak ada smoke test per sub-brand', fix: '§35 Smoke Test Suite', section: 35 },
  { id: 11, severity: 'MEDIUM', title: 'Citation format lemah (no hash/line)', fix: '§05 reinforced + commit hash + line number', section: 5 },
  { id: 12, severity: 'MEDIUM', title: 'SOS protocol tidak konkret', fix: '§20 expanded 8-step recovery flow', section: 20 },
  { id: 13, severity: 'MEDIUM', title: 'Decision log tanpa schema validation', fix: '§06 YAML frontmatter + JSON schema', section: 6 },
] as const

export const SPRINT_WEEKS = [
  { week: 0, days: 'D2–D7', mantra: 'Foundation dulu. Fork minggu depan.', focus: 'LANE F intense', healthDelta: '28→38', delta: 10, exitGate: 'DNS 4 subdomain live, monorepo final, 6 packages skeleton, CI/CD green, DEC-0001+0002 logged' },
  { week: 1, days: 'D8–D14', mantra: 'Capster lane ignited. Foundation jaga rumah.', focus: 'LANE E fork + F maintain', healthDelta: '38→48', delta: 10, exitGate: 'BK staging live, multi-tenant tested, GAP-Z1+Z2+BK-1 resolved, DEC-0003' },
  { week: 2, days: 'D15–D21', mantra: 'Triple lane ignited. Capster deepening, hobby starts, sister readies.', focus: 'B fork + E deepen + K kickoff', healthDelta: '48→57', delta: 9, exitGate: '3 lanes active, PL+KK staging live, Duitku integrated BK, DEC-0004' },
  { week: 3, days: 'D22–D28', mantra: 'Hobby ship. Sister scale. Capster polish.', focus: 'B finalize + K deepen + E harden', healthDelta: '57→64', delta: 7, exitGate: 'BK production live, PL MVP shipped, KK 1st module live, DEC-0005' },
  { week: 4, days: 'D29–D35', mantra: 'Devotion lane ignited. Sister scaling. Hobby growing.', focus: 'N ignite + K scale + B grow', healthDelta: '64→69', delta: 5, exitGate: 'KK 10 UMKM alpha, NU lane live, PL premium scaffold, DEC-0006' },
  { week: 5, days: 'D36–D42', mantra: 'All four lanes live. Maintain velocity. No drift.', focus: '4-lane full parallel', healthDelta: '69→73', delta: 4, exitGate: 'KK Marketplace live (Shopee), PL Sunday Run executed, NU Quran+Murattal live, DEC-0007' },
  { week: 6, days: 'D43–D49', mantra: 'Sister-brand cap-off. Devotion deepening. Cross-brand surface live.', focus: 'K finalize + N deepen + cross-brand', healthDelta: '73→76', delta: 3, exitGate: 'KK 5-module MVP complete & production, NU Tadarus live, cross-brand auth, DEC-0008+0009' },
  { week: 7, days: 'D50–D56', mantra: 'Devotion preview ready. All-brand polish.', focus: 'N polish + all-brand hardening', healthDelta: '76→77', delta: 1, exitGate: 'NU public preview ready, all-brand scale tested, DEC-0010' },
  { week: 8, days: 'D57–D60', mantra: 'Devotion launches preview. Sprint passes. Ramadhan runway begins.', focus: 'N preview launch + sprint wrap', healthDelta: '77→78', delta: 1, exitGate: 'NU preview LIVE, composite ≥78/100 GREEN = SPRINT PASS' },
] as const

export const ARTIFACTS = [
  { id: 'master-architect-v7', title: 'MASTER-ARCHITECT-PROMPT v7.0 HARDENED', description: 'Canonical doctrine (paste-ready). 16 constraints, 22 drift signals, 7-layer cycle, Genspark-native.', file: 'MASTER-ARCHITECT-PROMPT-v7.0-HARDENED.md', size: '~44 KB', primary: true, category: 'doctrine' },
  { id: 'master-architect-v6', title: 'MASTER-ARCHITECT-PROMPT v6.0', description: 'Previous doctrine (4-brand parallel, non-hardened). Supseded by v7.0.', file: 'MASTER-ARCHITECT-PROMPT-v6.0.md', size: '~41 KB', primary: false, category: 'doctrine' },
  { id: 'session-handoff-v2', title: 'SESSION-HANDOFF v2.0', description: 'Paste-ready session continuation template (12 sections, 4-lane lock).', file: 'SESSION-HANDOFF-v2.0.md', size: '~16 KB', primary: true, category: 'doctrine' },
  { id: 'full-sprint-v1', title: 'FULL-SPRINT-PLAN v1.0', description: 'Day-by-day 60-day execution plan. 5 lanes, 42 gaps tracked, 10 DEC entries, ASCII health trajectory.', file: 'FULL-SPRINT-PLAN-v1.0.md', size: '~34 KB', primary: true, category: 'doctrine' },
  { id: 'bootstrap-sh', title: 'bootstrap.sh', description: 'Executable monorepo init: 4 apps + 6 packages + Turborepo + .sovereign/ + DEC-0001.', file: 'bootstrap.sh', size: '~11 KB', primary: true, category: 'script' },
  { id: 'init-app-sh', title: 'init-app.sh', description: 'Scaffold per sub-brand app dengan Hono + wrangler + D1 + smoke test + ecosystem.config.cjs.', file: 'init-app.sh', size: '~15 KB', primary: true, category: 'script' },
  { id: 'genspark-bootstrap', title: 'genspark-bootstrap-prompt.md', description: 'Paste-ready prompts untuk Genspark AI Developer session bootstrap.', file: 'genspark-bootstrap-prompt.md', size: '~10 KB', primary: true, category: 'prompt' },
  { id: 'hardening-report', title: 'HARDENING-REPORT-v6-to-v7.md', description: '13 kelemahan kritis v6.0 → fix v7.0. Audit trail untuk decision-log.', file: 'HARDENING-REPORT-v6-to-v7.md', size: '~13 KB', primary: false, category: 'report' },
  { id: 'diff-trilogy', title: 'DIFF-REPORT-trilogy-evolution.md', description: 'Diff antara era 3-brand (v5.0) dan era 4-brand parallel (v6.0/v2.0/v1.0).', file: 'DIFF-REPORT-trilogy-evolution.md', size: '~7 KB', primary: false, category: 'report' },
] as const

export const AIDEV_PILLARS = [
  { id: 1, icon: '🎯', name: 'Direction', source: 'Doc-AIDEV-A v1.0', outcome: 'Zero ambiguity di input. 5-layer prompt scaffold.', layers: ['L1 Context', 'L2 Constraints', 'L3 Spec', 'L4 Acceptance', 'L5 Output Format'] },
  { id: 2, icon: '📚', name: 'Comprehension', source: 'Doc-AIDEV-B v1.0', outcome: 'Zero blindness di output. 10h tech vocab curriculum.', layers: ['Stack vocab', 'Workers/D1/R2/KV', 'Hono patterns', 'CF deploy lifecycle'] },
  { id: 3, icon: '🛡️', name: 'Defense', source: 'Doc-AIDEV-C v1.0', outcome: 'Zero disaster di prod. 20-item risk checklist.', layers: ['SEC (6 items)', 'DATA (5 items)', 'CODE (5 items)', 'COST (4 items)'] },
  { id: 4, icon: '⚙️', name: 'Selection', source: 'Doc-AIDEV-D v1.0', outcome: 'Zero waste di tooling. Genspark→Claude Code→Cursor.', layers: ['Genspark AI Dev', 'Claude Code Pro', 'Cursor IDE', 'GitHub web'] },
] as const

export const RISK_CHECKLIST = [
  // SEC (6, P0)
  { id: 1, category: 'SEC', priority: 'P0', text: 'No hardcoded secrets (grep sk-|API_KEY=|password=|Bearer\\s+\\w{20,})', anchor: '§31.SEC-1' },
  { id: 2, category: 'SEC', priority: 'P0', text: 'Auth middleware di setiap /api/* route (kecuali /api/health, /api/webhook/*)', anchor: '§31.SEC-2' },
  { id: 3, category: 'SEC', priority: 'P0', text: 'No SQL injection (pakai D1 prepared statement .prepare().bind())', anchor: '§31.SEC-3' },
  { id: 4, category: 'SEC', priority: 'P0', text: 'No CORS wildcard (Access-Control-Allow-Origin: *) for private API', anchor: '§31.SEC-4' },
  { id: 5, category: 'SEC', priority: 'P0', text: 'User input validated dengan Zod/Valibot schema', anchor: '§31.SEC-5' },
  { id: 6, category: 'SEC', priority: 'P0', text: 'Rate limiting di high-cost endpoints (KV-backed counter)', anchor: '§31.SEC-6' },
  // DATA (5, P0/P1)
  { id: 7, category: 'DATA', priority: 'P0', text: 'Migrations forward-only, no DROP TABLE di production migration', anchor: '§31.DATA-1' },
  { id: 8, category: 'DATA', priority: 'P0', text: 'Tenant isolation: WHERE tenant_id = ? mandatory di multi-tenant queries', anchor: '§31.DATA-2' },
  { id: 9, category: 'DATA', priority: 'P1', text: 'Backup strategy: D1 export weekly to R2', anchor: '§31.DATA-3' },
  { id: 10, category: 'DATA', priority: 'P1', text: 'Foreign key constraints di D1 schema', anchor: '§31.DATA-4' },
  { id: 11, category: 'DATA', priority: 'P0', text: 'No silent data loss (UPDATE without WHERE = reject)', anchor: '§31.DATA-5' },
  // CODE (5, P1)
  { id: 12, category: 'CODE', priority: 'P1', text: 'TypeScript strict mode pass', anchor: '§31.CODE-1' },
  { id: 13, category: 'CODE', priority: 'P1', text: 'No any types kecuali third-party API response', anchor: '§31.CODE-2' },
  { id: 14, category: 'CODE', priority: 'P1', text: 'Error boundaries: try/catch around external API calls (Fonnte/Duitku/Xendit)', anchor: '§31.CODE-3' },
  { id: 15, category: 'CODE', priority: 'P1', text: 'Logging: console.log dengan tag [MODULE] untuk traceability', anchor: '§31.CODE-4' },
  { id: 16, category: 'CODE', priority: 'P1', text: 'Conventional commit message (feat:, fix:, refactor:, chore:)', anchor: '§31.CODE-5' },
  // COST (4, P1/P2)
  { id: 17, category: 'COST', priority: 'P1', text: 'Worker CPU time ≤ 10ms (free) atau ≤ 30ms (paid) per request', anchor: '§31.COST-1' },
  { id: 18, category: 'COST', priority: 'P1', text: 'No infinite loops atau unbounded recursion', anchor: '§31.COST-2' },
  { id: 19, category: 'COST', priority: 'P2', text: 'Cache hit ratio target ≥ 80% for static assets (CF Pages auto)', anchor: '§31.COST-3' },
  { id: 20, category: 'COST', priority: 'P2', text: 'Monthly cost review: each route CF Analytics request count', anchor: '§31.COST-4' },
] as const

export const HEALTH_PILLARS = [
  { id: 'cross_brand', name: 'Cross-Brand', weight: 14, description: 'Shared infra, observability, persona surface' },
  { id: 'barberkas', name: 'BarberKas (P0)', weight: 20, description: 'Multi-tenant POS production-readiness' },
  { id: 'kuratorkas', name: 'KuratorKas (P1)', weight: 12, description: 'Curator.OS 5-module MVP + alpha cohort' },
  { id: 'pacelokal', name: 'PaceLokal (P2)', weight: 10, description: 'Banyumas community + Sunday Run' },
  { id: 'nurani_os', name: 'Nurani.OS (P3)', weight: 8, description: 'Preview + Ramadhan 1448H runway' },
  { id: 'engineering_discipline', name: 'Engineering Discipline', weight: 12, description: 'CI/CD, tests, decision-log, conventional commits' },
  { id: 'pg_router', name: 'Payment Gateway', weight: 12, description: 'Duitku + Xendit dual integration health' },
  { id: 'doctrine', name: 'Doctrine', weight: 12, description: 'Trilogy lock, citation discipline, drift detection' },
] as const

export const COST_TARGETS = [
  { brand: 'BarberKas', workerReq: '50K', d1: '100K/20K', r2: '50 MB', target: '$5/mo' },
  { brand: 'KuratorKas', workerReq: '30K', d1: '60K/15K', r2: '500 MB', target: '$15/mo (AI inference)' },
  { brand: 'PaceLokal', workerReq: '20K', d1: '40K/10K', r2: '200 MB (GPX)', target: '$3/mo' },
  { brand: 'Nurani.OS', workerReq: '10K', d1: '20K/5K', r2: '1 GB (Murattal)', target: '$8/mo' },
  { brand: 'TOTAL', workerReq: '110K', d1: '220K/50K', r2: '1.75 GB', target: '~$31/mo' },
] as const

export const SOVEREIGN_CADENCE = [
  { time: '05:30', activity: 'Wake + sholat Subuh', type: 'spiritual' },
  { time: '06:00', activity: 'Deep work block 1 (highest-priority lane) — 2h 30m', type: 'deep-work' },
  { time: '08:30', activity: 'Coffee + brief review (15m)', type: 'break' },
  { time: '08:45', activity: 'Decision-log delta entry (15m)', type: 'admin' },
  { time: '09:00', activity: 'Deep work block 2 (second-priority lane) — 2h', type: 'deep-work' },
  { time: '11:00', activity: 'Final lane status update + handoff prep (30m)', type: 'admin' },
  { time: '11:30', activity: 'Family / Ibu / Nurul time — NO CODE', type: 'family' },
] as const

export const LANE_ROTATION = [
  { day: 'Senin', am: 'E (BK)', pm: 'F (Foundation)' },
  { day: 'Selasa', am: 'K (KK)', pm: 'E (BK)' },
  { day: 'Rabu', am: 'B (PL)', pm: 'K (KK)' },
  { day: 'Kamis', am: 'N (NU)', pm: 'B (PL)' },
  { day: 'Jumat', am: 'F (Foundation)', pm: 'N (NU)' },
  { day: 'Sabtu', am: 'Founder Review', pm: 'Light catchup (no deep work)' },
  { day: 'Minggu', am: 'OFF', pm: 'OFF (rekoveri + family)' },
] as const
