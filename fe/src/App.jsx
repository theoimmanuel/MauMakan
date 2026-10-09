import { useEffect, useMemo, useState } from 'react'
import { AuthPanel } from './components/AuthPanel'
import { getCurrentUser } from './services/authApi'
import { BottomTabs } from './components/BottomTabs'
import { Button } from './components/Button'
import { Chip } from './components/Chip'
import { FoodCard } from './components/FoodCard'
import { PhoneFrame } from './components/PhoneFrame'
import { ScreenTabs } from './components/ScreenTabs'
import { preferenceOptions } from './data/mockFoods'
import { getRecommendations } from './services/recommendationApi'

const initialPreferences = {
  budget: 25000,
  foodTypes: ['Pedas'],
  moods: ['Pengen Unik'],
  location: '',
}

function App() {
  const [selectedScreen, setActiveScreen] = useState('login')
  const [user, setUser] = useState(null)
  const [restoring, setRestoring] = useState(true)
  const [authError, setAuthError] = useState('')
  const activeScreen = user ? selectedScreen : 'login'

  useEffect(() => {
    let cancelled = false
    getCurrentUser().then((currentUser) => {
      if (!cancelled && currentUser) {
        setUser(currentUser)
        setActiveScreen('preferences')
      }
    }).catch((error) => {
      if (!cancelled) setAuthError(error.message)
    }).finally(() => {
      if (!cancelled) setRestoring(false)
    })
    return () => { cancelled = true }
  }, [])
  const [preferences, setPreferences] = useState(initialPreferences)
  const [currentFoodIndex, setCurrentFoodIndex] = useState(0)
  const [activeTab, setActiveTab] = useState('Home')
  const [message, setMessage] = useState('')

  const [history, setHistory] = useState([])
  const [foods, setFoods] = useState([])
  const [loadingFoods, setLoadingFoods] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const currentFood = useMemo(() => foods.length ? foods[currentFoodIndex % foods.length] : null,
    [foods, currentFoodIndex])

  async function goToLoading(nextMessage = 'Mencari tempat makan...', surprise = false) {
    if (loadingFoods) return
    if (!preferences.location.trim()) {
      setFetchError('Isi kota, daerah, atau alamat pencarian terlebih dahulu.')
      return
    }
    setLoadingFoods(true)
    setFetchError(null)
    setFoods([])
    setMessage(nextMessage)
    setActiveTab('Home')
    setActiveScreen('loading')
    try {
      const { places } = await getRecommendations({ location: preferences.location })
      setFoods(places)
      setCurrentFoodIndex(surprise && places.length ? Math.floor(Math.random() * places.length) : 0)
    } catch (error) {
      setFetchError(error.message)
    } finally {
      setLoadingFoods(false)
      setActiveScreen('result')
      setMessage('')
    }
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

  // Simpan aktivitas Like dan Skip ke riwayat sesi ini.
  function handleNextFood(action) {
    if (currentFood) {
      setMessage(`${action}: ${currentFood.name}`)

      // Simpan ke riwayat jika aksi adalah 'Like' atau 'Skip'
      if (action === 'Like' || action === 'Skip') {
        setHistory((prev) => [
          { ...currentFood, actionStatus: action, timestamp: new Date() },
          ...prev,
        ])
      }
    }
    setCurrentFoodIndex((index) => index + 1)
  }

  return (
    <div className="min-h-screen bg-stone-200 px-4 py-6 text-stone-900">
      {user && !loadingFoods && <ScreenTabs activeScreen={activeScreen} onChange={setActiveScreen} />}
      <PhoneFrame>
        {activeScreen === 'login' && (
          <AuthPanel
            user={user}
            restoring={restoring}
            initialError={authError}
            onAuthenticated={(authenticatedUser) => {
              setUser(authenticatedUser)
              setAuthError('')
              setActiveScreen('preferences')
            }}
            onLogout={() => {
              setUser(null)
              setActiveScreen('login')
              setPreferences(initialPreferences)
              setCurrentFoodIndex(0)
              setActiveTab('Home')
              setMessage('')
              setFoods([])
              setHistory([])
              setFetchError(null)
            }}
            onContinue={() => setActiveScreen('preferences')}
          />
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
                className="w-full accent-stone-900 cursor-pointer"
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
                placeholder="Contoh: Sleman, Yogyakarta"
                maxLength={200}
                value={preferences.location}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, location: event.target.value }))
                }
              />
            </label>

            <p className="text-xs text-stone-500">Pencarian berdasarkan lokasi. Budget dan mood belum digunakan untuk menyaring tempat.</p>
            {fetchError && <p role="alert" className="text-sm text-red-600">{fetchError}</p>}
            <Button disabled={loadingFoods} onClick={() => goToLoading()}>Cari Rekomendasi</Button>
            <Button variant="outline" onClick={() => goToLoading('Mencari pilihan acak...', true)}>
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
          <section className="flex min-h-[520px] flex-col justify-between">
            {activeTab === 'Home' && (
              <div>
                <h1 className="mb-4 border border-dashed border-stone-300 px-4 py-3 text-center text-base font-bold">
                  Rekomendasi Untukmu
                </h1>

                {loadingFoods ? (
                  <p className="py-10 text-center text-xs text-stone-500">Memuat tempat makan...</p>
                ) : fetchError ? (
                  <p role="alert" className="py-10 text-center text-sm text-red-600">{fetchError}</p>
                ) : currentFood ? (
                  <>
                    <FoodCard food={currentFood} />

                    <div className="mt-4 grid grid-cols-2 gap-5 px-6">
                      {['Skip', 'Like'].map((action) => (
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
                  </>
                ) : (
                  <p className="py-10 text-center text-xs text-stone-500">Belum ada tempat makan ditemukan. Coba lokasi lain.</p>
                )}

                <div className="mt-4 space-y-2">
                  {fetchError && <Button onClick={() => goToLoading()}>Coba lagi</Button>}
                  <Button variant="outline" onClick={() => { setFetchError(null); setActiveScreen('preferences') }}>Ubah lokasi</Button>
                </div>
                {message && <p className="mt-3 text-center text-xs text-stone-500">{message}</p>}
              </div>
            )}

            {/* TAB RIWAYAT */}
            {activeTab === 'Riwayat' && (
              <div>
                <h1 className="mb-4 border border-dashed border-stone-300 px-4 py-3 text-center text-base font-bold">
                  Riwayat Aktivitas
                </h1>

                {history.length === 0 ? (
                  <p className="py-10 text-center text-xs text-stone-500">
                    Belum ada riwayat aktivitas.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border border-stone-300 p-3 rounded-lg bg-stone-50"
                      >
                        <div>
                          <p className="text-sm font-bold text-stone-900">{item.name}</p>
                          <p className="text-xs text-stone-500">
                            {item.address || item.location || 'Lokasi tidak tersedia'}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded font-semibold ${
                            item.actionStatus === 'Like'
                              ? 'bg-emerald-800 text-white'
                              : 'bg-stone-300 text-stone-700'
                          }`}
                        >
                          {item.actionStatus === 'Like' ? 'Disukai' : 'Dilewati'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB FAVORIT / PROFIL */}
            {(activeTab === 'Favorit' || activeTab === 'Profil') && (
              <div className="py-20 text-center text-xs text-stone-500">
                Halaman {activeTab} sedang dalam pengembangan.
              </div>
            )}

            <BottomTabs active={activeTab} onChange={setActiveTab} />
          </section>
        )}
      </PhoneFrame>
    </div>
  )
}

export default App
