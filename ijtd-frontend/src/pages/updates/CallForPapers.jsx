// jtd-frontend/src/pages/updates/CallForPapers.jsx
import { Link } from 'react-router-dom'
import PageHero from '../../components/ui/PageHero'
import SectionHeading from '../../components/shared/SectionHeading'
import { Calendar, FileText, Clock, ArrowRight, Users, Globe, Award } from 'lucide-react'

const CallForPapers = () => {
  const currentCalls = [
    {
      id: 1,
      title: "Special Issue: Artificial Intelligence in Healthcare",
      submissionDeadline: "August 30, 2026",
      publicationDate: "December 2026",
      topics: [
        "Machine learning for disease diagnosis",
        "AI in medical imaging",
        "Predictive analytics in patient care",
        "Ethical considerations of AI in healthcare"
      ],
      guestEditors: ["Dr. Amara Diallo", "Prof. Ngozi Adeyemi"]
    },
    {
      id: 2,
      title: "Sustainable Development in Sub-Saharan Africa",
      submissionDeadline: "October 15, 2026",
      publicationDate: "January 2027",
      topics: [
        "Renewable energy solutions",
        "Climate change adaptation",
        "Sustainable agriculture",
        "Green infrastructure"
      ],
      guestEditors: ["Dr. Samuel Kiprotich", "Prof. Jean-Pierre Mvondo"]
    },
    {
      id: 3,
      title: "Pharmaceutical Innovations for Tropical Diseases",
      submissionDeadline: "November 30, 2026",
      publicationDate: "March 2027",
      topics: [
        "Drug discovery for malaria",
        "Neglected tropical diseases",
        "Antimicrobial resistance",
        "Natural product pharmacology"
      ],
      guestEditors: ["Dr. Fatima Boussaïd", "Prof. Ali Hassan"]
    }
  ]

  return (
    <div>
      <PageHero
        title="Call for Papers"
        subtitle="Submit your research to our upcoming special issues"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Updates', path: '/news-highlights' },
          { title: 'Call for Papers' }
        ]}
      />

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading 
            title="Current Calls for Papers"
            subtitle="Explore our special issues and submit your manuscript"
          />

          <div className="space-y-8 max-w-5xl mx-auto">
            {currentCalls.map((call) => (
              <div key={call.id} className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                  <h2 className="text-xl font-bold text-white">{call.title}</h2>
                </div>
                
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                      <span>Submission Deadline: <strong>{call.submissionDeadline}</strong></span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-2 text-blue-600" />
                      <span>Expected Publication: <strong>{call.publicationDate}</strong></span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Topics of Interest:</h3>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {call.topics.map((topic, idx) => (
                        <li key={idx} className="flex items-center text-gray-600 text-sm">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-2"></div>
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Guest Editors:</h3>
                    <div className="flex flex-wrap gap-2">
                      {call.guestEditors.map((editor, idx) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {editor}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Link to="/submit-manuscript" className="btn-primary inline-flex items-center">
                      Submit Manuscript
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    <button className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-2 rounded-lg font-semibold transition-colors">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center max-w-3xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Propose a Special Issue</h3>
            <p className="text-gray-600 mb-4">
              Interested in guest editing a special issue? Contact our editorial office with your proposal.
            </p>
            <a href="mailto:contact@ijtd.com" className="text-blue-600 font-semibold hover:underline">
              Submit Proposal →
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default CallForPapers