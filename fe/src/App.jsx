import { useEffect, useMemo, useState } from 'react' // 1. Tambahkan useEffect di sini
import { BottomTabs } from './components/BottomTabs'
import { Button } from './components/Button'
import { Chip } from './components/Chip'
import { FoodCard } from './components/FoodCard'
import { PhoneFrame } from './components/PhoneFrame'
import { ScreenTabs } from './components/ScreenTabs'
import { foodRecommendations, preferenceOptions } from './data/mockFoods'
import { supabase } from './lib/supabaseClient' // 2. Import helper Supabase

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

  // 3. Tambahkan efek ini untuk tes mengambil data dari Supabase
  useEffect(() => {
    const testSupabaseConnection = async () => {
      const { data, error } = await supabase.from('food').select('*')
      if (error) {
        console.error('Error Supabase:', error.message)
      } else {
        console.log('Data Sukses dari Supabase:', data)
      }
    }

    testSupabaseConnection()
  }, [])

  const currentFood = useMemo(
    () => foodRecommendations[currentFoodIndex % foodRecommendations.length],
    [currentFoodIndex],
  )
