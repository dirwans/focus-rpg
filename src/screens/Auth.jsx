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
  const [showPassword, setShowPassword] = useState(false)
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

  // Partikel latar belakang mecha
  const bgParticles = [
    { id: 1, top: '12%', left: '15%', size: 4, delay: '0s', duration: '5.2s' },
    { id: 2, top: '48%', left: '85%', size: 3, delay: '0.8s', duration: '6.8s' },
    { id: 3, top: '72%', left: '10%', size: 5, delay: '1.5s', duration: '5.8s' },
    { id: 4, top: '22%', left: '78%', size: 3, delay: '0.3s', duration: '7.5s' },
    { id: 5, top: '82%', left: '68%', size: 4, delay: '1.2s', duration: '5.0s' },
    { id: 6, top: '58%', left: '25%', size: 3, delay: '2.0s', duration: '6.2s' },
    { id: 7, top: '8%', left: '58%', size: 4, delay: '2.5s', duration: '7.0s' },
  ]

  return (
    <div className="auth-root-bg">
      <style>{`
        @keyframes auth-emberRise {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 0.7; }
          100% { transform: translateY(-160px) translateX(12px); opacity: 0; }
        }
        .auth-root-bg {
          min-height: 100%;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: radial-gradient(circle at center, #0a172e 0%, #030710 100%);
          font-family: var(--font-body);
          position: relative;
          overflow: hidden;
        }
        .auth-ambient-glow {
          position: absolute;
          left: 50%;
          top: 45%;
          width: 320px;
          height: 320px;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(0, 229, 255, 0.15) 0%, transparent 70%);
          filter: blur(35px);
          pointer-events: none;
          z-index: 1;
        }
        .auth-card {
          width: 100%;
          max-width: 340px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: rgba(6, 15, 30, 0.58);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 229, 255, 0.22);
          padding: 26px 20px;
          box-shadow: 0 0 20px rgba(0, 229, 255, 0.08), inset 0 0 12px rgba(0, 229, 255, 0.05);
          clip-path: polygon(14px 0%, 100% 0%, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0% 100%, 0% 14px);
          z-index: 2;
          position: relative;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .auth-card:hover {
          border-color: rgba(0, 229, 255, 0.35);
          box-shadow: 0 0 30px rgba(0, 229, 255, 0.12), inset 0 0 16px rgba(0, 229, 255, 0.08);
        }
        .auth-logo-icon {
          font-size: 42px;
          margin-bottom: 6px;
          text-align: center;
          filter: drop-shadow(0 0 8px rgba(0, 229, 255, 0.6));
          animation: glowPulse 3s ease-in-out infinite;
        }
        .auth-logo-text {
          font-family: var(--font-title);
          font-size: 28px;
          font-weight: 900;
          color: #ffffff;
          letter-spacing: 4px;
          font-style: italic;
          text-shadow: 0 0 10px rgba(0, 229, 255, 0.65), 0 0 20px rgba(0, 229, 255, 0.25);
          text-align: center;
        }
        .auth-logo-sub {
          font-family: var(--font-title);
          font-size: 13px;
          color: #ffbe00;
          letter-spacing: 2px;
          margin-top: 4px;
          font-weight: 700;
          text-align: center;
          text-shadow: 0 0 6px rgba(255, 190, 0, 0.45);
        }
        .auth-lore-btn {
          background: rgba(3, 8, 20, 0.65);
          border: 1px solid rgba(0, 229, 255, 0.3);
          padding: 10px 14px;
          color: #00e5ff;
          font-family: var(--font-title);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          outline: none;
          clip-path: polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px);
        }
        .auth-lore-btn:hover {
          background: rgba(0, 229, 255, 0.12);
          border-color: rgba(0, 229, 255, 0.6);
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.25);
        }
        .auth-google-btn-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          width: 100%;
        }
        .auth-native-google {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          min-height: 42px;
          padding: 10px 16px;
          border: 1px solid rgba(0, 229, 255, 0.3);
          background: rgba(3, 8, 20, 0.6);
          color: #00e5ff;
          font-family: var(--font-title);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          outline: none;
          clip-path: polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px);
        }
        .auth-native-google:hover {
          background: rgba(0, 229, 255, 0.12);
          border-color: rgba(0, 229, 255, 0.6);
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.25);
        }
        .auth-divider {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #7ab0d0;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .auth-divider::before, .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.2), transparent);
        }
        .auth-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1.5px solid rgba(0, 229, 255, 0.15);
          padding-bottom: 2px;
        }
        .auth-tab {
          flex: 1;
          padding: 10px;
          border: none;
          background: transparent;
          font-family: var(--font-title);
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 1.5px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
          color: #7ab0d0;
        }
        .auth-tab.active {
          color: #00e5ff;
          text-shadow: 0 0 8px rgba(0, 229, 255, 0.5);
        }
        .auth-tab-indicator {
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: #00e5ff;
          box-shadow: 0 0 8px #00e5ff;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .auth-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          position: relative;
        }
        .auth-label {
          font-family: var(--font-title);
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #7ab0d0;
        }
        .auth-input {
          width: 100%;
          background: rgba(8, 18, 32, 0.7);
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 4px;
          padding: 12px 14px;
          font-family: var(--font-mono);
          font-size: 15px;
          color: #e0f4ff;
          outline: none;
          transition: all 0.2s ease;
        }
        .auth-input:focus {
          border-color: rgba(0, 229, 255, 0.7);
          box-shadow: 0 0 10px rgba(0, 229, 255, 0.25), inset 0 0 8px rgba(0, 229, 255, 0.1);
        }
        .auth-eye-btn {
          position: absolute;
          right: 12px;
          top: 35px;
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 15px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.7;
          color: #00e5ff;
          transition: opacity 0.2s;
        }
        .auth-eye-btn:hover {
          opacity: 1;
        }
        .auth-submit {
          position: relative;
          overflow: hidden;
          padding: 15px;
          border: 1px solid rgba(0, 229, 255, 0.35);
          background: linear-gradient(90deg, #004ebb, #009ae5);
          color: #ffffff;
          font-family: var(--font-title);
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 2px;
          cursor: pointer;
          transition: all 0.3s ease;
          clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
          box-shadow: 0 0 12px rgba(0, 78, 204, 0.35);
          margin-top: 4px;
        }
        .auth-submit:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 0 18px rgba(0, 229, 255, 0.5);
          border-color: rgba(0, 229, 255, 0.6);
        }
        .auth-submit:disabled {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.2);
          cursor: not-allowed;
          box-shadow: none;
        }
        .auth-error {
          background: rgba(255, 49, 49, 0.1);
          border: 1px solid #ff3131;
          border-radius: 4px;
          padding: 10px 14px;
          font-family: var(--font-mono);
          font-size: 13px;
          color: #ff6666;
          font-weight: 700;
        }
        .auth-hint {
          font-family: var(--font-body);
          font-size: 13px;
          color: #8ad2ec;
          text-align: center;
          line-height: 1.5;
          font-weight: 700;
        }
      `}</style>

      {/* Partikel Embers Latar Belakang */}
      {bgParticles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: '#00e5ff',
            boxShadow: '0 0 6px #00e5ff, 0 0 12px #00e5ff',
            animation: `auth-emberRise ${p.duration} ease-in infinite ${p.delay}`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Ambient background glow */}
      <div className="auth-ambient-glow" />

      <div className="auth-card">
        <div style={{ textAlign: 'center' }}>
          <div className="auth-logo-icon">⚡</div>
          <div className="auth-logo-text">FOCUS RPG</div>
          <div className="auth-logo-sub">IDLE BATTLE SYSTEM</div>
        </div>

        <button
          type="button"
          className="auth-lore-btn"
          onClick={() => setShowPrologue(true)}
        >
          📖 BACA SEJARAH DUNIA (LORE PROLOGUE)
        </button>

        {/* Google Sign-In Button */}
        {GOOGLE_CLIENT_ID && (
          <div className="auth-google-btn-wrap">
            {Capacitor.isNativePlatform() ? (
              <button
                type="button"
                className="auth-native-google"
                onClick={handleNativeGoogle}
                disabled={loading}
              >
                <svg style={{ width: 18, height: 18, fill: 'currentColor' }} viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                CONTINUE WITH GOOGLE
              </button>
            ) : (
              <div ref={googleBtnRef} style={{ width: '100%', minHeight: 44 }} />
            )}
            <div className="auth-divider"><span>atau</span></div>
          </div>
        )}

        <div className="auth-tabs">
          <button
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); clearError() }}
          >
            LOGIN
            {mode === 'login' && <div className="auth-tab-indicator" />}
          </button>
          <button
            className={`auth-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); clearError() }}
          >
            REGISTER
            {mode === 'register' && <div className="auth-tab-indicator" />}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">USERNAME</label>
            <input
              className="auth-input"
              type="text"
              placeholder="pilot123"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none"
              autoCorrect="off"
              required
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">PASSWORD</label>
            <input
              className="auth-input"
              style={{ paddingRight: '42px' }}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="auth-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {error && <div className="auth-error">⚠️ {error}</div>}

          <button className="auth-submit" type="submit" disabled={loading}>
            <div className="energy-sweep-line" style={{ position: 'absolute', top: 0, bottom: 0, left: '-70%', width: '50%', background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.45), transparent)', animation: 'energySweep 3.2s linear infinite' }} />
            {loading ? '...' : mode === 'login' ? '⚡ LOGIN' : '🚀 CREATE PILOT'}
          </button>
        </form>

        <div className="auth-hint">
          {mode === 'login' ? 'Belum punya akun? Pilih REGISTER' : 'Progress tersimpan di server — sync semua device'}
        </div>
      </div>
      {showPrologue && <PrologueModal onClose={() => setShowPrologue(false)} />}
    </div>
  )
}

