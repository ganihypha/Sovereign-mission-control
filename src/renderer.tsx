import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SparkMind Sovereign — Mission Control v7.0</title>
        <meta name="description" content="SparkMind Sovereign Mission Control: trilogy execution dashboard, session handoff manager, decision log, sprint tracker, prompt builder, doctrine hardener. 4-sub-brand parallel mode." />
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🛡️%3C/text%3E%3C/svg%3E" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet" />
        <link href="/static/style.css" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      sovereign: { 50:'#f8fafc', 100:'#f1f5f9', 800:'#1e293b', 900:'#0f172a', 950:'#020617' }
                    },
                    fontFamily: {
                      mono: ['JetBrains Mono','ui-monospace','SFMono-Regular','monospace']
                    }
                  }
                }
              }
            `,
          }}
        />
      </head>
      <body class="bg-sovereign-950 text-slate-200 antialiased">{children}</body>
    </html>
  )
})
