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
        provider: 'google',
        options: {
          scopes: ['email', 'profile']
        }
      })
      const idToken = response.result?.idToken || response.authentication?.idToken
      if (idToken) {
        await signInWithGoogle(idToken)
      } else {
        alert("Gagal mengambil Google Token.")
      }
    } catch (err) {
      console.error("Native Google login error:", err)
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
                  <path fill="currentColor" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.478 0-6.3-2.823-6.3-6.3 0-3.478 2.822-6.3 6.3-6.3 1.637 0 3.125.626 4.256 1.646l3.056-3.056C19.414 2.862 16.023 1.5 12.24 1.5 6.42 1.5 1.7 6.22 1.7 12s4.72 10.5 10.54 10.5c6.07 0 10.096-4.267 10.096-10.286 0-.693-.082-1.371-.22-1.929H12.24z"/>
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

