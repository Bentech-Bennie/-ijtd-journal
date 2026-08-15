import PageHero from '../../components/ui/PageHero'
import { subjectAreas, articleTypes } from '../../data/journalData'
import { 
  BookOpen, 
  Target, 
  Lightbulb, 
  CheckCircle,
  ArrowRight,
  Microscope,
  Heart,
  Stethoscope,
  Cpu,
  TrendingUp,
  Users,
  Globe,
  Zap
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Aimsandscope = () => {
  const iconMap = {
    'Biological Sciences': Microscope,
    'Pharmaceutical Sciences': Heart,
    'Medical Sciences': Stethoscope,
    'Nursing': Users,
    'Health Sciences': Heart,
    'Agriculture': TrendingUp,
    'Life Sciences': Microscope,
    'Engineering & Technology': Cpu,
    'Economic and Management Sciences': TrendingUp,
    'Human Sciences': Users,
    'Communication and Literature': BookOpen,
  }

  return (
    <div>
      <PageHero
        title="Aims and Scope"
        subtitle="Publishing transformative research across multiple disciplines to advance knowledge and foster innovation"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Aims and Scope' }
        ]}
      />

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-10 border border-blue-100">
              <div className="flex items-start space-x-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                  <p className="text-gray-600 leading-relaxed text-lg mb-4">
                    The International Journal of Transformative Development (IJTD) aims to establish itself 
                    as a premier medium for exchanging ideas in emerging trends across multiple disciplines 
                    that need more focus and exposure.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    IJTD is always committed to publish articles that will strengthen the knowledge of 
                    upcoming researchers. We welcome submissions of original research papers, both 
                    theoretical and experimental.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subject Areas Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Subject Areas
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Interdisciplinary coverage spanning sciences and humanities
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {subjectAreas.map((subject, index) => {
              const IconComponent = iconMap[subject] || BookOpen
              return (
                <div 
                  key={index}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {subject}
                  </h3>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Article Types */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Article Categories
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Multiple formats to accommodate diverse research outputs
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-green-600 to-teal-600 mx-auto mt-4 rounded-full"></div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {articleTypes.map((type, index) => (
              <div 
                key={index}
                className="flex items-center space-x-4 bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{type}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Impact */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Globe, value: '75+', label: 'Countries Reached' },
              { icon: Zap, value: '2-3 Weeks', label: 'Review Time' },
              { icon: TrendingUp, value: '15,000+', label: 'Citations' },
            ].map((stat, index) => (
              <div key={index} className="p-8">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-blue-300" />
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Lightbulb className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Have Research to Share?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Submit your manuscript to IJTD and contribute to transformative development across disciplines.
          </p>
          <Link to="/submit-manuscript" className="btn-primary text-lg">
            Submit Your Manuscript
            <ArrowRight className="w-5 h-5 ml-2 inline" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Aimsandscope