const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export async function getRecommendations(preferences) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sessionStorage.getItem('maumakan.auth.token') ?? ''}`,
      },
      body: JSON.stringify(preferences),
      signal: AbortSignal.timeout(15000),
    })
  } catch {
    throw new Error('Tidak dapat terhubung ke server. Silakan coba lagi.')
  }
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'Gagal mengambil tempat makan.')
  return data
}
