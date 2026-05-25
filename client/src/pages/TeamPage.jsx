import { useQuery } from '@tanstack/react-query'
import { getProjects } from '../api/projects'

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899','#06b6d4']

function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

export default function TeamPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['projects-with-members'],
    queryFn: async () => {
      const res = await getProjects()
      return res.data?.projects || []
    },
  })

  const getMembersMap = () => {
    const map = new Map()
    const projects = data || []
    projects.forEach((project) => {
      if (project.members) {
        project.members.forEach((member) => {
          if (!map.has(member.user?.id)) {
            map.set(member.user?.id, { ...member.user, projectCount: 1 })
          } else {
            const ex = map.get(member.user?.id)
            map.set(member.user?.id, { ...ex, projectCount: ex.projectCount + 1 })
          }
        })
      }
    })
    return Array.from(map.values())
  }

  const members = getMembersMap()

  return (
    <div style={{ maxWidth: '1100px', width: '100%' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>
          Team
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {members.length} member{members.length !== 1 ? 's' : ''} across all projects
        </p>
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px', padding: '28px', textAlign: 'center',
            }}>
              <div style={{
                width: '64px', height: '64px',
                backgroundColor: 'var(--bg-elevated)',
                borderRadius: '50%', margin: '0 auto 16px',
              }} />
              <div style={{ height: '14px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', width: '100px', margin: '0 auto 8px' }} />
              <div style={{ height: '12px', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', width: '140px', margin: '0 auto' }} />
            </div>
          ))}
        </div>
      ) : members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
            No team members found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Create a project and add members to see them here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {members.map((member) => {
            const avatarColor = getAvatarColor(member.name)
            const isAdmin = member.role === 'ADMIN'
            return (
              <div
                key={member.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px', padding: '28px 24px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', textAlign: 'center',
                  transition: 'all 200ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = avatarColor + '60'
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: '68px', height: '68px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}99)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px',
                  boxShadow: `0 8px 24px ${avatarColor}40`,
                  border: `3px solid ${avatarColor}40`,
                  fontSize: '22px', fontWeight: 800, color: 'white',
                }}>
                  {getInitials(member.name)}
                </div>

                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                  {member.name}
                </h3>

                <p style={{
                  color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '14px',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', width: '100%',
                }}>
                  {member.email}
                </p>

                {/* Role badge — bg uses CSS variables */}
                <span style={{
                  padding: '4px 14px', borderRadius: '999px',
                  fontSize: '11px', fontWeight: 700,
                  backgroundColor: 'var(--bg-elevated)',
                  color: isAdmin ? '#c084fc' : '#60a5fa',
                  border: `1px solid ${isAdmin ? '#7c3aed40' : '#2563eb40'}`,
                  marginBottom: '12px', letterSpacing: '0.04em',
                }}>
                  {isAdmin ? '⭐ Admin' : '👤 Member'}
                </span>

                {/* Project count */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: '8px', padding: '5px 12px',
                  border: '1px solid var(--border)',
                }}>
                  <svg width="12" height="12" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
                  </svg>
                  <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 600 }}>
                    {member.projectCount} project{member.projectCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}