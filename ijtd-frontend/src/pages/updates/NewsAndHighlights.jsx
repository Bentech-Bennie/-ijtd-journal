// jtd-frontend/src/pages/updates/NewsAndHighlights.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../../components/ui/PageHero'
import SectionHeading from '../../components/shared/SectionHeading'
import { Award, TrendingUp, Users, FileText, Calendar, ExternalLink, ChevronRight } from 'lucide-react'

const NewsAndHighlights = () => {
  const [activeTab, setActiveTab] = useState('news')

  const news = [
    {
      id: 1,
      title: "IJTD Receives Impact Factor of 10",
      date: "January 15, 2026",
      summary: "We are proud to announce that IJTD has received an impact factor of 10, recognizing the quality and influence of our published research.",
      category: "Announcement",
      icon: Award
    },
    {
      id: 2,
      title: "New Editorial Board Members Announced",
      date: "January 10, 2026",
      summary: "Welcome to our new editorial board members from 12 countries, bringing diverse expertise to strengthen our peer review process.",
      category: "Editorial",
      icon: Users
    },
    {
      id: 3,
      title: "IJTD Joins COPE",
      date: "December 20, 2025",
      summary: "IJTD has become a member of the Committee on Publication Ethics (COPE), reinforcing our commitment to publication ethics.",
      category: "Announcement",
      icon: FileText
    }
  ]

  const highlightedPapers = [
    {
      id: 1,
      title: "Advances in Sustainable Agricultural Practices for Climate Resilience",
      authors: "Kamga, P., Nwosu, C., Oluoch, J.",
      citations: 45,
      downloads: 1200,
      type: "Research Article"
    },
    {
      id: 2,
      title: "Machine Learning Applications in Pharmaceutical Drug Discovery",
      authors: "Mensah, A.K., Okonkwo, E.C.",
      citations: 38,
      downloads: 980,
      type: "Review Article"
    },
    {
      id: 3,
      title: "Traditional Medicine Integration in Modern Healthcare Systems",
      authors: "Banda, M.C., Okafor, N.I.",
      citations: 29,
      downloads: 756,
      type: "Perspective Article"
    }
  ]

  const conferencePapers = [
    {
      id: 1,
      title: "Proceedings of the African Research Summit 2025",
      date: "December 2025",
      location: "Yaoundé, Cameroon",
      papers: 45
    },
    {
      id: 2,
      title: "International Conference on Sustainable Development",
      date: "October 2025",
      location: "Dakar, Senegal",
      papers: 32
    }
  ]

  return (
    <div>
      <PageHero
        title="News and Highlights"
        subtitle="Stay updated with IJTD announcements, featured papers, and conference proceedings"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Updates' },
          { title: 'News and Highlights' }
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-8">
            {[
              { id: 'news', label: 'Latest News' },
              { id: 'papers', label: 'Highlighted Papers' },
              { id: 'conferences', label: 'Conference Proceedings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* News Tab */}
          {activeTab === 'news' && (
            <div className="max-w-4xl mx-auto">
              {news.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-6 mb-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                            {item.category}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {item.date}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 mb-4">{item.summary}</p>
                        <button className="text-blue-600 font-medium hover:text-blue-700 inline-flex items-center">
                          Read more
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Highlighted Papers Tab */}
          {activeTab === 'papers' && (
            <div>
              <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                {highlightedPapers.map((paper) => (
                  <div key={paper.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                        {paper.type}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {paper.citations} citations
                        </span>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{paper.title}</h3>
                    <p className="text-sm text-gray-500 mb-4">{paper.authors}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <span className="text-sm text-gray-400">{paper.downloads} downloads</span>
                      <Link to={`/article/${paper.id}`} className="text-blue-600 font-medium text-sm hover:underline">
                        Read Article →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conference Papers Tab */}
          {activeTab === 'conferences' && (
            <div className="max-w-3xl mx-auto">
              {conferencePapers.map((conf) => (
                <div key={conf.id} className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{conf.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>📍 {conf.location}</span>
                    <span>📅 {conf.date}</span>
                    <span>📄 {conf.papers} papers</span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Selected papers from this conference have been published as a special supplement in IJTD.
                  </p>
                  <button className="text-blue-600 font-medium hover:underline">
                    View proceedings →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default NewsAndHighlights