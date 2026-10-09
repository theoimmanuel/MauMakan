import { useState } from 'react'
import { authenticate, logout } from '../services/authApi'
import { Button } from './Button'

export function AuthPanel({ user, restoring, initialError, onAuthenticated, onLogout, onContinue }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [interacted, setInteracted] = useState(false)
  const register = mode === 'register'
  const inputClass = 'w-full border border-stone-300 px-3 py-2.5 text-sm outline-none focus:border-stone-900'

  async function submit(nextMode) {
    setInteracted(true)
    setError('')
    setBusy(true)
    try {
      const authenticatedUser = await authenticate(nextMode, nextMode === 'guest' ? {} : { name, email, password })
      setPassword('')
      onAuthenticated(authenticatedUser)
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setInteracted(true)
    setError('')
    setBusy(true)
    try {
      await logout()
      onLogout()
    } catch (failure) {
      setError(failure.message)
    } finally {
      setBusy(false)
    }
  }

  const message = error || (!interacted && initialError)
  return (
    <section className="space-y-4">
      <h1 className="border border-dashed border-stone-300 px-4 py-3 text-center text-base font-bold">
        Mau Makan Apa?
      </h1>
      {message && <p role="alert" className="text-sm text-red-600">{message}</p>}
      {restoring ? <p role="status">Memeriksa sesi...</p> : user ? (
        <>
          <p className="text-center text-sm">Halo, {user.is_guest ? 'Guest' : user.name}!</p>
          <Button onClick={onContinue} disabled={busy}>Lanjut ke Preferensi</Button>
          <Button variant="outline" onClick={handleLogout} disabled={busy}>
            {busy ? 'Keluar...' : 'Keluar'}
          </Button>
        </>
      ) : (
        <>
          <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); submit(mode) }}>
            <fieldset disabled={busy} className="space-y-4">
              {register && (
                <label className="block">
                  <span className="sr-only">Nama</span>
                  <input className={inputClass} placeholder="Nama" autoComplete="name" required maxLength={100}
                    value={name} onChange={(event) => setName(event.target.value)} />
                </label>
              )}
              <label className="block">
                <span className="sr-only">Email</span>
                <input className={inputClass} placeholder="Email" type="email" autoComplete="email" required maxLength={150}
                  value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="block">
                <span className="sr-only">Password</span>
                <input className={inputClass} placeholder="Password" type="password" required minLength={8} maxLength={128}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  value={password} onChange={(event) => setPassword(event.target.value)} />
              </label>
              {register && <p className="text-xs text-stone-500">Password terdiri dari 8–128 karakter.</p>}
              <Button type="submit" disabled={busy}>{busy ? 'Memproses...' : register ? 'Daftar Akun' : 'Login'}</Button>
            </fieldset>
          </form>
          <Button variant="outline" disabled={busy} onClick={() => {
            setMode(register ? 'login' : 'register'); setError(''); setPassword(''); setInteracted(true)
          }}>
            {register ? 'Sudah punya akun? Login' : 'Daftar Akun Baru'}
          </Button>
          <p className="text-center text-xs text-stone-400">atau</p>
          <Button variant="outline" disabled={busy} onClick={() => submit('guest')}>Lanjut sebagai Guest</Button>
        </>
      )}
    </section>
  )
}
