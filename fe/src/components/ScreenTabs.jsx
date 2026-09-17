const tabs = [
  { id: 'login', label: 'Login' },
  { id: 'preferences', label: 'Preferensi' },
  { id: 'loading', label: 'Loading' },
  { id: 'result', label: 'Hasil' },
]

export function ScreenTabs({ activeScreen, onChange }) {
  return (
    <nav className="mx-auto mb-3 grid w-full max-w-[375px] grid-cols-4 gap-1.5">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`border px-2 py-2 text-[11px] font-semibold transition ${
            activeScreen === tab.id
              ? 'border-stone-900 bg-stone-900 text-white'
              : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-100'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
