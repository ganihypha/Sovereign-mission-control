// ═══════════════════════════════════════════════════════════════
// SparkMind Sovereign — Mission Control (Frontend SPA)
// ═══════════════════════════════════════════════════════════════
(() => {
'use strict';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const view = $('#view-content');

// ─── Toast ────────────────────────────────────────────────────
let toastRoot = document.getElementById('toast-root');
if (!toastRoot) { toastRoot = document.createElement('div'); toastRoot.id = 'toast-root'; document.body.appendChild(toastRoot); }
function toast(msg, kind = 'info', ttl = 3500) {
  const el = document.createElement('div');
  el.className = `toast toast-${kind}`;
  el.innerHTML = `<div class="font-medium">${msg}</div>`;
  toastRoot.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(20px)'; setTimeout(() => el.remove(), 250); }, ttl);
}

// ─── API helper ───────────────────────────────────────────────
async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  if (!res.ok) {
    const msg = (body && body.error) || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return body;
}

// ─── Escape ───────────────────────────────────────────────────
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ─── State ────────────────────────────────────────────────────
const state = { tab: 'overview', data: {} };

// ─── Cache doctrine snapshot once ─────────────────────────────
async function loadSnapshot() {
  if (state.data.snapshot) return state.data.snapshot;
  try {
    const [snap, brands, packages, weak, drift, aidev, risk, costs, cadence, gaps] = await Promise.all([
      api('/api/doctrine/snapshot'),
      api('/api/doctrine/sub-brands'),
      api('/api/doctrine/packages'),
      api('/api/doctrine/weaknesses'),
      api('/api/doctrine/drift-signals'),
      api('/api/doctrine/aidev-pillars'),
      api('/api/doctrine/risk-checklist'),
      api('/api/doctrine/cost-targets'),
      api('/api/doctrine/cadence'),
      api('/api/sprint/gaps'),
    ]);
    state.data.snapshot = { snap, brands: brands.subBrands, packages: packages.packages, weaknesses: weak.weaknesses, drift: drift.signals, aidev: aidev.pillars, risk: risk.checklist, costs: costs.targets, cadence, gaps };
    return state.data.snapshot;
  } catch (e) {
    toast('Failed to load doctrine: ' + e.message, 'error');
    throw e;
  }
}

// ─── Tab routing ──────────────────────────────────────────────
function setActiveTab(tab) {
  state.tab = tab;
  $$('.tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === tab));
  history.replaceState(null, '', `#${tab}`);
  render();
}

$$('.tab-btn').forEach((b) => b.addEventListener('click', () => setActiveTab(b.dataset.tab)));

window.addEventListener('hashchange', () => {
  const t = location.hash.replace('#', '') || 'overview';
  if (t !== state.tab) setActiveTab(t);
});

// ─── Render dispatch ──────────────────────────────────────────
async function render() {
  view.innerHTML = `<div class="text-center py-20 text-slate-500"><i class="fas fa-spinner fa-spin text-3xl"></i><p class="mt-4">Loading ${state.tab}...</p></div>`;
  try {
    switch (state.tab) {
      case 'overview': await renderOverview(); break;
      case 'doctrine': await renderDoctrine(); break;
      case 'sprint': await renderSprint(); break;
      case 'gaps': await renderGaps(); break;
      case 'handoffs': await renderHandoffs(); break;
      case 'decisions': await renderDecisions(); break;
      case 'prompt': await renderPromptBuilder(); break;
      case 'hardener': await renderHardener(); break;
      case 'artifacts': await renderArtifacts(); break;
      default: view.innerHTML = '<p>Unknown tab</p>';
    }
  } catch (e) {
    view.innerHTML = `<div class="card border-red-500/40"><div class="text-red-400 font-bold"><i class="fas fa-triangle-exclamation"></i> Error</div><pre class="mt-2 text-xs">${esc(e.message)}</pre></div>`;
  }
}

// ═════════════════════════════════════════════════════════════
// VIEW: OVERVIEW
// ═════════════════════════════════════════════════════════════
async function renderOverview() {
  const { snap, brands, packages, aidev } = await loadSnapshot();
  const dash = await api('/api/dashboard').catch(() => ({}));
  const meta = snap.meta;

  // Try parse decisions count
  let decAccepted = 0, decProposed = 0;
  for (const r of (dash.decisions || [])) {
    if (r.status === 'ACCEPTED') decAccepted = r.n;
    if (r.status === 'PROPOSED') decProposed = r.n;
  }
  let gapsOpen = 0, gapsResolved = 0;
  for (const r of (dash.gaps || [])) {
    if (r.status === 'open') gapsOpen = r.n;
    if (r.status === 'resolved') gapsResolved = r.n;
  }

  const latestHealth = dash.latest_health || { composite: 28, status: 'RED' };
  updateTopBar(latestHealth.composite, latestHealth.status, 3);

  view.innerHTML = `
    <!-- Hero -->
    <section class="mb-8">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
        <div>
          <div class="text-xs font-mono text-slate-500 mb-1">@Sovereign-Architect ${meta.version} · ${meta.status}</div>
          <h1 class="text-3xl md:text-4xl font-extrabold text-white tracking-tight">Mission Control</h1>
          <p class="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
            Trilogy execution dashboard untuk <span class="text-white font-semibold">SparkMind Sovereign Ecosystem</span> — 
            4 sub-brand paralel, 60-hari sprint, doctrine v7.0 HARDENED.
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <span class="badge badge-blue">PARALLEL MODE</span>
          <span class="badge badge-emerald">${meta.subBrandCount} SUB-BRANDS</span>
          <span class="badge badge-purple">${meta.constraints} CONSTRAINTS</span>
          <span class="badge badge-amber">${meta.driftSignals} DRIFT SIGNALS</span>
        </div>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        ${kpi('Composite Health', `${latestHealth.composite}/100`, latestHealth.status, statusColor(latestHealth.status), 'fa-heart-pulse')}
        ${kpi('Sprint Day', 'D3/D60', 'D2→D60', 'text-emerald-400', 'fa-flag-checkered')}
        ${kpi('Gaps Open', String(gapsOpen), `of 42 (${gapsResolved} resolved)`, 'text-amber-400', 'fa-list-check')}
        ${kpi('Decisions', `${decAccepted}+${decProposed}`, `accepted + proposed`, 'text-blue-400', 'fa-gavel')}
      </div>
    </section>

    <!-- 4-Sub-brand Cards -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-white"><i class="fas fa-cubes mr-2 text-blue-400"></i>4 Sub-Brands · Parallel Lanes</h2>
        <button onclick="setActiveTab('doctrine')" class="text-xs text-blue-400 hover:underline">View doctrine →</button>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${brands.map((b) => brandCard(b)).join('')}
      </div>
    </section>

    <!-- Quick Actions -->
    <section class="mb-10">
      <h2 class="text-xl font-bold text-white mb-4"><i class="fas fa-bolt mr-2 text-yellow-400"></i>Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        ${quickAction('Generate Handoff', 'Create v2.0 session handoff block (paste-ready)', 'fa-handshake', 'blue', "setActiveTab('handoffs')")}
        ${quickAction('Build Prompt', '5-Layer AIDEV prompt for next session', 'fa-wand-magic-sparkles', 'purple', "setActiveTab('prompt')")}
        ${quickAction('Run Risk Audit', '20-item checklist before merge', 'fa-shield', 'emerald', "setActiveTab('hardener')")}
        ${quickAction('Log Decision', 'New DEC-NNNN entry', 'fa-gavel', 'amber', "setActiveTab('decisions')")}
        ${quickAction('Track Sprint', '60-day timeline + 42 gaps', 'fa-flag-checkered', 'blue', "setActiveTab('sprint')")}
        ${quickAction('View Artifacts', 'Trilogy docs + bootstrap scripts', 'fa-folder-tree', 'purple', "setActiveTab('artifacts')")}
      </div>
    </section>

    <!-- AIDEV Pillars -->
    <section class="mb-10">
      <h2 class="text-xl font-bold text-white mb-4"><i class="fas fa-layer-group mr-2 text-purple-400"></i>AIDEV Pillars · 4-Stack (Constraint #15)</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${aidev.map((p) => `
          <div class="card">
            <div class="text-3xl mb-2">${p.icon}</div>
            <div class="font-bold text-white">${esc(p.name)}</div>
            <div class="text-[10px] font-mono text-slate-500 mt-0.5">${esc(p.source)}</div>
            <p class="text-xs text-slate-400 mt-2">${esc(p.outcome)}</p>
            <div class="mt-3 space-y-1">
              ${(p.layers || []).map((l) => `<div class="text-[10px] text-slate-500"><i class="fas fa-check text-emerald-500 text-[8px] mr-1"></i>${esc(l)}</div>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Shared packages -->
    <section class="mb-10">
      <h2 class="text-xl font-bold text-white mb-4"><i class="fas fa-cube mr-2 text-emerald-400"></i>6 Shared Packages · @sparkmind/*</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        ${packages.map((p) => `
          <div class="card flex items-start gap-3">
            <div class="text-2xl text-emerald-400"><i class="fas ${p.icon || 'fa-cube'}"></i></div>
            <div class="flex-1 min-w-0">
              <div class="font-mono text-sm text-white truncate">${esc(p.name)}</div>
              <div class="text-xs text-slate-400 mt-1">${esc(p.purpose)}</div>
              <div class="text-[10px] text-slate-500 mt-2 flex items-center gap-2">
                <span class="badge badge-slate">${esc(p.consumers)}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </section>

    <!-- Mantra -->
    <section class="mb-10">
      <div class="card text-center bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <div class="text-xs font-mono text-slate-500 mb-2">MANTRA · FULL-SPRINT-PLAN v1.0 §00</div>
        <blockquote class="text-lg md:text-xl text-white font-medium italic">
          "Empat lane jalan barengan. Foundation dulu seminggu, lalu fork.<br/>
          Capster live D16. Sister-brand reverse-extract D17.<br/>
          Hobby MVP D28. Devotion preview D60.<br/>
          <span class="text-blue-400 font-bold not-italic">Lock. Execute.</span>"
        </blockquote>
      </div>
    </section>
  `;
}

function kpi(label, value, sub, colorClass, icon) {
  return `
    <div class="card">
      <div class="flex items-center justify-between mb-2">
        <div class="text-xs uppercase text-slate-500 font-bold tracking-wider">${esc(label)}</div>
        <i class="fas ${icon} ${colorClass}"></i>
      </div>
      <div class="text-2xl font-bold text-white">${esc(value)}</div>
      <div class="text-[11px] text-slate-500 mt-1">${esc(sub)}</div>
    </div>`;
}

function statusColor(s) {
  return s === 'GREEN' ? 'text-emerald-400' : s === 'AMBER' ? 'text-amber-400' : 'text-red-400';
}

function brandCard(b) {
  const pct = Math.round((b.scoreNow / 100) * 100);
  const colorMap = { blue: '#3b82f6', purple: '#a855f7', emerald: '#10b981', amber: '#f59e0b' };
  const c = b.accent || colorMap[b.color] || '#3b82f6';
  return `
    <div class="card brand-${b.color}" style="border-top: 3px solid ${c}">
      <div class="flex items-start justify-between mb-3">
        <div class="flex items-center gap-2">
          <i class="fas ${b.icon}" style="color: ${c}"></i>
          <div>
            <div class="font-bold text-white">${esc(b.name)}</div>
            <div class="text-[10px] font-mono text-slate-500">${esc(b.subdomain)}</div>
          </div>
        </div>
        <span class="badge badge-${b.color === 'amber' ? 'amber' : b.color === 'emerald' ? 'emerald' : b.color === 'purple' ? 'purple' : 'blue'}">${esc(b.priority)}</span>
      </div>
      <p class="text-xs text-slate-400 mb-3 min-h-[40px]">${esc(b.tagline || b.positioning)}</p>
      <div class="flex items-center justify-between text-xs mb-1">
        <span class="text-slate-400">Health</span>
        <span class="font-mono"><span class="text-white">${b.scoreNow}</span><span class="text-slate-500">/${b.scoreTarget}</span></span>
      </div>
      <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
        <div class="h-full rounded-full" style="width: ${(b.scoreNow/b.scoreTarget*100).toFixed(0)}%; background: ${c}"></div>
      </div>
      <div class="text-[10px] space-y-1 text-slate-500">
        <div><i class="fas fa-route w-3 mr-1"></i>LANE ${b.lane} · ${esc(b.lifespan)}</div>
        <div><i class="fas fa-coins w-3 mr-1"></i>${esc(b.revenue)}</div>
      </div>
      <button onclick="window.__brandDetail('${b.id}')" class="btn btn-secondary btn-sm w-full mt-3 justify-center">
        Detail <i class="fas fa-arrow-right text-[10px]"></i>
      </button>
    </div>`;
}

function quickAction(title, desc, icon, color, onclick) {
  return `
    <button onclick="${onclick}" class="card text-left hover:border-${color}-500/50 cursor-pointer transition group">
      <div class="flex items-start gap-3">
        <div class="text-2xl text-${color}-400 group-hover:scale-110 transition"><i class="fas ${icon}"></i></div>
        <div class="flex-1">
          <div class="font-bold text-white text-sm">${esc(title)}</div>
          <div class="text-xs text-slate-400 mt-1">${esc(desc)}</div>
        </div>
        <i class="fas fa-chevron-right text-slate-600 group-hover:text-white"></i>
      </div>
    </button>`;
}

// Top bar updater
function updateTopBar(health, status, day) {
  const score = $('#health-score');
  const day$ = $('#sprint-day');
  const badge = $('#health-badge');
  if (score) score.textContent = String(health);
  if (day$) day$.textContent = String(day);
  if (badge) {
    badge.className = `hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono ${
      status === 'GREEN' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
      : status === 'AMBER' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
      : 'bg-red-500/10 text-red-400 border border-red-500/30'
    }`;
    const dot = status === 'GREEN' ? 'bg-emerald-500' : status === 'AMBER' ? 'bg-amber-500' : 'bg-red-500';
    badge.innerHTML = `<span class="w-2 h-2 rounded-full ${dot} animate-pulse"></span><span id="health-score">${health}</span>/100 ${status}`;
  }
}

// ═════════════════════════════════════════════════════════════
// VIEW: DOCTRINE
// ═════════════════════════════════════════════════════════════
async function renderDoctrine() {
  const { snap, brands, packages, weaknesses, drift, aidev } = await loadSnapshot();
  const constraints = await api('/api/doctrine/constraints');
  const meta = snap.meta;

  view.innerHTML = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">📜 Doctrine · MASTER-ARCHITECT-PROMPT ${meta.version}</h1>
      <p class="text-slate-400 mt-1 text-sm">${esc(meta.codename)} · ${esc(meta.status)} · ${esc(meta.date)}</p>
    </div>

    <!-- Meta panel -->
    <div class="card mb-6">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-circle-info text-blue-400 mr-2"></i>Doctrine Meta</h2>
      <dl class="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-2 text-sm">
        <div><dt class="text-slate-500 text-xs">Owner</dt><dd>${esc(meta.owner)}</dd></div>
        <div><dt class="text-slate-500 text-xs">Mother Brand</dt><dd><a href="${esc(meta.motherUrl)}" target="_blank" class="text-blue-400 hover:underline">${esc(meta.motherBrand)}</a></dd></div>
        <div><dt class="text-slate-500 text-xs">Repo</dt><dd class="font-mono text-xs">${esc(meta.repo)}</dd></div>
        <div><dt class="text-slate-500 text-xs">Sprint Window</dt><dd>${esc(meta.sprintWindow)}</dd></div>
        <div><dt class="text-slate-500 text-xs">Cycle</dt><dd>${meta.cycleLayers}-layer EXECUTE</dd></div>
        <div><dt class="text-slate-500 text-xs">Mode</dt><dd class="text-blue-400 font-bold">${esc(meta.executionMode)}</dd></div>
      </dl>
      <div class="mt-4 pt-4 border-t border-slate-800">
        <div class="text-xs text-slate-500 mb-2">Close-Out Trilogy:</div>
        <div class="flex flex-wrap gap-2">${meta.trilogy.map((t) => `<span class="badge badge-blue">${esc(t)}</span>`).join('')}</div>
      </div>
    </div>

    <!-- Constraints -->
    <div class="card mb-6">
      <h2 class="font-bold text-white mb-3 flex items-center justify-between">
        <span><i class="fas fa-lock text-red-400 mr-2"></i>${constraints.total} Hardcoded Constraints</span>
        <span class="badge badge-red">CRITICAL: ${constraints.constraints.filter((c) => c.critical).length}</span>
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        ${constraints.constraints.map((c) => `
          <div class="flex items-start gap-2 p-2 rounded hover:bg-slate-800/50 ${c.critical ? 'border-l-2 border-red-500/60' : 'border-l-2 border-slate-700'}">
            <span class="font-mono text-xs ${c.critical ? 'text-red-400' : 'text-slate-500'} w-6 shrink-0">#${c.id}</span>
            <span class="text-xs ${c.critical ? 'text-white' : 'text-slate-400'}">${esc(c.text)}</span>
            ${c.newInV7 ? '<span class="badge badge-purple text-[9px] ml-auto">NEW v7</span>' : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Drift Signals -->
    <div class="card mb-6">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-triangle-exclamation text-amber-400 mr-2"></i>${drift.length} Drift Signals</h2>
      ${Object.entries(drift.reduce((acc, d) => { (acc[d.group] = acc[d.group] || []).push(d); return acc; }, {})).map(([group, signals]) => `
        <div class="mb-3">
          <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">${esc(group)}</div>
          <ul class="space-y-1 text-xs">
            ${signals.map((s) => `<li class="flex gap-2"><span class="font-mono text-slate-500 w-6">#${s.id}</span><span class="text-slate-300">${esc(s.text)}</span>${s.newInV7 ? '<span class="badge badge-purple text-[9px]">NEW v7</span>' : ''}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
    </div>

    <!-- Weaknesses Fixed -->
    <div class="card mb-6">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-bandage text-emerald-400 mr-2"></i>${weaknesses.length} Weaknesses Fixed (v6→v7 Hardening)</h2>
      <div class="space-y-2">
        ${weaknesses.map((w) => `
          <div class="flex items-start gap-3 p-2 rounded hover:bg-slate-800/50">
            <span class="badge ${w.severity === 'CRITICAL' ? 'badge-red' : w.severity === 'HIGH' ? 'badge-amber' : 'badge-slate'} shrink-0">${esc(w.severity)}</span>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-white">${esc(w.title)}</div>
              <div class="text-xs text-emerald-400 mt-0.5"><i class="fas fa-check-circle mr-1"></i>${esc(w.fix)}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Sub-brand deep dive -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6" id="sub-brand-details">
      ${brands.map((b) => brandDetail(b)).join('')}
    </div>
  `;
}

function brandDetail(b) {
  const colorMap = { blue: '#3b82f6', purple: '#a855f7', emerald: '#10b981', amber: '#f59e0b' };
  const c = b.accent || colorMap[b.color];
  return `
    <div class="card" style="border-top: 3px solid ${c}">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <i class="fas ${b.icon} text-xl" style="color: ${c}"></i>
          <div>
            <div class="font-bold text-white text-lg">${esc(b.name)} <span class="badge badge-slate ml-1">${esc(b.priority)}</span></div>
            <div class="text-[10px] font-mono text-slate-500">${esc(b.subdomain)}</div>
          </div>
        </div>
        <span class="badge badge-blue">LANE ${b.lane}</span>
      </div>
      <p class="text-sm text-slate-300 mb-3">${esc(b.positioning)}</p>
      <dl class="text-xs grid grid-cols-1 md:grid-cols-2 gap-y-2 mb-3">
        <div><dt class="text-slate-500">Path</dt><dd class="font-mono">${esc(b.monorepoPath)}</dd></div>
        <div><dt class="text-slate-500">Lifespan</dt><dd>${esc(b.lifespan)}</dd></div>
        <div><dt class="text-slate-500">Revenue</dt><dd>${esc(b.revenue)}</dd></div>
        <div><dt class="text-slate-500">PG</dt><dd>${esc(b.primaryPG)}</dd></div>
      </dl>
      <div class="text-xs text-slate-400 mb-2">Stack:</div>
      <div class="flex flex-wrap gap-1 mb-3">${(b.stack || []).map((s) => `<span class="badge badge-slate">${esc(s)}</span>`).join('')}</div>
      <div class="text-xs text-slate-400 mb-2">Key Features:</div>
      <ul class="text-xs space-y-0.5 mb-3">${(b.keyFeatures || []).map((f) => `<li class="text-slate-300"><i class="fas fa-check text-emerald-500 text-[10px] mr-1"></i>${esc(f)}</li>`).join('')}</ul>
      <div class="text-xs text-slate-400 mb-1">Top Gaps:</div>
      <div class="flex flex-wrap gap-1">${(b.topGaps || []).map((g) => `<span class="badge badge-amber font-mono">${esc(g)}</span>`).join('')}</div>
      <div class="mt-3 pt-3 border-t border-slate-800 text-xs text-slate-500">
        <i class="fas fa-info-circle mr-1"></i>${esc(b.description)}
      </div>
    </div>`;
}

window.__brandDetail = (id) => { setActiveTab('doctrine'); setTimeout(() => { const el = $('#sub-brand-details'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }, 200); };

// ═════════════════════════════════════════════════════════════
// VIEW: SPRINT
// ═════════════════════════════════════════════════════════════
async function renderSprint() {
  const [weeks, days, health, gaps] = await Promise.all([
    api('/api/sprint/weeks'),
    api('/api/sprint/days'),
    api('/api/sprint/health'),
    api('/api/sprint/gaps'),
  ]);

  // Health trajectory bars (week-end target)
  const targets = [28, 38, 48, 57, 64, 69, 73, 76, 77, 78];
  const maxScore = 100;

  view.innerHTML = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">🏁 Sprint Tracker · D2→D60</h1>
      <p class="text-slate-400 mt-1 text-sm">FULL-SPRINT-PLAN v1.0 · 60-hari window · 4 lane PARALLEL · target 78/100 GREEN</p>
    </div>

    <!-- Health trajectory chart -->
    <div class="card mb-6">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-chart-line text-blue-400 mr-2"></i>Composite Health Trajectory</h2>
      <div class="health-chart">
        ${targets.map((t, i) => `
          <div class="flex flex-col h-full">
            <div class="flex-1 flex items-end relative">
              <div class="health-bar w-full" style="height: ${(t/maxScore*100)}%" title="Week ${i}: ${t}/100"></div>
            </div>
            <div class="health-bar-label">W${i}<br/>${t}</div>
          </div>
        `).join('')}
      </div>
      <div class="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span><span class="inline-block w-3 h-3 rounded bg-emerald-500 mr-1"></span>Target trajectory</span>
        <span class="ml-auto">D60 target: <span class="text-emerald-400 font-bold">78/100 GREEN</span></span>
      </div>
    </div>

    <!-- Week table -->
    <div class="card mb-6 overflow-x-auto">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-calendar-week text-purple-400 mr-2"></i>Week-by-Week Breakdown</h2>
      <table class="w-full text-sm">
        <thead class="text-xs uppercase text-slate-500 border-b border-slate-800">
          <tr><th class="text-left p-2">Week</th><th class="text-left p-2">Days</th><th class="text-left p-2">Mantra</th><th class="text-left p-2">Focus</th><th class="text-right p-2">Δ Health</th></tr>
        </thead>
        <tbody>
          ${weeks.weeks.map((w) => `
            <tr class="border-b border-slate-800/50 hover:bg-slate-800/30">
              <td class="p-2 font-mono text-blue-400">W${w.week}</td>
              <td class="p-2 font-mono text-xs">${esc(w.days)}</td>
              <td class="p-2 text-xs italic text-slate-300">"${esc(w.mantra)}"</td>
              <td class="p-2 text-xs text-slate-400">${esc(w.focus)}</td>
              <td class="p-2 text-right font-mono text-xs text-emerald-400">${esc(w.healthDelta)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Sprint days -->
    <div class="card mb-6">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-calendar-day text-amber-400 mr-2"></i>Day-by-Day Progress (Week 0)</h2>
      <div class="space-y-2">
        ${(days.days || []).map((d) => `
          <div class="flex items-start gap-3 p-2 rounded ${d.status === 'done' ? 'bg-emerald-900/20 border border-emerald-500/30' : d.status === 'in-progress' ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-slate-800/30 border border-slate-700/40'}">
            <span class="font-mono font-bold text-sm w-12 shrink-0">D${d.sprint_day}</span>
            <span class="badge badge-${d.status === 'done' ? 'emerald' : d.status === 'in-progress' ? 'blue' : 'slate'} shrink-0">${esc(d.status)}</span>
            <span class="text-xs text-slate-400 flex-1">${esc(d.notes_md || '-')}</span>
            <span class="text-[10px] font-mono text-slate-500">${esc(d.date || '')}</span>
            ${d.status !== 'done' ? `<button onclick="markDay(${d.sprint_day}, 'done')" class="btn btn-sm btn-success">Done</button>` : ''}
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Gap summary -->
    <div class="card">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-list-check text-emerald-400 mr-2"></i>Gap Matrix Summary (42 gaps)</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        ${Object.entries(gaps.byCategory || {}).map(([cat, n]) => `
          <div class="p-2 rounded bg-slate-800/40">
            <div class="text-xs text-slate-500 uppercase">${esc(cat)}</div>
            <div class="text-xl font-bold text-white">${n}</div>
          </div>
        `).join('')}
      </div>
      <div class="flex gap-4 text-xs">
        ${Object.entries(gaps.byStatus || {}).map(([st, n]) => `
          <span class="badge badge-${st === 'open' ? 'red' : st === 'resolved' ? 'emerald' : st === 'in-progress' ? 'amber' : 'slate'}">${esc(st)}: ${n}</span>
        `).join('')}
        <button onclick="setActiveTab('gaps')" class="ml-auto text-blue-400 hover:underline">View all gaps →</button>
      </div>
    </div>
  `;
}

window.markDay = async (day, status) => {
  try {
    await api(`/api/sprint/days/${day}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    toast(`D${day} marked ${status}`, 'success');
    renderSprint();
  } catch (e) { toast(e.message, 'error'); }
};

// ═════════════════════════════════════════════════════════════
// VIEW: GAPS
// ═════════════════════════════════════════════════════════════
async function renderGaps() {
  const gaps = await api('/api/sprint/gaps');

  view.innerHTML = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">🎯 Gap Matrix · 42 Tracked</h1>
      <p class="text-slate-400 mt-1 text-sm">FULL-SPRINT-PLAN v1.0 §03 · Foundation 5 + BK 8 + KK 8 + PL 8 + NU 9 + Cross 4</p>
    </div>

    <div class="mb-4 flex flex-wrap gap-2 items-center">
      <label class="text-xs text-slate-500">Filter:</label>
      <select class="select w-auto" id="gap-cat">
        <option value="">All categories</option>
        <option value="foundation">Foundation</option>
        <option value="barberkas">BarberKas</option>
        <option value="kuratorkas">KuratorKas</option>
        <option value="pacelokal">PaceLokal</option>
        <option value="nurani">Nurani.OS</option>
        <option value="cross-brand">Cross-brand</option>
      </select>
      <select class="select w-auto" id="gap-status">
        <option value="">All status</option>
        <option value="open">Open</option>
        <option value="in-progress">In-progress</option>
        <option value="resolved">Resolved</option>
        <option value="blocked">Blocked</option>
      </select>
      <span class="ml-auto text-xs text-slate-500">${gaps.total} gaps total</span>
    </div>

    <div id="gaps-list" class="grid grid-cols-1 md:grid-cols-2 gap-3">
      ${gaps.gaps.map((g) => gapCard(g)).join('')}
    </div>
  `;

  const refresh = async () => {
    const cat = $('#gap-cat').value;
    const st = $('#gap-status').value;
    const qs = new URLSearchParams();
    if (cat) qs.set('category', cat);
    if (st) qs.set('status', st);
    const r = await api('/api/sprint/gaps?' + qs.toString());
    $('#gaps-list').innerHTML = r.gaps.map((g) => gapCard(g)).join('') || '<div class="col-span-2 text-center text-slate-500 py-8">No gaps match filter</div>';
  };
  $('#gap-cat').addEventListener('change', refresh);
  $('#gap-status').addEventListener('change', refresh);
}

function gapCard(g) {
  return `
    <div class="card gap-${g.status} text-sm">
      <div class="flex items-start justify-between gap-2 mb-1">
        <span class="font-mono font-bold text-white">${esc(g.gap_id)}</span>
        <div class="flex gap-1">
          <span class="badge badge-${g.severity === 'P0' ? 'red' : g.severity === 'P1' ? 'amber' : 'slate'}">${esc(g.severity)}</span>
          <span class="badge badge-blue">D${g.deadline_day}</span>
        </div>
      </div>
      <p class="text-slate-300 text-xs mb-2">${esc(g.description)}</p>
      <div class="flex items-center justify-between text-[10px]">
        <span class="lane-${g.lane} px-2 py-0.5 rounded font-mono">LANE ${esc(g.lane)}</span>
        <span class="badge badge-${g.status === 'open' ? 'red' : g.status === 'resolved' ? 'emerald' : g.status === 'in-progress' ? 'amber' : 'slate'}">${esc(g.status)}</span>
      </div>
      <div class="mt-3 flex gap-1">
        ${g.status !== 'in-progress' ? `<button onclick="updateGap('${g.gap_id}','in-progress')" class="btn btn-sm btn-secondary flex-1 justify-center">Start</button>` : ''}
        ${g.status !== 'resolved' ? `<button onclick="updateGap('${g.gap_id}','resolved')" class="btn btn-sm btn-success flex-1 justify-center">Resolve</button>` : ''}
        ${g.status !== 'blocked' ? `<button onclick="updateGap('${g.gap_id}','blocked')" class="btn btn-sm btn-danger flex-1 justify-center">Block</button>` : ''}
      </div>
    </div>`;
}

window.updateGap = async (id, status) => {
  try {
    await api(`/api/sprint/gaps/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    toast(`${id} → ${status}`, 'success');
    renderGaps();
  } catch (e) { toast(e.message, 'error'); }
};

// ═════════════════════════════════════════════════════════════
// VIEW: HANDOFFS
// ═════════════════════════════════════════════════════════════
async function renderHandoffs() {
  const list = await api('/api/handoffs');

  view.innerHTML = `
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">🤝 Session Handoffs · v2.0</h1>
        <p class="text-slate-400 mt-1 text-sm">12-section structure · paste-ready blocks · zero context loss</p>
      </div>
      <button onclick="document.getElementById('handoff-form').scrollIntoView({behavior:'smooth'})" class="btn btn-primary">
        <i class="fas fa-plus"></i> New Handoff
      </button>
    </div>

    <!-- History -->
    <div class="card mb-6">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-clock-rotate-left text-blue-400 mr-2"></i>Recent Handoffs (${list.total})</h2>
      ${list.handoffs.length === 0 ? '<p class="text-slate-500 text-sm">No handoffs yet. Create one below.</p>' :
        '<div class="divide-y divide-slate-800">' + list.handoffs.map((h) => `
          <div class="py-2 flex items-start gap-3">
            <span class="font-mono text-[10px] text-slate-500 shrink-0 mt-1">${esc(h.handoff_date?.slice(0,16) || '')}</span>
            <div class="flex-1 min-w-0">
              <div class="font-mono text-xs text-white truncate">${esc(h.session_id)}</div>
              <div class="text-[10px] text-slate-500">${esc(h.previous_ai || '?')} · D${h.sprint_day || '?'} · LANE ${esc(h.lane_focus || '')}</div>
            </div>
            <span class="badge badge-${h.health_status === 'GREEN' ? 'emerald' : h.health_status === 'AMBER' ? 'amber' : 'red'}">${h.composite_health}/100</span>
            <button onclick="viewHandoff('${esc(h.session_id)}')" class="btn btn-sm btn-secondary">View</button>
          </div>
        `).join('') + '</div>'}
    </div>

    <!-- Form -->
    <div class="card" id="handoff-form">
      <h2 class="font-bold text-white mb-4"><i class="fas fa-plus-circle text-emerald-400 mr-2"></i>Generate New Handoff</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div><label class="label">Previous AI</label><select class="select" id="hf-ai"><option>Genspark AI Developer</option><option>Claude Code</option><option>Cursor</option><option>GPT</option><option>Gemini</option></select></div>
        <div><label class="label">Lane Focus</label><select class="select" id="hf-lane"><option>F</option><option>E</option><option>K</option><option>B</option><option>N</option><option>META</option></select></div>
        <div><label class="label">Sprint Day (1-60)</label><input type="number" min="1" max="60" value="3" class="input" id="hf-day"/></div>
        <div><label class="label">Composite Health (0-100)</label><input type="number" min="0" max="100" value="28" class="input" id="hf-health"/></div>
      </div>
      <div class="grid grid-cols-5 gap-2 mb-3">
        <div><label class="label">Lane F</label><select class="select" id="hf-lf-F"><option>not-started</option><option selected>active</option><option>maintenance</option><option>paused</option><option>done</option></select></div>
        <div><label class="label">Lane E</label><select class="select" id="hf-lf-E"><option>not-started</option><option>active</option><option selected>paused</option><option>done</option></select></div>
        <div><label class="label">Lane K</label><select class="select" id="hf-lf-K"><option selected>not-started</option><option>active</option><option>done</option></select></div>
        <div><label class="label">Lane B</label><select class="select" id="hf-lf-B"><option selected>not-started</option><option>active</option><option>done</option></select></div>
        <div><label class="label">Lane N</label><select class="select" id="hf-lf-N"><option selected>not-started</option><option>active</option><option>done</option></select></div>
      </div>
      <div class="mb-3"><label class="label">Last Delta (Markdown)</label><textarea class="textarea" id="hf-delta" rows="3" placeholder="- File: src/index.tsx — added /api/health\n- Commit: feat(infra): scaffold mission control"></textarea></div>
      <div class="mb-3">
        <label class="label">Next 3 Tasks (one per line: "title|lane|cite")</label>
        <textarea class="textarea" id="hf-tasks" rows="4" placeholder="Drop trilogy ke repo|F|MASTER-ARCHITECT v7.0 §06.1
Claim 4 subdomain di Cloudflare DNS|F|MASTER-CONSOLIDATED v2.0 §01.2
Scaffold monorepo struktur|F|MASTER-ARCHITECT v7.0 §28.1"></textarea>
      </div>
      <div class="mb-3">
        <label class="label">Blocking Issues (one per line: "title|severity|lane|eta")</label>
        <textarea class="textarea" id="hf-blocks" rows="3" placeholder="DNS 4 subdomain belum claim|P0|F|D3"></textarea>
      </div>
      <div class="mb-3"><label class="label">Citations (one per line)</label><textarea class="textarea" id="hf-cites" rows="3" placeholder="MASTER-ARCHITECT-PROMPT v7.0 §01\nFULL-SPRINT-PLAN v1.0 §02"></textarea></div>
      <div class="flex gap-2 flex-wrap">
        <button onclick="previewHandoff()" class="btn btn-secondary"><i class="fas fa-eye"></i> Preview</button>
        <button onclick="saveHandoff()" class="btn btn-primary"><i class="fas fa-save"></i> Save + Generate Block</button>
      </div>

      <div id="handoff-output" class="mt-4 hidden">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs uppercase text-slate-500 font-bold">Paste-Ready Block</div>
          <button onclick="copyHandoff()" class="btn btn-sm btn-secondary"><i class="fas fa-copy"></i> Copy</button>
        </div>
        <pre class="code-block" id="handoff-pre"></pre>
      </div>
    </div>
  `;
}

function parseHandoffForm() {
  const tasksRaw = $('#hf-tasks').value.trim();
  const blocksRaw = $('#hf-blocks').value.trim();
  const citesRaw = $('#hf-cites').value.trim();
  const next_tasks = tasksRaw ? tasksRaw.split('\n').filter(Boolean).map((line) => {
    const [title, lane, cite] = line.split('|').map((s) => s?.trim());
    return { title, lane: lane || 'F', cite: cite || 'doctrine' };
  }) : [];
  const blocking_issues = blocksRaw ? blocksRaw.split('\n').filter(Boolean).map((line, i) => {
    const [title, severity, lane, eta] = line.split('|').map((s) => s?.trim());
    return { id: String(i + 1).padStart(3, '0'), title, severity: severity || 'P1', lane: lane || 'F', eta: eta || 'TBD' };
  }) : [];
  const citations = citesRaw ? citesRaw.split('\n').filter(Boolean).map((s) => s.trim()) : [];
  const health = parseInt($('#hf-health').value, 10);
  return {
    previous_ai: $('#hf-ai').value,
    lane_focus: $('#hf-lane').value,
    sprint_day: parseInt($('#hf-day').value, 10),
    composite_health: health,
    health_status: health >= 75 ? 'GREEN' : health >= 50 ? 'AMBER' : 'RED',
    lane_status: { F: $('#hf-lf-F').value, E: $('#hf-lf-E').value, K: $('#hf-lf-K').value, B: $('#hf-lf-B').value, N: $('#hf-lf-N').value },
    last_delta: $('#hf-delta').value,
    next_tasks,
    blocking_issues,
    citations,
  };
}

window.previewHandoff = async () => {
  try {
    const data = parseHandoffForm();
    const r = await api('/api/handoffs/preview', { method: 'POST', body: JSON.stringify(data) });
    $('#handoff-pre').textContent = r.raw_block;
    $('#handoff-output').classList.remove('hidden');
    toast('Preview generated', 'info');
  } catch (e) { toast(e.message, 'error'); }
};

window.saveHandoff = async () => {
  try {
    const data = parseHandoffForm();
    const r = await api('/api/handoffs', { method: 'POST', body: JSON.stringify(data) });
    $('#handoff-pre').textContent = r.raw_block;
    $('#handoff-output').classList.remove('hidden');
    toast(`Saved: ${r.session_id}`, 'success');
  } catch (e) { toast(e.message, 'error'); }
};

window.copyHandoff = async () => {
  try { await navigator.clipboard.writeText($('#handoff-pre').textContent); toast('Copied to clipboard', 'success'); } catch (e) { toast('Copy failed', 'error'); }
};

window.viewHandoff = async (id) => {
  try {
    const h = await api(`/api/handoffs/${id}`);
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4';
    modal.innerHTML = `
      <div class="bg-sovereign-900 border border-slate-700 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-4 border-b border-slate-800 flex items-center justify-between">
          <div class="font-mono text-sm text-white">${esc(h.session_id)}</div>
          <div class="flex gap-2">
            <button onclick="navigator.clipboard.writeText(\`${esc(h.raw_block).replace(/`/g,'\\`')}\`); this.textContent='Copied!'" class="btn btn-sm btn-secondary"><i class="fas fa-copy"></i> Copy</button>
            <button onclick="this.closest('.fixed').remove()" class="btn btn-sm btn-secondary">Close</button>
          </div>
        </div>
        <pre class="code-block m-0 rounded-none flex-1 overflow-auto">${esc(h.raw_block)}</pre>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  } catch (e) { toast(e.message, 'error'); }
};

// ═════════════════════════════════════════════════════════════
// VIEW: DECISIONS
// ═════════════════════════════════════════════════════════════
async function renderDecisions() {
  const list = await api('/api/decisions');
  const next = await api('/api/decisions/util/next-id');

  view.innerHTML = `
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">⚖️ Decision Log · DEC-NNNN</h1>
        <p class="text-slate-400 mt-1 text-sm">MASTER-ARCHITECT v7.0 §06 · YAML frontmatter + JSON schema · ${list.total} entries · next: <span class="font-mono text-emerald-400">${esc(next.next)}</span></p>
      </div>
      <button onclick="document.getElementById('dec-form').scrollIntoView({behavior:'smooth'})" class="btn btn-primary"><i class="fas fa-plus"></i> New Decision</button>
    </div>

    <div class="space-y-3 mb-6">
      ${list.decisions.map((d) => `
        <div class="card ${d.status === 'ACCEPTED' ? 'border-emerald-500/30' : d.status === 'PROPOSED' ? 'border-amber-500/30' : ''}">
          <div class="flex items-start justify-between mb-2">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-mono font-bold text-white">${esc(d.dec_id)}</span>
                <span class="badge badge-${d.status === 'ACCEPTED' ? 'emerald' : d.status === 'PROPOSED' ? 'amber' : d.status === 'SUPERSEDED' ? 'slate' : 'red'}">${esc(d.status)}</span>
                <span class="badge badge-${d.severity === 'P0' ? 'red' : d.severity === 'P1' ? 'amber' : 'slate'}">${esc(d.severity)}</span>
                <span class="badge badge-blue">LANE ${esc(d.lane)}</span>
              </div>
              <h3 class="text-white font-semibold mt-1">${esc(d.title)}</h3>
              <div class="text-[10px] font-mono text-slate-500 mt-0.5">${esc(d.date)} · ${esc(d.owner)}</div>
            </div>
            <div class="flex gap-1">
              ${d.status !== 'ACCEPTED' ? `<button onclick="acceptDec('${esc(d.dec_id)}')" class="btn btn-sm btn-success">Accept</button>` : ''}
              <button onclick="exportDec('${esc(d.dec_id)}')" class="btn btn-sm btn-secondary"><i class="fas fa-file-export"></i></button>
            </div>
          </div>
          ${d.context_md ? `<div class="text-xs text-slate-400 mt-2"><span class="text-slate-500 font-bold">Context:</span> ${esc(d.context_md)}</div>` : ''}
          ${d.decision_md ? `<div class="text-xs text-slate-300 mt-1"><span class="text-slate-500 font-bold">Decision:</span> ${esc(d.decision_md)}</div>` : ''}
          ${d.consequences_md ? `<div class="text-xs text-slate-400 mt-1"><span class="text-slate-500 font-bold">Consequences:</span> ${esc(d.consequences_md)}</div>` : ''}
          ${(d.cites && d.cites.length > 0) ? `<div class="flex flex-wrap gap-1 mt-2">${d.cites.map((c) => `<span class="badge badge-slate text-[9px]">${esc(c)}</span>`).join('')}</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="card" id="dec-form">
      <h2 class="font-bold text-white mb-3"><i class="fas fa-plus-circle text-emerald-400 mr-2"></i>New Decision</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div><label class="label">DEC ID</label><input class="input font-mono" id="dec-id" value="${esc(next.next)}"/></div>
        <div><label class="label">Title</label><input class="input" id="dec-title" placeholder="Lock X as canonical"/></div>
        <div><label class="label">Status</label><select class="select" id="dec-status"><option>PROPOSED</option><option>ACCEPTED</option><option>SUPERSEDED</option><option>REJECTED</option></select></div>
        <div><label class="label">Lane</label><select class="select" id="dec-lane"><option>F</option><option>E</option><option>K</option><option>B</option><option>N</option><option>META</option></select></div>
        <div><label class="label">Severity</label><select class="select" id="dec-severity"><option>P0</option><option>P1</option><option>P2</option></select></div>
        <div><label class="label">Date</label><input type="date" class="input" id="dec-date" value="${new Date().toISOString().slice(0,10)}"/></div>
      </div>
      <div class="mb-3"><label class="label">Context</label><textarea class="textarea" id="dec-context" rows="2"></textarea></div>
      <div class="mb-3"><label class="label">Decision</label><textarea class="textarea" id="dec-decision" rows="2"></textarea></div>
      <div class="mb-3"><label class="label">Consequences</label><textarea class="textarea" id="dec-consequences" rows="2"></textarea></div>
      <div class="mb-3"><label class="label">Citations (one per line)</label><textarea class="textarea" id="dec-cites" rows="2" placeholder="MASTER-ARCHITECT-PROMPT v7.0 §06"></textarea></div>
      <button onclick="saveDec()" class="btn btn-primary"><i class="fas fa-save"></i> Save Decision</button>
    </div>
  `;
}

window.saveDec = async () => {
  try {
    const body = {
      dec_id: $('#dec-id').value.trim(),
      title: $('#dec-title').value.trim(),
      status: $('#dec-status').value,
      lane: $('#dec-lane').value,
      severity: $('#dec-severity').value,
      date: $('#dec-date').value,
      context_md: $('#dec-context').value,
      decision_md: $('#dec-decision').value,
      consequences_md: $('#dec-consequences').value,
      cites: $('#dec-cites').value.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    if (!body.dec_id || !body.title) { toast('DEC ID + Title required', 'error'); return; }
    await api('/api/decisions', { method: 'POST', body: JSON.stringify(body) });
    toast(`${body.dec_id} saved`, 'success');
    renderDecisions();
  } catch (e) { toast(e.message, 'error'); }
};

window.acceptDec = async (id) => {
  try {
    await api(`/api/decisions/${id}`, { method: 'PATCH', body: JSON.stringify({ status: 'ACCEPTED' }) });
    toast(`${id} accepted`, 'success');
    renderDecisions();
  } catch (e) { toast(e.message, 'error'); }
};

window.exportDec = async (id) => {
  try {
    const text = await fetch(`/api/decisions/${id}/export`).then((r) => r.text());
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${id}.md`; a.click();
    URL.revokeObjectURL(url);
    toast(`${id}.md downloaded`, 'success');
  } catch (e) { toast(e.message, 'error'); }
};

// ═════════════════════════════════════════════════════════════
// VIEW: PROMPT BUILDER
// ═════════════════════════════════════════════════════════════
async function renderPromptBuilder() {
  const { brands } = await loadSnapshot();

  view.innerHTML = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">🪄 Prompt Builder · 5-Layer AIDEV</h1>
      <p class="text-slate-400 mt-1 text-sm">MASTER-ARCHITECT v7.0 §30 · Genspark-native invocation pattern · paste-ready</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card">
        <h2 class="font-bold text-white mb-3"><i class="fas fa-cog text-blue-400 mr-2"></i>Parameters</h2>
        <div class="space-y-3">
          <div>
            <label class="label">Scope</label>
            <select class="select" id="p-scope">
              <option value="cross">cross (infra / shared)</option>
              ${brands.map((b) => `<option value="${esc(b.id)}">${esc(b.name)} (${esc(b.priority)})</option>`).join('')}
            </select>
          </div>
          <div><label class="label">Task (one-liner, executable)</label><input class="input" id="p-task" placeholder="Scaffold @sparkmind/auth package with magic-link + D1 schema"/></div>
          <div class="grid grid-cols-3 gap-2">
            <div><label class="label">Lane</label><select class="select" id="p-lane"><option>F</option><option>E</option><option>K</option><option>B</option><option>N</option></select></div>
            <div><label class="label">Sprint Day</label><input type="number" min="1" max="60" value="3" class="input" id="p-day"/></div>
            <div><label class="label">Deploy</label><select class="select" id="p-deploy"><option>local</option><option>cloudflare-staging</option><option>cloudflare-production</option></select></div>
          </div>
          <div><label class="label">Citations (one per line)</label><textarea class="textarea" id="p-cites" rows="3">MASTER-ARCHITECT-PROMPT v7.0 §28
FULL-SPRINT-PLAN v1.0
SESSION-HANDOFF v2.0 §02</textarea></div>
          <details class="border-t border-slate-800 pt-3">
            <summary class="text-xs font-bold uppercase text-slate-400 cursor-pointer">Override 5 layers (optional)</summary>
            <div class="mt-2 space-y-2">
              <div><label class="label">L1 Context</label><textarea class="textarea" id="p-l1" rows="2"></textarea></div>
              <div><label class="label">L2 Constraints</label><textarea class="textarea" id="p-l2" rows="2"></textarea></div>
              <div><label class="label">L3 Spec</label><textarea class="textarea" id="p-l3" rows="2"></textarea></div>
              <div><label class="label">L4 Acceptance</label><textarea class="textarea" id="p-l4" rows="2"></textarea></div>
              <div><label class="label">L5 Output Format</label><textarea class="textarea" id="p-l5" rows="2"></textarea></div>
            </div>
          </details>
          <div class="flex gap-2">
            <button onclick="buildPrompt(false)" class="btn btn-primary"><i class="fas fa-bolt"></i> Build Prompt</button>
            <button onclick="buildPrompt(true)" class="btn btn-success"><i class="fas fa-save"></i> Build + Save</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-white"><i class="fas fa-scroll text-emerald-400 mr-2"></i>Generated Prompt</h2>
          <button onclick="copyPrompt()" class="btn btn-sm btn-secondary" id="p-copy" disabled><i class="fas fa-copy"></i> Copy</button>
        </div>
        <pre class="code-block min-h-[400px]" id="p-output">Configure parameters dan klik <b>Build Prompt</b>...</pre>
      </div>
    </div>
  `;
}

window.buildPrompt = async (save) => {
  try {
    const body = {
      scope: $('#p-scope').value,
      task: $('#p-task').value || '<one-liner task description>',
      lane: $('#p-lane').value,
      sprint_day: parseInt($('#p-day').value, 10),
      deploy_target: $('#p-deploy').value,
      cites: $('#p-cites').value.split('\n').map((s) => s.trim()).filter(Boolean),
      layer_1_context: $('#p-l1').value || undefined,
      layer_2_constraints: $('#p-l2').value || undefined,
      layer_3_spec: $('#p-l3').value || undefined,
      layer_4_acceptance: $('#p-l4').value || undefined,
      layer_5_output: $('#p-l5').value || undefined,
      save,
    };
    const r = await api('/api/prompt/build', { method: 'POST', body: JSON.stringify(body) });
    $('#p-output').textContent = r.prompt;
    $('#p-copy').disabled = false;
    toast(save ? 'Saved to library' : 'Prompt built', 'success');
  } catch (e) { toast(e.message, 'error'); }
};

window.copyPrompt = async () => {
  try { await navigator.clipboard.writeText($('#p-output').textContent); toast('Prompt copied', 'success'); } catch { toast('Copy failed', 'error'); }
};

// ═════════════════════════════════════════════════════════════
// VIEW: HARDENER (Audit + Risk Checklist + Scan)
// ═════════════════════════════════════════════════════════════
async function renderHardener() {
  const { risk, weaknesses } = await loadSnapshot();
  const runs = await api('/api/audit/runs').catch(() => ({ runs: [] }));

  // Group risk by category
  const byCat = risk.reduce((acc, r) => { (acc[r.category] = acc[r.category] || []).push(r); return acc; }, {});

  view.innerHTML = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">🛡️ Doctrine Hardener · Audit Suite</h1>
      <p class="text-slate-400 mt-1 text-sm">20-item Risk Checklist + Doctrine Self-Audit + Text Scanner · v7.0 §31</p>
    </div>

    <!-- Tabs within Hardener -->
    <div class="flex gap-2 mb-4 border-b border-slate-800 overflow-x-auto">
      <button onclick="hardSection('risk')" data-h="risk" class="hsec-btn px-3 py-2 text-sm border-b-2 border-blue-500 text-white">Risk Checklist (20)</button>
      <button onclick="hardSection('scan')" data-h="scan" class="hsec-btn px-3 py-2 text-sm border-b-2 border-transparent text-slate-400">Text Scanner</button>
      <button onclick="hardSection('runs')" data-h="runs" class="hsec-btn px-3 py-2 text-sm border-b-2 border-transparent text-slate-400">Past Runs (${runs.runs.length})</button>
      <button onclick="hardSection('weak')" data-h="weak" class="hsec-btn px-3 py-2 text-sm border-b-2 border-transparent text-slate-400">13 Weaknesses</button>
    </div>

    <div id="hsec-risk">
      <div class="card mb-4">
        <div class="flex items-center justify-between mb-3">
          <div>
            <h2 class="font-bold text-white"><i class="fas fa-shield-halved text-blue-400 mr-2"></i>20-Item Risk Checklist</h2>
            <p class="text-xs text-slate-500 mt-1">Click each item to mark pass/fail. Run audit for verdict.</p>
          </div>
          <div class="flex gap-2 flex-wrap">
            <input class="input w-auto text-sm" id="risk-target" placeholder="Target (e.g. apps/barberkas)" value="apps/barberkas"/>
            <button onclick="riskAllPass()" class="btn btn-secondary btn-sm">All Pass</button>
            <button onclick="riskReset()" class="btn btn-secondary btn-sm">Reset</button>
            <button onclick="runRiskAudit()" class="btn btn-primary"><i class="fas fa-play"></i> Run Audit</button>
          </div>
        </div>
        ${Object.entries(byCat).map(([cat, items]) => `
          <div class="mb-4">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">${esc(cat)} (${items.length})</div>
            <div class="space-y-1">
              ${items.map((r) => `
                <label class="flex items-start gap-2 p-2 rounded hover:bg-slate-800/50 cursor-pointer">
                  <input type="checkbox" class="risk-cb mt-1" data-id="${r.id}" data-priority="${r.priority}"/>
                  <div class="flex-1 min-w-0">
                    <div class="text-xs text-white">${esc(r.text)}</div>
                    <div class="text-[10px] font-mono text-slate-500">${esc(r.anchor)}</div>
                  </div>
                  <span class="badge badge-${r.priority === 'P0' ? 'red' : r.priority === 'P1' ? 'amber' : 'slate'} shrink-0">${esc(r.priority)}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
        <div id="risk-result" class="mt-4 hidden"></div>
      </div>
    </div>

    <div id="hsec-scan" class="hidden">
      <div class="card mb-4">
        <h2 class="font-bold text-white mb-3"><i class="fas fa-magnifying-glass text-purple-400 mr-2"></i>Text Scanner — Doctrine Drift Detection</h2>
        <p class="text-xs text-slate-400 mb-3">Paste any prompt, doctrine snippet, or code comment. Hardener will scan for drift signals, missing citations, constraint violations, and weakness coverage.</p>
        <div class="mb-3"><label class="label">Target (optional)</label><input class="input" id="scan-target" placeholder="e.g. apps/barberkas/src/index.tsx"/></div>
        <div class="mb-3"><label class="label">Text to scan</label><textarea class="textarea" id="scan-text" rows="8" placeholder="Paste prompt or doctrine text here..."></textarea></div>
        <button onclick="runScan()" class="btn btn-primary"><i class="fas fa-magnifying-glass"></i> Scan</button>
        <div id="scan-result" class="mt-4 hidden"></div>
      </div>
    </div>

    <div id="hsec-runs" class="hidden">
      <div class="card">
        <h2 class="font-bold text-white mb-3"><i class="fas fa-clock-rotate-left text-emerald-400 mr-2"></i>Past Audit Runs</h2>
        ${runs.runs.length === 0 ? '<p class="text-slate-500 text-sm">No past runs.</p>' :
          '<div class="space-y-2">' + runs.runs.map((r) => `
            <div class="flex items-start gap-3 p-2 rounded hover:bg-slate-800/40">
              <span class="font-mono text-[10px] text-slate-500 shrink-0 mt-1">${esc((r.created_at||'').slice(0,16))}</span>
              <div class="flex-1 min-w-0">
                <div class="text-xs text-white truncate">${esc(r.target)}</div>
                <div class="text-[10px] text-slate-500">${esc(r.category)} · ${r.passed}/${r.total_items} passed</div>
              </div>
              <span class="badge badge-${r.verdict === 'SAFE TO MERGE' || r.verdict === 'DOCTRINE INTACT' || r.verdict === 'HARDENING PASS' ? 'emerald' : r.verdict.includes('HOLD') || r.verdict.includes('CRITICAL') ? 'red' : 'amber'}">${esc(r.verdict)}</span>
            </div>
          `).join('') + '</div>'}
      </div>
    </div>

    <div id="hsec-weak" class="hidden">
      <div class="card">
        <h2 class="font-bold text-white mb-3"><i class="fas fa-bandage text-emerald-400 mr-2"></i>13 Weaknesses v6.0 → Fixed in v7.0</h2>
        <div class="space-y-2">
          ${weaknesses.map((w) => `
            <div class="flex items-start gap-3 p-3 rounded bg-slate-800/40">
              <span class="badge ${w.severity === 'CRITICAL' ? 'badge-red' : w.severity === 'HIGH' ? 'badge-amber' : 'badge-slate'} shrink-0">${esc(w.severity)}</span>
              <div class="flex-1">
                <div class="text-sm text-white font-medium">#${w.id} ${esc(w.title)}</div>
                <div class="text-xs text-emerald-400 mt-1"><i class="fas fa-check-circle mr-1"></i>Fixed at ${esc(w.fix)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

window.hardSection = (sec) => {
  ['risk', 'scan', 'runs', 'weak'].forEach((s) => {
    $('#hsec-' + s).classList.toggle('hidden', s !== sec);
  });
  $$('.hsec-btn').forEach((b) => {
    const active = b.dataset.h === sec;
    b.classList.toggle('border-blue-500', active);
    b.classList.toggle('text-white', active);
    b.classList.toggle('border-transparent', !active);
    b.classList.toggle('text-slate-400', !active);
  });
};

window.riskAllPass = () => { $$('.risk-cb').forEach((cb) => { cb.checked = true; }); toast('All marked pass', 'info'); };
window.riskReset = () => { $$('.risk-cb').forEach((cb) => { cb.checked = false; }); $('#risk-result').classList.add('hidden'); };

window.runRiskAudit = async () => {
  try {
    const passed_ids = $$('.risk-cb').filter((cb) => cb.checked).map((cb) => parseInt(cb.dataset.id, 10));
    const all_ids = $$('.risk-cb').map((cb) => parseInt(cb.dataset.id, 10));
    const failed_ids = all_ids.filter((id) => !passed_ids.includes(id));
    const target = $('#risk-target').value || 'unspecified';
    const r = await api('/api/audit/risk-check', { method: 'POST', body: JSON.stringify({ target, passed_ids, failed_ids }) });
    const verdictClass = r.verdict === 'SAFE TO MERGE' ? 'border-emerald-500/50 bg-emerald-900/20' : r.verdict === 'HOLD MERGE' ? 'border-red-500/50 bg-red-900/20' : 'border-amber-500/50 bg-amber-900/20';
    const verdictIcon = r.verdict === 'SAFE TO MERGE' ? 'fa-check-circle text-emerald-400' : r.verdict === 'HOLD MERGE' ? 'fa-circle-exclamation text-red-400' : 'fa-triangle-exclamation text-amber-400';
    $('#risk-result').innerHTML = `
      <div class="card ${verdictClass}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-lg font-bold"><i class="fas ${verdictIcon}"></i>${esc(r.verdict)}</div>
          <div class="text-sm text-slate-300"><span class="font-mono">${r.passed}/${r.total}</span> passed</div>
        </div>
        <pre class="code-block text-xs">${esc(r.output)}</pre>
        ${r.failed > 0 ? `<div class="mt-3 text-xs text-red-300"><b>Failed items:</b><ul class="list-disc ml-5 mt-1">${(r.details.failed_items || []).map((f) => `<li>${esc(f.text)} (${esc(f.anchor)})</li>`).join('')}</ul></div>` : ''}
      </div>
    `;
    $('#risk-result').classList.remove('hidden');
    toast(`Audit: ${r.verdict}`, r.verdict === 'SAFE TO MERGE' ? 'success' : 'error');
  } catch (e) { toast(e.message, 'error'); }
};

window.runScan = async () => {
  try {
    const text = $('#scan-text').value;
    if (!text.trim()) { toast('Paste some text first', 'error'); return; }
    const target = $('#scan-target').value || 'inline-text';
    const r = await api('/api/audit/hardener-scan', { method: 'POST', body: JSON.stringify({ text, target }) });
    const cls = r.verdict === 'HARDENING PASS' ? 'border-emerald-500/50 bg-emerald-900/20' : r.verdict === 'NEEDS HARDENING' ? 'border-amber-500/50 bg-amber-900/20' : 'border-red-500/50 bg-red-900/20';
    const ico = r.verdict === 'HARDENING PASS' ? 'fa-check-circle text-emerald-400' : r.verdict === 'NEEDS HARDENING' ? 'fa-triangle-exclamation text-amber-400' : 'fa-circle-exclamation text-red-400';
    $('#scan-result').innerHTML = `
      <div class="card ${cls}">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-lg font-bold"><i class="fas ${ico}"></i>${esc(r.verdict)}</div>
          <div class="flex gap-2 text-xs">
            <span class="badge badge-emerald">OK ${r.stats.ok}</span>
            <span class="badge badge-slate">INFO ${r.stats.info}</span>
            <span class="badge badge-amber">WARN ${r.stats.warn}</span>
            <span class="badge badge-red">CRIT ${r.stats.crit}</span>
          </div>
        </div>
        <div class="space-y-1 max-h-96 overflow-y-auto">
          ${r.findings.map((f) => `
            <div class="flex items-start gap-2 p-2 rounded ${f.severity === 'CRIT' ? 'bg-red-900/20' : f.severity === 'WARN' ? 'bg-amber-900/20' : f.severity === 'OK' ? 'bg-emerald-900/10' : 'bg-slate-800/30'}">
              <span class="badge badge-${f.severity === 'CRIT' ? 'red' : f.severity === 'WARN' ? 'amber' : f.severity === 'OK' ? 'emerald' : 'slate'} shrink-0 text-[9px]">${esc(f.severity)}</span>
              <span class="font-mono text-[10px] text-slate-500 shrink-0">${esc(f.code)}</span>
              <span class="text-xs text-slate-300">${esc(f.message)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    $('#scan-result').classList.remove('hidden');
    toast(`Scan: ${r.verdict}`, r.verdict === 'HARDENING PASS' ? 'success' : 'info');
  } catch (e) { toast(e.message, 'error'); }
};

// ═════════════════════════════════════════════════════════════
// VIEW: ARTIFACTS
// ═════════════════════════════════════════════════════════════
async function renderArtifacts() {
  const a = await api('/api/doctrine/artifacts');
  const byCat = a.artifacts.reduce((acc, art) => { (acc[art.category] = acc[art.category] || []).push(art); return acc; }, {});

  view.innerHTML = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-white">📂 Artifact Vault · Trilogy + Scripts</h1>
      <p class="text-slate-400 mt-1 text-sm">Canonical doctrine artifacts, bootstrap scripts, prompts, reports. All public-safe.</p>
    </div>

    ${Object.entries(byCat).map(([cat, items]) => `
      <div class="mb-6">
        <h2 class="text-sm font-bold uppercase text-slate-400 mb-3">${esc(cat)}</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          ${items.map((art) => `
            <div class="card">
              <div class="flex items-start justify-between mb-2">
                <div class="flex items-center gap-2">
                  <i class="fas ${cat === 'doctrine' ? 'fa-scroll' : cat === 'script' ? 'fa-terminal' : cat === 'prompt' ? 'fa-wand-magic-sparkles' : 'fa-file-lines'} text-blue-400"></i>
                  <div class="font-bold text-white text-sm">${esc(art.title)}</div>
                </div>
                ${art.primary ? '<span class="badge badge-emerald">PRIMARY</span>' : ''}
              </div>
              <p class="text-xs text-slate-400 mb-3">${esc(art.description)}</p>
              <div class="flex items-center justify-between text-[10px] font-mono">
                <span class="text-slate-500">${esc(art.file)} · ${esc(art.size)}</span>
                <div class="flex gap-2">
                  <a href="/static/artifacts/${esc(art.file)}" target="_blank" class="btn btn-sm btn-secondary"><i class="fas fa-eye"></i> View</a>
                  <a href="/static/artifacts/${esc(art.file)}" download class="btn btn-sm btn-primary"><i class="fas fa-download"></i> Download</a>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  `;
}

// ─── Boot ─────────────────────────────────────────────────────
window.setActiveTab = setActiveTab;
const initialTab = location.hash.replace('#', '') || 'overview';
setActiveTab(initialTab);

})();
