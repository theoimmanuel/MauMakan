import { HttpError } from './auth.js'

const fields = ['id', 'displayName', 'formattedAddress', 'rating', 'userRatingCount',
  'priceLevel', 'googleMapsUri', 'primaryTypeDisplayName', 'attributions']

export function createPlacesClient({ apiKey = process.env.GOOGLE_PLACES_API_KEY, fetchImpl = fetch } = {}) {
  return async function searchPlaces({ location } = {}) {
    if (typeof location !== 'string' || !location.trim() || location.trim().length > 200) {
      throw new HttpError(400, 'Isi lokasi pencarian dengan 1–200 karakter.')
    }
    if (!apiKey?.trim()) throw new HttpError(503, 'Layanan tempat makan belum dikonfigurasi.')
    let data
    try {
      const response = await fetchImpl('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': fields.map((field) => `places.${field}`).join(','),
        },
        body: JSON.stringify({ textQuery: `restoran di ${location.trim()}`, includedType: 'restaurant',
          strictTypeFiltering: true, languageCode: 'id', regionCode: 'ID', pageSize: 20 }),
        signal: AbortSignal.timeout(10_000),
      })
      if (!response.ok) {
        throw new HttpError(response.status === 429 ? 503 : 502,
          response.status === 429 ? 'Layanan tempat makan sedang sibuk. Coba lagi nanti.' : 'Gagal mengambil data tempat makan. Coba lagi nanti.')
      }
      data = await response.json()
      if (!data || typeof data !== 'object' || Array.isArray(data) || (data.places !== undefined && !Array.isArray(data.places))) throw new Error('Invalid response')
      if (data.places?.some((place) => !place || typeof place.id !== 'string')) throw new Error('Invalid place')
    } catch (error) {
      if (error instanceof HttpError) throw error
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new HttpError(504, 'Pencarian terlalu lama. Silakan coba lagi.')
      }
      throw new HttpError(502, 'Tidak dapat menghubungi layanan tempat makan. Coba lagi nanti.')
    }
    return { places: (data.places ?? []).map((place) => ({
      id: place.id,
      name: place.displayName?.text || 'Nama tempat tidak tersedia',
      address: place.formattedAddress || null,
      category: place.primaryTypeDisplayName?.text || null,
      rating: place.rating ?? null,
      userRatingCount: place.userRatingCount ?? null,
      priceLevel: place.priceLevel ?? null,
      googleMapsUri: place.googleMapsUri ?? null,
      attributions: place.attributions ?? [],
    })) }
  }
}
