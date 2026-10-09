import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const deriveKey = promisify(scrypt)
const scryptOptions = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }

export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

export function validateCredentials(body, register = false) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = body.password
  if (email.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, 'Alamat email tidak valid.')
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw new HttpError(400, 'Password harus terdiri dari 8–128 karakter.')
  }
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (register && (!name || name.length > 100)) {
    throw new HttpError(400, 'Nama wajib diisi, maksimal 100 karakter.')
  }
  return { email, password, name }
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = await deriveKey(password, salt, 64, scryptOptions)
  return `scrypt$${salt}$${hash.toString('hex')}`
}

export async function verifyPassword(password, encoded) {
  const [algorithm, salt, hash] = (encoded ?? '').split('$')
  if (algorithm !== 'scrypt' || !/^[a-f0-9]{32}$/.test(salt) || !/^[a-f0-9]{128}$/.test(hash)) {
    return false
  }
  const actual = await deriveKey(password, salt, 64, scryptOptions)
  return timingSafeEqual(actual, Buffer.from(hash, 'hex'))
}

export function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(db, user) {
  const token = randomBytes(32).toString('hex')
  const { rows } = await db.query(
    `INSERT INTO auth_sessions (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '24 hours') RETURNING expires_at`,
    [user.id, tokenHash(token)],
  )
  return { user, token, expires_at: rows[0].expires_at }
}

export function readToken(request) {
  const match = /^Bearer ([a-f0-9]{64})$/.exec(request.headers.authorization ?? '')
  if (!match) throw new HttpError(401, 'Silakan login terlebih dahulu.')
  return match[1]
}

export async function findSession(db, token) {
  const { rows } = await db.query(
    `SELECT u.id, u.name, u.email, u.is_guest, u.created_at
     FROM auth_sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > NOW()`,
    [tokenHash(token)],
  )
  if (!rows[0]) throw new HttpError(401, 'Sesi telah berakhir. Silakan login kembali.')
  return rows[0]
}
