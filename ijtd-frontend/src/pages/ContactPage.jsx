// src/pages/ContactPage.jsx
// FIX: actually calls contactApi.send() so messages appear in admin dashboard
import { useState } from 'react'
import PageHero from '../components/ui/PageHero'
import FormInput from '../components/shared/FormInput'
import FormTextarea from '../components/shared/FormTextarea'
import { contactApi } from '../services/api'
import { Mail, MapPin, Phone, Send, CheckCircle, Loader, AlertCircle } from 'lucide-react'

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState(null)

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (error) setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      // FIX: actually call the backend API
      await contactApi.send(formData)
      setSent(true)
    } catch (err) {
      setError(err.message || 'Failed to send message. Please try again or email us directly.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      <PageHero
        title="Contact IJTD"
        subtitle="Get in touch with the editorial team"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Contact' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">

            {/* Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                {sent ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                    <p className="text-gray-600 mb-2">
                      Thank you for contacting IJTD. We will respond within 2 business days.
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      A copy has been saved to our inbox.
                    </p>
                    <button
                      onClick={() => {
                        setSent(false)
                        setFormData({ name: '', email: '', subject: '', message: '' })
                      }}
                      className="text-blue-600 hover:underline text-sm font-medium"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    {error && (
                      <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />{error}
                      </div>
                    )}

                    <FormInput
                      label="Your Name" name="name" required
                      value={formData.name} onChange={handleChange}
                    />
                    <FormInput
                      label="Email Address" name="email" type="email" required
                      value={formData.email} onChange={handleChange}
                    />
                    <FormInput
                      label="Subject" name="subject" required
                      value={formData.subject} onChange={handleChange}
                    />
                    <FormTextarea
                      label="Message" name="message" required rows={5}
                      value={formData.message} onChange={handleChange}
                    />

                    <button
                      type="submit"
                      disabled={sending}
                      className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {sending
                        ? <><Loader className="w-5 h-5 animate-spin" />Sending…</>
                        : <><Send className="w-5 h-5" />Send Message</>
                      }
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Contact info */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                <a href="mailto:contact@ijtd.com"
                  className="text-sm text-blue-600 hover:underline">
                  contact@ijtd.com
                </a>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Address</h3>
                <p className="text-sm text-gray-600">ASAIE Publishing<br />Yaoundé, Cameroon</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                <p className="text-sm text-gray-600">+237 6XX XXX XXX</p>
              </div>

              <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-6 text-white">
                <h3 className="font-bold mb-2">Manuscript Submissions</h3>
                <p className="text-blue-100 text-sm mb-3">
                  For manuscript submissions, please use the online submission form.
                </p>
                <a href="/submit-manuscript"
                  className="inline-block bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                  Submit Manuscript
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage