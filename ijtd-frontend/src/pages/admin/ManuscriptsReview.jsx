// src/pages/admin/ManuscriptsReview.jsx
//
// Role-based manuscript management:
//
// REVIEWER: sees only their assigned manuscripts, can set:
//   revision_required | accepted_pending_payment | rejected
//
// EDITOR: sees all manuscripts, can set most statuses, and can upload
//   the formatted PDF for payment_received manuscripts (→ ready_to_publish)
//
// ADMIN: sees all manuscripts, full status control, plus can publish
//   from the Issues page once a formatted PDF is uploaded.
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { authFetchJson, authFetch, adminUrl } from '../../utils/auth'
import {
  FileText, Search, X, Send, AlertCircle,
  Loader, RefreshCw, Eye, Download, Upload,
  CheckCircle, DollarSign, Clock
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const STATUSES = [
  { value: '',                       label: 'All statuses' },
  { value: 'submitted',              label: 'Submitted' },
  { value: 'under_review',           label: 'Under Review' },
  { value: 'revision_required',      label: 'Revision Required' },
  { value: 'accepted_pending_payment', label: 'Accepted – Payment Due' },
  { value: 'payment_received',       label: 'Payment Received' },
  { value: 'ready_to_publish',       label: 'Ready to Publish' },
  { value: 'rejected',               label: 'Rejected' },
  { value: 'published',              label: 'Published' },
]

const STATUS_STYLE = {
  submitted:                 'bg-blue-50 text-blue-700 border-blue-200',
  under_review:              'bg-yellow-50 text-yellow-700 border-yellow-200',
  revision_required:         'bg-orange-50 text-orange-700 border-orange-200',
  accepted_pending_payment:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  payment_received:          'bg-teal-50 text-teal-700 border-teal-200',
  ready_to_publish:          'bg-purple-50 text-purple-700 border-purple-200',
  rejected:                  'bg-red-50 text-red-700 border-red-200',
  published:                 'bg-indigo-50 text-indigo-700 border-indigo-200',
}

// ── File Viewer Modal ──────────────────────────────────────────────────────────
const FileViewerModal = ({ manuscript, onClose }) => {
  const [blobUrl,     setBlobUrl]     = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [downloading, setDownloading] = useState(false)

  const ext = manuscript.file_path
    ? manuscript.file_path.split('.').pop().toLowerCase()
    : ''
  const isPdf = ext === 'pdf'

  useEffect(() => {
    if (!isPdf) { setLoading(false); return }
    const load = async () => {
      try {
        const res = await authFetch(`${API_BASE}/files/manuscript/${manuscript.id}`)
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || `HTTP ${res.status}`)
        }
        const blob = await res.blob()
        setBlobUrl(URL.createObjectURL(blob))
      } catch (e) { setError(e.message) }
      finally     { setLoading(false) }
    }
    load()
    return () => { if (blobUrl) URL.revokeObjectURL(blobUrl) }
  }, [])

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const res = await authFetch(`${API_BASE}/files/manuscript/${manuscript.id}`)
      if (!res.ok) throw new Error('Download failed')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = Object.assign(document.createElement('a'), {
        href: url, download: `${manuscript.manuscript_number}.${ext || 'docx'}`
      })
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); URL.revokeObjectURL(url)
    } catch (e) { alert(`Download failed: ${e.message}`) }
    finally     { setDownloading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/80">
      <div className="bg-gray-900 text-white px-4 py-3 flex items-center gap-4 flex-shrink-0">
        <button onClick={onClose} className="flex items-center gap-2 text-gray-300 hover:text-white text-sm">
          <X className="w-4 h-4" />Close
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{manuscript.title}</p>
          <p className="text-xs text-gray-400">{manuscript.manuscript_number} · {manuscript.authors}</p>
        </div>
        <button onClick={handleDownload} disabled={downloading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-4 py-2 rounded-lg">
          {downloading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Download {ext.toUpperCase()}
        </button>
      </div>
      <div className="flex-1 overflow-hidden bg-gray-100 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Loading document…</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-sm px-4">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-gray-700 font-semibold mb-2">Could not load file</p>
              <p className="text-gray-500 text-sm mb-4">{error}</p>
              <button onClick={handleDownload} className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700">
                Download instead
              </button>
            </div>
          </div>
        )}
        {!loading && !error && isPdf && blobUrl && (
          <iframe src={`${blobUrl}#toolbar=1&view=FitH`} className="w-full h-full border-0" title={manuscript.title} />
        )}
        {!loading && !error && !isPdf && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-6">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-700 mb-2">Word Document (.{ext})</h3>
              <p className="text-gray-500 text-sm mb-6">
                Word documents cannot render in the browser. Download to open in Microsoft Word or Google Docs,
                apply the IJTD editorial template, convert to PDF, then upload the formatted PDF.
              </p>
              <button onClick={handleDownload} disabled={downloading}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 disabled:opacity-60 mx-auto">
                {downloading ? <><Loader className="w-4 h-4 animate-spin" />Downloading…</> : <><Download className="w-4 h-4" />Download Word File</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Decision / Review Modal ────────────────────────────────────────────────────
const DecisionModal = ({ manuscript, reviewers, onClose, onSave }) => {
  const { isAdmin, isEditor, user } = useAuth()
  const isReviewer = user?.role === 'reviewer'

  const [status,       setStatus]       = useState(manuscript.status)
  const [comments,     setComments]     = useState(manuscript.reviewer_comments || '')
  const [reviewerId,   setReviewerId]   = useState('')
  const [sendEmail,    setSendEmail]    = useState(true)
  const [saving,       setSaving]       = useState(false)
  const [error,        setError]        = useState('')
  const [showViewer,   setShowViewer]   = useState(false)

  // Formatted PDF upload state (editor only, when status is payment_received)
  const [pdfFile,      setPdfFile]      = useState(null)
  const [uploading,    setUploading]    = useState(false)
  const [uploadMsg,    setUploadMsg]    = useState('')

  // Which statuses this role can set manually
  const allowedToSet = isAdmin
    ? ['submitted', 'under_review', 'revision_required', 'accepted_pending_payment', 'payment_received', 'rejected']
    : (isEditor || !isReviewer)
    ? ['submitted', 'under_review', 'revision_required', 'accepted_pending_payment', 'payment_received', 'rejected']
    : ['revision_required', 'accepted_pending_payment', 'rejected']  // reviewer

  const statusOptions = [
    { value: 'submitted',                label: 'Submitted',              cls: 'border-blue-300 text-blue-700 bg-blue-50' },
    { value: 'under_review',             label: 'Under Review',           cls: 'border-yellow-300 text-yellow-700 bg-yellow-50' },
    { value: 'revision_required',        label: 'Needs Revision',         cls: 'border-orange-300 text-orange-700 bg-orange-50' },
    { value: 'accepted_pending_payment', label: 'Accept — Request Payment', cls: 'border-emerald-400 text-emerald-700 bg-emerald-50' },
    { value: 'payment_received',         label: 'Mark Payment Received',  cls: 'border-teal-400 text-teal-700 bg-teal-50' },
    { value: 'rejected',                 label: 'Reject ✗',               cls: 'border-red-300 text-red-700 bg-red-50' },
  ].filter(o => allowedToSet.includes(o.value))

  const canUploadPDF = (isEditor || isAdmin) && manuscript.status === 'payment_received'

  const handleSave = async () => {
    setSaving(true); setError('')
    try {
      await authFetchJson(adminUrl(`/manuscripts/${manuscript.id}/status`), {
        method: 'PUT',
        body: JSON.stringify({ status, reviewer_comments: comments, send_email: sendEmail }),
      })
      if (reviewerId) {
        await authFetchJson(adminUrl(`/manuscripts/${manuscript.id}/assign-reviewer`), {
          method: 'PUT',
          body: JSON.stringify({ reviewer_id: parseInt(reviewerId) }),
        })
      }
      onSave(); onClose()
    } catch (e) { setError(e.message) }
    finally    { setSaving(false) }
  }

  const handleUploadPDF = async () => {
    if (!pdfFile) { setError('Please select a PDF file.'); return }
    setUploading(true); setError(''); setUploadMsg('')
    try {
      const fd = new FormData()
      fd.append('file', pdfFile)
      await authFetchJson(adminUrl(`/manuscripts/${manuscript.id}/upload-formatted`), {
        method: 'POST',
        body: fd,
      })
      setUploadMsg('Formatted PDF uploaded! Status changed to Ready to Publish.')
      onSave()
      setTimeout(() => { onClose() }, 1500)
    } catch (e) { setError(e.message) }
    finally    { setUploading(false) }
  }

  return (
    <>
      {showViewer && <FileViewerModal manuscript={manuscript} onClose={() => setShowViewer(false)} />}

      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                {isReviewer ? 'Submit Review' : 'Manage Manuscript'}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">
                Your role: <strong>{user?.role}</strong>
              </p>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Manuscript info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-mono text-gray-400">{manuscript.manuscript_number}</p>
              <p className="font-bold text-gray-900 leading-snug">{manuscript.title}</p>
              <p className="text-sm text-gray-500">{manuscript.authors}</p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                <span>Type: {manuscript.manuscript_type}</span>
                <span>Submitted: {manuscript.submitted_at}</span>
                <span>Email: {manuscript.corresponding_email}</span>
              </div>
              {manuscript.file_path && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-200">
                  <button onClick={() => setShowViewer(true)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                    View / Download Author's Word File
                  </button>
                  {manuscript.has_formatted_pdf && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-2 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Formatted PDF uploaded
                    </span>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
              </div>
            )}
            {uploadMsg && (
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />{uploadMsg}
              </div>
            )}

            {/* ── UPLOAD FORMATTED PDF SECTION ── */}
            {/* Shown to editor/admin when manuscript is payment_received */}
            {canUploadPDF && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-5">
                <h4 className="font-bold text-purple-900 mb-1 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Formatted PDF
                </h4>
                <p className="text-sm text-purple-700 mb-4">
                  Payment has been received. Download the author's Word file above, apply the IJTD
                  editorial template, convert to PDF, then upload it here. This will set the status
                  to <strong>Ready to Publish</strong> for the Admin to publish.
                </p>
                <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${pdfFile ? 'border-purple-400 bg-purple-100' : 'border-purple-300 hover:border-purple-500 cursor-pointer'}`}>
                  <input
                    type="file"
                    id="formatted-pdf-upload"
                    accept=".pdf"
                    className="hidden"
                    onChange={e => { setPdfFile(e.target.files[0] || null); setError('') }}
                  />
                  <label htmlFor="formatted-pdf-upload" className="cursor-pointer block">
                    {pdfFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-6 h-6 text-purple-600" />
                        <div className="text-left">
                          <p className="font-semibold text-purple-900 text-sm">{pdfFile.name}</p>
                          <p className="text-xs text-purple-600">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB — click to change</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-purple-700 font-medium">Click to select formatted PDF</p>
                        <p className="text-xs text-purple-500 mt-1">PDF only — this becomes the published article file</p>
                      </>
                    )}
                  </label>
                </div>
                {pdfFile && (
                  <button
                    onClick={handleUploadPDF}
                    disabled={uploading}
                    className="mt-3 w-full flex items-center justify-center gap-2 bg-purple-600 text-white rounded-lg py-2.5 font-semibold hover:bg-purple-700 disabled:opacity-60 transition-colors"
                  >
                    {uploading ? <><Loader className="w-4 h-4 animate-spin" />Uploading…</> : <><Upload className="w-4 h-4" />Upload Formatted PDF</>}
                  </button>
                )}
              </div>
            )}

            {/* ready_to_publish info for admin */}
            {manuscript.status === 'ready_to_publish' && isAdmin && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-purple-900 text-sm">Formatted PDF is ready</p>
                  <p className="text-xs text-purple-700 mt-0.5">
                    Go to <strong>Issues &amp; Publication</strong> to assign this article to an issue and publish it.
                  </p>
                </div>
              </div>
            )}

            {/* Payment pending info for editor/admin */}
            {manuscript.status === 'accepted_pending_payment' && !isReviewer && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900 text-sm">Awaiting payment from author</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    A payment request email has been sent to <strong>{manuscript.corresponding_email}</strong>.
                    Once you receive proof of payment, set the status to <em>Mark Payment Received</em>.
                  </p>
                </div>
              </div>
            )}

            {/* Status selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Update Status
                {isReviewer && <span className="text-gray-400 font-normal ml-2">(reviewer verdict)</span>}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statusOptions.map(opt => (
                  <label key={opt.value}
                    className={`flex items-center justify-center p-2.5 rounded-lg border-2 cursor-pointer text-xs font-semibold transition-all select-none
                      ${status === opt.value ? opt.cls : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}>
                    <input type="radio" name="status" value={opt.value} checked={status === opt.value}
                      onChange={e => setStatus(e.target.value)} className="sr-only" />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Assign reviewer (editor/admin only) */}
            {!isReviewer && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Assign Reviewer
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                </label>
                <select value={reviewerId} onChange={e => setReviewerId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Keep current assignment —</option>
                  {reviewers.map(r => (
                    <option key={r.id} value={r.id}>{r.full_name} ({r.role})</option>
                  ))}
                </select>
                {manuscript.assigned_reviewer && (
                  <p className="text-xs text-gray-400 mt-1">
                    Currently assigned: <strong>{manuscript.assigned_reviewer}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Comments */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                {isReviewer ? 'Review Comments' : 'Comments / Decision Notes'}
              </label>
              <textarea
                value={comments} onChange={e => setComments(e.target.value)} rows={5}
                placeholder={isReviewer
                  ? "Provide your detailed review recommendation, comments on methodology, results, and any required changes…"
                  : "Enter review feedback, revision requests, or decision rationale. These comments will be emailed to the author if 'Send email' is checked."
                }
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Send email toggle */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input type="checkbox" checked={sendEmail}
                onChange={e => setSendEmail(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300" />
              <span className="text-sm text-gray-700">
                Send decision email to author
                <span className="text-gray-400 ml-1">({manuscript.corresponding_email})</span>
              </span>
            </label>
          </div>

          <div className="flex gap-3 p-6 border-t border-gray-100">
            <button onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-2.5 font-semibold hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader className="w-4 h-4 animate-spin" />Saving…</> : <><Send className="w-4 h-4" />Save Decision</>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
const ManuscriptsReview = () => {
  const { user, isAdmin, isEditor } = useAuth()
  const isReviewer = user?.role === 'reviewer'

  const [searchParams, setSearchParams] = useSearchParams()
  const [manuscripts, setManuscripts]   = useState([])
  const [reviewers,   setReviewers]     = useState([])
  const [loading,     setLoading]       = useState(true)
  const [total,       setTotal]         = useState(0)
  const [page,        setPage]          = useState(1)
  const [search,      setSearch]        = useState('')
  const [selected,    setSelected]      = useState(null)
  const [quickViewer, setQuickViewer]   = useState(null)

  const statusFilter = searchParams.get('status') || ''

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page, per_page: 15 })
      if (statusFilter) params.append('status', statusFilter)
      const [data, revs] = await Promise.all([
        authFetchJson(adminUrl(`/manuscripts?${params}`)),
        // Reviewers don't need the reviewers list (they can't assign)
        isReviewer ? Promise.resolve([]) : authFetchJson(adminUrl('/reviewers')),
      ])
      setManuscripts(data.manuscripts || [])
      setTotal(data.total || 0)
      setReviewers(revs || [])
    } catch (e) { console.error(e) }
    finally     { setLoading(false) }
  }

  useEffect(() => { load() }, [statusFilter, page])

  const filtered = search
    ? manuscripts.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.authors.toLowerCase().includes(search.toLowerCase()) ||
        m.manuscript_number.toLowerCase().includes(search.toLowerCase())
      )
    : manuscripts

  const actionLabel = isReviewer ? 'Review' : 'Manage'

  return (
    <>
      {quickViewer && (
        <FileViewerModal manuscript={quickViewer} onClose={() => setQuickViewer(null)} />
      )}

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isReviewer ? 'My Assigned Manuscripts' : 'Manuscripts'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isReviewer
                ? 'Only manuscripts assigned to you are shown.'
                : `${total} total submissions`}
            </p>
          </div>
          <button onClick={load}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search title, author, or number…"
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          {/* Reviewers don't need the status filter since backend filters for them */}
          {!isReviewer && (
            <select value={statusFilter}
              onChange={e => { setSearchParams(e.target.value ? { status: e.target.value } : {}); setPage(1) }}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader className="w-6 h-6 animate-spin mx-auto mb-2" />Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              {isReviewer ? 'No manuscripts are assigned to you yet.' : 'No manuscripts found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">Manuscript</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Type</th>
                    <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Date</th>
                    {!isReviewer && <th className="px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Reviewer</th>}
                    <th className="px-4 py-3 font-semibold text-gray-600 text-center">File</th>
                    <th className="px-4 py-3 font-semibold text-gray-600 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(ms => (
                    <tr key={ms.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-900 line-clamp-1">{ms.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{ms.manuscript_number} · {ms.authors}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500 capitalize hidden md:table-cell">
                        {ms.manuscript_type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-semibold ${STATUS_STYLE[ms.status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {ms.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                        {ms.submitted_at}
                      </td>
                      {!isReviewer && (
                        <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                          {ms.assigned_reviewer || <span className="text-gray-300">Unassigned</span>}
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {ms.file_path && (
                            <button onClick={() => setQuickViewer(ms)} title="View author's Word file"
                              className="group flex flex-col items-center gap-0.5 mx-auto w-fit">
                              <Eye className="w-4 h-4 text-blue-500 group-hover:text-blue-700" />
                              <span className="text-xs text-gray-400 group-hover:text-blue-600">DOCX</span>
                            </button>
                          )}
                          {ms.has_formatted_pdf && (
                            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                              PDF✓
                            </span>
                          )}
                          {!ms.file_path && <span className="text-gray-300 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setSelected(ms)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition-colors">
                          <Send className="w-3 h-3" />{actionLabel}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {total > 15 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Page {page} of {Math.ceil(total / 15)}</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
                <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>

        {selected && (
          <DecisionModal
            manuscript={selected}
            reviewers={reviewers}
            onClose={() => setSelected(null)}
            onSave={load}
          />
        )}
      </div>
    </>
  )
}

export default ManuscriptsReview