// src/pages/admin/IssuesManagement.jsx
// Admin publishes articles from here.
// Editor can view issues and see formatted PDF status.
// The "Publish" action is ADMIN ONLY.
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authFetchJson, adminUrl } from '../../utils/auth'
import {
  BookOpen, ChevronDown, ChevronRight, FileText, Loader,
  RefreshCw, Send, CheckCircle, Lock, AlertCircle
} from 'lucide-react'

const PublishModal = ({ manuscript, issues, onClose, onDone }) => {
  const [issueId, setIssueId] = useState('')
  const [doi, setDoi] = useState(manuscript.manuscript_number)
  const [category, setCategory] = useState(manuscript.manuscript_type || 'Research Article')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePublish = async () => {
    if (!issueId) { setError('Please select an issue'); return }
    setSaving(true)
    setError('')
    try {
      await authFetchJson(adminUrl(`/manuscripts/${manuscript.id}/publish`), {
        method: 'POST',
        body: JSON.stringify({ issue_id: parseInt(issueId), doi, category }),
      })
      onDone()
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      {/* Modal container - max height 95vh, flex column layout */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
        
        {/* HEADER - Fixed at top (flex-shrink-0 prevents shrinking) */}
        <div className="flex-shrink-0 flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-bold text-gray-900">Publish Article</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* BODY - Scrollable (flex-1 takes remaining space, overflow-y-auto enables scrolling) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <p className="text-sm font-semibold text-purple-900 mb-1 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Formatted PDF Ready
            </p>
            <p className="text-xs text-purple-700">
              The editor has uploaded the formatted PDF. This will be the published article file.
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Manuscript</p>
            <p className="font-semibold text-gray-900 text-sm mt-1 line-clamp-2">{manuscript.title}</p>
            <p className="text-xs text-gray-400 mt-1">{manuscript.authors} · {manuscript.manuscript_number}</p>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Issue</label>
            <select
              value={issueId}
              onChange={e => setIssueId(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">— Select issue —</option>
              {issues.map(i => (
                <option key={i.id} value={i.id}>
                  Vol. {i.volume_number} ({i.volume_year}), Issue {i.number}: {i.month}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">DOI</label>
            <input
              value={doi}
              onChange={e => setDoi(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Article Category</label>
            <input
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Publishing will create a live article, send a publication notification email to the author,
              and make the formatted PDF publicly downloadable.
            </p>
          </div>
        </div>

        {/* FOOTER - Fixed at bottom (flex-shrink-0 prevents shrinking) */}
        <div className="flex-shrink-0 flex gap-3 p-6 border-t bg-white rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2 font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="flex-1 bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Publish
          </button>
        </div>
      </div>
    </div>
  )
}

const IssuesManagement = () => {
  const { isAdmin } = useAuth()

  const [issues, setIssues] = useState([])
  const [ready, setReady] = useState([]) // ready_to_publish manuscripts
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [articles, setArticles] = useState({})
  const [publishing, setPublishing] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [iss, rdy] = await Promise.all([
        authFetchJson(adminUrl('/issues')),
        authFetchJson(adminUrl('/manuscripts?status=ready_to_publish&per_page=50')),
      ])
      setIssues(iss)
      setReady(rdy.manuscripts || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const loadArticles = async (issueId) => {
    if (articles[issueId]) return
    try {
      const data = await authFetchJson(adminUrl(`/issues/${issueId}/articles`))
      setArticles(prev => ({ ...prev, [issueId]: data }))
    } catch {
      setArticles(prev => ({ ...prev, [issueId]: [] }))
    }
  }

  const toggle = (issueId) => {
    if (expanded === issueId) {
      setExpanded(null)
    } else {
      setExpanded(issueId)
      loadArticles(issueId)
    }
  }

  const byVolume = issues.reduce((acc, issue) => {
    const key = `${issue.volume_number} (${issue.volume_year})`
    if (!acc[key]) acc[key] = []
    acc[key].push(issue)
    return acc
  }, {})

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues &amp; Publication</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin
              ? `${ready.length} manuscript(s) ready to publish`
              : 'View issues and publication status'}
          </p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Ready to Publish panel */}
      {isAdmin ? (
        <div className={`border-2 rounded-xl p-5 mb-6 ${ready.length > 0 ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
          <h2 className={`font-bold mb-3 flex items-center gap-2 ${ready.length > 0 ? 'text-green-800' : 'text-gray-500'}`}>
            <Send className="w-4 h-4" />
            Ready to Publish — Formatted PDFs Uploaded ({ready.length})
          </h2>
          {ready.length === 0 ? (
            <p className="text-sm text-gray-400">
              No manuscripts ready yet. The editor uploads the formatted PDF from the Manuscripts page,
              which changes the status to "ready_to_publish".
            </p>
          ) : (
            <div className="space-y-2">
              {ready.map(ms => (
                <div key={ms.id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{ms.title}</p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <p className="text-xs text-gray-500">{ms.manuscript_number} · {ms.authors}</p>
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                        ✓ Formatted PDF
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setPublishing(ms)}
                    className="flex-shrink-0 text-sm bg-green-600 text-white rounded-lg px-6 py-2.5 font-semibold hover:bg-green-700 transition-colors ml-4"
                  >
                    Publish
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Editor sees a read-only info box
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900 text-sm">Publishing is Admin-only</p>
            <p className="text-xs text-blue-700 mt-0.5">
              Once you upload a formatted PDF for a payment-received manuscript, the status changes
              to <strong>Ready to Publish</strong> and the Admin can publish it here.
              {ready.length > 0 && <span className="font-semibold"> {ready.length} manuscript(s) are currently awaiting Admin publication.</span>}
            </p>
          </div>
        </div>
      )}

      {/* Issues by volume */}
      {loading ? (
        <div className="p-12 text-center text-gray-400">
          <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading…
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(byVolume).map(([volLabel, volIssues]) => (
            <div key={volLabel} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h2 className="font-bold text-gray-800">Volume {volLabel}</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {volIssues.map(issue => (
                  <div key={issue.id}>
                    <button
                      onClick={() => toggle(issue.id)}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        {expanded === issue.id
                          ? <ChevronDown className="w-4 h-4 text-gray-400" />
                          : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <span className="text-sm font-medium text-gray-700">
                          Issue {issue.number}: {issue.month}
                        </span>
                        <span className="text-xs text-gray-400">({issue.article_count} articles)</span>
                      </div>
                    </button>
                    {expanded === issue.id && (
                      <div className="px-5 pb-4 bg-gray-50 border-t border-gray-100">
                        {!articles[issue.id] ? (
                          <p className="text-sm text-gray-400 py-3">Loading…</p>
                        ) : articles[issue.id].length === 0 ? (
                          <p className="text-sm text-gray-400 py-3">No articles in this issue yet.</p>
                        ) : (
                          <div className="space-y-2 pt-3">
                            {articles[issue.id].map(a => (
                              <div key={a.id} className="flex items-start gap-3 bg-white rounded-lg p-3 shadow-sm">
                                <FileText className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{a.title}</p>
                                  <p className="text-xs text-gray-400">{a.authors} · DOI: {a.doi}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {publishing && (
        <PublishModal
          manuscript={publishing}
          issues={issues}
          onClose={() => setPublishing(null)}
          onDone={load}
        />
      )}
    </div>
  )
}

export default IssuesManagement