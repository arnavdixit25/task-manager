const STATUS_STYLES = {
  TODO:        { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)' },
  IN_PROGRESS: { backgroundColor: '#172554',            color: '#60a5fa' },
  IN_REVIEW:   { backgroundColor: '#2d2000',            color: '#fbbf24' },
  DONE:        { backgroundColor: '#052e16',            color: '#4ade80' },
  ACTIVE:      { backgroundColor: '#052e16',            color: '#4ade80' },
  ARCHIVED:    { backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)' },
  ON_HOLD:     { backgroundColor: '#2d1a00',            color: '#fb923c' },
}

const STATUS_LABELS = {
  TODO:        'Todo',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW:   'In Review',
  DONE:        'Done',
  ACTIVE:      'Active',
  ARCHIVED:    'Archived',
  ON_HOLD:     'On Hold',
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.TODO

  return (
    <span style={{
      ...style,
      padding: '3px 8px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 700,
      display: 'inline-block',
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  )
}