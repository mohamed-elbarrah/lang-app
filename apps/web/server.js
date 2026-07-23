import http, { createServer } from 'http'
import next from 'next'

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = parseInt(process.env.PORT || '3000', 10)
const apiTarget = process.env.API_TARGET || 'http://localhost:3001'

const app = next({ dev })
const handle = app.getRequestHandler()

function proxyRequest(req, res) {
  const parsed = new URL(req.url, apiTarget)
  const proxyHeaders = { ...req.headers }
  delete proxyHeaders.connection
  proxyHeaders['x-forwarded-for'] = req.socket.remoteAddress

  const proxyReq = http.request(
    parsed,
    {
      method: req.method,
      headers: proxyHeaders,
      timeout: 120000,
    },
    (proxyRes) => {
      const responseHeaders = { ...proxyRes.headers }
      res.writeHead(proxyRes.statusCode, responseHeaders)
      proxyRes.pipe(res, { end: true })
    },
  )

  proxyReq.on('error', () => {
    if (res.headersSent) return
    res.writeHead(502, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: false, error: { code: 502, message: 'Backend unavailable' } }))
  })

  proxyReq.on('timeout', () => {
    proxyReq.destroy()
    if (res.headersSent) return
    res.writeHead(504, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ success: false, error: { code: 504, message: 'Backend timeout' } }))
  })

  req.on('error', () => proxyReq.destroy())
  req.pipe(proxyReq, { end: true })
}

app.prepare().then(() => {
  createServer((req, res) => {
    const url = new URL(req.url, `http://${hostname}:${port}`)

    if (url.pathname.startsWith('/api/')) {
      return proxyRequest(req, res)
    }

    handle(req, res)
  }).listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
