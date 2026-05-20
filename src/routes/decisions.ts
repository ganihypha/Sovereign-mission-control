import { Hono } from 'hono'
import type { AppEnv } from '../types'

const decisions = new Hono<AppEnv>()

// ─── List all decisions ───────────────────────────────────────
decisions.get('/', async (c) => {
  try {
    const status = c.req.query('status')
    const lane = c.req.query('lane')
    let sql = `SELECT * FROM decisions WHERE 1=1`
    const params: any[] = []
    if (status) { sql += ` AND status = ?`; params.push(status) }
    if (lane) { sql += ` AND lane = ?`; params.push(lane) }
    sql += ` ORDER BY dec_id ASC`
    const stmt = c.env.DB.prepare(sql).bind(...params)
    const { results } = await stmt.all()
    return c.json({
      decisions: results.map((r: any) => ({ ...r, cites: r.cites ? JSON.parse(r.cites) : [] })),
      total: results.length,
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Get single decision ──────────────────────────────────────
decisions.get('/:dec_id', async (c) => {
  const id = c.req.param('dec_id')
  try {
    const row: any = await c.env.DB.prepare(`SELECT * FROM decisions WHERE dec_id = ?`).bind(id).first()
    if (!row) return c.json({ error: 'Decision not found' }, 404)
    return c.json({ ...row, cites: row.cites ? JSON.parse(row.cites) : [] })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Create decision ──────────────────────────────────────────
decisions.post('/', async (c) => {
  try {
    const body = await c.req.json()
    if (!body.dec_id || !body.title) return c.json({ error: 'dec_id + title required' }, 400)
    const result = await c.env.DB.prepare(
      `INSERT INTO decisions (dec_id, title, date, owner, status, lane, severity, cites, supersedes, context_md, decision_md, consequences_md, verification_md)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.dec_id,
      body.title,
      body.date || new Date().toISOString().slice(0, 10),
      body.owner || 'Haidar',
      body.status || 'PROPOSED',
      body.lane || 'META',
      body.severity || 'P1',
      JSON.stringify(body.cites || []),
      body.supersedes || null,
      body.context_md || '',
      body.decision_md || '',
      body.consequences_md || '',
      body.verification_md || ''
    ).run()
    return c.json({ success: true, id: result.meta.last_row_id, dec_id: body.dec_id }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Update decision status ───────────────────────────────────
decisions.patch('/:dec_id', async (c) => {
  const id = c.req.param('dec_id')
  try {
    const body = await c.req.json()
    const allowed = ['title', 'status', 'lane', 'severity', 'context_md', 'decision_md', 'consequences_md', 'verification_md']
    const sets: string[] = []
    const vals: any[] = []
    for (const k of allowed) {
      if (body[k] !== undefined) { sets.push(`${k} = ?`); vals.push(body[k]) }
    }
    if (body.cites !== undefined) { sets.push('cites = ?'); vals.push(JSON.stringify(body.cites)) }
    if (sets.length === 0) return c.json({ error: 'No fields to update' }, 400)
    sets.push('updated_at = CURRENT_TIMESTAMP')
    vals.push(id)
    await c.env.DB.prepare(`UPDATE decisions SET ${sets.join(', ')} WHERE dec_id = ?`).bind(...vals).run()
    return c.json({ success: true, dec_id: id })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Get next DEC-NNNN id ─────────────────────────────────────
decisions.get('/util/next-id', async (c) => {
  try {
    const row: any = await c.env.DB.prepare(`SELECT dec_id FROM decisions ORDER BY dec_id DESC LIMIT 1`).first()
    if (!row) return c.json({ next: 'DEC-0001' })
    const m = (row.dec_id as string).match(/DEC-(\d+)/)
    const n = m ? parseInt(m[1], 10) + 1 : 1
    return c.json({ next: `DEC-${String(n).padStart(4, '0')}`, previous: row.dec_id })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Export decision as YAML+MD ───────────────────────────────
decisions.get('/:dec_id/export', async (c) => {
  const id = c.req.param('dec_id')
  try {
    const row: any = await c.env.DB.prepare(`SELECT * FROM decisions WHERE dec_id = ?`).bind(id).first()
    if (!row) return c.json({ error: 'Decision not found' }, 404)
    const cites = row.cites ? JSON.parse(row.cites) : []
    const yaml = `---
id: ${row.dec_id}
date: ${row.date}
owner: ${row.owner}
status: ${row.status}
lane: ${row.lane}
severity: ${row.severity}
cites:
${cites.map((x: string) => `  - "${x}"`).join('\n')}
supersedes: ${row.supersedes || 'null'}
---

## ${row.dec_id} — ${row.title}

### Context
${row.context_md || ''}

### Decision
${row.decision_md || ''}

### Consequences
${row.consequences_md || ''}

### Verification
${row.verification_md || ''}
`
    return c.text(yaml, 200, { 'Content-Type': 'text/markdown; charset=utf-8' })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default decisions
