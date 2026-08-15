// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authFetchJson, adminUrl } from '../../utils/auth'
import {
  FileText, Users, Clock, CheckCircle, XCircle, Mail,
  TrendingUp, BookOpen, AlertCircle, RefreshCw
} from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, color, to }) => {
  const card = (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all group`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value ?? '—'}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  )
  return to ? <Link to={to}>{card}</Link> : card
}

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats]           = useState(null)
  const [recentMs, setRecentMs]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [s, ms] = await Promise.all([
        authFetchJson(adminUrl('/stats')),
        authFetchJson(adminUrl('/manuscripts?per_page=5')),
      ])
      setStats(s)
      setRecentMs(ms.manuscripts || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const STATUS_COLOR = {
    submitted:          'bg-blue-100 text-blue-700',
    under_review:       'bg-yellow-100 text-yellow-700',
    revision_required:  'bg-orange-100 text-orange-700',
    accepted:           'bg-green-100 text-green-700',
    rejected:           'bg-red-100 text-red-700',
    published:          'bg-purple-100 text-purple-700',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.full_name}</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FileText}    label="Total Submissions"   value={stats?.manuscripts.total}       color="bg-blue-600"   to="/admin/manuscripts" />
        <StatCard icon={Clock}       label="Under Review"        value={stats?.manuscripts.under_review} color="bg-yellow-500" to="/admin/manuscripts?status=under_review" />
        <StatCard icon={CheckCircle} label="Accepted"            value={stats?.manuscripts.accepted}    color="bg-green-600"  to="/admin/manuscripts?status=accepted" />
        <StatCard icon={BookOpen}    label="Published Articles"  value={stats?.articles.published}      color="bg-purple-600" to="/admin/manuscripts?status=published" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={AlertCircle} label="Pending (New)"    value={stats?.manuscripts.submitted}     color="bg-orange-500" to="/admin/manuscripts?status=submitted" />
        <StatCard icon={XCircle}     label="Rejected"         value={stats?.manuscripts.rejected}      color="bg-red-500"    to="/admin/manuscripts?status=rejected" />
        <StatCard icon={Users}       label="Pending Applic."  value={stats?.applications.pending}      color="bg-teal-600"   to="/admin/applications" />
        <StatCard icon={Mail}        label="Unread Messages"  value={stats?.messages.unread}           color="bg-indigo-600" to="/admin/messages" />
      </div>

      {/* Recent submissions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Submissions</h2>
          <Link to="/admin/manuscripts" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : recentMs.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No manuscripts yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentMs.map(ms => (
              <div key={ms.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <FileText className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{ms.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{ms.authors} · {ms.submitted_at}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_COLOR[ms.status] || 'bg-gray-100 text-gray-600'}`}>
                    {ms.status.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/admin/manuscripts/${ms.id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard