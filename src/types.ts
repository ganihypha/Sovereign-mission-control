// Cloudflare Bindings for Hono context
export type Bindings = {
  DB: D1Database
}

export type AppEnv = {
  Bindings: Bindings
}
