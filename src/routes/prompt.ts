import { Hono } from 'hono'
import type { AppEnv } from '../types'
import { SUB_BRANDS } from '../data/doctrine'

const prompt = new Hono<AppEnv>()

type BuilderInput = {
  scope?: string
  task?: string
  lane?: string
  sprint_day?: number
  deploy_target?: string
  cites?: string[]
  layer_1_context?: string
  layer_2_constraints?: string
  layer_3_spec?: string
  layer_4_acceptance?: string
  layer_5_output?: string
  save?: boolean
  title?: string
}

prompt.post('/build', async (c) => {
  try {
    const body = await c.req.json<BuilderInput>()
    const scope = body.scope || 'cross'
    const task = body.task || '<one-liner task description>'
    const lane = body.lane || 'F'
    const sprintDay = body.sprint_day ?? 3
    const deployTarget = body.deploy_target || 'local'
    const cites = body.cites && body.cites.length > 0 ? body.cites : [
      'MASTER-ARCHITECT-PROMPT v7.0 §28',
      'FULL-SPRINT-PLAN v1.0',
      'SESSION-HANDOFF v2.0 §02',
    ]

    const subBrand = SUB_BRANDS.find((s) => s.id === scope)
    const subBrandLine = subBrand
      ? `Sub-brand: ${subBrand.name} (${subBrand.priority} · LANE ${subBrand.lane}) — ${subBrand.subdomain}`
      : `Scope: cross-brand (infrastructure / shared)`

    const L1 = body.layer_1_context || `Project: SparkMind Sovereign — apps/${scope === 'cross' ? '*' : scope}/
Founder: Reza Estes / Haidar (solo, non-engineer reviewer)
Phase: D${sprintDay}/D60 sprint window
Lane: ${lane}
Mother brand: SparkMind — https://www.sparkmind.web.id/`

    const L2 = body.layer_2_constraints || `- Stack: Cloudflare Workers + D1 + R2 + KV + Pages (NO Supabase, NO Vercel)
- Build: Vite + @hono/vite-build/cloudflare-pages
- Mono: pnpm workspace + Turborepo
- PG: Duitku primary, Xendit fallback (dual-mandatory per constraint #7)
- Locale: Bahasa Indonesia (UI) + English (code/comments)
- Voice: Sovereign no-bullshit
- All secrets via wrangler secret put (never commit .dev.vars)
- 16 doctrine constraints active (esp. #1 stack lock, #13 4-sub-brand, #16 smoke test)`

    const L3 = body.layer_3_spec || `Reference: ${cites[0]}
${task}`

    const L4 = body.layer_4_acceptance || `1. TypeScript strict mode compile pass
2. npm run build exits 0
3. pm2 start ecosystem.config.cjs boots cleanly
4. curl http://localhost:3000/api/health returns {"status":"ok"}
5. Smoke test: bash scripts/smoke.sh exits 0
6. Decision log entry if irreversible decision made
7. Conventional commit message ready (feat:|fix:|refactor:|chore:)
8. 20-item risk checklist (§31) pass — output: "20/20 SAFE TO MERGE"`

    const L5 = body.layer_5_output || `1. [REASON] — plan + dependency graph
2. [BUILD] — full code blocks (no ellipsis, no "...")
3. [VERIFY] — smoke test commands + expected output
4. [CITE] — doc anchors with version + section
5. [HANDOFF] — next-step + files touched + DEC if any`

    const built = `@Sovereign-Architect v7.0
Host: Genspark AI Developer
Sandbox path: /home/user/webapp (DEFAULT — never deviate)
Scope: ${scope}
${subBrandLine}
Task: ${task}
Cycle: 7-layer (L0–L6)
AIDEV Pillar Check: required (4 pillars must pass)
Sprint Day: D${sprintDay}/D60
Lane focus: ${lane}
Deploy target: ${deployTarget}

Cite-required:
${cites.map((x) => `  - ${x}`).join('\n')}

# L1 · CONTEXT
${L1}

# L2 · CONSTRAINTS
${L2}

# L3 · SPEC
${L3}

# L4 · ACCEPTANCE
${L4}

# L5 · OUTPUT FORMAT
${L5}`

    // Optional save to DB
    let saved: any = null
    if (body.save) {
      const promptId = `prompt-${Date.now()}-${scope}`
      try {
        const r = await c.env.DB.prepare(
          `INSERT INTO prompts (prompt_id, title, scope, task, lane, sprint_day, deploy_target, cites, layer_1_context, layer_2_constraints, layer_3_spec, layer_4_acceptance, layer_5_output, built_prompt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(promptId, body.title || task.slice(0, 80), scope, task, lane, sprintDay, deployTarget, JSON.stringify(cites), L1, L2, L3, L4, L5, built).run()
        saved = { prompt_id: promptId, id: r.meta.last_row_id }
      } catch (e: any) {
        saved = { error: e.message }
      }
    }

    return c.json({
      success: true,
      prompt: built,
      meta: { scope, task, lane, sprintDay, deployTarget, cites, subBrand: subBrand?.name || null },
      layers: { L1, L2, L3, L4, L5 },
      saved,
    })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

prompt.get('/library', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(`SELECT id, prompt_id, title, scope, task, lane, sprint_day, deploy_target, created_at FROM prompts ORDER BY created_at DESC LIMIT 50`).all()
    return c.json({ prompts: results, total: results.length })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

prompt.get('/library/:prompt_id', async (c) => {
  try {
    const row: any = await c.env.DB.prepare(`SELECT * FROM prompts WHERE prompt_id = ?`).bind(c.req.param('prompt_id')).first()
    if (!row) return c.json({ error: 'Prompt not found' }, 404)
    return c.json({ ...row, cites: row.cites ? JSON.parse(row.cites) : [] })
  } catch (e: any) {
    return c.json({ error: e.message }, 500)
  }
})

export default prompt
