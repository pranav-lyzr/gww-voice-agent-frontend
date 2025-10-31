import { useEffect, useState } from 'react'
import { MessagesSquare, RefreshCw, Eye } from 'lucide-react'
import { api } from '../api'
import type { ConversationItem, ConversationResponse } from '../types'

export function ConversationsPanel() {
  const [items, setItems] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [detail, setDetail] = useState<ConversationResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const res = await api.getConversations(50, 0)
      setItems(res.items)
    } catch (e: any) {
      setError(e.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  async function viewConversation(sessionId: string) {
    try {
      setSelected(sessionId)
      setDetail(null)
      setDetailLoading(true)
      const conv = await api.getConversation(sessionId)
      setDetail(conv)
    } catch (e: any) {
      alert(e.message || 'Failed to load conversation')
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="stack-between" style={{ marginBottom: 8 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessagesSquare size={18} />
          <span>Conversations</span>
        </div>
        <button className="btn" onClick={refresh}><RefreshCw size={16} /> Refresh</button>
      </div>

      {error && <div className="section-subtle" style={{ color: 'crimson' }}>{error}</div>}
      {loading && <div className="section-subtle">Loading…</div>}

      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Session</th>
              <th>From</th>
              <th>To</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.session_id}>
                <td>{c.session_id}</td>
                <td>{c.from_number}</td>
                <td>{c.to_number}</td>
                <td>{new Date(c.start_time).toLocaleString()}</td>
                <td>{c.end_time ? new Date(c.end_time).toLocaleString() : '-'}</td>
                <td>{c.duration_seconds ?? '-'}</td>
                <td>
                  <button className="btn" onClick={() => viewConversation(c.session_id)}>
                    <Eye size={16} /> View
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={7} style={{ color: '#6b7280' }}>No conversations.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="card" style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Conversation: {selected}</div>
          {detailLoading && <div className="section-subtle">Loading…</div>}
          {detail && (
            <div style={{ display: 'grid', gap: 8 }}>
              {detail.conversation.turns.length === 0 && (
                <div className="section-subtle">No turns captured.</div>
              )}
              {detail.conversation.turns.map((t, i) => (
                <div key={i} className="card" style={{ padding: 12 }}>
                  <div className="section-subtle">{new Date(t.timestamp).toLocaleTimeString()}</div>
                  <div><strong>{t.role}:</strong> {t.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
