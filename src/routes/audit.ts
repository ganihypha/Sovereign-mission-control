import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { RISK_CHECKLIST, CONSTRAINTS, DRIFT_SIGNALS, WEAKNESSES } from '../data/doctrine'

const audit = new Hono<AppEnv>()

// ─── Run risk checklist (interactive) ─────────────────────────
audit.post('/risk-check', async (c) => {
  try {
    const body = await c.req.json<{ target: string; passed_ids: number[]; failed_ids?: number[]; warning_ids?: number[]; notes?: string }>()
    const passed = body.passed_ids || []
    const failed = body.failed_ids || []
    const warnings = body.warning_ids || []
    const total = RISK_CHECKLIST.length
    const passedCount = passed.length
    const failedCount = failed.length
    const warnCount = warnings.length

    // Verdict logic
    const hasP0Fail = failed.some((id) => {
      const item = RISK_CHECKLIST.find((r) => r.id === id)
      return item?.priority === 'P0'
    })
    let verdict = 'SAFE TO MERGE'
    if (hasP0Fail) verdict = 'HOLD MERGE'
    else if (failedCount > 0) verdict = 'NEEDS REVIEW'

    // Build category summary
    const summary: Record<string, { passed: number; failed: number; total: number }> = {}
    for (const item of RISK_CHECKLIST) {
      if (!summary[item.category]) summary[item.category] = { passed: 0, failed: 0, total: 0 }
      summary[item.category].total++
      if (passed.includes(item.id)) summary[item.category].passed++
      if (failed.includes(item.id)) summary[item.category].failed++
    }

    const runId = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const details = {
      passed_ids: passed,
      failed_ids: failed,
      warning_ids: warnings,
      summary,
      failed_items: failed.map((id) => RISK_CHECKLIST.find((r) => r.id === id)).filter(Boolean),
    }

    await c.env.DB.prepare(
      `INSERT INTO audit_runs (run_id, target, category, total_items, passed, failed, warnings, verdict, details, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      runId,
      body.target || 'unspecified',
      'risk-checklist',
      total,
      passedCount,
      failedCount,
      warnCount,
      verdict,
      JSON.stringify(details),
      body.notes || null
    ).run()

    return c.json({
      success: true,
      run_id: runId,
      verdict,
      total,
      passed: passedCount,
      failed: failedCount,
      warnings: warnCount,
      summary,
      output: formatRiskOutput(summary, verdict, failedCount, total, passedCount),
      details,
    }, 201)
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Doctrine self-audit ──────────────────────────────────────
audit.post('/doctrine-self-audit', async (c) => {
  try {
    const body = await c.req.json<{ check_constraints?: Record<number, boolean>; check_drift?: Record<number, boolean>; notes?: string }>()
    const constraintChecks = body.check_constraints || {}
    const driftChecks = body.check_drift || {}

    const constraintTotal = CONSTRAINTS.length
    const constraintPassed = Object.values(constraintChecks).filter((v) => v === true).length
    const constraintFailed = Object.values(constraintChecks).filter((v) => v === false).length

    const driftTotal = DRIFT_SIGNALS.length
    const driftRaised = Object.values(driftChecks).filter((v) => v === true).length // true = signal RAISED (bad)

    const failedConstraints = Object.entries(constraintChecks).filter(([_, v]) => v === false).map(([k]) => parseInt(k))
    const raisedDrifts = Object.entries(driftChecks).filter(([_, v]) => v === true).map(([k]) => parseInt(k))

    const hasCriticalConstraintFail = failedConstraints.some((id) => {
      const c = CONSTRAINTS.find((x) => x.id === id)
      return c?.critical
    })

    const verdict = hasCriticalConstraintFail || driftRaised > 3
      ? 'DOCTRINE DRIFT — INTERVENE'
      : driftRaised > 0 || constraintFailed > 0
        ? 'MINOR DRIFT — MONITOR'
        : 'DOCTRINE INTACT'

    const runId = `doctrine-audit-${Date.now()}`
    const details = {
      constraints: { total: constraintTotal, passed: constraintPassed, failed: constraintFailed, failed_ids: failedConstraints },
      drift_signals: { total: driftTotal, raised: driftRaised, raised_ids: raisedDrifts },
      failed_constraints: failedConstraints.map((id) => CONSTRAINTS.find((x) => x.id === id)),
      raised_drifts: raisedDrifts.map((id) => DRIFT_SIGNALS.find((x) => x.id === id)),
    }

    await c.env.DB.prepare(
      `INSERT INTO audit_runs (run_id, target, category, total_items, passed, failed, warnings, verdict, details, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      runId,
      'doctrine v7.0',
      'doctrine-self-audit',
      constraintTotal + driftTotal,
      constraintPassed,
      constraintFailed + driftRaised,
      0,
      verdict,
      JSON.stringify(details),
      body.notes || null
    ).run()

    return c.json({ success: true, run_id: runId, verdict, details })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── List audit runs ──────────────────────────────────────────
audit.get('/runs', async (c) => {
  try {
    const category = c.req.query('category')
    let sql = `SELECT id, run_id, target, category, total_items, passed, failed, verdict, created_at FROM audit_runs`
    const params: any[] = []
    if (category) { sql += ` WHERE category = ?`; params.push(category) }
    sql += ` ORDER BY created_at DESC LIMIT 100`
    const { results } = await c.env.DB.prepare(sql).bind(...params).all()
    return c.json({ runs: results, total: results.length })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

audit.get('/runs/:run_id', async (c) => {
  try {
    const row: any = await c.env.DB.prepare(`SELECT * FROM audit_runs WHERE run_id = ?`).bind(c.req.param('run_id')).first()
    if (!row) return c.json({ error: 'Run not found' }, 404)
    return c.json({ ...row, details: row.details ? JSON.parse(row.details) : null })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Hardener analysis: input prompt/doctrine snippet, get weakness scan ─
audit.post('/hardener-scan', async (c) => {
  try {
    const body = await c.req.json<{ text: string; target?: string }>()
    const text = (body.text || '').toLowerCase()

    const findings: any[] = []

    // Constraint detection
    for (const cn of CONSTRAINTS) {
      const tokens = cn.text.toLowerCase().split(/[\s,()]+/).filter((t) => t.length > 4)
      const matched = tokens.some((t) => text.includes(t))
      if (cn.critical && !matched) {
        findings.push({ severity: 'WARN', code: `C-${cn.id}`, message: `Critical constraint #${cn.id} not referenced: "${cn.text}"` })
      }
    }

    // Drift signal detection (simple keyword)
    const driftPatterns: Array<{ id: number; pat: RegExp; msg: string }> = [
      { id: 1, pat: /(aws|gcp|azure|vercel|firebase)/, msg: 'Non-Cloudflare stack mentioned' },
      { id: 8, pat: /single.?pg|only.?duitku|only.?xendit/, msg: 'Single-PG lock-in hint' },
      { id: 10, pat: /3.?sub.?brand|three.?brand/, msg: '3-brand era pattern detected (must be 4)' },
      { id: 13, pat: /sequential|one.?at.?a.?time/, msg: 'Sequential execution mode hint (LOCK = PARALLEL)' },
      { id: 22, pat: /supabase|firebase/, msg: 'Stack regression: Supabase/Firebase mentioned' },
    ]
    for (const dp of driftPatterns) {
      if (dp.pat.test(text)) {
        const drift = DRIFT_SIGNALS.find((d) => d.id === dp.id)
        findings.push({ severity: 'CRIT', code: `D-${dp.id}`, message: `Drift signal #${dp.id}: ${dp.msg}`, group: drift?.group })
      }
    }

    // Citation check
    if (!/v\d+\.\d+/.test(text)) {
      findings.push({ severity: 'WARN', code: 'CITE-1', message: 'No version number found (e.g. v7.0, v6.0). Citations must include version.' })
    }
    if (!/§\d+/.test(text) && !/section.?\d+/i.test(text)) {
      findings.push({ severity: 'INFO', code: 'CITE-2', message: 'No section anchor (e.g. §27). Strong citations include section.' })
    }

    // 13 weaknesses sniff
    const weaknessChecks = [
      { wid: 1, pat: /genspark/i, present: true, msg: 'Genspark mode bridge mentioned ✅' },
      { wid: 2, pat: /bootstrap\.sh|init-app\.sh/i, present: true, msg: 'Bootstrap script referenced ✅' },
      { wid: 3, pat: /supabase|migration/i, msg: 'Migration plan referenced (must address per §29)' },
      { wid: 5, pat: /acceptance|definition.?of.?done/i, present: true, msg: 'Acceptance criteria mentioned ✅' },
      { wid: 6, pat: /risk.?checklist|20.?item/i, present: true, msg: 'Risk checklist mentioned ✅' },
      { wid: 10, pat: /smoke.?test|curl.+health/i, present: true, msg: 'Smoke test referenced ✅' },
    ]
    for (const w of weaknessChecks) {
      const m = w.pat.test(text)
      if (w.present && m) {
        findings.push({ severity: 'OK', code: `W-${w.wid}`, message: w.msg })
      } else if (!w.present && !m) {
        findings.push({ severity: 'WARN', code: `W-${w.wid}`, message: `Weakness #${w.wid} not addressed` })
      }
    }

    const verdict = findings.some((f) => f.severity === 'CRIT')
      ? 'CRITICAL DRIFT'
      : findings.some((f) => f.severity === 'WARN')
        ? 'NEEDS HARDENING'
        : 'HARDENING PASS'

    return c.json({
      success: true,
      verdict,
      target: body.target || 'inline-text',
      findings,
      stats: {
        ok: findings.filter((f) => f.severity === 'OK').length,
        info: findings.filter((f) => f.severity === 'INFO').length,
        warn: findings.filter((f) => f.severity === 'WARN').length,
        crit: findings.filter((f) => f.severity === 'CRIT').length,
      },
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

// ─── Helpers ──────────────────────────────────────────────────
function formatRiskOutput(summary: Record<string, { passed: number; failed: number; total: number }>, verdict: string, failed: number, total: number, passed: number): string {
  const lines = ['[VERIFY · RISK CHECKLIST]']
  for (const [cat, s] of Object.entries(summary)) {
    const icon = s.failed === 0 ? '✅' : '⚠️'
    lines.push(`${cat}: ${s.passed}/${s.total} ${icon}`)
  }
  lines.push(`TOTAL: ${passed}/${total} — ${verdict}`)
  return lines.join('\n')
}

export default audit
