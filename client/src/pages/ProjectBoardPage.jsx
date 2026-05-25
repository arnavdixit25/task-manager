import { useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { getProject } from '../api/projects'
import { getTasks, updateTaskStatus } from '../api/tasks'
import CreateTaskModal from '../components/CreateTaskModal'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'TODO',        label: 'To Do',      color: '#64748b', emoji: '📋', emptyMsg: 'No tasks yet — add one!' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6', emoji: '⚡', emptyMsg: 'Nothing in progress' },
  { id: 'IN_REVIEW',   label: 'In Review',   color: '#f59e0b', emoji: '👁', emptyMsg: 'Nothing to review' },
  { id: 'DONE',        label: 'Done',        color: '#22c55e', emoji: '✅', emptyMsg: 'No completed tasks' },
]

// ── PRIORITY CONFIG ───────────────────────────────────────────
// bg now uses CSS variables so badges adapt in light mode
const PRIORITY_STYLES = {
  LOW:    { bg: 'var(--bg-elevated)', color: '#94a3b8', label: 'Low' },
  MEDIUM: { bg: 'var(--bg-elevated)', color: '#60a5fa', label: 'Medium' },
  HIGH:   { bg: 'var(--bg-elevated)', color: '#fb923c', label: 'High' },
  URGENT: { bg: 'var(--bg-elevated)', color: '#f87171', label: 'Urgent' },
}

const AVATAR_COLORS = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#ec4899']
function getAvatarColor(name) {
  if (!name) return AVATAR_COLORS[0]
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}
function getInitials(name) {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

// ─────────────────────────────────────────────────────────────
// TASK CARD
// ─────────────────────────────────────────────────────────────
function TaskCard({ task, index, projectId }) {
  const navigate = useNavigate()
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  const priority = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.MEDIUM

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => navigate(`/projects/${projectId}/tasks/${task.id}`)}
          style={{
            ...provided.draggableProps.style,
            backgroundColor: snapshot.isDragging
              ? 'var(--bg-elevated)'
              : 'var(--bg-surface)',
            border: `1px solid ${snapshot.isDragging ? '#3b82f6' : 'var(--border)'}`,
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '8px',
            cursor: 'grab',
            boxShadow: snapshot.isDragging
              ? 'var(--shadow-lg), 0 0 0 1px #3b82f630'
              : 'var(--shadow-sm)',
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(1.5deg) scale(1.02)`
              : provided.draggableProps.style?.transform,
            transition: snapshot.isDragging
              ? 'box-shadow 150ms, border-color 150ms'
              : 'border-color 150ms, background-color 150ms, box-shadow 150ms',
            userSelect: 'none',
          }}
          onMouseEnter={(e) => {
            if (!snapshot.isDragging) {
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = 'var(--shadow-md)'
            }
          }}
          onMouseLeave={(e) => {
            if (!snapshot.isDragging) {
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
            }
          }}
        >
          {/* Task title */}
          <p style={{
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            lineHeight: 1.4,
            marginBottom: '10px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {task.title}
          </p>

          {/* Priority badge */}
          <span style={{
            backgroundColor: priority.bg,
            color: priority.color,
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            border: `1px solid ${priority.color}30`,
          }}>
            {priority.label}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <p style={{
              color: isOverdue ? '#f87171' : 'var(--text-muted)',
              fontSize: '11px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: isOverdue ? 600 : 400,
            }}>
              {isOverdue ? '⚠️' : '📅'}
              {isOverdue ? 'Overdue' : new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}

          {/* Footer: avatar + comment count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid var(--border)',
          }}>
            {task.assignee ? (
              <div title={task.assignee.name} style={{
                width: '24px', height: '24px',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${getAvatarColor(task.assignee.name)}, ${getAvatarColor(task.assignee.name)}90)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '9px', fontWeight: 700,
                border: '1.5px solid var(--border)',
              }}>
                {getInitials(task.assignee.name)}
              </div>
            ) : (
              <div title="Unassigned" style={{
                width: '24px', height: '24px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px dashed var(--border-strong)',
              }} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
              <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span style={{ fontSize: '11px' }}>{task._count?.comments ?? 0}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  )
}

// ─────────────────────────────────────────────────────────────
// KANBAN COLUMN
// ─────────────────────────────────────────────────────────────
function KanbanColumn({ column, tasks, projectId, onAddTask }) {
  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderTop: `3px solid ${column.color}`,
      borderRadius: '16px',
      padding: '16px',
      width: '280px',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      transition: 'background-color 220ms, border-color 220ms',
    }}>

      {/* Column header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>{column.emoji}</span>
          <span style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 700 }}>
            {column.label}
          </span>
          <span style={{
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-muted)',
            fontSize: '11px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            transition: 'background-color 200ms',
          }}>
            {tasks.length}
          </span>
        </div>

        <button
          onClick={onAddTask}
          title={`Add task to ${column.label}`}
          style={{
            background: 'none',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            borderRadius: '8px',
            padding: '4px 10px',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
            transition: 'all 150ms',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = column.color
            e.currentTarget.style.color = column.color
            e.currentTarget.style.backgroundColor = column.color + '15'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          +
        </button>
      </div>

      {/* Droppable zone */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              minHeight: '120px',
              borderRadius: '10px',
              backgroundColor: snapshot.isDraggingOver
                ? column.color + '12'
                : 'transparent',
              border: snapshot.isDraggingOver
                ? `2px dashed ${column.color}50`
                : '2px dashed transparent',
              transition: 'background-color 200ms, border-color 200ms',
              padding: snapshot.isDraggingOver ? '6px' : '0',
            }}
          >
            {/* Empty state */}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--text-muted)',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '32px', height: '32px',
                  borderRadius: '50%',
                  backgroundColor: column.color + '15',
                  border: `1px dashed ${column.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px',
                }}>
                  {column.emoji}
                </div>
                <span>{column.emptyMsg}</span>
              </div>
            )}

            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                projectId={projectId}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PRIORITY FILTER BAR
// ─────────────────────────────────────────────────────────────
function PriorityFilter({ active, onChange }) {
  const priorities = ['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW']

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      {priorities.map((p) => {
        const isActive = active === p
        const style = PRIORITY_STYLES[p]
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            style={{
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              border: `1px solid ${isActive && style ? style.color + '60' : 'var(--border)'}`,
              backgroundColor: isActive
                ? (style ? 'var(--bg-muted)' : 'var(--accent)')
                : 'var(--bg-elevated)',
              color: isActive
                ? (style ? style.color : 'white')
                : 'var(--text-muted)',
              transition: 'all 150ms',
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
            }}
          >
            {p === 'ALL' ? 'All' : PRIORITY_STYLES[p].label}
          </button>
        )
      })}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function ProjectBoardPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [defaultStatus, setDefaultStatus] = useState('TODO')
  const [priorityFilter, setPriorityFilter] = useState('ALL')

  const undoRef = useRef(null)
  const toastIdRef = useRef(null)

  const { data: projectData, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => { const res = await getProject(id); return res.data },
  })

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => { const res = await getTasks(id); return res.data },
  })

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current)
      const tid = toast.success(
        (t) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px' }}>Status updated</span>
            <button
              onClick={() => {
                if (undoRef.current) {
                  queryClient.setQueryData(['tasks', id], undoRef.current)
                  undoRef.current = null
                }
                toast.dismiss(t.id)
                toast('↩️ Undone', { duration: 1500 })
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: 'white',
                padding: '3px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Undo
            </button>
          </div>
        ),
        { duration: 4000 }
      )
      toastIdRef.current = tid
    },
    onError: () => {
      if (undoRef.current) {
        queryClient.setQueryData(['tasks', id], undoRef.current)
        undoRef.current = null
      }
      toast.error('Failed to update status')
    },
  })

  const handleDragEnd = useCallback((result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return

    const newStatus = destination.droppableId
    undoRef.current = queryClient.getQueryData(['tasks', id])

    queryClient.setQueryData(['tasks', id], (old) => {
      if (!old) return old
      return {
        ...old,
        tasks: old.tasks.map((t) =>
          t.id === draggableId ? { ...t, status: newStatus } : t
        ),
      }
    })

    statusMutation.mutate({ taskId: draggableId, status: newStatus })
  }, [id, queryClient, statusMutation])

  const project = projectData?.project
  const allTasks = tasksData?.tasks || []

  const filteredTasks = priorityFilter === 'ALL'
    ? allTasks
    : allTasks.filter((t) => t.priority === priorityFilter)

  const doneTasks = allTasks.filter((t) => t.status === 'DONE').length
  const totalTasks = allTasks.length
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  // Loading state
  if (projectLoading || tasksLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '300px',
        gap: '12px',
        backgroundColor: 'var(--bg-base)',
        transition: 'var(--theme-transition)',
      }}>
        <div style={{
          width: '36px', height: '36px',
          border: '3px solid var(--bg-muted)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
          Loading board...
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ transition: 'var(--theme-transition)' }}>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: '20px' }}>

        {/* Top row: project name + Add Task button */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Glowing project color dot */}
            <div style={{
              width: '12px', height: '12px',
              borderRadius: '50%',
              backgroundColor: project?.color || '#3b82f6',
              boxShadow: `0 0 10px ${project?.color || '#3b82f6'}80`,
            }} />
            <h1 style={{
              color: 'var(--text-primary)',
              fontSize: '20px',
              fontWeight: 800,
            }}>
              {project?.name}
            </h1>
            {/* Active badge — uses CSS variables */}
            <span style={{
              backgroundColor: 'var(--bg-elevated)',
              color: '#4ade80',
              fontSize: '10px',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '999px',
              border: '1px solid #4ade8030',
            }}>
              Active
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              color: 'var(--text-muted)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m4 6v-2m0 0a4 4 0 10-4-4 4 4 0 004 4z" />
              </svg>
              {project?.members?.length ?? 0} members
            </span>

            <button
              onClick={() => { setDefaultStatus('TODO'); setShowTaskModal(true) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-text)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 18px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(37,99,235,0.35)',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-hover)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(37,99,235,0.35)'
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </button>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
          }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Progress</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 600 }}>
              {doneTasks} / {totalTasks} tasks done ({progressPct}%)
            </span>
          </div>
          {/* Track */}
          <div style={{
            height: '6px',
            backgroundColor: 'var(--bg-elevated)',
            borderRadius: '999px',
            overflow: 'hidden',
          }}>
            {/* Fill */}
            <div style={{
              height: '100%',
              width: `${progressPct}%`,
              backgroundColor: progressPct === 100 ? '#22c55e' : 'var(--accent)',
              borderRadius: '999px',
              transition: 'width 400ms ease',
            }} />
          </div>
        </div>

        {/* PRIORITY FILTER BAR */}
        <PriorityFilter active={priorityFilter} onChange={setPriorityFilter} />
      </div>

      {/* KANBAN BOARD */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-scroll" style={{ display: 'flex', gap: '16px' }}>
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={filteredTasks.filter((t) => t.status === column.id)}
              projectId={id}
              onAddTask={() => {
                setDefaultStatus(column.id)
                setShowTaskModal(true)
              }}
            />
          ))}
        </div>
      </DragDropContext>

      {/* CREATE TASK MODAL */}
      {showTaskModal && (
        <CreateTaskModal
          projectId={id}
          defaultStatus={defaultStatus}
          members={project?.members || []}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  )
}