import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../api/auth'
import useAuthStore from '../store/authStore'

const InputField = ({ label, type, name, value, onChange, placeholder, required, hint }) => (
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
    {hint && <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '5px' }}>{hint}</p>}
  </div>
)

function PasswordStrength({ password }) {
  const score = !password ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', '#ef4444', '#fb923c', '#facc15', '#4ade80']

  if (!password) return null
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{
            flex: 1, height: '3px', borderRadius: '2px',
            backgroundColor: i <= score ? colors[score] : 'var(--border)',
            transition: 'background-color 200ms',
          }} />
        ))}
      </div>
      <p style={{ color: colors[score], fontSize: '11px', fontWeight: 600 }}>{labels[score]}</p>
    </div>
  )
}

export default function SignupPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')
    try {
      const res = await signup(form)
      setAuth(res.data.user, res.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--bg-base)', fontFamily: 'system-ui, sans-serif', transition: 'var(--theme-transition)' }}>

      {/* Left Panel */}
      <div
        style={{
          display: 'none', width: '45%',
          background: 'linear-gradient(160deg, var(--bg-surface) 0%, var(--bg-base) 100%)',
          borderRight: '1px solid var(--border)',
          flexDirection: 'column', justifyContent: 'center',
          padding: '60px', position: 'relative', overflow: 'hidden',
        }}
        className="left-panel"
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '350px', height: '350px', background: 'radial-gradient(circle, #7c3aed18 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '60px', left: '-40px', width: '250px', height: '250px', background: 'radial-gradient(circle, #1d4ed820 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-lg)' }}>
            <svg width="22" height="22" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em' }}>TaskManager</span>
        </div>

        <h2 style={{ color: 'var(--text-primary)', fontSize: '38px', fontWeight: 800, lineHeight: 1.15, marginBottom: '16px', letterSpacing: '-0.03em' }}>
          Start managing<br />
          <span style={{ color: '#3b82f6' }}>your projects.</span>
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: 1.6, marginBottom: '44px' }}>
          Join thousands of teams who use TaskManager to ship projects faster and stay organized.
        </p>

        {[
          { icon: '🎉', text: 'Free to get started, no credit card needed' },
          { icon: '👥', text: 'Invite your team and collaborate instantly' },
          { icon: '🗂️', text: 'Powerful Kanban boards and task tracking' },
        ].map(({ icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#3b82f615', border: '1px solid #3b82f625', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>
              {icon}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{text}</span>
          </div>
        ))}

        <div style={{ marginTop: '44px', padding: '20px', borderRadius: '14px', backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-strong)' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px', fontStyle: 'italic' }}>
            "TaskManager transformed how our team ships. We went from chaos to clarity in a week."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '13px', fontWeight: 700 }}>
              S
            </div>
            <div>
              <p style={{ color: 'var(--text-primary)', fontSize: '12px', fontWeight: 600 }}>Sarah K.</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>Engineering Lead</p>
            </div>
          </div>
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
                Create an account
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Get started for free today — no credit card required</p>
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
              <InputField label="Full name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
              <InputField label="Email address" type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              <div>
                <InputField label="Password" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Min. 6 characters" required />
                <PasswordStrength password={form.password} />
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
                    Creating account...
                  </>
                ) : 'Create free account'}
              </button>

              <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', lineHeight: 1.5 }}>
                By creating an account, you agree to our{' '}
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Terms of Service</a>{' '}
                and{' '}
                <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>Privacy Policy</a>.
              </p>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
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