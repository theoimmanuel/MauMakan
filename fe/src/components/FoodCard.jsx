export function FoodCard({ food }) {
  return (
    <section className="relative h-[420px]">
      <div className="absolute left-2 top-2 h-[380px] w-full border-2 border-stone-200 bg-white" />
      <article className="absolute left-0 top-0 h-[380px] w-full overflow-hidden border-2 border-stone-900 bg-white">
        <div className="flex h-[55%] items-center justify-center border-b border-stone-300 bg-[repeating-linear-gradient(135deg,#e7e5e4,#e7e5e4_7px,#fafaf9_7px,#fafaf9_14px)] text-xs font-semibold text-stone-400">
          Foto Makanan
        </div>
        <div className="space-y-3 p-4">
          <div>
            <h2 className="text-base font-bold text-stone-950">{food.name}</h2>
            <p className="mt-1 text-sm leading-5 text-stone-600">{food.description}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {food.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700">
                {tag}
              </span>
            ))}
          </div>
          <p className="text-center text-xs text-stone-500">
            Est. {food.price} · {food.distance} dari kamu
          </p>
        </div>
      </article>
    </section>
  )
}
