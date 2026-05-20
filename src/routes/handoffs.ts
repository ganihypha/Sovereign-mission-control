import { Hono } from 'hono'
import type { AppEnv } from '../types'

const handoffs = new Hono<AppEnv>()

// ─── List all handoffs ────────────────────────────────────────
handoffs.get('/', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, session_id, previous_ai, operator, handoff_date, doctrine_version,
              sprint_day, composite_health, health_status, lane_focus, created_at
       FROM handoffs ORDER BY handoff_date DESC LIMIT 100`
    ).all()
    return c.json({ handoffs: results, total: results.length })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Get single handoff ───────────────────────────────────────
handoffs.get('/:session_id', async (c) => {
  const sessionId = c.req.param('session_id')
  try {
    const row = await c.env.DB.prepare(
      `SELECT * FROM handoffs WHERE session_id = ?`
    ).bind(sessionId).first()
    if (!row) return c.json({ error: 'Handoff not found' }, 404)
    // Parse JSON fields
    const parsed = {
      ...row,
      lane_status: row.lane_status ? JSON.parse(row.lane_status as string) : null,
      blocking_issues: row.blocking_issues ? JSON.parse(row.blocking_issues as string) : [],
      next_tasks: row.next_tasks ? JSON.parse(row.next_tasks as string) : [],
      open_decisions: row.open_decisions ? JSON.parse(row.open_decisions as string) : [],
      citations: row.citations ? JSON.parse(row.citations as string) : [],
    }
    return c.json(parsed)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Create handoff ───────────────────────────────────────────
handoffs.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const sessionId = body.session_id || generateSessionId(body.lane_focus)
    const now = new Date().toISOString()

    // Build raw paste-ready block
    const rawBlock = buildHandoffBlock({ ...body, session_id: sessionId, handoff_date: body.handoff_date || now })

    const result = await c.env.DB.prepare(
      `INSERT INTO handoffs (
        session_id, previous_ai, operator, handoff_date, doctrine_version,
        sprint_day, composite_health, health_status, lane_focus, lane_status,
        last_delta, blocking_issues, next_tasks, open_decisions, citations,
        constitutional_flags, context_carry_over, invocation_hint, raw_block
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      sessionId,
      body.previous_ai || 'Genspark AI Developer',
      body.operator || 'Haidar',
      body.handoff_date || now,
      body.doctrine_version || 'v7.0',
      body.sprint_day ?? null,
      body.composite_health ?? null,
      body.health_status || null,
      body.lane_focus || 'META',
      JSON.stringify(body.lane_status || {}),
      body.last_delta || '',
      JSON.stringify(body.blocking_issues || []),
      JSON.stringify(body.next_tasks || []),
      JSON.stringify(body.open_decisions || []),
      JSON.stringify(body.citations || []),
      body.constitutional_flags || null,
      body.context_carry_over || null,
      body.invocation_hint || null,
      rawBlock
    ).run()

    return c.json({ success: true, session_id: sessionId, id: result.meta.last_row_id, raw_block: rawBlock }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Generate raw block preview (no DB write) ─────────────────
handoffs.post('/preview', async (c) => {
  try {
    const body = await c.req.json()
    const sessionId = body.session_id || generateSessionId(body.lane_focus)
    const rawBlock = buildHandoffBlock({ ...body, session_id: sessionId, handoff_date: body.handoff_date || new Date().toISOString() })
    return c.json({ session_id: sessionId, raw_block: rawBlock })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Delete handoff ───────────────────────────────────────────
handoffs.delete('/:session_id', async (c) => {
  const sessionId = c.req.param('session_id')
  try {
    const r = await c.env.DB.prepare(`DELETE FROM handoffs WHERE session_id = ?`).bind(sessionId).run()
    return c.json({ success: true, deleted: r.meta.changes })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Helpers ──────────────────────────────────────────────────
function generateSessionId(laneFocus?: string): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const lane = (laneFocus || 'meta').toLowerCase()
  return `${y}-${m}-${d}-${h}${min}-${lane}-session`
}

function buildHandoffBlock(d: any): string {
  const tasks = (d.next_tasks || []).map((t: any, i: number) => {
    return `- TASK-${i + 1}: ${t.title || t}\n  - Lane: ${t.lane || d.lane_focus || 'F'}\n  - Sub-agent invocation: @Sovereign-Architect v7.0 Scope:${t.scope || 'cross'} Task:${t.title || t}\n  - Cite-required: ${t.cite || 'MASTER-ARCHITECT-PROMPT v7.0'}\n  - Expected output: ${t.expected || 'artifact + commit + DEC entry if irreversible'}`
  }).join('\n')

  const blocks = (d.blocking_issues || []).map((b: any) => {
    return `- BLOCK-${b.id || '???'}: ${b.title}\n  - Severity: ${b.severity || 'P1'}\n  - Lane: ${b.lane || 'F'}\n  - Status: ${b.status || 'open'}\n  - ETA: ${b.eta || 'TBD'}`
  }).join('\n')

  const decisions = (d.open_decisions || []).map((dec: any) => {
    return `- ${dec.id || 'DEC-XXXX'} (${dec.status || 'PROPOSED'}): ${dec.title}\n  - Context: ${dec.context || 'TBD'}\n  - Options: ${dec.options || 'A | B | C'}`
  }).join('\n')

  const cites = (d.citations || []).map((c: string) => `- ${c}`).join('\n')

  const laneStatus = d.lane_status || {}
  const lf = (k: string) => laneStatus[k] || 'not-started'

  return `[HANDOFF-START]

═══════════════════════════════════════════════════════════════
SPARKMIND SOVEREIGN — SESSION HANDOFF v2.0
═══════════════════════════════════════════════════════════════

## 1. METADATA
- Session ID: ${d.session_id}
- Previous AI: ${d.previous_ai || 'Genspark AI Developer'}
- Operator: ${d.operator || 'Haidar'}
- Handoff Date: ${d.handoff_date}
- Doctrine Loaded: MASTER-ARCHITECT-PROMPT ${d.doctrine_version || 'v7.0'}
- Companions: SESSION-HANDOFF v2.0 + FULL-SPRINT-PLAN v1.0

## 2. DOCTRINE STATE
- Doctrine version: ${d.doctrine_version || 'v7.0'} (4-sub-brand parallel · HARDENED)
- Constraints: 16 hardcoded (no violation: ✅)
- Sub-brand lock: BarberKas (P0) · KuratorKas (P1) · PaceLokal (P2) · Nurani.OS (P3)
- Execution mode: PARALLEL (4-lane)
- Stack: 100% Cloudflare-native

## 3. SPRINT STATE
- Sprint Day: D${d.sprint_day ?? '?'}/D60
- Sprint End: 2026-07-17
- Composite Sovereign Health: ${d.composite_health ?? '?'}/100 ${d.health_status || 'AMBER'}
- Target D60: 78/100 GREEN

## 4. LANE FOCUS (4 PARALLEL)
- LANE F (Foundation): ${lf('F')}
- LANE E (BarberKas):  ${lf('E')}
- LANE K (KuratorKas): ${lf('K')}
- LANE B (PaceLokal):  ${lf('B')}
- LANE N (Nurani.OS):  ${lf('N')}
- Dominant lane this session: ${d.lane_focus || 'META'}

## 5. LAST DELTA
${d.last_delta || '- (no delta recorded)'}

## 6. BLOCKING ISSUES (P0/P1)
${blocks || '- (none)'}

## 7. NEXT 3 TASKS (Execute order)
${tasks || '- (none)'}

## 8. OPEN DECISIONS (Belum di-log)
${decisions || '- (none)'}

## 9. CITATIONS REQUIRED
${cites || '- MASTER-ARCHITECT-PROMPT v7.0\n- FULL-SPRINT-PLAN v1.0'}

## 10. CONSTITUTIONAL FLAGS
${d.constitutional_flags || '- Safety: none\n- Halal: none\n- PII leak: none\n- Drift signals: none'}

## 11. CONTEXT CARRY-OVER
${d.context_carry_over || '- Last user state: focused\n- Time pressure: D' + (d.sprint_day || 3) + '/D60 sprint window'}

## 12. INVOCATION HINT (Copy ke session baru)
${d.invocation_hint || `@Sovereign-Architect v7.0\nResume from: SESSION-HANDOFF v2.0 (${d.session_id})\nLane focus: ${d.lane_focus || 'F'}\nNext task: TASK-1 above\nCycle: 7-layer (L0–L6)`}

═══════════════════════════════════════════════════════════════
[HANDOFF-END]`
}

export default handoffs
