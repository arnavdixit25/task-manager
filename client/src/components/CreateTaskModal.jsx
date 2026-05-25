import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTask } from '../api/tasks'
import toast from 'react-hot-toast'

const PRIORITY_OPTIONS = [
  { value: 'LOW',    label: 'Low',    color: '#94a3b8', bg: 'var(--bg-elevated)' },
  { value: 'MEDIUM', label: 'Medium', color: '#60a5fa', bg: 'var(--bg-elevated)' },
  { value: 'HIGH',   label: 'High',   color: '#fb923c', bg: 'var(--bg-elevated)' },
  { value: 'URGENT', label: 'Urgent', color: '#f87171', bg: 'var(--bg-elevated)' },
]

const STATUS_OPTIONS = [
  { value: 'TODO',        label: 'Todo',        color: '#94a3b8', bg: 'var(--bg-elevated)' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#60a5fa', bg: 'var(--bg-elevated)' },
  { value: 'IN_REVIEW',   label: 'In Review',   color: '#fbbf24', bg: 'var(--bg-elevated)' },
  { value: 'DONE',        label: 'Done',        color: '#4ade80', bg: 'var(--bg-elevated)' },
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

export default function CreateTaskModal({ projectId, members = [], defaultStatus, onClose }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: defaultStatus || 'TODO',
    dueDate: '',
    assigneeId: '',
  })
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
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Task created successfully!')
      handleClose()
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to create task'
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
    if (!form.title.trim()) { setError('Task title is required'); return }
    mutation.mutate({
      ...form,
      projectId,
      assigneeId: form.assigneeId || null,
      dueDate: form.dueDate || null,
    })
  }

  const selectedPriority = PRIORITY_OPTIONS.find((p) => p.value === form.priority)
  const selectedStatus   = STATUS_OPTIONS.find((s) => s.value === form.status)

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
        maxWidth: '460px',
        maxHeight: '90vh',
        overflowY: 'auto',
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
              backgroundColor: '#a855f720', border: '1px solid #a855f730',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" fill="none" stroke="#a855f7" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2 style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 800 }}>
                Create New Task
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                Add a task to this project
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

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Title */}
            <div>
              <label style={labelStyle}>
                Title <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text" name="title" value={form.title}
                onChange={handleChange}
                placeholder="What needs to be done?"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#a855f7'
                  e.target.style.boxShadow = '0 0 0 3px #a855f720'
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
                placeholder="Add more details (optional)..."
                rows={3}
                style={{ ...inputStyle, resize: 'none', lineHeight: 1.6 }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#a855f7'
                  e.target.style.boxShadow = '0 0 0 3px #a855f720'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Priority & Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Priority</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="priority" value={form.priority} onChange={handleChange}
                    style={{
                      ...inputStyle,
                      appearance: 'none', paddingRight: '32px', cursor: 'pointer',
                      backgroundColor: 'var(--bg-elevated)',
                      color: selectedPriority.color,
                      borderColor: selectedPriority.color + '40',
                      fontWeight: 600,
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = `0 0 0 3px ${selectedPriority.color}20`
                    }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none' }}
                  >
                    {PRIORITY_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" fill="none" stroke={selectedPriority.color}
                    viewBox="0 0 24 24" style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)', pointerEvents: 'none',
                    }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Status</label>
                <div style={{ position: 'relative' }}>
                  <select
                    name="status" value={form.status} onChange={handleChange}
                    style={{
                      ...inputStyle,
                      appearance: 'none', paddingRight: '32px', cursor: 'pointer',
                      backgroundColor: 'var(--bg-elevated)',
                      color: selectedStatus.color,
                      borderColor: selectedStatus.color + '40',
                      fontWeight: 600,
                    }}
                    onFocus={(e) => {
                      e.target.style.boxShadow = `0 0 0 3px ${selectedStatus.color}20`
                    }}
                    onBlur={(e) => { e.target.style.boxShadow = 'none' }}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" fill="none" stroke={selectedStatus.color}
                    viewBox="0 0 24 24" style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)', pointerEvents: 'none',
                    }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                      d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label style={labelStyle}>Due Date</label>
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" fill="none" stroke="var(--text-muted)"
                  viewBox="0 0 24 24" style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none',
                  }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input
                  type="date" name="dueDate" value={form.dueDate}
                  onChange={handleChange}
                  style={{ ...inputStyle, paddingLeft: '36px' }}
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
            </div>

            {/* Assignee */}
            <div>
              <label style={labelStyle}>Assignee</label>
              <div style={{ position: 'relative' }}>
                <svg width="14" height="14" fill="none" stroke="var(--text-muted)"
                  viewBox="0 0 24 24" style={{
                    position: 'absolute', left: '12px', top: '50%',
                    transform: 'translateY(-50%)', pointerEvents: 'none',
                  }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <select
                  name="assigneeId" value={form.assigneeId} onChange={handleChange}
                  style={{
                    ...inputStyle,
                    paddingLeft: '36px', appearance: 'none', cursor: 'pointer',
                    backgroundColor: 'var(--bg-base)',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6'
                    e.target.style.boxShadow = '0 0 0 3px #3b82f620'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border)'
                    e.target.style.boxShadow = 'none'
                  }}
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.user.id} value={member.user.id}>
                      {member.user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
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
                  backgroundColor: '#7c3aed',
                  border: 'none', color: 'white',
                  borderRadius: '10px', padding: '11px',
                  fontSize: '13px', fontWeight: 700,
                  cursor: mutation.isPending ? 'not-allowed' : 'pointer',
                  opacity: mutation.isPending ? 0.75 : 1,
                  boxShadow: '0 4px 16px #7c3aed40',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'transform 150ms, box-shadow 150ms, opacity 200ms',
                }}
                onMouseEnter={(e) => {
                  if (!mutation.isPending) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 6px 20px #7c3aed55'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px #7c3aed40'
                }}
              >
                {mutation.isPending ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" style={{ animation: 'spin 1s linear infinite' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
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
        select option { background-color: var(--bg-surface); color: var(--text-primary); }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }
        textarea::placeholder, input::placeholder { color: var(--text-muted); }
      `}</style>
    </div>
  )
}