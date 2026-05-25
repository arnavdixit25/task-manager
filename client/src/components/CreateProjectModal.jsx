import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProject } from '../api/projects'
import toast from 'react-hot-toast'

const PROJECT_COLORS = [
  '#3b82f6', '#a855f7', '#22c55e', '#ef4444',
  '#f59e0b', '#06b6d4', '#ec4899', '#f97316',
  '#14b8a6', '#8b5cf6', '#84cc16', '#e11d48',
]

const inputStyle = {
  width: '100%',
  backgroundColor: 'var(--bg-base)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 200ms, box-shadow 200ms',
}

const labelStyle = {
  display: 'block',
  color: 'var(--text-muted)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  marginBottom: '7px',
}

export default function CreateProjectModal({ onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', description: '', color: '#3b82f6' })
  const [error, setError] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Project created!')
      handleClose()
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to create project'
      setError(msg)
      toast.error(msg)
    },
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Project name is required'); return }
    mutation.mutate(form)
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: visible ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: '16px',
        backdropFilter: visible ? 'blur(4px)' : 'blur(0px)',
        transition: 'background-color 220ms ease, backdrop-filter 220ms ease',
      }}
    >
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '28px',
        width: '100%',
        maxWidth: '440px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateY(0px)' : 'scale(0.93) translateY(12px)',
        transition: 'opacity 220ms cubic-bezier(0.16,1,0.3,1), transform 220ms cubic-bezier(0.16,1,0.3,1)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: form.color + '20',
              border: `1px solid ${form.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 200ms, border-color 200ms',
            }}>
              <svg width="18" height="18" fill="none" stroke={form.color} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 800 }}>
                New Project
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                Set up your project workspace
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-muted)'
              e.currentTarget.style.color = 'var(--text-primary)'
              e.currentTarget.style.transform = 'rotate(90deg)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.transform = 'rotate(0deg)'
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid #7f1d1d',
            color: '#f87171', padding: '10px 14px', borderRadius: '10px',
            marginBottom: '16px', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '8px',
            animation: 'slideDown 200ms ease',
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Live preview banner */}
        <div style={{
          backgroundColor: form.color + '12',
          border: `1px solid ${form.color}25`,
          borderRadius: '12px', padding: '14px 16px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', gap: '12px',
          transition: 'background-color 300ms, border-color 300ms',
        }}>
          <div style={{
            width: '10px', height: '10px', borderRadius: '50%',
            backgroundColor: form.color, flexShrink: 0,
            transition: 'background-color 300ms',
            boxShadow: `0 0 8px ${form.color}60`,
          }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {form.name || 'Project name preview'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
              0 tasks · Active
            </p>
          </div>
          <span style={{
            fontSize: '10px', padding: '2px 8px', borderRadius: '6px',
            backgroundColor: '#052e16', color: '#4ade80', fontWeight: 600,
          }}>
            Active
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Project Name */}
            <div>
              <label style={labelStyle}>
                Project Name <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange}
                placeholder="e.g. Website Redesign"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = form.color
                  e.target.style.boxShadow = `0 0 0 3px ${form.color}20`
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description" value={form.description}
                onChange={handleChange}
                placeholder="What is this project about? (optional)"
                rows={3}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6'
                  e.target.style.boxShadow = '0 0 0 3px #3b82f620'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Color picker */}
            <div>
              <label style={labelStyle}>Project Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color} type="button"
                    onClick={() => setForm({ ...form, color })}
                    style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      backgroundColor: color,
                      border: form.color === color ? '2px solid white' : '2px solid transparent',
                      cursor: 'pointer',
                      boxShadow: form.color === color ? `0 0 12px ${color}90` : 'none',
                      transform: form.color === color ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 150ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 150ms',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      if (form.color !== color) e.currentTarget.style.transform = 'scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                      if (form.color !== color) e.currentTarget.style.transform = 'scale(1)'
                    }}
                  >
                    {form.color === color && (
                      <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3}
                          d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button" onClick={handleClose}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  borderRadius: '10px', padding: '11px',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 150ms',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-muted)'
                  e.currentTarget.style.borderColor = 'var(--border-strong)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                Cancel
              </button>

              <button
                type="submit" disabled={mutation.isPending}
                style={{
                  flex: 2,
                  backgroundColor: form.color,
                  border: 'none', color: 'white',
                  borderRadius: '10px', padding: '11px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: mutation.isPending ? 0.75 : 1,
                  boxShadow: `0 4px 16px ${form.color}45`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'background-color 200ms, box-shadow 200ms, transform 150ms, opacity 200ms',
                }}
                onMouseEnter={(e) => {
                  if (!mutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = `0 6px 20px ${form.color}55`
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = `0 4px 16px ${form.color}45`
                }}
              >
                {mutation.isPending ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      style={{ animation: 'spin 1s linear infinite' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M3 7a2 2 0 012-2h3l2 2h9a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                    </svg>
                    Create Project
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        textarea::placeholder, input::placeholder { color: var(--text-muted); }
      `}</style>
    </div>
  )
}