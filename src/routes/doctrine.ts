import { Hono } from 'hono'
import type { AppEnv } from '../types'
import {
  DOCTRINE_META,
  SUB_BRANDS,
  SHARED_PACKAGES,
  CONSTRAINTS,
  DRIFT_SIGNALS,
  WEAKNESSES,
  SPRINT_WEEKS,
  ARTIFACTS,
  AIDEV_PILLARS,
  RISK_CHECKLIST,
  HEALTH_PILLARS,
  COST_TARGETS,
  SOVEREIGN_CADENCE,
  LANE_ROTATION,
} from '../data/doctrine'

const doctrine = new Hono<AppEnv>()

doctrine.get('/meta', (c) => c.json(DOCTRINE_META))
doctrine.get('/version', (c) => c.json({
  version: DOCTRINE_META.version,
  status: DOCTRINE_META.status,
  date: DOCTRINE_META.date,
  supersedes: DOCTRINE_META.supersedes,
  trilogy: DOCTRINE_META.trilogy,
}))
doctrine.get('/sub-brands', (c) => c.json({ subBrands: SUB_BRANDS, total: SUB_BRANDS.length }))
doctrine.get('/sub-brands/:id', (c) => {
  const id = c.req.param('id')
  const brand = SUB_BRANDS.find((b) => b.id === id)
  if (!brand) return c.json({ error: 'Sub-brand not found' }, 404)
  return c.json(brand)
})
doctrine.get('/packages', (c) => c.json({ packages: SHARED_PACKAGES }))
doctrine.get('/constraints', (c) => c.json({ constraints: CONSTRAINTS, total: CONSTRAINTS.length }))
doctrine.get('/drift-signals', (c) => c.json({ signals: DRIFT_SIGNALS, total: DRIFT_SIGNALS.length }))
doctrine.get('/weaknesses', (c) => c.json({ weaknesses: WEAKNESSES, total: WEAKNESSES.length }))
doctrine.get('/sprint', (c) => c.json({ weeks: SPRINT_WEEKS, totalDays: 60 }))
doctrine.get('/artifacts', (c) => c.json({ artifacts: ARTIFACTS }))
doctrine.get('/aidev-pillars', (c) => c.json({ pillars: AIDEV_PILLARS }))
doctrine.get('/risk-checklist', (c) => c.json({ checklist: RISK_CHECKLIST, total: RISK_CHECKLIST.length }))
doctrine.get('/health-pillars', (c) => c.json({ pillars: HEALTH_PILLARS }))
doctrine.get('/cost-targets', (c) => c.json({ targets: COST_TARGETS }))
doctrine.get('/cadence', (c) => c.json({ cadence: SOVEREIGN_CADENCE, rotation: LANE_ROTATION }))

// All-in-one snapshot
doctrine.get('/snapshot', (c) => c.json({
  meta: DOCTRINE_META,
  subBrands: SUB_BRANDS,
  packages: SHARED_PACKAGES,
  constraints: CONSTRAINTS,
  driftSignalsCount: DRIFT_SIGNALS.length,
  weaknessesCount: WEAKNESSES.length,
  sprintWeeks: SPRINT_WEEKS.length,
  aidevPillars: AIDEV_PILLARS,
}))

export default doctrine
