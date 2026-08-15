// src/pages/admin/ApplicationsPage.jsx
import { useState, useEffect } from 'react'
import { authFetchJson, adminUrl } from '../../utils/auth'
import { CheckCircle, XCircle, Clock, Loader, RefreshCw, User, Building, Globe } from 'lucide-react'

const STATUS_STYLE = {
  pending:  'bg-yellow-50 text-yellow-700 border-yellow-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

export const ApplicationsPage = () => {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('pending')
  const [saving, setSaving]   = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await authFetchJson(adminUrl(`/applications?status=${filter}`))
      setApps(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id, status) => {
    setSaving(id)
    try {
      await authFetchJson(adminUrl(`/applications/${id}/status`), {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      load()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Join Applications</h1>
        <button onClick={load} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        {['pending', 'approved', 'rejected', 'all'].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${filter === s ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400"><Loader className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…</div>
      ) : apps.length === 0 ? (
        <div className="p-12 text-center text-gray-400">No applications found</div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => (
            <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLE[app.status] || ''}`}>
                      {app.status}
                    </span>
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full capitalize">
                      {app.application_type}
                    </span>
                    <span className="text-xs text-gray-400">{app.submitted_at}</span>
                  </div>
                  <h3 className="font-bold text-gray-900">{app.full_name}</h3>
                  <p className="text-sm text-gray-500">{app.email}</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                    {app.institution && (
                      <span className="flex items-center gap-1"><Building className="w-3 h-3" />{app.institution}</span>
                    )}
                    {app.country && (
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{app.country}</span>
                    )}
                    {app.research_field && (
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{app.research_field}</span>
                    )}
                  </div>
                  {app.motivation && (
                    <p className="text-sm text-gray-600 mt-2 italic border-l-2 border-gray-200 pl-3">
                      "{app.motivation}"
                    </p>
                  )}
                </div>

                {app.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      disabled={saving === app.id}
                      onClick={() => updateStatus(app.id, 'approved')}
                      className="flex items-center gap-1 text-xs bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-700 disabled:opacity-60"
                    >
                      {saving === app.id ? <Loader className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                      Approve
                    </button>
                    <button
                      disabled={saving === app.id}
                      onClick={() => updateStatus(app.id, 'rejected')}
                      className="flex items-center gap-1 text-xs bg-red-600 text-white rounded-lg px-3 py-1.5 hover:bg-red-700 disabled:opacity-60"
                    >
                      <XCircle className="w-3 h-3" />Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicationsPage