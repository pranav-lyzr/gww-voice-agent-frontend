import { useEffect, useState } from 'react'
import { Trash2, RefreshCw, PhoneCall } from 'lucide-react'
import { api } from '../api'
import type { Session } from '../types'
import { ConfirmDialog } from './Modal'

export function SessionsPanel() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [confirmId, setConfirmId] = useState<string | null>(null)

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const res = await api.getSessions()
      setSessions(res.sessions)
    } catch (e: any) {
      setError(e.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  async function onConfirmEnd() {
    if (!confirmId) return
    try {
      await api.deleteSession(confirmId)
      setSuccess('Session ended')
      setConfirmId(null)
      await refresh()
      setTimeout(() => setSuccess(null), 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to end session')
    }
  }

  return (
    <div className="card card-muted">
      <div className="stack-between" style={{ marginBottom: 8 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <PhoneCall size={18} />
          <span>Active Sessions</span>
        </div>
        <div className="stack">
          <span className="badge">{sessions.length} active</span>
          <button className="btn" onClick={refresh}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>

      {error && <div className="section-subtle" style={{ color: 'crimson' }}>{error}</div>}
      {success && <div className="section-subtle" style={{ color: '#15803d' }}>{success}</div>}
      {loading && <div className="section-subtle">Loading…</div>}
      {!loading && sessions.length === 0 && (
        <div className="section-subtle" style={{ padding: 24 }}>No active sessions</div>
      )}

      {sessions.map((s) => (
        <div key={s.session_id} style={{ borderTop: '1px solid #eef2f7', paddingTop: 12, marginTop: 12 }}>
          <div className="stack" style={{ flexWrap: 'wrap' }}>
            <div><strong>Session:</strong> {s.session_id}</div>
            <div><strong>From:</strong> {s.from_number}</div>
            <div><strong>To:</strong> {s.to_number}</div>
            <div><strong>Started:</strong> {new Date(s.start_time).toLocaleString()}</div>
          </div>
          <div className="stack" style={{ marginTop: 8, flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setConfirmId(s.session_id)}>
              <Trash2 size={16} /> End
            </button>
          </div>
        </div>
      ))}

      <ConfirmDialog
        open={!!confirmId}
        title="End session?"
        message="Are you sure you want to end this session?"
        confirmText="End Session"
        cancelText="Cancel"
        onConfirm={onConfirmEnd}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
