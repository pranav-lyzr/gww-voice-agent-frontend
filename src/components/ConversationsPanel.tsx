import { useEffect, useState, useRef } from 'react'
import { MessageSquare, RefreshCw, Eye, X } from 'lucide-react'
import { api } from '../api'
import type { ConversationItem, ConversationTurn } from '../types'

// Add keyframe animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = `
    @keyframes fadeIn {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.9);
      }
      50% {
        opacity: 0.8;
        transform: translateY(-5px) scale(1.02);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
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
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
      }
      to {
        transform: translateX(0);
      }
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes typing {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
    .typing-dot {
      animation: typing 1.4s infinite;
    }
    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    .conversation-row {
      animation: slideIn 0.3s ease-out forwards;
    }
    .conversation-row:hover {
      background-color: #F9FAFB;
    }
    .message-bubble {
      animation: fadeIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      animation: fadeIn 0.2s ease-out;
    }
    .sidebar {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      width: 500px;
      max-width: 90vw;
      background: white;
      box-shadow: -4px 0 12px rgba(0, 0, 0, 0.15);
      z-index: 1001;
      animation: slideInRight 0.3s ease-out;
      display: flex;
      flex-direction: column;
    }
  `
  if (!document.head.querySelector('style[data-conversation-animations]')) {
    style.setAttribute('data-conversation-animations', 'true')
    document.head.appendChild(style)
  }
}

// Skeleton loader component
function SkeletonRow() {
  return (
    <tr style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
      <td><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '85%' }} /></td>
      <td><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '85%' }} /></td>
      <td><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '80%' }} /></td>
      <td><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '60%' }} /></td>
      <td><div style={{ height: 16, background: '#E5E7EB', borderRadius: 4, width: '50%' }} /></td>
      <td><div style={{ height: 32, width: 80, background: '#E5E7EB', borderRadius: 6 }} /></td>
    </tr>
  )
}

export function ConversationsPanel() {
  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null)
  const [displayedMessages, setDisplayedMessages] = useState<ConversationTurn[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    // Auto-scroll to bottom when new messages are displayed
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [displayedMessages, isStreaming])

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const response = await api.getConversations(100, 0)
      // Sort by start_time descending (latest first)
      const sortedConversations = [...response.items].sort((a, b) => {
        return new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
      })
      setConversations(sortedConversations)
    } catch (e: any) {
      setError(e.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  async function handleViewTranscript(conv: ConversationItem) {
    setSelectedConversation(conv)
    setDisplayedMessages([])
    setIsStreaming(true)

    // Stream messages with animation delay
    const messages = conv.turns
    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 120)) // 120ms delay between messages
      setDisplayedMessages(prev => [...prev, messages[i]])
    }
    setIsStreaming(false)
  }

  function closeSidebar() {
    setSelectedConversation(null)
    setDisplayedMessages([])
    setIsStreaming(false)
  }

  function formatDuration(seconds?: number) {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div>
      {/* Header Card */}
      <div className="card" style={{ marginBottom: 16, padding: 24 }}>
        <div className="stack-between" style={{ alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <MessageSquare size={20} color="#374151" />
            <div>
              <div style={{ fontSize: 20, fontWeight: 600, color: '#111827' }}>Conversations</div>
              <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                {conversations.length} {conversations.length === 1 ? 'conversation' : 'conversations'} total
              </div>
            </div>
          </div>
          <button
            className="btn"
            onClick={refresh}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              minWidth: 100
            }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            <span>{loading ? 'Loading...' : 'Refresh'}</span>
          </button>
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

      {/* Conversations Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '2px solid #F3F4F6', background: '#FAFAFA' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Conversation History</div>
        </div>

        {loading ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: '#F9FAFB' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>From Number</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>To Number</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Start Time</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Duration</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Turns</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB', width: 120 }}>Actions</th>
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
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>From Number</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>To Number</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Start Time</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Duration</th>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB' }}>Turns</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: '#6B7280', borderBottom: '1px solid #E5E7EB', width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conversations.map((conv, index) => (
                  <tr key={conv.session_id} className="conversation-row" style={{
                    animationDelay: `${index * 0.05}s`,
                    transition: 'background-color 0.2s ease',
                    borderBottom: '1px solid #F3F4F6'
                  }}>
                    <td style={{ padding: '18px 20px', fontSize: 14, color: '#374151', fontWeight: 500 }}>
                      {conv.from_number}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: 14, color: '#374151' }}>
                      {conv.to_number}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: 13, color: '#374151' }}>
                      {new Date(conv.start_time).toLocaleString()}
                    </td>
                    <td style={{ padding: '18px 20px', fontSize: 13, color: '#374151' }}>
                      {formatDuration(conv.duration_seconds)}
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 12,
                        fontSize: 12,
                        fontWeight: 600,
                        background: '#EFF6FF',
                        color: '#3B82F6',
                        border: '1px solid #BFDBFE'
                      }}>
                        {conv.turns.length}
                      </span>
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                      <button
                        className="btn"
                        onClick={() => handleViewTranscript(conv)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '8px 14px',
                          fontSize: 13
                        }}
                      >
                        <Eye size={14} />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {conversations.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px 20px', textAlign: 'center', color: '#6b7280' }}>
                      No conversations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sidebar Transcript Viewer */}
      {selectedConversation && (
        <>
          <div className="sidebar-overlay" onClick={closeSidebar} />
          <div className="sidebar">
            {/* Sidebar Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '2px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#FAFAFA'
            }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
                  Conversation Transcript
                </div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>
                  {selectedConversation.from_number}
                </div>
              </div>
              <button
                onClick={closeSidebar}
                style={{
                  padding: 8,
                  border: '1.5px solid #E5E7EB',
                  borderRadius: 8,
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <X size={20} color="#6B7280" />
              </button>
            </div>

            {/* Conversation Details */}
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #F3F4F6',
              background: '#F9FAFB'
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 12 }}>
                <div>
                  <span style={{ color: '#6B7280' }}>Start: </span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>
                    {new Date(selectedConversation.start_time).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6B7280' }}>Duration: </span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>
                    {formatDuration(selectedConversation.duration_seconds)}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#6B7280' }}>Turns: </span>
                  <span style={{ fontWeight: 600, color: '#374151' }}>
                    {selectedConversation.turns.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}>
              {displayedMessages.map((turn, index) => (
                <div
                  key={index}
                  className="message-bubble"
                  style={{
                    display: 'flex',
                    justifyContent: turn.role === 'customer' ? 'flex-end' : 'flex-start',
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    background: turn.role === 'customer' ? '#111827' : 'white',
                    color: turn.role === 'customer' ? 'white' : '#111827',
                    boxShadow: turn.role === 'customer' 
                      ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' 
                      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    border: turn.role === 'customer' ? 'none' : '1px solid #E5E7EB'
                  }}>
                    <div style={{ 
                      fontSize: 11, 
                      fontWeight: 700, 
                      marginBottom: 8, 
                      opacity: turn.role === 'customer' ? 0.8 : 0.6,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {turn.role === 'customer' ? 'Customer' : 'Assistant'}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.6, fontWeight: turn.role === 'customer' ? 400 : 500 }}>
                      {turn.text}
                    </div>
                    <div style={{ fontSize: 10, marginTop: 8, opacity: turn.role === 'customer' ? 0.6 : 0.5 }}>
                      {new Date(turn.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {isStreaming && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', padding: 12 }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '14px 18px',
                    borderRadius: 12,
                    background: '#F3F4F6',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <div className="typing-dot" style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#9CA3AF'
                    }} />
                    <div className="typing-dot" style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#9CA3AF'
                    }} />
                    <div className="typing-dot" style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#9CA3AF'
                    }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
