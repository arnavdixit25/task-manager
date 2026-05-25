import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '96px', fontWeight: 900, color: 'var(--accent)', lineHeight: 1, marginBottom: '16px', textShadow: '0 0 60px var(--accent)' }}>
          404
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 700, marginBottom: '10px' }}>Page not found</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '28px' }}>The page you are looking for does not exist.</p>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            backgroundColor: 'var(--accent)', color: 'var(--accent-text)',
            border: 'none', borderRadius: '12px',
            padding: '12px 28px', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', boxShadow: 'var(--shadow-md)',
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}