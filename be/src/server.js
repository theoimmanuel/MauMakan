import pg from 'pg'
import { createApp } from './app.js'

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi di be/.env.')
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
pool.on('error', (error) => console.error('Database error:', error.code ?? error.name))
await pool.query('SELECT 1')
const server = createApp(pool, { frontendOrigin: process.env.FRONTEND_ORIGIN })
const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '127.0.0.1'
server.listen(port, host, () => console.log(`MauMakan API: http://${host}:${port}`))
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => server.close(async () => { await pool.end() }))
}
