import { Link } from 'react-router-dom'
import PageHero from '../../components/ui/PageHero'
import { FileText, ClipboardList, Clock, ArrowRight, Download } from 'lucide-react'

const Instructions = () => {
  return (
    <div>
      <PageHero
        title="Instructions for Authors"
        subtitle="Guidelines for manuscript preparation and submission to IJTD"
      />

      {/* Quick Action Cards */}
      <section className="relative -mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: FileText, label: 'Submit Manuscript', path: '/submit-manuscript', color: 'blue' },
              { icon: ClipboardList, label: 'Track Status', path: '/track-manuscript', color: 'green' },
              { icon: Download, label: 'Download Template', path: '#', color: 'purple' },
            ].map((card, idx) => (
              <Link
                key={idx}
                to={card.path}
                className={`bg-white rounded-xl shadow-xl p-6 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 group`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  card.color === 'blue' ? 'bg-blue-100' : card.color === 'green' ? 'bg-green-100' : 'bg-purple-100'
                }`}>
                  <card.icon className={`w-6 h-6 ${
                    card.color === 'blue' ? 'text-journal-blue' : card.color === 'green' ? 'text-green-600' : 'text-purple-600'
                  }`} />
                </div>
                <span className="font-semibold text-gray-900 group-hover:text-journal-blue transition-colors">
                  {card.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar with navigation */}
          <div className="lg:col-span-1">
            <div className="border border-gray-200 rounded-xl p-6 sticky top-24">
              <h3 className="font-display text-lg text-gray-900 mb-4">Contents</h3>
              <nav className="space-y-1">
                {[
                  'Manuscript Categories',
                  'Formatting Requirements', 
                  'Manuscript Structure',
                  'Review Process',
                  'Publication Ethics'
                ].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    className="block px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-journal-blue rounded-lg transition-all"
                  >
                    {item}
                  </a>
                ))}
              </nav>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Quick Links
                </h4>
                <div className="space-y-2">
                  <Link to="/charges" className="text-sm text-journal-blue hover:text-blue-700 block">
                    Processing Charges
                  </Link>
                  <Link to="/submit-manuscript" className="text-sm text-journal-blue hover:text-blue-700 block">
                    Submit Now
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-12">
            <section id="manuscript-categories" className="animate-fade-in">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-journal-blue" />
                </div>
                <h2 className="text-2xl font-display text-gray-900">Manuscript Categories</h2>
              </div>
              
              <p className="text-gray-600 mb-6 leading-relaxed">
                IJTD accepts research and review articles, Colloquia, Topical Reviews, Roadmap Articles, 
                and Perspective Articles. All manuscripts undergo rapid peer review with publication in 2 weeks.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'Research Articles', desc: 'Complete reports of original research findings' },
                  { title: 'Review Articles', desc: 'Comprehensive summaries of existing research' },
                  { title: 'Short Communications', desc: 'Brief reports of significant findings' },
                  { title: 'Case Reports', desc: 'Detailed descriptions of unique cases' },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-5 hover:bg-blue-50 transition-all duration-300">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* More sections with similar styling */}
            <section id="manuscript-structure">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-2xl font-display text-gray-900">Manuscript Structure</h2>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-8">
                <ol className="space-y-4">
                  {[
                    'Title Page - Title, authors, affiliations, corresponding author',
                    'Abstract - Maximum 300 words, self-explanatory',
                    'Keywords - 4-6 keywords for indexing',
                    'Introduction - Brief objectives with background',
                    'Materials and Methods - Detailed experimental procedures',
                    'Results and Discussion - Concise presentation',
                    'Conclusion - Main findings and significance',
                    'References - Vancouver citation style',
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-4">
                      <span className="w-8 h-8 bg-journal-blue text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 pt-1.5">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* CTA */}
            <div className="bg-gradient-to-r from-journal-blue to-blue-700 rounded-2xl p-8 text-white text-center">
              <h3 className="text-2xl font-display mb-4">Ready to Submit?</h3>
              <p className="text-blue-100 mb-6">
                Prepare your manuscript following our guidelines and submit for peer review.
              </p>
              <Link to="/submit-manuscript" className="inline-flex items-center bg-white text-journal-blue font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-lg">
                Submit Manuscript
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Instructions