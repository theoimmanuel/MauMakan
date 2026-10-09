import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { readFile } from 'node:fs/promises'
import { once } from 'node:events'
import { randomUUID } from 'node:crypto'
import pg from 'pg'
import { createApp } from '../src/app.js'
import { tokenHash } from '../src/auth.js'

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('Isi TEST_DATABASE_URL dengan database PostgreSQL khusus pengujian.')
}
const schema = `auth_test_${randomUUID().replaceAll('-', '')}`
const admin = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL })
const pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL, options: `-c search_path=${schema},public` })
let server
let baseUrl

before(async () => {
  await admin.query(`CREATE SCHEMA ${schema}`)
  await pool.query(await readFile(new URL('../erd/mau_makan_apa_schema.sql', import.meta.url), 'utf8'))
  server = createApp(pool, { rateLimit: 100 })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  if (server?.listening) await new Promise((resolve) => server.close(resolve))
  await pool.end()
  await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`)
  await admin.end()
})

async function request(path, body, token, method = 'POST', extraHeaders = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extraHeaders,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  return { status: response.status, headers: response.headers, data: await response.json() }
}

const credentials = { name: 'Amelia', email: 'Amelia@example.com', password: 'aman-rahasia-123' }
let account

test('register creates an account and session without exposing password hashes', async () => {
  const result = await request('/auth/register', credentials)
  assert.equal(result.status, 201)
  account = result.data
  assert.equal(account.user.email, 'amelia@example.com')
  assert.equal(account.user.name, 'Amelia')
  assert.equal(account.user.is_guest, false)
  assert.equal(account.user.password_hash, undefined)
  assert.match(account.token, /^[a-f0-9]{64}$/)
  const { rows: [stored] } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [account.user.id])
  assert.match(stored.password_hash, /^scrypt\$/)
  assert.ok(!stored.password_hash.includes(credentials.password))
  const { rows: [session] } = await pool.query('SELECT token_hash FROM auth_sessions WHERE user_id = $1', [account.user.id])
  assert.equal(session.token_hash, tokenHash(account.token))
  assert.equal(result.headers.get('cache-control'), 'no-store')
})

test('duplicate email is rejected case-insensitively', async () => {
  assert.equal((await request('/auth/register', { ...credentials, email: ' AMELIA@example.com ' })).status, 409)
})

test('validation rejects missing/invalid email, password, and name', async () => {
  for (const changes of [
    { email: 'invalid' }, { email: null }, { email: 'a'.repeat(151) + '@example.com' },
    { password: 'short' }, { password: null }, { password: 'a'.repeat(129) },
    { name: '' }, { name: '   ' }, { name: 'a'.repeat(101) },
  ]) {
    assert.equal((await request('/auth/register', { ...credentials, ...changes })).status, 400)
  }
})

test('login normalizes email, preserves password, and issues a usable token', async () => {
  const result = await request('/auth/login', { ...credentials, email: ' AMELIA@EXAMPLE.COM ' })
  assert.equal(result.status, 200)
  assert.equal(result.data.user.id, account.user.id)
  assert.equal(result.data.user.password_hash, undefined)
  assert.notEqual(result.data.token, account.token)
  const me = await request('/auth/me', undefined, result.data.token, 'GET')
  assert.equal(me.status, 200)
  assert.equal(me.data.user.id, account.user.id)
})

test('unknown email and wrong password return the same generic error', async () => {
  const wrong = await request('/auth/login', { ...credentials, password: 'password-salah' })
  const unknown = await request('/auth/login', { ...credentials, email: 'unknown@example.com' })
  assert.equal(wrong.status, 401)
  assert.equal(unknown.status, 401)
  assert.deepEqual(wrong.data, unknown.data)
  assert.equal((await request('/auth/login', { ...credentials, email: "a'OR'1'='1@example.com" })).status, 401)
})

test('guest accounts have distinct identities and authenticated sessions without credentials', async () => {
  const first = await request('/auth/guest', {})
  const second = await request('/auth/guest', {})
  assert.equal(first.status, 201)
  assert.equal(first.data.user.is_guest, true)
  assert.equal(first.data.user.email, null)
  assert.notEqual(first.data.user.id, second.data.user.id)
  const me = await request('/auth/me', undefined, first.data.token, 'GET')
  assert.equal(me.data.user.is_guest, true)
  const { rows: [guest] } = await pool.query('SELECT password_hash FROM users WHERE id = $1', [first.data.user.id])
  assert.equal(guest.password_hash, null)
})

test('missing, malformed, unknown, and expired session tokens are rejected', async () => {
  for (const token of [undefined, 'invalid-token', 'a'.repeat(64)]) {
    assert.equal((await request('/auth/me', undefined, token, 'GET')).status, 401)
  }
  const session = (await request('/auth/guest', {})).data
  await pool.query(`UPDATE auth_sessions SET created_at = NOW() - INTERVAL '2 days',
    expires_at = NOW() - INTERVAL '1 day' WHERE token_hash = $1`, [tokenHash(session.token)])
  assert.equal((await request('/auth/me', undefined, session.token, 'GET')).status, 401)
})

test('logout revokes only its token and is safe to repeat', async () => {
  assert.equal((await request('/auth/logout', undefined, account.token)).status, 200)
  assert.equal((await request('/auth/me', undefined, account.token, 'GET')).status, 401)
  assert.equal((await request('/auth/logout', undefined, account.token)).status, 200)
  const login = await request('/auth/login', credentials)
  assert.equal(login.status, 200)
})

test('invalid JSON, non-object payloads, wrong media type, and oversized bodies fail safely', async () => {
  const malformed = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid',
  })
  assert.equal(malformed.status, 400)
  for (const body of [null, [], 'text']) assert.equal((await request('/auth/register', body)).status, 400)
  assert.equal((await request('/auth/register', credentials, undefined, 'POST', { 'Content-Type': 'text/plain' })).status, 415)
  const large = await request('/auth/register', { ...credentials, name: 'a'.repeat(17000) })
  assert.equal(large.status, 413)
})

test('CORS allows the configured frontend and rejects other origins', async () => {
  const allowed = await request('/auth/guest', {}, undefined, 'POST', { Origin: 'http://localhost:5173' })
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173')
  assert.equal((await request('/auth/guest', {}, undefined, 'POST', { Origin: 'https://untrusted.example' })).status, 403)
  const preflight = await fetch(`${baseUrl}/auth/login`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173' } })
  assert.equal(preflight.status, 204)
  assert.match(preflight.headers.get('access-control-allow-headers'), /Authorization/)
})

test('database enforces guest/account identity, email uniqueness, and cascading sessions', async () => {
  await assert.rejects(pool.query("INSERT INTO users (name) VALUES ('Incomplete')"), { code: '23514' })
  await assert.rejects(pool.query("INSERT INTO users (is_guest, email) VALUES (TRUE, 'guest@example.com')"), { code: '23514' })
  await assert.rejects(pool.query("INSERT INTO users (email, password_hash) VALUES ('AMELIA@example.com', 'hash')"), { code: '23505' })
  const guest = (await request('/auth/guest', {})).data
  await pool.query('DELETE FROM users WHERE id = $1', [guest.user.id])
  assert.equal((await request('/auth/me', undefined, guest.token, 'GET')).status, 401)
  const { rows } = await pool.query('SELECT * FROM auth_sessions WHERE user_id = $1', [guest.user.id])
  assert.equal(rows.length, 0)
})

test('registration rolls back the account if session creation fails', async () => {
  await pool.query(`CREATE FUNCTION reject_session() RETURNS trigger LANGUAGE plpgsql AS $$
    BEGIN RAISE EXCEPTION 'test session failure'; END; $$;
    CREATE TRIGGER reject_session BEFORE INSERT ON auth_sessions FOR EACH ROW EXECUTE FUNCTION reject_session();`)
  try {
    assert.equal((await request('/auth/register', { ...credentials, email: 'rollback@example.com' })).status, 500)
    const { rows } = await pool.query("SELECT id FROM users WHERE email = 'rollback@example.com'")
    assert.equal(rows.length, 0)
  } finally {
    await pool.query('DROP TRIGGER reject_session ON auth_sessions; DROP FUNCTION reject_session()')
  }
})

test('auth attempts are rate limited', async () => {
  const limited = createApp(pool, { rateLimit: 1 })
  limited.listen(0, '127.0.0.1')
  await once(limited, 'listening')
  const url = `http://127.0.0.1:${limited.address().port}/auth/login`
  try {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }
    assert.equal((await fetch(url, options)).status, 400)
    const result = await fetch(url, options)
    assert.equal(result.status, 429)
    assert.ok(Number(result.headers.get('retry-after')) > 0)
  } finally {
    await new Promise((resolve) => limited.close(resolve))
  }
})

test('migration upgrades legacy users without dropping existing data', async () => {
  const legacy = `${schema}_legacy`
  const db = await admin.connect()
  try {
    await db.query(`CREATE SCHEMA ${legacy}; SET search_path TO ${legacy}, public;
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100), email VARCHAR(150) UNIQUE,
        password_hash VARCHAR(255), is_guest BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      INSERT INTO users (name, email, password_hash) VALUES ('Existing', 'old@example.com', 'existing-hash');`)
    await db.query(await readFile(new URL('../migrations/001_user_auth.sql', import.meta.url), 'utf8'))
    const { rows } = await db.query("SELECT name FROM users WHERE email = 'old@example.com'")
    assert.equal(rows[0].name, 'Existing')
    await db.query('SELECT * FROM auth_sessions')
  } finally {
    await db.query('ROLLBACK')
    await db.query(`SET search_path TO public; DROP SCHEMA IF EXISTS ${legacy} CASCADE`)
    db.release()
  }
})
