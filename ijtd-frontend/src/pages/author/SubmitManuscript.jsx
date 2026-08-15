// src/pages/authors/SubmitManuscript.jsx
import { useState } from 'react'
import PageHero from '../../components/ui/PageHero'
import FormInput from '../../components/shared/FormInput'
import FormTextarea from '../../components/shared/FormTextarea'
import { Upload, FileText, CheckCircle, Loader, AlertCircle, Info } from 'lucide-react'
import { manuscriptsApi } from '../../services/api'

const SubmitManuscript = () => {
  const [formData, setFormData] = useState({
    manuscriptType: '', title: '', abstract: '',
    keywords: '', authors: '', email: '', file: null,
  })
  const [errors, setErrors]         = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult]         = useState(null)
  const [apiError, setApiError]     = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const ext = file.name.split('.').pop().toLowerCase()
    if (!['doc', 'docx', 'pdf'].includes(ext)) {
      setErrors(prev => ({ ...prev, file: 'Only .doc, .docx, or .pdf files are accepted' }))
      return
    }
    setFormData(prev => ({ ...prev, file }))
    setErrors(prev => ({ ...prev, file: '' }))
  }

  const validate = () => {
    const e = {}
    if (!formData.manuscriptType) e.manuscriptType = 'Required'
    if (!formData.title)          e.title          = 'Required'
    if (!formData.abstract)       e.abstract       = 'Required'
    if (!formData.keywords)       e.keywords       = 'Required'
    if (!formData.authors)        e.authors        = 'Required'
    if (!formData.email)          e.email          = 'Required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setSubmitting(true)
    setApiError(null)
    try {
      const fd = new FormData()
      fd.append('manuscriptType', formData.manuscriptType)
      fd.append('title',          formData.title)
      fd.append('abstract',       formData.abstract)
      fd.append('keywords',       formData.keywords)
      fd.append('authors',        formData.authors)
      fd.append('email',          formData.email)
      if (formData.file) fd.append('file', formData.file)
      const res = await manuscriptsApi.submit(fd)
      setResult({ number: res.manuscript_number })
    } catch (err) {
      setApiError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) return (
    <div>
      <PageHero title="Submit Manuscript" subtitle="Submission successful"
        breadcrumbs={[{title:'Home',path:'/'},{title:'For Authors'},{title:'Submit Manuscript'}]} />
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Manuscript Submitted!</h2>
            <p className="text-gray-500 mb-4">Your manuscript number is:</p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl py-4 px-6 mb-6">
              <span className="text-2xl font-mono font-bold text-blue-700">{result.number}</span>
            </div>
            <p className="text-gray-600 text-sm mb-2">
              Save this number — use it to track your submission at{' '}
              <a href="/track-manuscript" className="text-blue-600 hover:underline">Track Manuscript</a>.
            </p>
            <p className="text-gray-400 text-xs mb-8">
              A confirmation email will be sent if journal email is configured.
            </p>
            <button
              onClick={() => {
                setResult(null)
                setFormData({ manuscriptType:'', title:'', abstract:'', keywords:'', authors:'', email:'', file:null })
              }}
              className="btn-primary"
            >
              Submit Another Manuscript
            </button>
          </div>
        </div>
      </section>
    </div>
  )

  return (
    <div>
      <PageHero
        title="Submit Manuscript"
        subtitle="Submit your research for publication in IJTD"
        breadcrumbs={[{title:'Home',path:'/'},{title:'For Authors'},{title:'Submit Manuscript'}]}
      />

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">

          <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Before submitting,</strong> ensure your manuscript follows{' '}
              <a href="/instructions" className="underline hover:text-blue-900">author guidelines</a>:
              double-spaced, A4, Times New Roman 12pt, abstract max 300 words,
              4–6 keywords, Vancouver citation style.
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {apiError && (
              <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{apiError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-4">
                <FormInput
                  label="Manuscript Type" name="manuscriptType" type="select" required
                  value={formData.manuscriptType} onChange={handleChange} error={errors.manuscriptType}
                >
                  <option value="">Select type…</option>
                  <option value="research">Research Article</option>
                  <option value="review">Review Article</option>
                  <option value="short">Short Communication</option>
                  <option value="case">Case Report</option>
                  <option value="colloquia">Colloquia</option>
                  <option value="topical">Topical Review</option>
                  <option value="roadmap">Roadmap Article</option>
                  <option value="perspective">Perspective Article</option>
                </FormInput>
              </div>

              <FormInput
                label="Manuscript Title" name="title" required
                value={formData.title} onChange={handleChange} error={errors.title}
              />

              <FormTextarea
                label="Abstract (max 300 words)" name="abstract" required rows={6}
                value={formData.abstract} onChange={handleChange} error={errors.abstract}
              />

              <FormInput
                label="Keywords (4–6 keywords, comma separated)" name="keywords" required
                value={formData.keywords} onChange={handleChange} error={errors.keywords}
              />

              <FormInput
                label="Authors (full names, comma separated)" name="authors" required
                value={formData.authors} onChange={handleChange} error={errors.authors}
              />

              <FormInput
                label="Corresponding Author Email" name="email" type="email" required
                value={formData.email} onChange={handleChange} error={errors.email}
              />

              {/* File upload — PDF, DOC, DOCX */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Manuscript
                  <span className="text-gray-400 font-normal ml-1">( DOC, or DOCX — max 100 MB)</span>
                </label>
                <div className={`border-2 border-dashed rounded-xl transition-colors
                  ${errors.file ? 'border-red-400 bg-red-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  {/* KEY FIX: accept=".doc,.docx,.pdf" */}
                  <input
                    type="file"
                    id="manuscript-file"
                    accept=".doc,.docx,"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="manuscript-file" className="cursor-pointer block p-8 text-center">
                    {formData.file ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
                        <div className="text-left">
                          <p className="font-semibold text-gray-800">{formData.file.name}</p>
                          <p className="text-sm text-gray-400">
                            {(formData.file.size / 1024 / 1024).toFixed(2)} MB — click to change
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">Click to upload your manuscript</p>
                        <p className="text-sm text-gray-400 mt-1"> DOC, or DOCX — max 100 MB</p>
                      </>
                    )}
                  </label>
                </div>
                {errors.file && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />{errors.file}
                  </p>
                )}
              </div>

              <button
                type="submit" disabled={submitting}
                className="btn-primary w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting
                  ? <><Loader className="w-5 h-5 animate-spin" />Submitting…</>
                  : <><FileText className="w-5 h-5" />Submit Manuscript</>
                }
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SubmitManuscript