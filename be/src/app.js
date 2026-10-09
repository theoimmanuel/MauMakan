import { createServer } from 'node:http'
import {
  HttpError, validateCredentials, hashPassword, verifyPassword,
  createSession, readToken, findSession, tokenHash,
} from './auth.js'

const publicColumns = 'id, name, email, is_guest, created_at'
// Equal-cost password work for an unknown email, without storing a real credential.
const dummyPasswordHash = `scrypt$${'0'.repeat(32)}$${'0'.repeat(128)}`

async function readJson(request) {
  if (request.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
    throw new HttpError(415, 'Gunakan Content-Type application/json.')
  }
  let length = 0
  const chunks = []
  for await (const chunk of request) {
    length += chunk.length
    if (length > 16384) throw new HttpError(413, 'Data permintaan terlalu besar.')
    chunks.push(chunk)
  }
  try {
    const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error()
    return body
  } catch {
    throw new HttpError(400, 'JSON tidak valid.')
  }
}

async function transaction(pool, action) {
  const db = await pool.connect()
  try {
    await db.query('BEGIN')
    const result = await action(db)
    await db.query('COMMIT')
    return result
  } catch (error) {
    await db.query('ROLLBACK')
    throw error
  } finally {
    db.release()
  }
}

export function createApp(pool, { frontendOrigin = 'http://localhost:5173', rateLimit = 30 } = {}) {
  const attempts = new Map()
  return createServer(async (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Cache-Control', 'no-store')
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Vary', 'Origin')
    const send = (status, data) => {
      response.writeHead(status)
      response.end(JSON.stringify(data))
    }
    try {
      const origin = request.headers.origin
      if (origin && origin !== frontendOrigin) throw new HttpError(403, 'Origin tidak diizinkan.')
      if (origin) response.setHeader('Access-Control-Allow-Origin', origin)
      if (request.method === 'OPTIONS') {
        response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        response.writeHead(204)
        response.end()
        return
      }
      const path = new URL(request.url, 'http://localhost').pathname
      if (request.method === 'POST' && ['/auth/register', '/auth/login', '/auth/guest'].includes(path)) {
        const now = Date.now()
        for (const [key, value] of attempts) {
          if (value.until <= now) attempts.delete(key)
        }
        const ip = request.socket.remoteAddress
        const attempt = attempts.get(ip) ?? { count: 0, until: now + 60_000 }
        attempts.set(ip, attempt)
        if (++attempt.count > rateLimit) {
          response.setHeader('Retry-After', String(Math.ceil((attempt.until - now) / 1000)))
          throw new HttpError(429, 'Terlalu banyak percobaan. Coba lagi sebentar.')
        }
        const body = await readJson(request)
        if (path === '/auth/register') {
          const { email, password, name } = validateCredentials(body, true)
          const passwordHash = await hashPassword(password)
          const result = await transaction(pool, async (db) => {
            const { rows } = await db.query(
              `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING ${publicColumns}`,
              [name, email, passwordHash],
            )
            return createSession(db, rows[0])
          })
          return send(201, result)
        }
        if (path === '/auth/login') {
          const { email, password } = validateCredentials(body)
          const { rows } = await pool.query(
            `SELECT ${publicColumns}, password_hash FROM users WHERE lower(email) = $1 AND NOT is_guest`,
            [email],
          )
          const record = rows[0]
          const valid = await verifyPassword(password, record?.password_hash ?? dummyPasswordHash)
          if (!record || !valid) throw new HttpError(401, 'Email atau password salah.')
          const { password_hash: _passwordHash, ...user } = record
          return send(200, await createSession(pool, user))
        }
        const result = await transaction(pool, async (db) => {
          const { rows } = await db.query(
            `INSERT INTO users (name, is_guest) VALUES ('Guest', TRUE) RETURNING ${publicColumns}`,
          )
          return createSession(db, rows[0])
        })
        return send(201, result)
      }
      if (request.method === 'GET' && path === '/auth/me') {
        return send(200, { user: await findSession(pool, readToken(request)) })
      }
      if (request.method === 'POST' && path === '/auth/logout') {
        await pool.query('DELETE FROM auth_sessions WHERE token_hash = $1', [tokenHash(readToken(request))])
        return send(200, { message: 'Berhasil keluar.' })
      }
      throw new HttpError(404, 'Endpoint tidak ditemukan.')
    } catch (error) {
      if (error.code === '23505') return send(409, { message: 'Email sudah terdaftar.' })
      if (error instanceof HttpError) return send(error.status, { message: error.message })
      // Never log request payloads, passwords, tokens, or connection strings.
      console.error('Auth API error:', error.code ?? error.name)
      send(500, { message: 'Terjadi kesalahan server. Silakan coba lagi.' })
    }
  })
}
