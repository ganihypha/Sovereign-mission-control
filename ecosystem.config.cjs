// Sovereign Mission Control — PM2 config
// Anchor: MASTER-ARCHITECT-PROMPT v7.0 §27.4
module.exports = {
  apps: [
    {
      name: 'sovereign',
      script: 'npx',
      args: 'wrangler pages dev dist --d1=sparkmind-sovereign-production --local --ip 0.0.0.0 --port 3000',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      watch: false,
      instances: 1,
      exec_mode: 'fork',
      max_restarts: 5,
      restart_delay: 2000
    }
  ]
}
