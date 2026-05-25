import { useQuery } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { getDashboardStats } from '../api/dashboard'
import useAuthStore from '../store/authStore'

const GLOBAL_STYLES = `
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position:  400px 0; }
  }
  @keyframes growWidth {
    from { width: 0%; }
    to   { width: var(--target-width); }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

function useGlobalStyles() {
  useEffect(() => {
    if (document.getElementById('dashboard-styles')) return
    const style = document.createElement('style')
    style.id = 'dashboard-styles'
    style.textContent = GLOBAL_STYLES
    document.head.appendChild(style)
  }, [])
}

function useCountUp(target, enabled = true, duration = 800) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    if (!enabled || target == null) return
    const start = performance.now()
    function tick(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round((target) * eased))
      if (progress < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, enabled, duration])
  return value
}

// ── All bg values now use CSS variables ──
const PRIORITY_STYLES = {
  LOW:    { bg: 'var(--bg-elevated)', color: '#94a3b8' },
  MEDIUM: { bg: 'var(--bg-elevated)', color: '#60a5fa' },
  HIGH:   { bg: 'var(--bg-elevated)', color: '#fb923c' },
  URGENT: { bg: 'var(--bg-elevated)', color: '#f87171' },
}

const STATUS_STYLES = {
  TODO:        { bg: 'var(--bg-elevated)', color: '#94a3b8', label: 'Todo' },
  IN_PROGRESS: { bg: 'var(--bg-elevated)', color: '#60a5fa', label: 'In Progress' },
  IN_REVIEW:   { bg: 'var(--bg-elevated)', color: '#fbbf24', label: 'In Review' },
  DONE:        { bg: 'var(--bg-elevated)', color: '#4ade80', label: 'Done' },
}

const shimmerBg = `linear-gradient(
  90deg,
  var(--bg-elevated) 25%,
  var(--bg-muted)    50%,
  var(--bg-elevated) 75%
)`

function ShimmerBlock({ width = '100%', height = '12px', radius = '6px', style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: shimmerBg,
      backgroundSize: '800px 100%',
      animation: 'shimmer 1.4s infinite linear',
      ...style,
    }} />
  )
}

function SkeletonCard() {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '16px', padding: '24px',
    }}>
      <ShimmerBlock width="70px" height="10px" style={{ marginBottom: '14px' }} />
      <ShimmerBlock width="50px" height="32px" />
    </div>
  )
}

function StatCard({ label, value, icon, color, delay = 0, animate = false }) {
  const [entered, setEntered] = useState(false)
  const count = useCountUp(value, animate)

  useEffect(() => {
    if (!animate) return
    const t = setTimeout(() => setEntered(true), delay)
    return () => clearTimeout(t)
  }, [animate, delay])

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px', padding: '24px',
        display: 'flex', alignItems: 'center', gap: '16px',
        opacity: animate ? (entered ? 1 : 0) : 1,
        transform: animate ? (entered ? 'translateY(0)' : 'translateY(16px)') : 'none',
        transition: 'opacity 400ms ease, transform 400ms ease, border-color 200ms, box-shadow 200ms',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color + '60'
        e.currentTarget.style.boxShadow = `0 0 20px ${color}15`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{
        width: '48px', height: '48px', borderRadius: '14px',
        backgroundColor: color + '20',
        border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color,
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px',
        }}>
          {label}
        </p>
        <p style={{ color: 'var(--text-primary)', fontSize: '32px', fontWeight: 800, lineHeight: 1 }}>
          {animate ? count : (value ?? 0)}
        </p>
      </div>
    </div>
  )
}

function ProgressBar({ color, pct = 5 }) {
  const ref = useRef(null)
  useEffect(() => {
    const t = setTimeout(() => { if (ref.current) ref.current.style.width = `${pct}%` }, 80)
    return () => clearTimeout(t)
  }, [pct])

  return (
    <div style={{
      width: '100%', backgroundColor: 'var(--bg-elevated)',
      borderRadius: '6px', height: '6px',
    }}>
      <div ref={ref} style={{
        height: '6px', borderRadius: '6px',
        backgroundColor: color, width: '0%',
        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      }} />
    </div>
  )
}

export default function DashboardPage() {
  useGlobalStyles()
  const { user } = useAuthStore()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => { const res = await getDashboardStats(); return res.data },
  })

  const dataLoaded = !isLoading && !!data

  return (
    <div style={{ maxWidth: '1100px', width: '100%' }}>

      <div style={{ marginBottom: '28px', animation: 'fadeSlideUp 400ms ease both' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
          Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.name}</span> 👋
        </p>
      </div>

      {isError && (
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid #7f1d1d',
          color: '#f87171', padding: '12px 16px',
          borderRadius: '12px', marginBottom: '24px', fontSize: '13px',
        }}>
          Failed to load dashboard data. Make sure the server is running.
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '24px' }}>
        {isLoading ? (
          <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
        ) : (
          <>
            <StatCard label="Total Projects" value={data?.totalProjects} color="#3b82f6" delay={0} animate={dataLoaded}
              icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>}
            />
            <StatCard label="Total Tasks" value={data?.totalTasks} color="#a855f7" delay={80} animate={dataLoaded}
              icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>}
            />
            <StatCard label="Completed" value={data?.completedTasks} color="#22c55e" delay={160} animate={dataLoaded}
              icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
            <StatCard label="Overdue" value={data?.overdueTasks} color="#ef4444" delay={240} animate={dataLoaded}
              icon={<svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Recent Tasks */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px', padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700 }}>Recent Tasks</h2>
            <span style={{
              backgroundColor: 'var(--bg-elevated)',
              color: 'var(--text-muted)',
              fontSize: '11px', padding: '3px 10px',
              borderRadius: '999px', fontWeight: 600,
              border: '1px solid var(--border)',
            }}>
              Last 5
            </span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1,2,3,4,5].map(i => <ShimmerBlock key={i} height="40px" radius="8px" />)}
            </div>
          ) : !data?.recentTasks?.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📋</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No tasks yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {data.recentTasks.map((task, i) => {
                const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM
                const status   = STATUS_STYLES[task.status]   || STATUS_STYLES.TODO
                return (
                  <div key={task.id} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '12px',
                    padding: '12px 0',
                    borderBottom: i < data.recentTasks.length - 1
                      ? '1px solid var(--border)' : 'none',
                    animation: 'fadeSlideUp 300ms ease both',
                    animationDelay: `${i * 50}ms`,
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{
                        color: 'var(--text-primary)', fontSize: '13px', fontWeight: 500,
                        overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', marginBottom: '4px',
                      }}>
                        {task.title}
                      </p>
                      <span style={{
                        fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
                        backgroundColor: (task.project?.color || '#3b82f6') + '20',
                        color: task.project?.color || '#3b82f6', fontWeight: 600,
                      }}>
                        {task.project?.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                        backgroundColor: priority.bg, color: priority.color, fontWeight: 600,
                        border: `1px solid ${priority.color}30`,
                      }}>
                        {task.priority}
                      </span>
                      <span style={{
                        fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                        backgroundColor: status.bg, color: status.color, fontWeight: 600,
                        border: `1px solid ${status.color}30`,
                      }}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Active Projects */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px', padding: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700 }}>Active Projects</h2>
            {/* Active badge — uses CSS variables instead of hardcoded dark green */}
            <span style={{
              backgroundColor: 'var(--bg-elevated)',
              color: '#4ade80',
              fontSize: '11px', padding: '3px 10px',
              borderRadius: '999px', fontWeight: 600,
              border: '1px solid #4ade8030',
            }}>
              Active
            </span>
          </div>

          {isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1,2,3,4].map(i => (
                <div key={i}>
                  <ShimmerBlock width="120px" height="12px" style={{ marginBottom: '8px' }} />
                  <ShimmerBlock height="6px" radius="3px" />
                </div>
              ))}
            </div>
          ) : !data?.activeProjects?.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚀</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No active projects</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {data.activeProjects.map((project, i) => {
                const taskCount = project._count?.tasks ?? 0
                const maxTasks = Math.max(...data.activeProjects.map(p => p._count?.tasks ?? 0), 1)
                const pct = taskCount > 0 ? Math.round((taskCount / maxTasks) * 85) + 10 : 5
                return (
                  <div key={project.id} style={{
                    animation: 'fadeSlideUp 300ms ease both',
                    animationDelay: `${i * 60}ms`,
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '8px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '10px', height: '10px',
                          borderRadius: '50%', backgroundColor: project.color,
                        }} />
                        <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>
                          {project.name}
                        </span>
                      </div>
                      <span style={{
                        color: 'var(--text-muted)', fontSize: '11px',
                        backgroundColor: 'var(--bg-elevated)',
                        padding: '2px 8px', borderRadius: '6px',
                        border: '1px solid var(--border)',
                      }}>
                        {taskCount} tasks
                      </span>
                    </div>
                    <ProgressBar color={project.color} pct={pct} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}