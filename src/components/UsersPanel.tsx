import { useEffect, useState } from 'react'
import { RefreshCw, Users as UsersIcon, Plus, Trash2, X } from 'lucide-react'
import { api } from '../api'
import type { User, CreateUserRequest } from '../types'

// Skeleton loader component
function SkeletonRow() {
  return (
    <tr style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '80%' }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '90%' }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '90%' }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '70%' }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '95%' }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '85%' }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 20, background: '#E5E7EB', borderRadius: 12, width: 60 }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 20, background: '#E5E7EB', borderRadius: 12, width: 60 }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '85%' }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '90%' }} /></td>
      <td style={{ padding: '18px 20px' }}><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '75%' }} /></td>
      <td style={{ padding: '18px 20px', textAlign: 'center' }}><div style={{ height: 32, width: 40, background: '#E5E7EB', borderRadius: 6, margin: '0 auto' }} /></td>
    </tr>
  )
}

// Add keyframe animation to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-10px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes modalFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes modalScaleIn {
      0% {
        opacity: 0;
        transform: scale(0.7) translateY(30px);
      }
      50% {
        opacity: 0.8;
        transform: scale(1.05) translateY(-5px);
      }
      100% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .user-row {
      animation: slideIn 0.3s ease-out forwards;
    }
    .user-row:hover {
      background-color: #F9FAFB;
    }
    .icon-btn:hover {
      background-color: #FEF3C7 !important;
      border-color: #F59E0B !important;
      transform: translateY(-1px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
    }
    .icon-btn:active {
      transform: translateY(0);
    }
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: modalFadeIn 0.2s ease-out;
    }
    .modal-content {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      max-width: 540px;
      width: 100%;
      max-height: 90vh;
      overflow: hidden;
      animation: modalScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
      display: flex;
      flex-direction: column;
    }
    .modal-content::-webkit-scrollbar {
      display: none;
    }
    .modal-content {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .modal-body-scroll {
      overflow-y: auto;
      padding: 28px 32px 28px 32px;
      margin-right: 16px;
    }
    .modal-body-scroll::-webkit-scrollbar {
      display: none;
    }
    .modal-body-scroll {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    .delete-btn:hover {
      background-color: #FEE2E2 !important;
      border-color: #EF4444 !important;
      transform: translateY(-1px);
    }
  `
  if (!document.head.querySelector('style[data-user-animations]')) {
    style.setAttribute('data-user-animations', 'true')
    document.head.appendChild(style)
  }
}

export function UsersPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createFormData, setCreateFormData] = useState<CreateUserRequest>({
    name: '',
    address: '',
    phone_number: '',
    secondary_phone_number: '',
    dob: '',
    email: '',
  })
  const [createLoading, setCreateLoading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)

  useEffect(() => {
    void refresh()
    
    // Set up auto-refresh every 5 seconds
    const intervalId = setInterval(() => {
      void refresh(true) // Pass true to indicate auto-refresh
    }, 5000)

    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  async function refresh(isAuto = false) {
    try {
      if (isAuto) {
        setIsAutoRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)
      // Use analytics endpoint for user data
      const response = await api.getUserAnalytics()
      setUsers(response.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load users')
    } finally {
      if (isAuto) {
        setIsAutoRefreshing(false)
      } else {
        setLoading(false)
      }
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    try {
      setCreateLoading(true)
      setCreateError(null)
      await api.createUser(createFormData)
      // Reset form and close modal
      setCreateFormData({
        name: '',
        address: '',
        phone_number: '',
        secondary_phone_number: '',
        dob: '',
        email: '',
      })
      setShowCreateModal(false)
      // Refresh users list
      await refresh()
    } catch (e: any) {
      setCreateError(e.message || 'Failed to create user')
    } finally {
      setCreateLoading(false)
    }
  }

  async function handleDeleteUser(phoneNumber: string) {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      setDeleteLoading(phoneNumber)
      await api.deleteUser(phoneNumber)
      // Refresh users list
      await refresh()
    } catch (e: any) {
      setError(e.message || 'Failed to delete user')
    } finally {
      setDeleteLoading(null)
    }
  }

  function openCreateModal() {
    setShowCreateModal(true)
    setCreateError(null)
  }

  function closeCreateModal() {
    setShowCreateModal(false)
    setCreateError(null)
  }

  return (
    <div>
      {/* Header Card */}
      <div className="card" style={{ marginBottom: 16, padding: 24 }}>
        <div className="stack-between" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UsersIcon size={20} color="#374151" />
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>User Management</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                {users.length} {users.length === 1 ? 'user' : 'users'} total
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn"
              onClick={openCreateModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: '#111827',
                color: 'white',
                border: '1px solid #111827',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#000000'
                e.currentTarget.style.borderColor = '#000000'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#111827'
                e.currentTarget.style.borderColor = '#111827'
              }}
            >
              <Plus size={16} />
              <span>Create User</span>
            </button>
            <button
              className="btn"
              onClick={() => refresh(false)}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                minWidth: 100,
                background: isAutoRefreshing ? '#DBEAFE' : 'white',
                color: isAutoRefreshing ? '#1E40AF' : '#111827',
                border: `1px solid ${isAutoRefreshing ? '#93C5FD' : '#E5E7EB'}`,
                fontWeight: 600,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => !loading && !isAutoRefreshing && (e.currentTarget.style.background = '#F9FAFB')}
              onMouseLeave={(e) => !loading && !isAutoRefreshing && (e.currentTarget.style.background = 'white')}
            >
              <RefreshCw size={16} style={{ animation: (loading || isAutoRefreshing) ? 'spin 1s linear infinite' : 'none' }} />
              <span>{loading ? 'Loading...' : isAutoRefreshing ? 'Auto Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="card" style={{
          marginBottom: 16,
          padding: 14,
          background: '#FAFAFA',
          border: '1px solid #E5E7EB',
          borderLeft: '3px solid #EF4444'
        }}>
          <div style={{ color: '#DC2626', fontSize: 14 }}>{error}</div>
        </div>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '2px solid #F3F4F6', background: '#FAFAFA' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>User Details</div>
        </div>

        {loading ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Name</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Phone</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Secondary Phone</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>DOB</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Email</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Address</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>OTP Verified</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Portal Mail Sent</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Call Outcome</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Fields Updated</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Callback</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB', width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: '#F9FAFB' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Name</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Phone</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Secondary Phone</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>DOB</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Email</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Address</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>OTP Verified</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Portal Mail Sent</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Call Outcome</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Fields Updated</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Callback</th>
                <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB', width: 80 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, index) => (
                <tr key={u.phone_number} className="user-row" style={{
                  animationDelay: `${index * 0.05}s`,
                  transition: 'background-color 0.2s ease',
                  borderBottom: '1px solid #F3F4F6'
                }}>
                  <td style={{ padding: '18px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#374151',
                        fontWeight: 600,
                        fontSize: 14,
                        border: '2px solid #E5E7EB',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                      }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 14, color: '#111827' }}>{u.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: 14, color: '#374151' }}>{u.phone_number}</td>
                  <td style={{ padding: '18px 20px', fontSize: 14, color: u.secondary_phone_number ? '#374151' : '#9CA3AF' }}>
                    {u.secondary_phone_number || '-'}
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: 14, color: u.dob ? '#374151' : '#9CA3AF' }}>
                    {u.dob || '-'}
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: 14, color: u.email ? '#374151' : '#9CA3AF' }}>
                    {u.email || '-'}
                  </td>
                  <td style={{
                    padding: '18px 20px',
                    maxWidth: 250,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: 14,
                    color: u.address ? '#374151' : '#9CA3AF'
                  }}>
                    {u.address || '-'}
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'white',
                      color: u.otp_verified ? '#059669' : '#D97706',
                      border: `1.5px solid ${u.otp_verified ? '#D1FAE5' : '#FED7AA'}`,
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      {u.otp_verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                      background: 'white',
                      color: u.portal_mail_sent ? '#059669' : '#D97706',
                      border: `1.5px solid ${u.portal_mail_sent ? '#D1FAE5' : '#FED7AA'}`,
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                      {u.portal_mail_sent ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: u.call_outcome ? '#374151' : '#9CA3AF' }}>
                    {u.call_outcome ? u.call_outcome.replace(/_/g, ' ') : '-'}
                  </td>
                  <td style={{ padding: '18px 20px' }}>
                    {u.fields_updated && u.fields_updated.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {u.fields_updated.map((field, idx) => (
                          <span key={idx} style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: 4,
                            fontSize: 11,
                            fontWeight: 600,
                            background: '#DBEAFE',
                            color: '#1E40AF',
                            border: '1px solid #BFDBFE'
                          }}>
                            {field.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: 13, color: '#9CA3AF' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '18px 20px', fontSize: 13, color: u.call_back_datetime ? '#374151' : '#9CA3AF' }}>
                    {u.call_back_datetime ? new Date(u.call_back_datetime).toLocaleString() : '-'}
                  </td>
                  <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteUser(u.phone_number)}
                      disabled={deleteLoading === u.phone_number}
                      className="delete-btn"
                      style={{
                        padding: '8px 12px',
                        border: '1.5px solid #FCA5A5',
                        borderRadius: 6,
                        background: 'white',
                        cursor: deleteLoading === u.phone_number ? 'not-allowed' : 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        transition: 'all 0.2s ease',
                        opacity: deleteLoading === u.phone_number ? 0.6 : 1
                      }}
                      title="Delete user"
                    >
                      <Trash2 size={16} color={deleteLoading === u.phone_number ? '#9CA3AF' : '#EF4444'} />
                      {deleteLoading === u.phone_number && (
                        <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} color="#9CA3AF" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ padding: '18px 20px', textAlign: 'center', color: '#6b7280' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '28px 32px', borderBottom: '2px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  background: '#FEF3C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Plus size={22} color="#F59E0B" />
                </div>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#111827' }}>Create New User</h2>
              </div>
              <button
                onClick={closeCreateModal}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  padding: 8,
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 8,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <X size={22} color="#6B7280" />
              </button>
            </div>

            <div className="modal-body-scroll">
              <form onSubmit={handleCreateUser}>
              {createError && (
                <div style={{
                  padding: '12px 16px',
                  marginBottom: 20,
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  borderRadius: 8,
                  color: '#DC2626',
                  fontSize: 14
                }}>
                  {createError}
                </div>
              )}

              <div style={{ display: 'grid', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
                    Name <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 14,
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
                    Phone Number <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={createFormData.phone_number}
                    onChange={(e) => setCreateFormData({ ...createFormData, phone_number: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 14,
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    placeholder="+1234567890"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
                    Secondary Phone Number
                  </label>
                  <input
                    type="tel"
                    value={createFormData.secondary_phone_number || ''}
                    onChange={(e) => setCreateFormData({ ...createFormData, secondary_phone_number: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 14,
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    placeholder="+1234567890 (optional)"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
                    Email <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={createFormData.email}
                    onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 14,
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
                    Date of Birth <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={createFormData.dob}
                    onChange={(e) => setCreateFormData({ ...createFormData, dob: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 14,
                      transition: 'border-color 0.2s',
                      outline: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 10 }}>
                    Address <span style={{ color: '#EF4444' }}>*</span>
                  </label>
                  <textarea
                    required
                    value={createFormData.address}
                    onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid #E5E7EB',
                      borderRadius: 8,
                      fontSize: 14,
                      transition: 'border-color 0.2s',
                      outline: 'none',
                      minHeight: 80,
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#F59E0B'}
                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '2px solid #F3F4F6', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={createLoading}
                  style={{
                    padding: '12px 24px',
                    border: '1.5px solid #E5E7EB',
                    borderRadius: 10,
                    background: 'white',
                    color: '#111827',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: createLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    opacity: createLoading ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => !createLoading && (e.currentTarget.style.background = '#F9FAFB')}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    borderRadius: 10,
                    background: createLoading ? '#6B7280' : '#111827',
                    color: 'white',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: createLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                  onMouseEnter={(e) => !createLoading && (e.currentTarget.style.background = '#000000')}
                  onMouseLeave={(e) => !createLoading && (e.currentTarget.style.background = '#111827')}
                >
                  {createLoading && <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />}
                  {createLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
