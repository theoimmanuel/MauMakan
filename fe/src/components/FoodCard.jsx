const prices = {
  PRICE_LEVEL_FREE: 'Gratis',
  PRICE_LEVEL_INEXPENSIVE: 'Terjangkau',
  PRICE_LEVEL_MODERATE: 'Menengah',
  PRICE_LEVEL_EXPENSIVE: 'Mahal',
  PRICE_LEVEL_VERY_EXPENSIVE: 'Sangat mahal',
}

function safeLink(value) {
  return typeof value === 'string' && /^https:\/\//i.test(value) ? value : undefined
}

export function FoodCard({ food }) {
  if (!food) return null

  const price = food.price ?? food.price_min

  return (
    <article className="space-y-4 border-2 border-stone-900 bg-white p-5">
      {food.image_url && (
        <img src={food.image_url} alt={food.name || 'Makanan'} className="h-48 w-full object-cover" />
      )}
      <div>
        <p className="mb-2 text-xs font-semibold text-stone-500">TEMPAT MAKAN</p>
        <h2 className="break-words text-xl font-bold">{food.name}</h2>
        <p className="mt-2 text-sm text-stone-600">{food.address || food.location || 'Alamat belum tersedia'}</p>
      </div>
      {food.category && <p className="text-sm text-stone-600">{food.category}</p>}
      <p className="text-sm">
        {food.rating != null ? `★ ${food.rating} / 5 (${food.userRatingCount ?? 0} ulasan)` : 'Belum ada rating'}
      </p>
      {price != null && (
        <p className="text-sm font-bold">Rp {Number(price).toLocaleString('id-ID')}</p>
      )}
      <p className="text-sm">Kategori harga: {prices[food.priceLevel] || 'Belum tersedia'}</p>
      {safeLink(food.googleMapsUri) && (
        <a className="block text-sm font-semibold underline" href={food.googleMapsUri} target="_blank" rel="noopener noreferrer">Info & lokasi di Google Maps ↗</a>
      )}
      <p translate="no" className="whitespace-nowrap text-xs font-normal text-[#5e5e5e]">Google Maps</p>
      {food.attributions?.map((attribution, index) => (
        <a key={index} href={safeLink(attribution.providerUri)} target="_blank" rel="noopener noreferrer" className="block text-xs underline">{attribution.provider}</a>
      ))}
      {food.foods?.length > 0 && (
        <div className="border-t border-stone-200 pt-3">
          <p className="text-sm font-semibold">Menu dari katalog MauMakan</p>
          <ul className="mt-2 space-y-1 text-sm">
            {food.foods.map((item) => <li key={item.id}>{item.name} · {item.price == null ? 'Harga belum tersedia' : `Rp ${Number(item.price).toLocaleString('id-ID')}`}</li>)}
          </ul>
        </div>
      )}
    </article>
  )
}
