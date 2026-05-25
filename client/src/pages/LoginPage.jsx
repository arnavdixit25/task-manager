import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../api/auth'
import useAuthStore from '../store/authStore'

const InputField = ({ label, type, name, value, onChange, placeholder, required }) => (
  <div>
    <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{
        width: '100%',
        backgroundColor: 'var(--bg-base)',
        border: '1px solid var(--border)',
        color: 'var(--text-primary)',
        borderRadius: '12px',
        padding: '12px 16px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        transition: 'border-color 200ms',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--accent)'}
      onBlur={e => e.target.style.borderColor = 'var(--border)'}
    />
  </div>
)

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await login(form)
      setAuth(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-base)', fontFamily: 'system-ui, sans-serif', transition: 'var(--theme-transition)' }}>

      {/* Left Panel */}
      <div
        style={{
          display: 'none',
          width: '45%',
          background: 'linear-gradient(160deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
          borderRight: '1px solid var(--border)',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="left-panel"
      >
        <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '400px', height: '400px', background: 'radial-gradient(circle, #1d4ed820 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '-60px', width: '300px', height: '300px', background: 'radial-gradient(circle, #7c3aed15 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>TaskManager</span>
        </div>

        <h2 style={{ color: 'var(--text-primary)', fontSize: '38px', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Manage your work,<br />
          <span style={{ color: '#3b82f6' }}>beautifully.</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '44px' }}>
          Organize projects, track tasks, and collaborate with your team — all in one place.
        </p>

        {[
          { icon: '⚡', text: 'Kanban boards for visual task management' },
          { icon: '🤝', text: 'Real-time collaboration with your team' },
          { icon: '📊', text: 'Track progress across all your projects' },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#3b82f615', border: '1px solid #3b82f625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              {icon}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{text}</span>
          </div>
        ))}

        <div style={{ display: 'flex', gap: '24px', marginTop: '44px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
          {[['10k+', 'Teams'], ['500k+', 'Tasks Done'], ['99.9%', 'Uptime']].map(([val, lbl]) => (
            <div key={lbl}>
              <p style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 800 }}>{val}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600 }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '36px', justifyContent: 'center' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '18px' }}>TaskManager</span>
          </div>

          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px', transition: 'var(--theme-transition)' }}>
            <div style={{ marginBottom: '28px' }}>
              <h1 style={{ color: 'var(--text-primary)', fontSize: '26px', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                Welcome back
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Sign in to your account to continue</p>
            </div>

            {error && (
              <div style={{ backgroundColor: '#1a0a0a', border: '1px solid #7f1d1d', color: '#f87171', padding: '12px 16px', borderRadius: '12px', marginBottom: '20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <InputField label="Email address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              <InputField label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-4px' }}>
                <a href="#" style={{ color: '#3b82f6', fontSize: '13px', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</a>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', backgroundColor: 'var(--accent)', color: 'var(--accent-text)',
                  border: 'none', borderRadius: '12px', padding: '13px', fontSize: '14px', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.8 : 1,
                  transition: 'background-color 150ms', boxShadow: 'var(--shadow-md)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = 'var(--accent-hover)' }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'var(--accent)' }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Create one free →</Link>
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) { .left-panel { display: flex !important; } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: var(--text-muted); }
      `}</style>
    </div>
  )
}