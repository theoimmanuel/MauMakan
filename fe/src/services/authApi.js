const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const TOKEN_KEY = 'maumakan.auth.token'

async function request(path, { method = 'POST', body, authenticated = false } = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY)
  let response
  try {
    response = await fetch(`${API_BASE_URL}/auth/${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Silakan coba lagi.')
  }
  const data = await response.json()
  if (!response.ok) {
    if (response.status === 401 && authenticated) sessionStorage.removeItem(TOKEN_KEY)
    throw new Error(data.message || 'Permintaan gagal. Silakan coba lagi.')
  }
  return data
}

export async function authenticate(mode, credentials = {}) {
  if (!['login', 'register', 'guest'].includes(mode)) throw new Error('Mode autentikasi tidak valid.')
  const data = await request(mode, { body: credentials })
  sessionStorage.setItem(TOKEN_KEY, data.token)
  return data.user
}

export async function getCurrentUser() {
  if (!sessionStorage.getItem(TOKEN_KEY)) return null
  const data = await request('me', { method: 'GET', authenticated: true })
  return data.user
}

export async function logout() {
  await request('logout', { authenticated: true })
  sessionStorage.removeItem(TOKEN_KEY)
}
