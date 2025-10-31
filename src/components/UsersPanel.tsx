import { useEffect, useState } from 'react'
import { Pencil, KeyRound, CalendarClock, CheckCircle2, RefreshCw, Users as UsersIcon } from 'lucide-react'
import { api } from '../api'
import type { User } from '../types'
import { Modal } from './Modal'

export function UsersPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Modals
  const [emailTarget, setEmailTarget] = useState<User | null>(null)
  const [emailValue, setEmailValue] = useState('')

  const [callbackTarget, setCallbackTarget] = useState<User | null>(null)
  const [callbackWhen, setCallbackWhen] = useState('')

  const [outcomeTarget, setOutcomeTarget] = useState<User | null>(null)
  const [outcomeValue, setOutcomeValue] = useState('')

  useEffect(() => {
    void refresh()
  }, [])

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const { items } = await api.getUsers()
      setUsers(items)
    } catch (e: any) {
      setError(e.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendOtp(phone: string) {
    try {
      await api.sendOtp(phone)
      setSuccess('OTP generated')
      setTimeout(() => setSuccess(null), 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP')
    }
  }

  async function submitEmail() {
    if (!emailTarget) return
    try {
      await api.updateEmail(emailTarget.phone_number, emailValue)
      setEmailTarget(null)
      setEmailValue('')
      setSuccess('Email updated')
      await refresh()
      setTimeout(() => setSuccess(null), 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to update email')
    }
  }

  async function submitCallback() {
    if (!callbackTarget) return
    try {
      await api.scheduleCallback(callbackTarget.phone_number, callbackWhen)
      setCallbackTarget(null)
      setCallbackWhen('')
      setSuccess('Callback scheduled')
      await refresh()
      setTimeout(() => setSuccess(null), 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to schedule callback')
    }
  }

  async function submitOutcome() {
    if (!outcomeTarget) return
    try {
      await api.setOutcome(outcomeTarget.phone_number, outcomeValue)
      setOutcomeTarget(null)
      setOutcomeValue('')
      setSuccess('Outcome set')
      await refresh()
      setTimeout(() => setSuccess(null), 2000)
    } catch (e: any) {
      setError(e.message || 'Failed to set outcome')
    }
  }

  return (
    <div className="card">
      <div className="stack-between" style={{ marginBottom: 8 }}>
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <UsersIcon size={18} />
          <span>Users</span>
        </div>
        <button className="btn" onClick={refresh}><RefreshCw size={16} /> Refresh</button>
      </div>

      {error && <div className="section-subtle" style={{ color: 'crimson' }}>{error}</div>}
      {success && <div className="section-subtle" style={{ color: '#15803d' }}>{success}</div>}

      {loading ? (
        <div className="section-subtle" style={{ padding: 24 }}>Loading…</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Address</th>
                <th style={{ width: 300 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.phone_number}>
                  <td>{u.name}</td>
                  <td>{u.phone_number}</td>
                  <td>{u.email || '-'}</td>
                  <td>{u.address || '-'}</td>
                  <td>
                    <div className="row-actions">
                      <button className="icon-btn" title="Update Email" onClick={() => { setEmailTarget(u); setEmailValue(u.email || ''); }}><Pencil size={16} /></button>
                      <button className="icon-btn" title="Send OTP" onClick={() => handleSendOtp(u.phone_number)}><KeyRound size={16} /></button>
                      <button className="icon-btn" title="Schedule Callback" onClick={() => { setCallbackTarget(u); setCallbackWhen(''); }}><CalendarClock size={16} /></button>
                      <button className="icon-btn" title="Set Outcome" onClick={() => { setOutcomeTarget(u); setOutcomeValue(''); }}><CheckCircle2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ color: '#6b7280' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Email modal */}
      <Modal open={!!emailTarget} title="Update Email" onClose={() => setEmailTarget(null)} footer={(
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setEmailTarget(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={submitEmail}>Save</button>
        </div>
      )}>
        <div className="stack" style={{ alignItems: 'stretch' }}>
          <input className="input" type="email" placeholder="Email" value={emailValue} onChange={(e) => setEmailValue(e.target.value)} />
        </div>
      </Modal>

      {/* Callback modal */}
      <Modal open={!!callbackTarget} title="Schedule Callback" onClose={() => setCallbackTarget(null)} footer={(
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setCallbackTarget(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={submitCallback}>Schedule</button>
        </div>
      )}>
        <div className="stack" style={{ alignItems: 'stretch' }}>
          <input className="input" type="text" placeholder="When (ISO-8601 or text)" value={callbackWhen} onChange={(e) => setCallbackWhen(e.target.value)} />
        </div>
      </Modal>

      {/* Outcome modal */}
      <Modal open={!!outcomeTarget} title="Set Outcome" onClose={() => setOutcomeTarget(null)} footer={(
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={() => setOutcomeTarget(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={submitOutcome}>Save</button>
        </div>
      )}>
        <div className="stack" style={{ alignItems: 'stretch' }}>
          <input className="input" type="text" placeholder="Outcome (e.g., verified)" value={outcomeValue} onChange={(e) => setOutcomeValue(e.target.value)} />
        </div>
      </Modal>
    </div>
  )
}
