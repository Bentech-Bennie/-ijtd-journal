// src/pages/join/JoinPage.jsx
import { useState } from 'react'
import PageHero from '../../components/ui/PageHero'
import FormInput from '../../components/shared/FormInput'
import FormTextarea from '../../components/shared/FormTextarea'
import { joinApi } from '../../services/api'
import { Users, Award, CheckCircle, Loader, AlertCircle } from 'lucide-react'

const JoinPage = () => {
  const [applicationType, setApplicationType] = useState('reviewer')
  const [formData, setFormData] = useState({
    fullName: '', email: '', institution: '', country: '',
    researchField: '', degree: '', experienceYears: '', motivation: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted]   = useState(false)
  const [error, setError]           = useState(null)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        ...formData,
        experienceYears: formData.experienceYears ? parseInt(formData.experienceYears) : undefined,
      }
      if (applicationType === 'reviewer') {
        await joinApi.applyReviewer(payload)
      } else {
        await joinApi.applyEditorial(payload)
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div>
        <PageHero title="Application Submitted" subtitle="Thank you for your interest in IJTD" />
        <section className="py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-10">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Received!</h2>
              <p className="text-gray-600 mb-2">
                Thank you for applying to join IJTD as a{' '}
                <strong>{applicationType === 'reviewer' ? 'Reviewer' : 'Editorial Board Member'}</strong>.
              </p>
              <p className="text-gray-500 text-sm mb-8">
                A confirmation email has been sent to <strong>{formData.email}</strong>.
                Our editorial team will review your application and contact you within 5–7 business days.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false)
                  setFormData({ fullName: '', email: '', institution: '', country: '', researchField: '', degree: '', experienceYears: '', motivation: '' })
                }}
                className="btn-primary"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div>
      <PageHero
        title="Join IJTD"
        subtitle="Become part of our global academic community"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Join IJTD' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Type toggle */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setApplicationType('reviewer')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${applicationType === 'reviewer' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Users className="w-5 h-5 inline mr-2" />Join as Reviewer
            </button>
            <button
              onClick={() => setApplicationType('editorial')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${applicationType === 'editorial' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <Award className="w-5 h-5 inline mr-2" />Join Editorial Board
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Benefits panel */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white">
              {applicationType === 'reviewer' ? (
                <>
                  <Users className="w-12 h-12 mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Reviewer Benefits</h2>
                  <ul className="space-y-3 text-blue-100 text-sm">
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Gain valuable experience in scientific publishing</li>
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Enhance knowledge of professional publishing standards</li>
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Earn respect from peers in your research community</li>
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Receive a certificate of contribution from IJTD</li>
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Access to cutting-edge research in your field</li>
                  </ul>
                  <div className="mt-6 p-4 bg-white/10 rounded-xl">
                    <p className="text-sm font-semibold mb-1">Requirements</p>
                    <ul className="text-xs text-blue-200 space-y-1">
                      <li>• PhD or equivalent doctoral degree</li>
                      <li>• Affiliation with accredited academic institution</li>
                      <li>• Research field matching journal scope</li>
                      <li>• Willingness to review manuscripts promptly</li>
                    </ul>
                  </div>
                </>
              ) : (
                <>
                  <Award className="w-12 h-12 mb-4" />
                  <h2 className="text-2xl font-bold mb-4">Editorial Board Benefits</h2>
                  <ul className="space-y-3 text-blue-100 text-sm">
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Shape the direction and scope of the journal</li>
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Access latest research before publication</li>
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Build your international academic network</li>
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Receive certificate of editorial contribution</li>
                    <li className="flex items-start gap-2"><span className="mt-1">✓</span>Opportunity to propose and lead special issues</li>
                  </ul>
                  <div className="mt-6 p-4 bg-white/10 rounded-xl">
                    <p className="text-sm font-semibold mb-1">Requirements</p>
                    <ul className="text-xs text-blue-200 space-y-1">
                      <li>• PhD or equivalent, preferably professorial rank</li>
                      <li>• Strong publication record in relevant fields</li>
                      <li>• Experience in peer review processes</li>
                      <li>• Commitment to academic integrity and ethics</li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                {applicationType === 'reviewer' ? 'Reviewer Application' : 'Editorial Board Application'}
              </h3>

              {error && (
                <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput label="Full Name" name="fullName" placeholder="Dr. John Doe" required value={formData.fullName} onChange={handleChange} />
                <FormInput label="Email Address" name="email" type="email" placeholder="john.doe@university.edu" required value={formData.email} onChange={handleChange} />
                <FormInput label="Institution / University" name="institution" placeholder="University Name" required value={formData.institution} onChange={handleChange} />
                <FormInput label="Country" name="country" placeholder="Country" required value={formData.country} onChange={handleChange} />
                <FormInput label="Research Field / Specialization" name="researchField" placeholder="e.g., Biological Sciences" required value={formData.researchField} onChange={handleChange} />
                <FormInput label="Highest Degree" name="degree" placeholder="PhD, MD, etc." required value={formData.degree} onChange={handleChange} />
                <FormInput label="Years of Research Experience" name="experienceYears" type="number" placeholder="e.g., 8" value={formData.experienceYears} onChange={handleChange} />
                <FormTextarea label="Motivation / Statement of Interest" name="motivation" placeholder="Why do you want to join IJTD? Describe your expertise and how you can contribute…" rows={4} value={formData.motivation} onChange={handleChange} />

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <><Loader className="w-5 h-5 animate-spin" />Submitting…</>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default JoinPage