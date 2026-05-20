import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { renderer } from './renderer'
import type { AppEnv } from './types'

import doctrineRoutes from './routes/doctrine'
import handoffRoutes from './routes/handoffs'
import decisionRoutes from './routes/decisions'
import sprintRoutes from './routes/sprint'
import promptRoutes from './routes/prompt'
import auditRoutes from './routes/audit'

// ═══════════════════════════════════════════════════════════════
// 🛡️  SPARKMIND SOVEREIGN MISSION CONTROL v7.0
// Anchor: MASTER-ARCHITECT-PROMPT v7.0 (HARDENED)
// Owner: Reza Estes / Haidar — Sovereign AI Dev
// ═══════════════════════════════════════════════════════════════

const app = new Hono<AppEnv>()

app.use(logger())
app.use('/api/*', cors())
app.use(renderer)

// ─── Health ───────────────────────────────────────────────────
app.get('/api/health', (c) => c.json({
  status: 'ok',
  app: 'sparkmind-sovereign-mission-control',
  doctrine: 'MASTER-ARCHITECT-PROMPT v7.0 HARDENED',
  trilogy: ['v7.0', 'v2.0', 'v1.0'],
  parallel_mode: true,
  sub_brands: 4,
  timestamp: new Date().toISOString(),
}))

// ─── Mount API routes ─────────────────────────────────────────
app.route('/api/doctrine', doctrineRoutes)
app.route('/api/handoffs', handoffRoutes)
app.route('/api/decisions', decisionRoutes)
app.route('/api/sprint', sprintRoutes)
app.route('/api/prompt', promptRoutes)
app.route('/api/audit', auditRoutes)

// ─── Aggregated dashboard data ────────────────────────────────
app.get('/api/dashboard', async (c) => {
  try {
    const [handoffsR, decisionsR, gapsR, healthR, daysR] = await Promise.all([
      c.env.DB.prepare(`SELECT COUNT(*) as n FROM handoffs`).first<{ n: number }>(),
      c.env.DB.prepare(`SELECT COUNT(*) as n, status FROM decisions GROUP BY status`).all(),
      c.env.DB.prepare(`SELECT COUNT(*) as n, status FROM gaps GROUP BY status`).all(),
      c.env.DB.prepare(`SELECT * FROM health_snapshots ORDER BY snapshot_date DESC LIMIT 1`).first(),
      c.env.DB.prepare(`SELECT COUNT(*) as n, status FROM sprint_progress GROUP BY status`).all(),
    ])
    return c.json({
      handoffs: handoffsR?.n || 0,
      decisions: decisionsR.results,
      gaps: gapsR.results,
      latest_health: healthR,
      sprint_days: daysR.results,
    })
  } catch (e: any) {
    return c.json({ error: e.message, fallback: true }, 200)
  }
})

// ─── Main HTML page (SPA shell) ───────────────────────────────
app.get('/', (c) => {
  return c.render(
    <>
      <div id="app">
        {/* Top Nav */}
        <nav class="border-b border-slate-800 bg-sovereign-900/80 backdrop-blur sticky top-0 z-50">
          <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="text-2xl">🛡️</div>
              <div>
                <div class="font-bold text-white text-sm md:text-base">SparkMind Sovereign</div>
                <div class="text-[10px] md:text-xs text-slate-400 font-mono">Mission Control · v7.0 HARDENED</div>
              </div>
            </div>
            <div class="flex items-center gap-2 md:gap-4">
              <span id="health-badge" class="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-red-500/10 text-red-400 border border-red-500/30 font-mono">
                <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span id="health-score">28</span>/100 RED
              </span>
              <span class="hidden md:inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                D<span id="sprint-day">3</span>/D60
              </span>
              <a href="https://github.com/ganihypha/Sparkmind-Sovereign" target="_blank" class="text-slate-400 hover:text-white text-sm">
                <i class="fab fa-github text-lg"></i>
              </a>
            </div>
          </div>
          {/* Tab Bar */}
          <div class="max-w-7xl mx-auto px-2 md:px-4 flex gap-1 overflow-x-auto scrollbar-none">
            {[
              ['overview', 'fa-gauge-high', 'Overview'],
              ['doctrine', 'fa-scroll', 'Doctrine'],
              ['sprint', 'fa-flag-checkered', 'Sprint'],
              ['gaps', 'fa-list-check', 'Gaps'],
              ['handoffs', 'fa-handshake', 'Handoffs'],
              ['decisions', 'fa-gavel', 'Decisions'],
              ['prompt', 'fa-wand-magic-sparkles', 'Prompt Builder'],
              ['hardener', 'fa-shield', 'Hardener'],
              ['artifacts', 'fa-folder-tree', 'Artifacts'],
            ].map(([id, icon, label]) => (
              <button
                data-tab={id}
                class="tab-btn whitespace-nowrap px-3 py-2 text-xs md:text-sm border-b-2 border-transparent text-slate-400 hover:text-white hover:border-slate-600 transition flex items-center gap-2"
              >
                <i class={`fas ${icon}`}></i>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main Content */}
        <main class="max-w-7xl mx-auto px-4 py-6 md:py-8">
          <div id="view-content">
            <div class="text-center py-20 text-slate-500">
              <i class="fas fa-spinner fa-spin text-3xl"></i>
              <p class="mt-4">Loading Sovereign doctrine...</p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer class="border-t border-slate-800 mt-12 py-6 text-center text-xs text-slate-500 font-mono">
          <div>SparkMind Sovereign — Mission Control · MASTER-ARCHITECT-PROMPT v7.0 HARDENED</div>
          <div class="mt-1">Owner: Reza Estes / Haidar · Sprint D2 (2026-05-19) → D60 (2026-07-17) · 4 lane PARALLEL</div>
          <div class="mt-2 flex justify-center gap-4">
            <a class="hover:text-slate-300" href="/api/health">/api/health</a>
            <a class="hover:text-slate-300" href="/api/doctrine/snapshot">/api/doctrine/snapshot</a>
            <a class="hover:text-slate-300" href="/api/dashboard">/api/dashboard</a>
          </div>
        </footer>
      </div>

      <script src="/static/app.js"></script>
    </>
  )
})

export default app
