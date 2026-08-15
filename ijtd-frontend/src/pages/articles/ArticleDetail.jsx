// src/pages/articles/ArticleDetail.jsx
// Springer-style article page with working PDF reader and download
// Uses fetch→blob approach to avoid CORS issues with cross-origin file serving
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { articlesApi } from '../../services/api'
import {
  Download, Eye, Calendar, User, Tag, BookOpen,
  Share2, Loader, AlertCircle, Copy, CheckCircle,
  FileText, ChevronRight, ArrowLeft, X, ExternalLink
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ─── shared helpers ──────────────────────────────────────────────────────────

async function fetchFileBlob(url) {
  const res = await fetch(url, { mode: 'cors' })
  if (!res.ok) {
    let msg = `Server returned ${res.status}`
    try { const j = await res.json(); msg = j.error || msg } catch {}
    throw new Error(msg)
  }
  return res.blob()
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href    = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

// ─── Full-screen PDF / Document Viewer ──────────────────────────────────────

const DocumentViewer = ({ articleId, title, authors, hasPdf, onClose, onDownloadCounted }) => {
  const [blobUrl, setBlobUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [dlBusy,  setDlBusy]  = useState(false)
  const [isDocx,  setIsDocx]  = useState(false)

  const fileUrl = `${API_BASE}/files/article/${articleId}/view`

  useEffect(() => {
    if (!hasPdf) { setLoading(false); return }

    let objectUrl = null
    fetchFileBlob(fileUrl)
      .then(blob => {
        const type = blob.type || ''
        if (type.includes('word') || type.includes('officedocument') || type.includes('msword')) {
          setIsDocx(true)
        } else {
          // Force PDF MIME so browser renders it properly
          const pdfBlob = new Blob([blob], { type: 'application/pdf' })
          objectUrl     = URL.createObjectURL(pdfBlob)
          setBlobUrl(objectUrl)
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [articleId, hasPdf])

  const handleDownload = async () => {
    setDlBusy(true)
    try {
      const result = await articlesApi.incrementDownload(articleId).catch(() => null)
      if (result && typeof result.downloads === 'number' && onDownloadCounted) {
        onDownloadCounted(result.downloads)
      }
      const blob = await fetchFileBlob(`${fileUrl}?download=1`)
      const ext  = blob.type.includes('pdf') ? 'pdf'
                 : blob.type.includes('word') || blob.type.includes('officedocument') ? 'docx'
                 : 'pdf'
      triggerDownload(blob, `IJTD_article_${articleId}.${ext}`)
    } catch (e) { alert('Download failed: ' + e.message) }
    finally { setDlBusy(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0f172a' }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0 border-b"
        style={{ background: '#020617', borderColor: '#1e293b' }}>
        <button onClick={onClose}
          className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors">
          <X className="w-4 h-4" /><span className="hidden sm:inline">Close</span>
        </button>
        <div className="w-px h-5 bg-slate-700 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">{title}</p>
          <p className="text-slate-500 text-xs truncate">{authors}</p>
        </div>
        {hasPdf && (
          <button onClick={handleDownload} disabled={dlBusy}
            className="flex items-center gap-2 text-white text-xs font-semibold px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex-shrink-0 transition-colors">
            {dlBusy ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Download</span>
          </button>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0f172a' }}>
            <div className="text-center">
              <Loader className="w-10 h-10 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-slate-400 text-sm">Loading full text…</p>
            </div>
          </div>
        )}

        {/* No file uploaded */}
        {!loading && !hasPdf && (
          <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: '#0f172a' }}>
            <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <FileText className="w-14 h-14 text-slate-600 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-3">Full text not yet uploaded</h3>
              <p className="text-slate-400 text-sm mb-6">
                The editorial team is currently formatting this article's PDF.
                It will be available here shortly.
              </p>
              <a href="mailto:contact@ijtd.com"
                className="text-blue-400 hover:underline text-sm">
                Request a copy from contact@ijtd.com
              </a>
            </div>
          </div>
        )}

        {/* Fetch error */}
        {!loading && hasPdf && error && (
          <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: '#0f172a' }}>
            <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-3">Could not load file</h3>
              <p className="text-slate-400 text-sm mb-6">{error}</p>
              <p className="text-slate-500 text-xs">
                Contact <a href="mailto:contact@ijtd.com" className="text-blue-400 hover:underline">contact@ijtd.com</a>
              </p>
            </div>
          </div>
        )}

        {/* Word document */}
        {!loading && !error && isDocx && (
          <div className="absolute inset-0 flex items-center justify-center p-6" style={{ background: '#0f172a' }}>
            <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
              <FileText className="w-14 h-14 text-blue-400 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-3">Word Document</h3>
              <p className="text-slate-400 text-sm mb-6">
                This article is in .docx format. Download it to read in Microsoft Word or Google Docs.
              </p>
              <button onClick={handleDownload} disabled={dlBusy}
                className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 mx-auto disabled:opacity-50 transition-colors">
                {dlBusy ? <><Loader className="w-4 h-4 animate-spin" />Downloading…</> : <><Download className="w-4 h-4" />Download Full Text</>}
              </button>
            </div>
          </div>
        )}

        {/* PDF iframe */}
        {!loading && !error && blobUrl && !isDocx && (
          <iframe
            src={`${blobUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
            className="w-full h-full border-0"
            title={title}
          />
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

const ArticleDetail = () => {
  const { id }                     = useParams()
  const [article,  setArticle]     = useState(null)
  const [loading,  setLoading]     = useState(true)
  const [error,    setError]       = useState(null)
  const [copied,   setCopied]      = useState('')
  const [dlBusy,   setDlBusy]      = useState(false)
  const [showReader,setShowReader] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    articlesApi.getArticle(id)
      .then(d => { setArticle(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [id])

  const handleDownload = async () => {
    if (!article) return
    setDlBusy(true)
    try {
      const result = await articlesApi.incrementDownload(article.id).catch(() => null)
      // FIX: update the on-screen counter immediately instead of waiting for a refresh.
      // The backend returns the new total in result.downloads — use it directly so the
      // sidebar and header numbers reflect the click right away.
      if (result && typeof result.downloads === 'number') {
        setArticle(prev => prev ? { ...prev, downloads: result.downloads } : prev)
      }
      const url  = `${API_BASE}/files/article/${article.id}/view?download=1`
      const blob = await fetchFileBlob(url)
      const ext  = blob.type.includes('pdf') ? 'pdf'
                 : blob.type.includes('word') || blob.type.includes('officedocument') ? 'docx'
                 : (article.pdf_url?.split('.').pop() || 'pdf')
      triggerDownload(blob, `IJTD_${(article.doi || article.id).toString().replace(/\//g,'_')}.${ext}`)
    } catch (e) {
      alert('Download failed: ' + e.message + '\n\nContact contact@ijtd.com if this persists.')
    } finally { setDlBusy(false) }
  }

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading article…</p>
      </div>
    </div>
  )

  if (error || !article) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Article Not Found</h2>
        <p className="text-gray-500 mb-6 text-sm">{error || 'Could not load this article.'}</p>
        <Link to="/current-issue" className="inline-flex items-center gap-2 text-blue-600 font-semibold">
          <ArrowLeft className="w-4 h-4" />Back to Articles
        </Link>
      </div>
    </div>
  )

  const issueLabel = article.issue
    ? `Volume ${article.issue.volume.number}, Issue ${article.issue.number} · ${article.issue.month} ${article.issue.volume.year}`
    : null

  const year     = article.date?.split(' ').pop() || new Date().getFullYear()
  const citation = `${article.authors} (${year}). ${article.title}. International Journal of Transformative Development${article.doi ? `. https://doi.org/${article.doi}` : ''}.`
  const hasFile  = !!article.pdf_url

  return (
    <>
      {showReader && (
        <DocumentViewer
          articleId={article.id}
          title={article.title}
          authors={article.authors}
          hasPdf={hasFile}
          onClose={() => setShowReader(false)}
          onDownloadCounted={(newCount) =>
            setArticle(prev => prev ? { ...prev, downloads: newCount } : prev)
          }
        />
      )}

      <div className="bg-white min-h-screen">
        {/* Sticky top breadcrumb */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-30 shadow-sm">
          <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            <Link to="/" className="font-bold text-gray-800 hover:text-blue-700">IJTD</Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <Link to="/current-issue" className="hover:text-blue-600">Articles</Link>
            {issueLabel && <><ChevronRight className="w-3 h-3 text-gray-300 hidden sm:inline" /><span className="text-gray-400 hidden sm:inline">{issueLabel}</span></>}
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-10 items-start">

            {/* Left: article */}
            <div className="min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">{article.category}</span>
                <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Open Access
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-5" style={{ fontFamily: 'Georgia, serif' }}>
                {article.title}
              </h1>

              {/* Authors */}
              <div className="flex items-start gap-2 mb-4">
                <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 font-medium text-sm">{article.authors}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500 pb-5 mb-5 border-b border-gray-200">
                {article.date && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Published {article.date}</span>}
                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" />{(article.views||0).toLocaleString()} views</span>
                <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" />{(article.downloads||0).toLocaleString()} downloads</span>
              </div>

              {/* DOI */}
              {article.doi && (
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mb-6 text-sm">
                  <span className="font-bold text-gray-400 text-xs uppercase tracking-wider">DOI</span>
                  <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-mono text-xs flex items-center gap-1">
                    https://doi.org/{article.doi}<ExternalLink className="w-3 h-3" />
                  </a>
                  <button onClick={() => copy(`https://doi.org/${article.doi}`, 'doi')} className="text-gray-300 hover:text-blue-500 transition-colors">
                    {copied === 'doi' ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              {/* ── Action buttons — prominent like Springer ── */}
              <div className="flex flex-wrap gap-3 mb-8 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <button
                  onClick={() => setShowReader(true)}
                  className="flex items-center gap-2 text-white text-sm font-bold px-6 py-2.5 rounded-lg transition-all active:scale-95 shadow"
                  style={{ background: 'linear-gradient(135deg,#1d4ed8,#1e40af)' }}
                >
                  <BookOpen className="w-4 h-4" />
                  {hasFile ? 'Read Full Text' : 'View Abstract'}
                </button>
                <button
                  onClick={handleDownload}
                  disabled={dlBusy || !hasFile}
                  className={`flex items-center gap-2 text-sm font-bold px-6 py-2.5 rounded-lg border-2 transition-all active:scale-95
                    ${hasFile ? 'border-blue-700 text-blue-700 hover:bg-blue-50' : 'border-gray-300 text-gray-400 cursor-not-allowed'}`}
                >
                  {dlBusy ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {dlBusy ? 'Downloading…' : hasFile ? 'Download PDF' : 'PDF not yet available'}
                </button>
                {!hasFile && (
                  <p className="w-full text-xs text-gray-400 mt-1">
                    Full text will be uploaded shortly. Contact <a href="mailto:contact@ijtd.com" className="text-blue-500 hover:underline">contact@ijtd.com</a> to request early access.
                  </p>
                )}
              </div>

              {/* Abstract */}
              <section className="mb-8">
                <h2 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200" style={{ fontFamily: 'Georgia, serif' }}>Abstract</h2>
                <p className="text-gray-700 leading-relaxed text-[15px]">{article.abstract || 'Abstract not available.'}</p>
              </section>

              {/* Keywords */}
              {article.keywords?.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Tag className="w-3.5 h-3.5" />Keywords</h2>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((kw, i) => (
                      <Link key={i} to={`/current-issue?q=${encodeURIComponent(kw)}`}
                        className="px-3 py-1 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-700 text-gray-700 text-sm rounded-full transition-colors">
                        {kw}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Citation */}
              <section className="mb-8 p-5 bg-gray-50 border border-gray-200 rounded-xl">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">How to Cite</h2>
                <p className="text-sm text-gray-700 leading-relaxed font-mono bg-white border border-gray-200 rounded-lg p-3 break-words">{citation}</p>
                <button onClick={() => copy(citation, 'cite')}
                  className="mt-3 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  {copied === 'cite' ? <><CheckCircle className="w-4 h-4 text-green-500" />Copied!</> : <><Copy className="w-4 h-4" />Copy APA citation</>}
                </button>
              </section>

              {/* Share */}
              <section>
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2"><Share2 className="w-3.5 h-3.5" />Share</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'X (Twitter)', fn: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title + ' ' + window.location.href)}`, '_blank') },
                    { label: 'LinkedIn', fn: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank') },
                    { label: copied === 'link' ? '✓ Copied!' : 'Copy link', fn: () => copy(window.location.href, 'link') },
                  ].map(item => (
                    <button key={item.label} onClick={item.fn}
                      className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
                      {item.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* Right sidebar */}
            <div className="space-y-4 lg:sticky lg:top-12">
              {/* Access card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 text-white" style={{ background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8)' }}>
                  <h3 className="font-bold">Full Text</h3>
                  <p className="text-xs text-blue-200 mt-0.5">Open Access · Free worldwide</p>
                </div>
                <div className="p-4 space-y-2.5">
                  <button onClick={() => setShowReader(true)}
                    className="w-full flex items-center justify-center gap-2 text-white text-sm font-bold py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors active:scale-95">
                    <BookOpen className="w-4 h-4" />
                    {hasFile ? 'Read Online' : 'View Abstract'}
                  </button>
                  <button onClick={handleDownload} disabled={dlBusy || !hasFile}
                    className={`w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 rounded-lg border-2 transition-colors active:scale-95
                      ${hasFile ? 'border-blue-600 text-blue-600 hover:bg-blue-50' : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'}`}>
                    {dlBusy ? <><Loader className="w-4 h-4 animate-spin" />Downloading…</> : <><Download className="w-4 h-4" />{hasFile ? 'Download PDF' : 'PDF Pending'}</>}
                  </button>
                  <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
                    {[
                      ['Format', hasFile ? (article.pdf_url?.split('.').pop().toUpperCase() || 'PDF') : '—'],
                      ['Access', 'Open Access'],
                      ['License', 'CC BY 4.0'],
                      ['Views', (article.views||0).toLocaleString()],
                      ['Downloads', (article.downloads||0).toLocaleString()],
                    ].map(([k,v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-400">{k}</span>
                        <span className={`font-medium ${v === 'Open Access' ? 'text-green-600' : 'text-gray-800'}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Journal */}
              <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Journal</h3>
                <div className="space-y-2 text-sm">
                  {[['Publisher','ASAIE Publishing'],['ISSN Online','1434-6036'],['ISSN Print','1434-6028'],['Impact Factor','10'],['Frequency','Monthly']].map(([k,v]) => (
                    <div key={k} className="flex flex-col">
                      <span className="text-gray-400 text-xs">{k}</span>
                      <span className={`font-medium ${k==='Impact Factor'?'text-green-600':'text-gray-800'}`}>{v}</span>
                    </div>
                  ))}
                </div>
                <Link to="/journal-information" className="mt-3 block text-xs text-blue-600 hover:underline">About IJTD →</Link>
              </div>

              {issueLabel && (
                <div className="border border-gray-200 rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-400 mb-1">Published in</p>
                  <p className="text-sm font-semibold text-gray-700">{issueLabel}</p>
                  <Link to="/current-issue" className="mt-2 text-xs text-blue-600 hover:underline block">Browse this issue →</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ArticleDetail