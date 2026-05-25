import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getProjects, deleteProject } from '../api/projects'
import CreateProjectModal from '../components/CreateProjectModal'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const STATUS_STYLES = {
  ACTIVE:   { bg: 'var(--bg-elevated)', color: '#4ade80', label: 'Active' },
  ARCHIVED: { bg: 'var(--bg-elevated)', color: '#94a3b8', label: 'Archived' },
  ON_HOLD:  { bg: 'var(--bg-elevated)', color: '#fb923c', label: 'On Hold' },
}

function DeleteConfirmModal({ project, onConfirm, onCancel, isLoading }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: '16px',
      }}
    >
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px', padding: '28px',
        width: '100%', maxWidth: '380px',
      }}>
        <div style={{
          width: '48px', height: '48px',
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid #ef444430',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '16px',
        }}>
          <svg width="22" height="22" fill="none" stroke="#ef4444" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <h2 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '16px', marginBottom: '8px' }}>
          Delete Project
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px' }}>
          Are you sure you want to delete{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>"{project.name}"</span>?
          All tasks and comments will be permanently removed.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-strong)',
              borderRadius: '10px', color: 'var(--text-secondary)',
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-muted)' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              flex: 1, padding: '11px',
              backgroundColor: '#dc2626',
              border: 'none', borderRadius: '10px',
              color: 'white', fontSize: '13px', fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.7 : 1,
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.backgroundColor = '#b91c1c' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dc2626' }}
          >
            {isLoading ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, onDelete }) {
  const [hovered, setHovered] = useState(false)
  const status = STATUS_STYLES[project.status] || STATUS_STYLES.ACTIVE

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: hovered ? 'var(--bg-elevated)' : 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--border-strong)' : 'var(--border)'}`,
        borderRadius: '16px', overflow: 'hidden',
        transition: 'all 200ms ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ height: '4px', backgroundColor: project.color }} />

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <div style={{
              width: '36px', height: '36px',
              backgroundColor: project.color + '22',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="18" height="18" fill="none" stroke={project.color} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{
                color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {project.name}
              </h3>
              {/* Status badge — bg uses CSS variable */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                backgroundColor: status.bg,
                color: status.color,
                border: `1px solid ${status.color}30`,
                fontSize: '10px', fontWeight: 600,
                padding: '2px 8px', borderRadius: '999px', marginTop: '3px',
              }}>
                <span style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  backgroundColor: status.color, display: 'inline-block',
                }} />
                {status.label}
              </span>
            </div>
          </div>

          {/* Delete button */}
          <button
            onClick={(e) => { e.preventDefault(); onDelete(project) }}
            style={{
              width: '28px', height: '28px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              borderRadius: '8px', color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
              e.currentTarget.style.color = '#ef4444'
              e.currentTarget.style.borderColor = '#ef444430'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <p style={{
          color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.6,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1,
        }}>
          {project.description || 'No description provided for this project.'}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          paddingTop: '12px', borderTop: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4z" />
            </svg>
            <span style={{ fontSize: '12px' }}>{project._count?.members ?? 0} members</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span style={{ fontSize: '12px' }}>{project._count?.tasks ?? 0} tasks</span>
          </div>
          <Link
            to={`/projects/${project.id}`}
            style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: '5px',
              color: project.color, fontSize: '12px', fontWeight: 600,
              textDecoration: 'none', padding: '5px 12px',
              backgroundColor: project.color + '15', borderRadius: '8px',
              border: `1px solid ${project.color}30`, transition: 'all 150ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = project.color + '30' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = project.color + '15' }}
          >
            Open Board
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => { const res = await getProjects(); return res.data },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Project deleted!')
      setProjectToDelete(null)
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete project')
      setProjectToDelete(null)
    },
  })

  const projects = data?.projects || []
  if (isLoading) return <LoadingSpinner />

  return (
    <div style={{ maxWidth: '1100px', width: '100%' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
            Projects
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            backgroundColor: 'var(--accent)', color: 'var(--accent-text)',
            border: 'none', borderRadius: '12px', padding: '12px 20px',
            fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            transition: 'all 150ms', boxShadow: 'var(--shadow-md)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--accent)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      {isError && (
        <div style={{
          backgroundColor: 'var(--bg-elevated)',
          border: '1px solid #7f1d1d', color: '#f87171',
          padding: '12px 16px', borderRadius: '10px',
          marginBottom: '20px', fontSize: '13px',
        }}>
          Failed to load projects.
        </div>
      )}

      {projects.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '80px 24px', textAlign: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border)', borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <svg width="28" height="28" fill="none" stroke="var(--text-muted)" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '16px', marginBottom: '8px' }}>
            No projects yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px' }}>
            Create your first project to get started
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: 'var(--accent)', color: 'var(--accent-text)',
              border: 'none', borderRadius: '10px', padding: '11px 24px',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} onDelete={setProjectToDelete} />
          ))}
        </div>
      )}

      {showCreateModal && <CreateProjectModal onClose={() => setShowCreateModal(false)} />}
      {projectToDelete && (
        <DeleteConfirmModal
          project={projectToDelete}
          onConfirm={() => deleteMutation.mutate(projectToDelete.id)}
          onCancel={() => setProjectToDelete(null)}
          isLoading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}