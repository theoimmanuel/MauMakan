export function FoodCard({ food }) {
  return (
    <section className="relative h-[420px]">
      <div className="absolute left-2 top-2 h-[380px] w-full border-2 border-stone-200 bg-white" />
      <article className="absolute left-0 top-0 h-[380px] w-full overflow-hidden border-2 border-stone-900 bg-white">
        {/* Placeholder / Foto Makanan */}
        <div className="flex h-[55%] items-center justify-center border-b border-stone-300 bg-[repeating-linear-gradient(135deg,#e7e5e4,#e7e5e4_7px,#fafaf9_7px,#fafaf9_14px)] text-xs font-semibold text-stone-400">
          Foto Makanan
        </div>

        <div className="space-y-3 p-4">
          <div>
            <h2 className="text-base font-bold text-stone-950">{food?.name || 'Nama Makanan'}</h2>
            <p className="mt-1 text-sm leading-5 text-stone-600">{food?.description || '-'}</p>
          </div>

          {/* Menampilkan Kategori sebagai Tag */}
          {food?.category && (
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700">
                {food.category}
              </span>
            </div>
          )}

          {/* Menampilkan Harga & Nama Tempat */}
          <p className="text-center text-xs text-stone-500">
            Est. Rp {food?.price ? Number(food.price).toLocaleString('id-ID') : 0}
            {food?.place_name ? ` · ${food.place_name}` : ''}
          </p>
        </div>
      </article>
    </section>
  )
}
