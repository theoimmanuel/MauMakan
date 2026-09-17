import { useMemo, useState } from 'react'
import { BottomTabs } from './components/BottomTabs'
import { Button } from './components/Button'
import { Chip } from './components/Chip'
import { FoodCard } from './components/FoodCard'
import { PhoneFrame } from './components/PhoneFrame'
import { ScreenTabs } from './components/ScreenTabs'
import { foodRecommendations, preferenceOptions } from './data/mockFoods'

const initialPreferences = {
  budget: 15000,
  foodTypes: ['Pedas'],
  moods: ['Pengen Unik'],
  location: '',
}

function App() {
  const [activeScreen, setActiveScreen] = useState('login')
  const [preferences, setPreferences] = useState(initialPreferences)
  const [currentFoodIndex, setCurrentFoodIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('Home')
  const [message, setMessage] = useState('')

  const currentFood = useMemo(
    () => foodRecommendations[currentFoodIndex % foodRecommendations.length],
    [currentFoodIndex],
  )

  function goToLoading(nextMessage = 'Mencocokkan preferensi kamu...') {
    setMessage(nextMessage)
    setActiveScreen('loading')

    window.setTimeout(() => {
      setActiveScreen('result')
      setMessage('')
    }, 900)
  }

  function togglePreference(group, value) {
    setPreferences((prev) => {
      const exists = prev[group].includes(value)
      return {
        ...prev,
        [group]: exists ? prev[group].filter((item) => item !== value) : [...prev[group], value],
      }
    })
  }

  function handleNextFood(action) {
    setMessage(`${action}: ${currentFood.name}`)
    setCurrentFoodIndex((index) => index + 1)
  }

  return (
    <div className="min-h-screen bg-stone-200 px-4 py-6 text-stone-900">
      <ScreenTabs activeScreen={activeScreen} onChange={setActiveScreen} />
      <PhoneFrame>
        {activeScreen === 'login' && (
          <section className="space-y-4">
            <h1 className="border border-dashed border-stone-300 px-4 py-3 text-center text-base font-bold">
              Mau Makan Apa?
            </h1>

            <label className="block">
              <span className="sr-only">Email</span>
              <input
                className="w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-900"
                placeholder="Email"
                type="email"
              />
            </label>
            <label className="block">
              <span className="sr-only">Password</span>
              <input
                className="w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-900"
                placeholder="Password"
                type="password"
              />
            </label>

            <Button onClick={() => setActiveScreen('preferences')}>Login</Button>
            <Button variant="outline" onClick={() => setActiveScreen('preferences')}>
              Daftar Akun Baru
            </Button>

            <p className="text-center text-xs text-stone-400">atau</p>

            <Button variant="outline" onClick={() => setActiveScreen('preferences')}>
              Lanjut sebagai Guest
            </Button>
          </section>
        )}

        {activeScreen === 'preferences' && (
          <section className="space-y-4">
            <h1 className="border border-dashed border-stone-300 px-4 py-3 text-center text-base font-bold">
              Input Preferensi
            </h1>

            <div className="border border-stone-300 p-3">
              <div className="mb-3 flex items-center justify-between text-sm font-semibold">
                <span>Budget</span>
                <span>Rp {preferences.budget.toLocaleString('id-ID')}</span>
              </div>
              <input
                className="w-full accent-stone-900"
                max="50000"
                min="5000"
                step="5000"
                type="range"
                value={preferences.budget}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, budget: Number(event.target.value) }))
                }
              />
            </div>

            <div className="border border-stone-300 p-3">
              <p className="mb-3 text-sm font-semibold">Tipe Makanan</p>
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.foodTypes.map((type) => (
                  <Chip
                    key={type}
                    active={preferences.foodTypes.includes(type)}
                    onClick={() => togglePreference('foodTypes', type)}
                  >
                    {type}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="border border-stone-300 p-3">
              <p className="mb-3 text-sm font-semibold">Mood</p>
              <div className="flex flex-wrap gap-2">
                {preferenceOptions.moods.map((mood) => (
                  <Chip
                    key={mood}
                    active={preferences.moods.includes(mood)}
                    onClick={() => togglePreference('moods', mood)}
                  >
                    {mood}
                  </Chip>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="sr-only">Lokasi</span>
              <input
                className="w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-900"
                placeholder="Lokasi otomatis / manual"
                value={preferences.location}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, location: event.target.value }))
                }
              />
            </label>

            <Button onClick={() => goToLoading()}>Cari Rekomendasi</Button>
            <Button variant="outline" onClick={() => goToLoading('Mencari pilihan acak...')}>
              Surprise Me
            </Button>
          </section>
        )}

        {activeScreen === 'loading' && (
          <section className="flex h-[560px] flex-col items-center justify-center text-center">
            <div className="mb-5 size-14 animate-spin rounded-full border-4 border-dashed border-stone-400" />
            <div className="mb-3 h-2.5 w-40 bg-[repeating-linear-gradient(45deg,#d6d3d1,#d6d3d1_4px,#f5f5f4_4px,#f5f5f4_8px)]" />
            <p className="text-xs text-stone-500">{message || 'Mencocokkan preferensi kamu...'}</p>
          </section>
        )}

        {activeScreen === 'result' && (
          <section>
            <h1 className="mb-4 border border-dashed border-stone-300 px-4 py-3 text-center text-base font-bold">
              Rekomendasi Untukmu
            </h1>

            <FoodCard food={currentFood} />

            <div className="mt-4 grid grid-cols-3 gap-5 px-6">
              {['Skip', 'Info', 'Like'].map((action) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => handleNextFood(action)}
                  className="aspect-square rounded-full border-2 border-stone-900 text-xs font-bold transition hover:bg-stone-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2"
                >
                  {action}
                </button>
              ))}
            </div>

            {message && <p className="mt-3 text-center text-xs text-stone-500">{message}</p>}
            <BottomTabs active={activeTab} onChange={setActiveTab} />
          </section>
        )}
      </PhoneFrame>
    </div>
  )
}

export default App
