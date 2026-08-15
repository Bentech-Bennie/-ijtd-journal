// src/pages/author/MySubmissions.jsx
// Full submission tracker with payment flow.
// NEW statuses: accepted_pending_payment, payment_received, ready_to_publish
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { manuscriptsApi } from '../../services/api'
import PageHero from '../../components/ui/PageHero'
import {
  FileText, Search, CheckCircle, Clock, AlertCircle,
  XCircle, Loader, Award, ChevronDown, ChevronUp,
  BookOpen, Send, DollarSign, CreditCard
} from 'lucide-react'

// ── Status config (all possible values) ────────────────────────────────────
const STATUS = {
  submitted: {
    label: 'Submitted',
    icon: FileText,
    cls: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  under_review: {
    label: 'Under Peer Review',
    icon: Clock,
    cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  },
  revision_required: {
    label: 'Revision Required',
    icon: AlertCircle,
    cls: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  accepted_pending_payment: {
    label: 'Accepted — Payment Required',
    icon: DollarSign,
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  payment_received: {
    label: 'Payment Received',
    icon: CheckCircle,
    cls: 'bg-teal-50 text-teal-700 border-teal-200',
  },
  ready_to_publish: {
    label: 'In Final Formatting',
    icon: Clock,
    cls: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  published: {
    label: 'Published',
    icon: CheckCircle,
    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    cls: 'bg-red-50 text-red-700 border-red-200',
  },
}

const StatusBadge = ({ status }) => {
  const cfg  = STATUS[status] || { label: status, icon: FileText, cls: 'bg-gray-50 text-gray-600 border-gray-200' }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

// ── Progress Timeline ───────────────────────────────────────────────────────
const STEPS = [
  { key: 'submitted',                label: 'Submitted' },
  { key: 'under_review',             label: 'Peer Review' },
  { key: 'accepted_pending_payment', label: 'Accepted' },
  { key: 'payment_received',         label: 'Payment OK' },
  { key: 'ready_to_publish',         label: 'Formatting' },
  { key: 'published',                label: 'Published' },
]

const Timeline = ({ status }) => {
  if (status === 'rejected') return (
    <div className="flex items-center gap-2 text-sm text-red-600 mt-3">
      <XCircle className="w-4 h-4" />
      Manuscript was not accepted for publication.
    </div>
  )
  if (status === 'revision_required') return (
    <div className="flex items-center gap-2 text-sm text-orange-600 mt-3">
      <AlertCircle className="w-4 h-4" />
      Revision requested — please revise and resubmit as directed.
    </div>
  )

  const currentIdx = STEPS.findIndex(s => s.key === status)

  return (
    <div className="overflow-x-auto mt-4">
      <div className="flex items-center min-w-max gap-0">
        {STEPS.map((step, idx) => {
          const done    = idx <= currentIdx
          const current = idx === currentIdx
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all
                  ${done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-300'}
                  ${current ? 'ring-4 ring-blue-100' : ''}`}>
                  {done ? '✓' : idx + 1}
                </div>
                <span className={`text-xs mt-1 whitespace-nowrap ${done ? 'text-blue-700 font-semibold' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`w-10 h-0.5 mx-1 mb-4 ${idx < currentIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Payment Instructions Card ───────────────────────────────────────────────
const PaymentInstructions = ({ ms }) => (
  <div className="mt-4 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-4">
    <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
      <DollarSign className="w-4 h-4" />
      Action Required: Pay Article Processing Charge (APC)
    </h4>
    <p className="text-sm text-emerald-800 mb-3">
      Your manuscript has been accepted! To proceed with publication, please remit the APC
      and send proof of payment to <a href="mailto:contact@ijtd.com" className="underline font-semibold">contact@ijtd.com</a>{' '}
      quoting <strong>{ms.manuscript_number}</strong>.
    </p>

    <div className="grid sm:grid-cols-2 gap-3 mb-3">
      <div className="bg-white rounded-lg p-3 border border-emerald-200">
        <p className="text-xs font-semibold text-gray-500 mb-1">Foreign Authors (outside Cameroon)</p>
        <p className="text-lg font-bold text-emerald-700">120 USD</p>
        <p className="text-xs text-gray-600 mt-1">
          <strong>PayPal:</strong> contact@ijtd.com
        </p>
      </div>
      <div className="bg-white rounded-lg p-3 border border-emerald-200">
        <p className="text-xs font-semibold text-gray-500 mb-1">Authors in Cameroon</p>
        <p className="text-lg font-bold text-emerald-700">60,000 FCFA</p>
        <p className="text-xs text-gray-600 mt-1">
          <strong>MTN MoMo / Orange Money / Bank Transfer</strong>
        </p>
      </div>
    </div>

    <div className="bg-white border border-emerald-200 rounded-lg p-3">
      <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />Payment Methods:
      </p>
      <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
        <li><strong>PayPal:</strong> contact@ijtd.com (for USD payments)</li>
        <li><strong>MTN Mobile Money:</strong> +237 6XX XXX XXX — ASAIE Publishing</li>
        <li><strong>Orange Money:</strong> +237 6XX XXX XXX — ASAIE Publishing</li>
        <li><strong>Bank Transfer:</strong> Email contact@ijtd.com for account details</li>
      </ul>
    </div>
    <p className="text-xs text-emerald-700 mt-3 font-medium">
      ✓ No charges for rejected manuscripts.
      ✓ Corrections are free within 3 days of publication.
    </p>
  </div>
)

// ── Single Submission Card ──────────────────────────────────────────────────
const SubmissionCard = ({ ms }) => {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-gray-400 mb-1">{ms.manuscript_number}</p>
          <p className="font-semibold text-gray-900 leading-snug">{ms.title}</p>
          <p className="text-sm text-gray-500 mt-1">{ms.authors}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <StatusBadge status={ms.status} />
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {open && (
        <div className="border-t border-gray-100 px-5 pb-5 pt-4 bg-gray-50">
          <Timeline status={ms.status} />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600 mt-5">
            <div><span className="font-medium text-gray-700">Type:</span> <span className="capitalize">{ms.manuscript_type?.replace(/_/g, ' ')}</span></div>
            <div><span className="font-medium text-gray-700">Submitted:</span> {ms.submitted_at}</div>
            <div><span className="font-medium text-gray-700">Last update:</span> {ms.updated_at}</div>
          </div>

          {/* PAYMENT REQUIRED */}
          {ms.status === 'accepted_pending_payment' && <PaymentInstructions ms={ms} />}

          {/* PAYMENT RECEIVED */}
          {ms.status === 'payment_received' && (
            <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-teal-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />Payment Received — Editorial Formatting in Progress
              </p>
              <p className="text-xs text-teal-700 mt-1">
                The editorial team is formatting your manuscript using the IJTD template
                and will publish it shortly.
              </p>
            </div>
          )}

          {/* FORMATTING */}
          {ms.status === 'ready_to_publish' && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-purple-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />Final Formatted PDF Ready — Awaiting Publication
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Your article has been formatted and is scheduled for publication. You will
                receive a notification email with your article link once it is live.
              </p>
            </div>
          )}

          {/* REVISION REQUIRED */}
          {ms.status === 'revision_required' && ms.reviewer_comments && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-orange-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />Reviewer Comments
              </p>
              <p className="text-sm text-orange-700 whitespace-pre-wrap leading-relaxed">{ms.reviewer_comments}</p>
              <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-xs text-orange-600">
                  Please revise your manuscript based on the comments above and resubmit within
                  3 weeks by sending your revised Word document to{' '}
                  <a href="mailto:contact@ijtd.com" className="underline">contact@ijtd.com</a>
                  {' '}quoting your manuscript number.
                </p>
              </div>
            </div>
          )}

          {/* PUBLISHED */}
          {ms.status === 'published' && (
            <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-indigo-800 mb-1 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />Your article has been published!
              </p>
              <div className="flex gap-3 mt-3">
                <Link to="/get-certificate"
                  className="inline-flex items-center gap-2 text-xs bg-indigo-600 text-white rounded-lg px-3 py-1.5 hover:bg-indigo-700 font-semibold">
                  <Award className="w-3 h-3" />Download Certificate
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────
const MySubmissions = () => {
  const [email,    setEmail]    = useState('')
  const [msNumber, setMsNumber] = useState('')
  const [results,  setResults]  = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true); setError(null); setResults(null)
    try {
      const data = await manuscriptsApi.track(email.trim(), msNumber.trim())
      setResults(data)
    } catch (err) {
      setError(err.message || 'No manuscripts found for the provided details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHero
        title="My Submissions"
        subtitle="Track and manage all your manuscript submissions to IJTD"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'For Authors', path: '/instructions' },
          { title: 'My Submissions' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Send,     label: 'Submit New Manuscript', to: '/submit-manuscript', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100' },
              { icon: Award,    label: 'Get Certificate',       to: '/get-certificate',   color: 'text-green-600 bg-green-50 hover:bg-green-100' },
              { icon: FileText, label: 'Author Guidelines',     to: '/instructions',      color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 p-4 rounded-xl font-semibold text-sm transition-colors ${item.color}`}>
                <item.icon className="w-5 h-5 flex-shrink-0" />{item.label}
              </Link>
            ))}
          </div>

          {/* Search form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Find Your Submissions</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Corresponding Author Email <span className="text-red-500">*</span>
                </label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Enter the email used during submission"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manuscript Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input type="text" value={msNumber} onChange={e => setMsNumber(e.target.value)}
                  placeholder="e.g. IJTD-2026-00001"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2">
                {loading ? <><Loader className="w-4 h-4 animate-spin" />Searching…</> : <><Search className="w-4 h-4" />Search My Submissions</>}
              </button>
            </form>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
            </div>
          )}

          {results && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Found <strong>{results.length}</strong> submission{results.length !== 1 ? 's' : ''} for <strong>{email}</strong>
              </p>
              {results.map(ms => <SubmissionCard key={ms.manuscript_number} ms={ms} />)}
            </div>
          )}

          {!results && !error && !loading && (
            <div className="text-center py-12 text-gray-400">
              <BookOpen className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-sm">Enter your email above to view all your submissions.</p>
              <p className="text-xs mt-1">
                First time?{' '}
                <Link to="/submit-manuscript" className="text-blue-600 hover:underline">Submit a manuscript</Link>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default MySubmissions