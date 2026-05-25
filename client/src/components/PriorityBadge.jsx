const PRIORITY_STYLES = {
  LOW:    { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' },
  MEDIUM: { backgroundColor: '#172554',            color: '#60a5fa' },
  HIGH:   { backgroundColor: '#2d1a00',            color: '#fb923c' },
  URGENT: { backgroundColor: '#1a0a0a',            color: '#f87171' },
}

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.LOW

  return (
    <span style={{
      ...style,
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
      display: 'inline-block',
    }}>
      {priority}
    </span>
  )
}