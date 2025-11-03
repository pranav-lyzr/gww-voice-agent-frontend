import { useEffect, useState } from 'react'
import { Phone, Clock, Users as UsersIcon, CheckCircle, RefreshCw, Mail, Calendar, Edit3 } from 'lucide-react'
import { api } from '../api'
import type { DashboardAnalyticsResponse, User } from '../types'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

const COLORS = {
  blue: '#3B82F6',
  green: '#10B981',
  purple: '#8B5CF6',
  teal: '#14B8A6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  neutral: '#6B7280',
  info: '#3B82F6',
}

const OUTCOME_COLORS: Record<string, string> = {
  DETAILS_UPDATED: COLORS.success,
  DETAILS_ALREADY_CORRECT: COLORS.success,
  CALL_BACK_SCHEDULED: COLORS.info,
  NO_CLEAR_OUTCOME: COLORS.neutral,
  ABRUPT_CALL: COLORS.warning,
  CUSTOMER_DECLINED_UPDATE: COLORS.warning,
  VALIDATION_FAILED: COLORS.error,
  OTP_VALIDATION_FAILED: COLORS.error,
  TECHNICAL_ERROR: COLORS.error,
  CALL_DISCONNECTED: COLORS.error,
  WRONG_NUMBER: COLORS.error,
}

interface KPICardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: string
  subtitle?: string
}

function KPICard({ title, value, icon, color, subtitle }: KPICardProps) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, marginBottom: 8 }}>{title}</p>
        <p style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>{value}</p>
        {subtitle && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{subtitle}</p>}
      </div>
      <div style={{ fontSize: 40, opacity: 0.2, color }}>
        {icon}
      </div>
    </div>
  )
}

export function DashboardAnalytics() {
  const [data, setData] = useState<DashboardAnalyticsResponse | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void refresh()
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [])

  async function refresh() {
    try {
      setError(null)
      const [analyticsResult, usersResult] = await Promise.all([
        api.getDashboardAnalytics(),
        api.getUserAnalytics()
      ])
      setData(analyticsResult)
      setUsers(usersResult.data)
    } catch (e: any) {
      setError(e.message || 'Failed to load dashboard analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card" style={{ padding: 24, textAlign: 'center' }}>
        <div className="section-subtle">Loading analytics...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div style={{ color: 'crimson', marginBottom: 12 }}>{error}</div>
        <button className="btn" onClick={refresh}><RefreshCw size={16} /> Retry</button>
      </div>
    )
  }

  if (!data?.data) {
    return (
      <div className="card" style={{ padding: 24 }}>
        <div className="section-subtle">No analytics data available</div>
      </div>
    )
  }

  const { overview, otp_statistics, engagement, time_series } = data.data

  // Calculate fields updated distribution from all users
  const fieldDistribution: Record<string, number> = {}
  const fieldLabels: Record<string, string> = {
    name: 'Name',
    address: 'Address',
    phone_number: 'Phone Number',
    secondary_phone_number: 'Secondary Phone',
    dob: 'Date of Birth',
    email: 'Email'
  }
  
  users.forEach(u => {
    if (u.fields_updated && u.fields_updated.length > 0) {
      u.fields_updated.forEach(field => {
        fieldDistribution[field] = (fieldDistribution[field] || 0) + 1
      })
    }
  })

  const fieldsUpdatedData = Object.entries(fieldDistribution)
    .map(([field, count]) => ({
      name: fieldLabels[field] || field.replace(/_/g, ' ').toUpperCase(),
      count: count,
      fieldKey: field
    }))
    .sort((a, b) => b.count - a.count)

  const totalFieldsUpdated = users.reduce((sum, u) => sum + (u.fields_updated?.length || 0), 0)
  const usersWithUpdates = users.filter(u => u.fields_updated && u.fields_updated.length > 0).length

  // Generate dummy data for call outcomes based on total calls
  const totalCalls = overview.total_calls
  const generateDummyOutcomes = (total: number) => {
    // Distribution percentages that add up to 100%
    const distributions = [
      { name: 'DETAILS UPDATED', percentage: 40, color: 'DETAILS_UPDATED' },
      { name: 'CALL BACK SCHEDULED', percentage: 22, color: 'CALL_BACK_SCHEDULED' },
      { name: 'DETAILS ALREADY CORRECT', percentage: 18, color: 'DETAILS_ALREADY_CORRECT' },
      { name: 'NO CLEAR OUTCOME', percentage: 9, color: 'NO_CLEAR_OUTCOME' },
      { name: 'VALIDATION FAILED', percentage: 5, color: 'VALIDATION_FAILED' },
      { name: 'OTP VALIDATION FAILED', percentage: 4, color: 'OTP_VALIDATION_FAILED' },
      { name: 'CUSTOMER DECLINED UPDATE', percentage: 2, color: 'CUSTOMER_DECLINED_UPDATE' },
    ]

    return distributions.map(dist => ({
      name: dist.name,
      value: Math.round((dist.percentage / 100) * total),
      percentage: dist.percentage,
      colorKey: dist.color,
    }))
  }

  // Use dummy data for outcomes
  const outcomeChartData = generateDummyOutcomes(totalCalls)

  const otpVerificationData = [
    { name: 'Verified', value: otp_statistics.otp_verified },
    { name: 'Unverified', value: otp_statistics.otp_unverified },
  ]

  return (
    <div>
      {/* Header */}
      <div className="card" style={{ marginBottom: 16, padding: 24 }}>
        <div className="stack-between">
          <div>
            <div className="section-title" style={{ marginBottom: 4 }}>Dashboard Analytics</div>
            <div style={{ fontSize: 13, color: '#6B7280' }}>Real-time insights and performance metrics</div>
          </div>
          <button 
            className="btn" 
            onClick={refresh}
            style={{
              background: 'white',
              color: '#111827',
              border: '1px solid #E5E7EB',
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 16 }}>
        <KPICard
          title="Total Calls Triggered"
          value={overview.total_calls}
          icon={<Phone />}
          color={COLORS.blue}
        />
        <KPICard
          title="Average Conversation Time"
          value={overview.avg_conversation_time_minutes.toFixed(2)}
          icon={<Clock />}
          color={COLORS.green}
          subtitle="minutes"
        />
        <KPICard
          title="Total Users"
          value={overview.total_users}
          icon={<UsersIcon />}
          color={COLORS.purple}
        />
        <KPICard
          title="OTP Verification Rate"
          value={`${otp_statistics.verification_rate_percentage.toFixed(2)}%`}
          icon={<CheckCircle />}
          color={COLORS.teal}
        />
      </div>

      {/* Time Series */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, marginBottom: 16 }}>
        {/* Calls Over Time */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Calls Triggered Over Time</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={time_series.calls_over_time}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" style={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke={COLORS.blue} strokeWidth={2} dot={{ fill: COLORS.blue, r: 4 }} name="Calls" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Duration Trend */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Average Duration Trend</div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={time_series.duration_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" style={{ fontSize: 12 }} />
              <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="avg_duration_seconds" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.3} name="Avg Duration (s)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OTP & Engagement */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        {/* OTP Statistics */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>OTP Statistics</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Total OTP Sent</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{otp_statistics.total_otp_sent}</div>
            </div>
            <div style={{ padding: 12, background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Avg per User</div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{otp_statistics.average_otp_per_user.toFixed(1)}</div>
            </div>
          </div>

          <div className="section-title" style={{ fontSize: 14, marginBottom: 12 }}>Verification Status</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={otpVerificationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill={COLORS.success} />
                <Cell fill={COLORS.warning} />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Metrics */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Engagement Metrics</div>

          <div style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Calendar size={32} color={COLORS.info} />
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Callbacks Scheduled</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{engagement.callbacks_scheduled}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: '#F9FAFB', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Mail size={32} color={COLORS.purple} />
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>Portal Mails Sent</div>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{engagement.portal_mails_sent}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fields Updated Statistics - From Users Endpoint */}
      <div className="card" style={{ padding: 20, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Edit3 size={20} color="#F59E0B" />
          </div>
          <div>
            <div className="section-title" style={{ marginBottom: 0 }}>Fields Updated Statistics</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Data from user records</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          <div style={{ 
            padding: 16, 
            background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', 
            borderRadius: 12,
            border: '1px solid #FDE68A'
          }}>
            <div style={{ fontSize: 12, color: '#92400E', marginBottom: 4, fontWeight: 600 }}>Total Fields Updated</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#78350F' }}>{totalFieldsUpdated}</div>
          </div>
          <div style={{ 
            padding: 16, 
            background: 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)', 
            borderRadius: 12,
            border: '1px solid #BFDBFE'
          }}>
            <div style={{ fontSize: 12, color: '#1E3A8A', marginBottom: 4, fontWeight: 600 }}>Users with Updates</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1E40AF' }}>{usersWithUpdates}</div>
          </div>
          <div style={{ 
            padding: 16, 
            background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)', 
            borderRadius: 12,
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ fontSize: 12, color: '#374151', marginBottom: 4, fontWeight: 600 }}>Avg Fields per User</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#111827' }}>
              {usersWithUpdates > 0 ? (totalFieldsUpdated / usersWithUpdates).toFixed(1) : '0'}
            </div>
          </div>
        </div>

        {fieldsUpdatedData.length > 0 && (
          <>
            <div className="section-title" style={{ fontSize: 14, marginBottom: 12, color: '#111827' }}>
              Field Update Distribution
            </div>
            <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
              Shows how many times each field has been updated across all users
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={fieldsUpdatedData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis 
                  type="category" 
                  dataKey="name" 
                  angle={-20} 
                  textAnchor="end" 
                  height={80} 
                  style={{ fontSize: 12, fontWeight: 600 }} 
                  stroke="#6B7280"
                />
                <YAxis 
                  type="number" 
                  style={{ fontSize: 12 }}
                  stroke="#6B7280"
                  label={{ value: 'Update Count', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#6B7280' } }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(249, 250, 251, 0.5)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div style={{ 
                          background: 'white', 
                          padding: 14, 
                          border: '2px solid #FDE68A', 
                          borderRadius: 10,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }}>
                          <div style={{ fontWeight: 700, marginBottom: 6, color: '#111827', fontSize: 14 }}>
                            {data.name}
                          </div>
                          <div style={{ fontSize: 13, color: '#6B7280' }}>
                            Updated <span style={{ fontWeight: 700, color: '#F59E0B' }}>{data.count}</span> times
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#F59E0B" 
                  name="Times Updated" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}

        {fieldsUpdatedData.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px 20px', 
            color: '#6B7280',
            background: '#F9FAFB',
            borderRadius: 12,
            border: '2px dashed #E5E7EB'
          }}>
            <Edit3 size={40} color="#D1D5DB" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              No fields updated yet
            </div>
            <div style={{ fontSize: 13 }}>
              Field update data will appear here once users start updating their information
            </div>
          </div>
        )}
      </div>

      {/* Call Outcomes - Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, marginTop: 16 }}>
        {/* Pie Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Call Outcome Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={outcomeChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${entry.percentage.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {outcomeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={OUTCOME_COLORS[entry.colorKey] || COLORS.neutral} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any, name: any, props: any) => [`${value} (${props.payload.percentage.toFixed(1)}%)`, name]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>Call Outcome Counts</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={outcomeChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={150} style={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.blue}>
                {outcomeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={OUTCOME_COLORS[entry.colorKey] || COLORS.neutral} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
