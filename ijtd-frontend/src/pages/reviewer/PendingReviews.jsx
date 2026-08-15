// src/pages/reviewer/PendingReviews.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { authFetchJson, adminUrl } from '../../utils/auth'
import PageHero from '../../components/ui/PageHero'
import { FileText, Clock, CheckCircle, Send, Loader, AlertCircle, X } from 'lucide-react'

// ── Review Submission Modal ─────────────────────────────────────────────────
const ReviewModal = ({ manuscript, onClose, onDone }) => {
  const [decision, setDecision]   = useState('under_review')
  const [comments, setComments]   = useState('')
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!comments.trim()) { setError('Please provide reviewer comments'); return }
    setSaving(true)
    setError('')
    try {
      await authFetchJson(adminUrl(`/manuscripts/${manuscript.id}/status`), {
        method: 'PUT',
        body: JSON.stringify({
          status: decision,
          reviewer_comments: comments,
          send_email: true,
        }),
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Submit Review</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-5">
            <div>
              <p className="text-sm text-gray-500">Manuscript</p>
              <p className="font-bold text-gray-900 mt-1">{manuscript.title}</p>
              <p className="text-sm text-gray-500">{manuscript.authors} · {manuscript.manuscript_number}</p>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recommendation</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'accepted',          label: 'Accept',          color: 'border-green-300 text-green-700 bg-green-50' },
                  { value: 'revision_required', label: 'Minor Revision',  color: 'border-orange-300 text-orange-700 bg-orange-50' },
                  { value: 'rejected',          label: 'Reject',          color: 'border-red-300 text-red-700 bg-red-50' },
                ].map(opt => (
                  <label key={opt.value} className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-semibold ${decision === opt.value ? opt.color : 'border-gray-200 text-gray-500 bg-white'}`}>
                    <input
                      type="radio"
                      name="decision"
                      value={opt.value}
                      checked={decision === opt.value}
                      onChange={e => setDecision(e.target.value)}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Review Comments <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={8}
                placeholder="Provide detailed feedback to the authors. Include comments on methodology, results, discussion, and any required revisions…"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{comments.length} characters</p>
            </div>
          </div>
          <div className="flex gap-3 p-6 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 rounded-lg py-2.5 font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────────
const PendingReviews = () => {
  const { isReviewer } = useAuth()
  const [manuscripts, setManuscripts] = useState([])
  const [loading, setLoading]         = useState(true)
  const [selected, setSelected]       = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await authFetchJson(adminUrl('/manuscripts?status=under_review&per_page=50'))
      setManuscripts(data.manuscripts || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (!isReviewer) {
    return (
      <div>
        <PageHero title="Pending Reviews" subtitle="Manuscript review assignments" />
        <div className="py-16 text-center text-gray-500">
          You need reviewer access to view this page.
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHero
        title="Pending Reviews"
        subtitle="Manuscripts assigned to you for peer review"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Pending Reviews' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-3" />
              <p>Loading assigned manuscripts…</p>
            </div>
          ) : manuscripts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-500">No manuscripts are currently assigned for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 mb-2">{manuscripts.length} manuscript{manuscripts.length !== 1 ? 's' : ''} awaiting review</p>
              {manuscripts.map(ms => (
                <div key={ms.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">Under Review</span>
                        <span className="text-xs text-gray-400 font-mono">{ms.manuscript_number}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 leading-snug">{ms.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{ms.authors}</p>
                      <div className="flex gap-4 text-xs text-gray-400 mt-2">
                        <span>Type: {ms.manuscript_type}</span>
                        <span>Submitted: {ms.submitted_at}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelected(ms)}
                      className="flex-shrink-0 flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      Submit Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {selected && (
        <ReviewModal
          manuscript={selected}
          onClose={() => setSelected(null)}
          onDone={load}
        />
      )}
    </div>
  )
}

export default PendingReviews