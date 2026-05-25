import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTask, updateTaskStatus, addComment, deleteComment } from '../api/tasks'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'

const PRIORITY_STYLES = {
  LOW:    { bg: '#1e293b', color: '#94a3b8' },
  MEDIUM: { bg: '#172554', color: '#60a5fa' },
  HIGH:   { bg: '#2d1a00', color: '#fb923c' },
  URGENT: { bg: '#1a0a0a', color: '#f87171' },
}

function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899']
function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function TaskDetailPage() {
  const { id: projectId, taskId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [comment, setComment] = useState('')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await getTask(taskId)
      return res.data
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      toast.success('Status updated!')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const commentMutation = useMutation({
    mutationFn: (content) => addComment(taskId, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      setComment('')
      toast.success('Comment added!')
    },
    onError: () => toast.error('Failed to add comment'),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId) => deleteComment(taskId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] })
      toast.success('Comment deleted!')
    },
    onError: () => toast.error('Failed to delete comment'),
  })

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (isError) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#1a0a0a', border: '1px solid #7f1d1d', color: '#f87171', padding: '16px', borderRadius: '12px' }}>
          Failed to load task.
        </div>
      </div>
    )
  }

  const task = data?.task
  const priority = PRIORITY_STYLES[task?.priority] || PRIORITY_STYLES.MEDIUM

  return (
    <div style={{ maxWidth: '800px', width: '100%', margin: '0 auto' }}>

      {/* Back button */}
      <button
        onClick={() => navigate(`/projects/${projectId}`)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500,
          background: 'none', border: 'none', cursor: 'pointer',
          marginBottom: '24px', padding: '8px 0',
          transition: 'color 150ms',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = '#93c5fd'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Board
      </button>

      {/* Main card */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', marginBottom: '16px', transition: 'var(--theme-transition)' }}>

        {/* Title + priority */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '20px' }}>
          <h1 style={{ color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800, lineHeight: 1.3, flex: 1 }}>
            {task?.title}
          </h1>
          <span style={{ backgroundColor: priority.bg, color: priority.color, fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '8px', flexShrink: 0 }}>
            {task?.priority}
          </span>
        </div>

        {/* Status + due date */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <select
            value={task?.status}
            onChange={(e) => statusMutation.mutate({ id: taskId, status: e.target.value })}
            style={{
              backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
              color: '#93c5fd', fontSize: '13px', fontWeight: 600,
              borderRadius: '10px', padding: '8px 14px',
              cursor: 'pointer', outline: 'none',
              transition: 'var(--theme-transition)',
            }}
          >
            <option value="TODO">📋 Todo</option>
            <option value="IN_PROGRESS">⚡ In Progress</option>
            <option value="IN_REVIEW">👁 In Review</option>
            <option value="DONE">✅ Done</option>
          </select>

          {task?.dueDate && (
            <span style={{
              backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border-strong)',
              color: 'var(--text-muted)', fontSize: '12px',
              borderRadius: '10px', padding: '8px 14px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: 'var(--border)', marginBottom: '24px' }} />

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Description
          </p>
          <p style={{ color: task?.description ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: '14px', lineHeight: 1.7, fontStyle: task?.description ? 'normal' : 'italic' }}>
            {task?.description || 'No description provided.'}
          </p>
        </div>

        {/* Assignee */}
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Assignee
          </p>
          {task?.assignee ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${getAvatarColor(task.assignee.name)}, ${getAvatarColor(task.assignee.name)}99)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '13px', fontWeight: 700, flexShrink: 0,
              }}>
                {getInitials(task.assignee.name)}
              </div>
              <div>
                <p style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>{task.assignee.name}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{task.assignee.email}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'var(--bg-elevated)', border: '2px dashed var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" fill="none" stroke="var(--text-secondary)" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Unassigned</span>
            </div>
          )}
        </div>
      </div>

      {/* Comments */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px', transition: 'var(--theme-transition)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '15px' }}>Comments</h3>
          <span style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '11px', padding: '3px 10px', borderRadius: '999px', fontWeight: 600 }}>
            {task?.comments?.length ?? 0}
          </span>
        </div>

        {/* Comment list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '24px' }}>
          {task?.comments?.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No comments yet. Be the first!</p>
            </div>
          ) : (
            task?.comments?.map((c, i) => (
              <div key={c.id} style={{
                display: 'flex', gap: '12px',
                padding: '16px 0',
                borderBottom: i < task.comments.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${getAvatarColor(c.author?.name)}, ${getAvatarColor(c.author?.name)}80)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0,
                }}>
                  {getInitials(c.author?.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600 }}>{c.author?.name}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{timeAgo(c.createdAt)}</span>
                    </div>
                    {c.author?.id === user?.id && (
                      <button
                        onClick={() => deleteCommentMutation.mutate(c.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', borderRadius: '6px', transition: 'color 150ms' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>{c.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add comment */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              borderRadius: '12px', padding: '14px 16px',
              fontSize: '13px', resize: 'none',
              outline: 'none', marginBottom: '12px',
              fontFamily: 'inherit', lineHeight: 1.6,
              transition: 'border-color 150ms',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
          />
          <button
            onClick={() => { if (comment.trim()) commentMutation.mutate(comment) }}
            disabled={!comment.trim() || commentMutation.isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: comment.trim() ? 'var(--accent)' : 'var(--bg-elevated)',
              color: comment.trim() ? 'var(--accent-text)' : 'var(--text-muted)',
              border: 'none', borderRadius: '10px',
              padding: '10px 20px', fontSize: '13px', fontWeight: 600,
              cursor: comment.trim() ? 'pointer' : 'not-allowed',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => { if (comment.trim()) e.currentTarget.style.backgroundColor = 'var(--accent-hover)' }}
            onMouseLeave={(e) => { if (comment.trim()) e.currentTarget.style.backgroundColor = 'var(--accent)' }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      <style>{`textarea::placeholder { color: var(--text-muted); }`}</style>
    </div>
  )
}