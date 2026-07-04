import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import PrologueModal from '../components/PrologueModal'
import { Capacitor } from '@capacitor/core'
import { SocialLogin } from '@capgo/capacitor-social-login'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function Auth() {
  const [mode, setMode] = useState('login') // login | register
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPrologue, setShowPrologue] = useState(false)
  const googleBtnRef = useRef(null)

  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const error = useAuthStore((s) => s.error)
  const loading = useAuthStore((s) => s.loading)
  const clearError = useAuthStore((s) => s.clearError)

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      SocialLogin.initialize({
        google: {
          webClientId: GOOGLE_CLIENT_ID,
        }
      }).catch(err => console.error("SocialLogin init fail:", err))
      return
    }

    const initGoogle = () => {
      if (!window.google || !GOOGLE_CLIENT_ID) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          clearError()
          await signInWithGoogle(response.credential)
        },
      })
      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'filled_black',
          size: 'large',
          width: googleBtnRef.current.offsetWidth || 300,
          text: 'continue_with',
          shape: 'rectangular',
        })
      }
    }

    if (window.google) {
      initGoogle()
    } else {
      // Wait for GSI script to load
      const interval = setInterval(() => {
        if (window.google) { clearInterval(interval); initGoogle() }
      }, 200)
      return () => clearInterval(interval)
    }
  }, [])

  const handleNativeGoogle = async () => {
    try {
      clearError()
      const response = await SocialLogin.login({
        provider: 'google'
      })
      const idToken = response.result?.idToken || response.authentication?.idToken
      if (idToken) {
        await signInWithGoogle(idToken)
      } else {
        alert("Gagal mengambil Google Token.")
      }
    } catch (err) {
      console.error("Native Google login error:", err)
      alert("Native Google login error: " + (err.message || JSON.stringify(err)))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearError()
    if (mode === 'login') await signIn(username.trim(), password)
    else await signUp(username.trim(), password)
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>⚡</div>
          <div style={styles.logoText}>FOCUS RPG</div>
          <div style={styles.logoSub}>IDLE BATTLE SYSTEM</div>
        </div>

        <button
          type="button"
          style={styles.loreBtn}
          onClick={() => setShowPrologue(true)}
        >
          📖 BACA SEJARAH DUNIA (LORE PROLOGUE)
        </button>

        {/* Google Sign-In Button */}
        {GOOGLE_CLIENT_ID && (
          <div style={styles.googleWrap}>
            {Capacitor.isNativePlatform() ? (
              <button
                type="button"
                style={styles.nativeGoogleBtn}
                onClick={handleNativeGoogle}
                disabled={loading}
              >
                <svg style={styles.googleIconSvg} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                CONTINUE WITH GOOGLE
              </button>
            ) : (
              <div ref={googleBtnRef} style={styles.googleBtn} />
            )}
            <div style={styles.divider}><span>atau</span></div>
          </div>
        )}

        <div style={styles.tabs}>
          <button style={styles.tab(mode === 'login')} onClick={() => { setMode('login'); clearError() }}>LOGIN</button>
          <button style={styles.tab(mode === 'register')} onClick={() => { setMode('register'); clearError() }}>REGISTER</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>USERNAME</label>
            <input
              style={styles.input}
              type="text"
              placeholder="pilot123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>PASSWORD</label>
            <input
              style={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <div style={styles.error}>⚠️ {error}</div>}

          <button style={styles.submit} type="submit" disabled={loading}>
            {loading ? '...' : mode === 'login' ? '⚡ LOGIN' : '🚀 CREATE PILOT'}
          </button>
        </form>

        <div style={styles.hint}>
          {mode === 'login' ? 'Belum punya akun? Pilih REGISTER' : 'Progress tersimpan di server — sync semua device'}
        </div>
      </div>
      {showPrologue && <PrologueModal onClose={() => setShowPrologue(false)} />}
    </div>
  )
}

const styles = {
  root:      { minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'linear-gradient(180deg,#06101f 0%,#050810 100%)', fontFamily: 'var(--font-body)' },
  card:      { width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 20 },
  logo:      { textAlign: 'center', marginBottom: 8 },
  logoIcon:  { fontSize: 48, marginBottom: 8 },
  logoText:  { fontFamily: 'var(--font-title)', fontSize: 28, fontWeight: 900, color: '#00e5ff', letterSpacing: 4 },
  logoSub:   { fontFamily: 'var(--font-title)', fontSize: 14, color: '#7ab0d0', letterSpacing: 3, marginTop: 4, fontWeight: 800 },
  loreBtn:   { background: 'rgba(3,8,20,0.6)', border: '1px solid rgba(0, 229, 255, 0.35)', borderRadius: 8, padding: '10px 14px', color: '#00e5ff', fontFamily: 'var(--font-title)', fontSize: 13, fontWeight: 800, letterSpacing: 1.5, cursor: 'pointer', transition: 'all 0.2s', width: '100%', outline: 'none' },
  googleWrap:{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 },
  googleBtn: { width: '100%', minHeight: 44 },
  nativeGoogleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    minHeight: 44,
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid rgba(0, 229, 255, 0.35)',
    background: 'rgba(3,8,20,0.6)',
    color: '#00e5ff',
    fontFamily: 'var(--font-title)',
    fontSize: 13,
    fontWeight: 800,
    letterSpacing: 1.5,
    cursor: 'pointer',
    transition: 'all 0.2s',
    outline: 'none',
  },
  googleIconSvg: {
    width: 18,
    height: 18,
    fill: 'currentColor',
  },
  divider:   { width: '100%', display: 'flex', alignItems: 'center', gap: 10, color: '#7ab0d0', fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, '::before': { content: '""', flex: 1, height: 1, background: 'rgba(0,229,255,0.15)' } },
  tabs:      { display: 'flex', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: 10, overflow: 'hidden' },
  tab:       (active) => ({ flex: 1, padding: '12px', border: 'none', fontFamily: 'var(--font-title)', fontSize: 15, fontWeight: 800, letterSpacing: 1, cursor: 'pointer', background: active ? 'rgba(0,100,200,0.3)' : 'rgba(6, 15, 35, 0.6)', color: active ? '#00e5ff' : '#7ab0d0', borderBottom: active ? '3px solid #00c8ff' : 'none' }),
  form:      { display: 'flex', flexDirection: 'column', gap: 14 },
  field:     { display: 'flex', flexDirection: 'column', gap: 8 },
  label:     { fontFamily: 'var(--font-title)', fontSize: 14, fontWeight: 800, letterSpacing: 2, color: '#7ab0d0' },
  input:     { background: 'rgba(3, 8, 20, 0.8)', border: '1.5px solid rgba(0, 229, 255, 0.2)', borderRadius: 8, padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: 16, color: '#e0f4ff', outline: 'none' },
  error:     { background: 'rgba(255,68,68,0.1)', border: '1px solid #ff4444', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--font-mono)', fontSize: 14, color: '#ff6666', fontWeight: 800 },
  submit:    { padding: '16px', borderRadius: 12, border: 'none', background: 'linear-gradient(90deg,#0050cc,#00a8ff)', fontFamily: 'var(--font-title)', fontSize: 17, fontWeight: 900, color: '#fff', letterSpacing: 2, cursor: 'pointer', marginTop: 4 },
  hint:      { fontFamily: 'var(--font-body)', fontSize: 14, color: '#7ec8e3', textAlign: 'center', lineHeight: 1.6, fontWeight: 700 },
}

