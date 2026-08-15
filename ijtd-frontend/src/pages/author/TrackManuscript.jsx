// src/pages/author/TrackManuscript.jsx
// Authors track their manuscript using email + manuscript number (NO login required).
// Shows all 8 possible statuses including the new payment workflow statuses.
// Displays full payment instructions when status = accepted_pending_payment.

import { useState } from 'react'
import PageHero from '../../components/ui/PageHero'
import {
  Search, FileText, Clock, CheckCircle, XCircle,
  AlertCircle, Loader, Award, DollarSign, BookOpen,
  CreditCard, ChevronDown, ChevronUp, Send
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { manuscriptsApi } from '../../services/api'

// ── Status configuration for all 8 possible statuses ─────────────────────────
const STATUS_CONFIG = {
  submitted: {
    label:       'Submitted',
    icon:        FileText,
    badgeCls:    'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Your manuscript has been received by the editorial office and is awaiting assignment to a reviewer.',
  },
  under_review: {
    label:       'Under Peer Review',
    icon:        Clock,
    badgeCls:    'bg-yellow-50 text-yellow-700 border-yellow-200',
    description: 'Your manuscript has been assigned to a peer reviewer. You will receive the editorial decision within 2–3 weeks.',
  },
  revision_required: {
    label:       'Revision Required',
    icon:        AlertCircle,
    badgeCls:    'bg-orange-50 text-orange-700 border-orange-200',
    description: 'The reviewer has requested changes to your manuscript. Please review the comments below and resubmit a revised version.',
  },
  accepted_pending_payment: {
    label:       'Accepted – Payment Required',
    icon:        DollarSign,
    badgeCls:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Congratulations! Your manuscript has been accepted for publication. Please remit the Article Processing Charge (APC) to proceed.',
  },
  payment_received: {
    label:       'Payment Received',
    icon:        CheckCircle,
    badgeCls:    'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Thank you — your payment has been received. The editorial team is now formatting your manuscript for publication.',
  },
  ready_to_publish: {
    label:       'In Final Formatting',
    icon:        Clock,
    badgeCls:    'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Your article has been formatted and is scheduled for publication. You will receive a notification email once it is live.',
  },
  published: {
    label:       'Published',
    icon:        CheckCircle,
    badgeCls:    'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Your article has been published and is freely available to readers worldwide.',
  },
  rejected: {
    label:       'Not Accepted',
    icon:        XCircle,
    badgeCls:    'bg-red-50 text-red-700 border-red-200',
    description: 'After careful review, your manuscript was not accepted for publication at this time. Please see the reviewer comments for feedback.',
  },
}

// ── Progress timeline steps (happy path) ─────────────────────────────────────
const TIMELINE_STEPS = [
  { key: 'submitted',                label: 'Submitted'   },
  { key: 'under_review',             label: 'Under Review' },
  { key: 'accepted_pending_payment', label: 'Accepted'    },
  { key: 'payment_received',         label: 'Payment OK'  },
  { key: 'ready_to_publish',         label: 'Formatting'  },
  { key: 'published',                label: 'Published'   },
]

const Timeline = ({ status }) => {
  if (status === 'rejected') {
    return (
      <div className="flex items-center gap-2 mt-3 text-sm text-red-600">
        <XCircle className="w-4 h-4 flex-shrink-0" />
        Manuscript was not accepted for publication.
      </div>
    )
  }
  if (status === 'revision_required') {
    return (
      <div className="flex items-center gap-2 mt-3 text-sm text-orange-600">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        Revision requested — please revise and contact the editorial office.
      </div>
    )
  }

  const currentIdx = TIMELINE_STEPS.findIndex(s => s.key === status)

  return (
    <div className="mt-4 overflow-x-auto pb-1">
      <div className="flex items-center min-w-max">
        {TIMELINE_STEPS.map((step, idx) => {
          const done    = idx <= currentIdx
          const current = idx === currentIdx
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all
                  ${done    ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-300'}
                  ${current ? 'ring-4 ring-blue-100 scale-110' : ''}`}>
                  {done ? '✓' : idx + 1}
                </div>
                <span className={`text-xs mt-1 text-center whitespace-nowrap font-medium
                  ${done ? 'text-blue-700' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={`w-12 h-0.5 mx-1 mb-4 transition-colors
                  ${idx < currentIdx ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Payment instructions (shown when accepted_pending_payment) ────────────────
const PaymentInstructions = ({ manuscriptNumber }) => (
  <div className="mt-5 bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5">
    <h3 className="font-bold text-emerald-900 text-base mb-1 flex items-center gap-2">
      <DollarSign className="w-5 h-5" />
      Action Required: Pay the Article Processing Charge (APC)
    </h3>
    <p className="text-sm text-emerald-800 mb-4">
      To proceed with publication, please remit the APC using one of the methods
      below, then send your proof of payment to{' '}
      <a href="mailto:contact@ijtd.com" className="font-semibold underline hover:text-emerald-900">
        contact@ijtd.com
      </a>{' '}
      quoting your manuscript number <strong>{manuscriptNumber}</strong>.
    </p>

    {/* Fee table */}
    <div className="grid sm:grid-cols-2 gap-3 mb-4">
      <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Foreign Authors (outside Cameroon)
        </p>
        <p className="text-2xl font-bold text-emerald-700">120 USD</p>
        <p className="text-xs text-gray-500 mt-1">Any transaction fees borne by author</p>
      </div>
      <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Authors in Cameroon
        </p>
        <p className="text-2xl font-bold text-emerald-700">60,000 FCFA</p>
        <p className="text-xs text-gray-500 mt-1">Mobile Money or Bank Transfer</p>
      </div>
    </div>

    {/* Payment methods */}
    <div className="bg-white rounded-xl p-4 border border-emerald-200">
      <p className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
        <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
        Payment Methods
      </p>
      <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-700">
        <div>
          <p className="font-semibold text-gray-800 mb-1">For Foreign Authors (USD):</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• <strong>PayPal:</strong> contact@ijtd.com</li>
            <li>• Include your manuscript number as reference</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-gray-800 mb-1">For Authors in Cameroon (FCFA):</p>
          <ul className="space-y-1 text-xs text-gray-600">
            <li>• <strong>MTN Mobile Money:</strong> +237 6XX XXX XXX</li>
            <li>• <strong>Orange Money:</strong> +237 6XX XXX XXX</li>
            <li>• <strong>Bank Transfer:</strong> email contact@ijtd.com for details</li>
          </ul>
        </div>
      </div>
    </div>

    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
      <p className="text-xs text-amber-800">
        <strong>Important:</strong> After payment, send your receipt/screenshot to{' '}
        <a href="mailto:contact@ijtd.com" className="underline">contact@ijtd.com</a>{' '}
        with subject line <em>"APC Payment – {manuscriptNumber}"</em>.
        No charges apply for rejected manuscripts. Corrections are free within 3 days of publication.
      </p>
    </div>
  </div>
)

// ── Single manuscript result card ─────────────────────────────────────────────
const ManuscriptCard = ({ ms }) => {
  const [expanded, setExpanded] = useState(true)
  const cfg  = STATUS_CONFIG[ms.status] || STATUS_CONFIG['submitted']
  const Icon = cfg.icon

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header row */}
      <div
        className="flex items-start gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <BookOpen className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-mono text-gray-400 mb-1">{ms.manuscript_number}</p>
          <p className="font-bold text-gray-900 leading-snug line-clamp-2">{ms.title}</p>
          <p className="text-sm text-gray-500 mt-0.5">{ms.authors}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.badgeCls}`}>
            <Icon className="w-3.5 h-3.5" />
            {cfg.label}
          </span>
          {expanded
            ? <ChevronUp   className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 pb-6 pt-4 bg-gray-50">

          {/* Status description */}
          <p className="text-sm text-gray-600 mb-3">{cfg.description}</p>

          {/* Progress timeline */}
          <Timeline status={ms.status} />

          {/* Metadata grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Type: </span>
              <span className="text-gray-600 capitalize">{ms.manuscript_type?.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Submitted: </span>
              <span className="text-gray-600">{ms.submitted_at}</span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Last update: </span>
              <span className="text-gray-600">{ms.updated_at}</span>
            </div>
          </div>

          {/* ── PAYMENT REQUIRED ── */}
          {ms.status === 'accepted_pending_payment' && (
            <PaymentInstructions manuscriptNumber={ms.manuscript_number} />
          )}

          {/* ── PAYMENT RECEIVED ── */}
          {ms.status === 'payment_received' && (
            <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4">
              <p className="font-semibold text-teal-800 text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Payment received — editorial formatting in progress
              </p>
              <p className="text-xs text-teal-700 mt-1">
                The editorial team is formatting your manuscript using the IJTD template.
                Your article will be published shortly and you will receive a notification email.
              </p>
            </div>
          )}

          {/* ── READY TO PUBLISH ── */}
          {ms.status === 'ready_to_publish' && (
            <div className="mt-4 bg-purple-50 border border-purple-200 rounded-xl p-4">
              <p className="font-semibold text-purple-800 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Formatted PDF ready — awaiting final publication by administrator
              </p>
              <p className="text-xs text-purple-700 mt-1">
                Your article has been formatted and will be published very soon.
              </p>
            </div>
          )}

          {/* ── REVISION REQUIRED ── */}
          {ms.status === 'revision_required' && ms.reviewer_comments && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="font-semibold text-orange-800 text-sm mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Reviewer / Editorial Comments
              </p>
              <p className="text-sm text-orange-700 whitespace-pre-wrap leading-relaxed">
                {ms.reviewer_comments}
              </p>
              <div className="mt-3 pt-3 border-t border-orange-200">
                <p className="text-xs text-orange-600">
                  Please revise your manuscript and send the updated Word document to{' '}
                  <a href="mailto:contact@ijtd.com" className="underline font-semibold">contact@ijtd.com</a>
                  {' '}quoting <strong>{ms.manuscript_number}</strong> within 3 weeks.
                </p>
              </div>
            </div>
          )}

          {/* ── PUBLISHED ── */}
          {ms.status === 'published' && (
            <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="font-semibold text-indigo-800 text-sm flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4" />
                Your article is now published and freely accessible worldwide!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/get-certificate"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" />
                  Download Certificate
                </Link>
                <Link
                  to="/current-issue"
                  className="inline-flex items-center gap-2 bg-white text-indigo-700 border border-indigo-300 text-xs font-bold px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  View Published Article
                </Link>
              </div>
            </div>
          )}

          {/* ── REJECTED ── */}
          {ms.status === 'rejected' && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="font-semibold text-red-800 text-sm mb-1 flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                Manuscript not accepted
              </p>
              {ms.reviewer_comments && (
                <p className="text-sm text-red-700 whitespace-pre-wrap mt-2 leading-relaxed">
                  {ms.reviewer_comments}
                </p>
              )}
              <p className="text-xs text-red-600 mt-3">
                We appreciate your interest in IJTD. You are welcome to consider the feedback
                and submit an improved manuscript in the future.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main page component ───────────────────────────────────────────────────────
const TrackManuscript = () => {
  const [email,     setEmail]     = useState('')
  const [msNumber,  setMsNumber]  = useState('')
  const [results,   setResults]   = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)
    setResults(null)
    try {
      const data = await manuscriptsApi.track(email.trim().toLowerCase(), msNumber.trim())
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
        title="Track Manuscript"
        subtitle="Check the status of your submission at any time using your email address"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'For Authors', path: '/instructions' },
          { title: 'Track Manuscript' },
        ]}
      />

      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4">

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Send,     label: 'Submit Manuscript',  to: '/submit-manuscript', color: 'text-blue-600   bg-blue-50   hover:bg-blue-100'   },
              { icon: Award,    label: 'Get Certificate',     to: '/get-certificate',   color: 'text-green-600  bg-green-50  hover:bg-green-100'  },
              { icon: BookOpen, label: 'Author Guidelines',   to: '/instructions',       color: 'text-purple-600 bg-purple-50 hover:bg-purple-100' },
            ].map(item => (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 p-4 rounded-xl font-semibold text-sm transition-colors ${item.color}`}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            ))}
          </div>

          {/* Search form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Find Your Submission</h2>
            <p className="text-sm text-gray-500 mb-5">
              No account needed — enter the email you used when submitting.
            </p>

            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Corresponding Author Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter the email address used during submission"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Manuscript Number
                  <span className="text-gray-400 font-normal ml-1">(optional — filters to a single submission)</span>
                </label>
                <input
                  type="text"
                  value={msNumber}
                  onChange={e => setMsNumber(e.target.value)}
                  placeholder="e.g. IJTD-2026-00001"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader className="w-4 h-4 animate-spin" />Searching…</>
                  : <><Search className="w-4 h-4" />Track Manuscript</>}
              </button>
            </form>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm mb-6 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">No manuscripts found</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Found <strong>{results.length}</strong> submission{results.length !== 1 ? 's' : ''} for{' '}
                <strong>{email}</strong>
              </p>
              {results.map(ms => (
                <ManuscriptCard key={ms.manuscript_number} ms={ms} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!results && !error && !loading && (
            <div className="text-center py-14 text-gray-400">
              <Search className="w-14 h-14 mx-auto mb-4 opacity-20" />
              <p className="text-sm font-medium">Enter your email above to find your submissions.</p>
              <p className="text-xs mt-2">
                First time?{' '}
                <Link to="/submit-manuscript" className="text-blue-600 hover:underline font-semibold">
                  Submit a manuscript
                </Link>
              </p>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}

export default TrackManuscript