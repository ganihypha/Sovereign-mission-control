import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { SPRINT_WEEKS } from '../data/doctrine'

const sprint = new Hono<AppEnv>()

// ─── Sprint days ──────────────────────────────────────────────
sprint.get('/days', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM sprint_progress ORDER BY sprint_day ASC`).all()
    return c.json({ days: results, total: results.length })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

sprint.get('/days/:day', async (c) => {
  const day = parseInt(c.req.param('day'), 10)
  try {
    const row = await c.env.DB.prepare(`SELECT * FROM sprint_progress WHERE sprint_day = ?`).bind(day).first()
    return c.json(row || { sprint_day: day, status: 'not-scheduled' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

sprint.patch('/days/:day', async (c) => {
  const day = parseInt(c.req.param('day'), 10)
  try {
    const body = await c.req.json()
    const allowed = ['status', 'composite_health', 'notes_md', 'lane_focus_am', 'lane_focus_pm', 'founder_review']
    const sets: string[] = []
    const vals: any[] = []
    for (const k of allowed) {
      if (body[k] !== undefined) { sets.push(`${k} = ?`); vals.push(body[k]) }
    }
    if (sets.length === 0) return c.json({ error: 'No fields' }, 400)
    sets.push('updated_at = CURRENT_TIMESTAMP')
    vals.push(day)
    await c.env.DB.prepare(`UPDATE sprint_progress SET ${sets.join(', ')} WHERE sprint_day = ?`).bind(...vals).run()
    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Weeks (static doctrine + dynamic progress overlay) ───────
sprint.get('/weeks', (c) => c.json({ weeks: SPRINT_WEEKS }))

// ─── Gaps ─────────────────────────────────────────────────────
sprint.get('/gaps', async (c) => {
  try {
    const category = c.req.query('category')
    const status = c.req.query('status')
    let sql = `SELECT * FROM gaps WHERE 1=1`
    const params: any[] = []
    if (category) { sql += ` AND category = ?`; params.push(category) }
    if (status) { sql += ` AND status = ?`; params.push(status) }
    sql += ` ORDER BY deadline_day ASC, gap_id ASC`
    const { results } = await c.env.DB.prepare(sql).bind(...params).all()
    // Counts
    const counts: Record<string, number> = {}
    const statusCounts: Record<string, number> = {}
    for (const g of results as any[]) {
      counts[g.category] = (counts[g.category] || 0) + 1
      statusCounts[g.status] = (statusCounts[g.status] || 0) + 1
    }
    return c.json({ gaps: results, total: results.length, byCategory: counts, byStatus: statusCounts })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

sprint.patch('/gaps/:gap_id', async (c) => {
  const id = c.req.param('gap_id')
  try {
    const body = await c.req.json()
    const allowed = ['status', 'notes', 'resolved_commit']
    const sets: string[] = []
    const vals: any[] = []
    for (const k of allowed) {
      if (body[k] !== undefined) { sets.push(`${k} = ?`); vals.push(body[k]) }
    }
    if (body.status === 'resolved') { sets.push('resolved_at = CURRENT_TIMESTAMP') }
    if (sets.length === 0) return c.json({ error: 'No fields' }, 400)
    sets.push('updated_at = CURRENT_TIMESTAMP')
    vals.push(id)
    await c.env.DB.prepare(`UPDATE gaps SET ${sets.join(', ')} WHERE gap_id = ?`).bind(...vals).run()
    return c.json({ success: true })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Health snapshots ─────────────────────────────────────────
sprint.get('/health', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`SELECT * FROM health_snapshots ORDER BY sprint_day ASC, snapshot_date ASC`).all()
    return c.json({ snapshots: results, latest: results[results.length - 1] || null })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

sprint.post('/health', async (c) => {
  try {
    const body = await c.req.json()
    const composite = body.composite || Math.round(
      ((body.cross_brand || 0) * 0.14 +
       (body.barberkas || 0) * 0.20 +
       (body.kuratorkas || 0) * 0.12 +
       (body.pacelokal || 0) * 0.10 +
       (body.nurani_os || 0) * 0.08 +
       (body.engineering_discipline || 0) * 0.12 +
       (body.pg_router || 0) * 0.12 +
       (body.doctrine || 0) * 0.12)
    )
    const status = composite >= 75 ? 'GREEN' : composite >= 50 ? 'AMBER' : 'RED'
    const result = await c.env.DB.prepare(
      `INSERT INTO health_snapshots
        (snapshot_date, sprint_day, cross_brand, barberkas, kuratorkas, pacelokal, nurani_os, engineering_discipline, pg_router, doctrine, composite, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.snapshot_date || new Date().toISOString().slice(0, 10),
      body.sprint_day ?? null,
      body.cross_brand || 0,
      body.barberkas || 0,
      body.kuratorkas || 0,
      body.pacelokal || 0,
      body.nurani_os || 0,
      body.engineering_discipline || 0,
      body.pg_router || 0,
      body.doctrine || 0,
      composite,
      status,
      body.notes || null
    ).run()
    return c.json({ success: true, id: result.meta.last_row_id, composite, status }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default sprint
