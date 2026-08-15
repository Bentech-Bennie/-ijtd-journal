// jtd-frontend/src/pages/authors/GetCertificate.jsx
//
// FIX: certificate is an HTML page (not a real PDF — see certificate.py),
// so we must NOT save it with a .pdf extension and try to "open" it as PDF.
// Instead: open it in a new browser tab where the user can use the in-page
// "Save as PDF" print button (already built into the HTML template),
// or save it as .html directly.
import { useState } from 'react'
import PageHero from '../../components/ui/PageHero'
import FormInput from '../../components/shared/FormInput'
import { certificateApi } from '../../services/api'
import { Award, Download, Search, CheckCircle, Loader, AlertCircle, ExternalLink } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const GetCertificate = () => {
  const [manuscriptNumber, setManuscriptNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [certificate, setCertificate] = useState(null)
  const [error, setError] = useState(null)
  const [opening, setOpening] = useState(false)

  const handleGetCertificate = async (e) => {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }

    setLoading(true)
    setError(null)
    try {
      const data = await certificateApi.getCertificate(manuscriptNumber, email)
      setCertificate(data)
    } catch (err) {
      setError(err.message || 'No certificate found for the provided details.')
    } finally {
      setLoading(false)
    }
  }

  // ── FIX: open the certificate HTML page in a new tab ──────────────────────
  // The backend route /api/certificate/download returns a styled HTML page
  // with a built-in "Save as PDF" print button — that's the correct UX here,
  // not a forced .pdf download (which would be corrupt since it's HTML).
  const handleViewCertificate = () => {
    setOpening(true)
    const params = new URLSearchParams({
      manuscript_number: manuscriptNumber,
      email,
    })
    const url = `${API_BASE}/certificate/download?${params}`
    window.open(url, '_blank')
    setTimeout(() => setOpening(false), 600)
  }

  return (
    <div>
      <PageHero
        title="Get Publication Certificate"
        subtitle="View and save your free digital certificate of publication"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'For Authors', path: '/instructions' },
          { title: 'Publication Certificate' }
        ]}
      />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-center mb-8">
            <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Celebrate Your Publication</h2>
            <p className="text-gray-600">
              Every author receives a FREE digital certificate of publication.
            </p>
          </div>

          {!certificate ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Retrieve Your Certificate</h3>

              {error && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <form onSubmit={handleGetCertificate} className="space-y-4">
                <FormInput
                  label="Manuscript Number (Optional)"
                  name="manuscriptNumber"
                  placeholder="e.g., IJTD-2026-00123"
                  value={manuscriptNumber}
                  onChange={(e) => setManuscriptNumber(e.target.value)}
                />
                <FormInput
                  label="Corresponding Author Email"
                  name="email"
                  type="email"
                  placeholder="Enter the email used during submission"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader className="w-5 h-5 animate-spin" /> Searching...</>
                  ) : (
                    <><Search className="w-5 h-5" /> Get Certificate</>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Certificate Preview */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-8 text-center text-white">
                <Award className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-3xl font-bold mb-2">Certificate of Publication</h2>
                <p className="text-blue-200">International Journal of Transformative Development</p>
              </div>

              <div className="p-8">
                <div className="border-2 border-gray-200 rounded-xl p-6 mb-6">
                  <p className="text-center text-gray-500 mb-4">This certifies that</p>
                  <p className="text-center text-2xl font-bold text-gray-900 mb-4">
                    {certificate.authors}
                  </p>
                  <p className="text-center text-gray-500 mb-4">has published the article</p>
                  <p className="text-center text-xl font-semibold text-blue-700 mb-4">
                    {certificate.title}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-400">Manuscript Number</p>
                      <p className="font-semibold">{certificate.manuscriptNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Publication Date</p>
                      <p className="font-semibold">{certificate.publicationDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">DOI</p>
                      <p className="font-semibold">{certificate.doi}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Journal</p>
                      <p className="font-semibold">IJTD</p>
                    </div>
                  </div>
                </div>

                {/* FIX: "View & Save as PDF" instead of a broken direct PDF download */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-700 flex items-start gap-2">
                  <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Your certificate opens in a new tab. Use the <strong>"Save as PDF"</strong> button
                    on that page (top-right) to download it, or your browser's Print → Save as PDF option.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleViewCertificate}
                    disabled={opening}
                    className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {opening
                      ? <><Loader className="w-5 h-5 animate-spin" />Opening…</>
                      : <><ExternalLink className="w-5 h-5" />View & Save as PDF</>
                    }
                  </button>
                  <button
                    onClick={() => {
                      setCertificate(null)
                      setManuscriptNumber('')
                      setEmail('')
                    }}
                    className="border border-gray-300 text-gray-700 hover:bg-gray-50 flex-1 rounded-lg font-semibold transition-colors"
                  >
                    Search Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default GetCertificate