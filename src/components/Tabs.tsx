import { PhoneCall, Users, MessagesSquare } from 'lucide-react'

type TabKey = 'sessions' | 'users' | 'conversations'

type Props = {
  active: TabKey
  onChange: (tab: TabKey) => void
}

export function Tabs({ active, onChange }: Props) {
  return (
    <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
      <button
        className="btn"
        onClick={() => onChange('sessions')}
        aria-pressed={active === 'sessions'}
        style={active === 'sessions' ? { background: '#e8f0ff', borderColor: '#dbe7ff' } : undefined}
      >
        <PhoneCall size={16} /> Sessions
      </button>
      <button
        className="btn"
        onClick={() => onChange('users')}
        aria-pressed={active === 'users'}
        style={active === 'users' ? { background: '#e8f0ff', borderColor: '#dbe7ff' } : undefined}
      >
        <Users size={16} /> Users
      </button>
      <button
        className="btn"
        onClick={() => onChange('conversations')}
        aria-pressed={active === 'conversations'}
        style={active === 'conversations' ? { background: '#e8f0ff', borderColor: '#dbe7ff' } : undefined}
      >
        <MessagesSquare size={16} /> Conversations
      </button>
    </div>
  )
}

export type { TabKey }
