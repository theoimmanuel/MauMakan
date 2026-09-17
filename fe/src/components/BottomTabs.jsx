const items = ['Home', 'Riwayat', 'Favorit', 'Profil']

export function BottomTabs({ active = 'Home', onChange }) {
  return (
    <footer className="mt-4 grid grid-cols-4 border-t border-stone-300 pt-3">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange?.(item)}
          className={`text-[11px] font-semibold ${active === item ? 'text-stone-950' : 'text-stone-400'}`}
        >
          {item}
        </button>
      ))}
    </footer>
  )
}
