import { useLocation, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import useAuthStore from '../store/authStore'

// ── HELPER: Get 2-letter initials from a name ─────────────
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

// ── HELPER: Pick the right page title from the URL ────────
function usePageTitle() {
  const location = useLocation()
  const { id } = useParams()
  const queryClient = useQueryClient()
  const pathname = location.pathname
  if (pathname === '/dashboard') return 'Dashboard'
  if (pathname === '/projects') return 'Projects'
  if (pathname === '/team') return 'Team'
  if (id && pathname.includes('/projects/') && !pathname.includes('/tasks/')) {
    const cached = queryClient.getQueryData(['project', id])
    return cached?.project?.name || 'Project Board'
  }
  if (pathname.includes('/tasks/')) return 'Task Detail'
  return 'TaskManager'
}

// ── DARK MODE: Sun icon (shown in dark mode → click for light) ──
function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

// ── DARK MODE: Moon icon (shown in light mode → click for dark) ─
function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function Navbar() {
  // Pull user, theme, and toggleTheme from the store
  const { user, theme, toggleTheme } = useAuthStore()
  const title = usePageTitle()

  // true when dark mode is active
  const isDark = theme === 'dark'

  return (
    <div style={{
      height: '56px',
      // Use CSS variable so it auto-switches on theme change
      backgroundColor: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '224px',
      zIndex: 10,
      // Smooth color transition when theme toggles
      transition: 'background-color 220ms ease, border-color 220ms ease',
    }}>

      {/* ── Page title ── */}
      <h1 style={{
        color: 'var(--text-primary)',
        fontWeight: 600,
        fontSize: '15px',
      }}>
        {title}
      </h1>

      {/* ── Right side: toggle + user name + avatar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

        {/* ── DARK MODE TOGGLE BUTTON ──────────────────────────
            - Uses .theme-toggle class defined in index.css
            - Shows Sun when dark (click → go light)
            - Shows Moon when light (click → go dark)
            - title attribute shows tooltip on hover
        ─────────────────────────────────────────────────────── */}
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>

        {/* ── User name ── */}
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          {user?.name}
        </span>

        {/* ── Avatar circle with initials ── */}
        <div style={{
          width: '32px',
          height: '32px',
          backgroundColor: 'var(--accent)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ color: 'var(--accent-text)', fontSize: '12px', fontWeight: 700 }}>
            {getInitials(user?.name)}
          </span>
        </div>

      </div>
    </div>
  )
}