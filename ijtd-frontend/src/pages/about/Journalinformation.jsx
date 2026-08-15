import PageHero from '../../components/ui/PageHero'
import { journalInfo } from '../../data/journalData'
import { 
  BookOpen, 
  Globe, 
  Calendar, 
  Award, 
  Mail, 
  MapPin,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
  Zap,
  Shield
} from 'lucide-react'
import { Link } from 'react-router-dom'

const Journalinformation = () => {
  return (
    <div>
      <PageHero
        title="Journal Information"
        subtitle="International Journal of Transformative Development - A leading multidisciplinary, open-access journal"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Journal Information' }
        ]}
      />

      {/* Quick Stats Bar */}
      <section className="relative -mt-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Award, label: 'Impact Factor', value: '10', color: 'from-blue-500 to-blue-600' },
              { icon: Zap, label: 'Review Time', value: '2-3 Weeks', color: 'from-green-500 to-green-600' },
              { icon: Globe, label: 'Open Access', value: 'Global', color: 'from-purple-500 to-purple-600' },
              { icon: Calendar, label: 'Frequency', value: 'Monthly', color: 'from-orange-500 to-orange-600' },
            ].map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-xl p-6 transform hover:-translate-y-2 transition-all duration-300">
                <div className={`bg-gradient-to-r ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* About the Journal */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <BookOpen className="w-6 h-6 mr-3" />
                    About the Journal
                  </h2>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                    The International Journal of Transformative Development (IJTD) is a premier 
                    multidisciplinary, peer-reviewed journal dedicated to publishing high-quality 
                    research that contributes to transformative development across various fields.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    {[
                      { icon: Shield, text: 'Peer-Reviewed Excellence' },
                      { icon: Zap, text: 'Rapid Publication (2-3 weeks)' },
                      { icon: Globe, text: 'Worldwide Open Access' },
                      { icon: TrendingUp, text: 'High Impact Factor: 10' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <item.icon className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    Established in 2026 by the African Scientific Association for Innovative and 
                    Entrepreneurship (ASAIE), IJTD aims to bridge the gap between research and 
                    practical applications, fostering innovation and sustainable development 
                    particularly in emerging economies.
                  </p>
                </div>
              </div>

              {/* Journal Details Table */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <Star className="w-6 h-6 mr-3" />
                    Journal Specifications
                  </h2>
                </div>
                <div className="p-8">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody className="divide-y divide-gray-200">
                        {[
                          { label: 'Full Name', value: journalInfo.name },
                          { label: 'Abbreviation', value: journalInfo.abbreviation },
                          { label: 'Publisher', value: journalInfo.publisher },
                          { label: 'Electronic ISSN', value: journalInfo.issn.electronic, highlight: true },
                          { label: 'Print ISSN', value: journalInfo.issn.print, highlight: true },
                          { label: 'Impact Factor', value: journalInfo.impactFactor, badge: true },
                          { label: 'Publishing Model', value: journalInfo.model },
                          { label: 'Publication Frequency', value: journalInfo.frequency },
                          { label: 'Primary Contact', value: journalInfo.email },
                          { label: 'Location', value: journalInfo.location },
                        ].map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4 text-sm font-semibold text-gray-700 w-1/3">
                              {row.label}
                            </td>
                            <td className="py-4 px-4 text-sm">
                              <span className={`${row.highlight ? 'text-blue-700 font-bold' : 'text-gray-900'}`}>
                                {row.value}
                                {row.badge && (
                                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <TrendingUp className="w-3 h-3 mr-1" />
                                    High
                                  </span>
                                )}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
                  <h3 className="text-lg font-bold text-white">Quick Actions</h3>
                </div>
                <div className="p-6 space-y-3">
                  <Link to="/submit-manuscript" className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-gray-700">Submit Manuscript</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link to="/instructions" className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors group">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-gray-700">Author Guidelines</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link to="/current-issue" className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-medium text-gray-700">Current Issue</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link to="/join" className="flex items-center justify-between p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors group">
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-orange-600" />
                      <span className="font-medium text-gray-700">Join as Reviewer</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-orange-600 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Contact Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <p className="text-sm text-gray-600">ASAIE Publishing, Yaoundé, Cameroon</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href="mailto:contact@ijtd.com" className="text-sm text-blue-600 hover:underline">
                        contact@ijtd.com
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <a href="#" className="text-sm text-blue-600 hover:underline">
                        www.ijtd.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Indexing Badge */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg p-6 text-white">
                <h3 className="font-bold mb-3 flex items-center">
                  <Award className="w-5 h-5 mr-2 text-yellow-400" />
                  Indexed In
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Scopus', 'Web of Science', 'Google Scholar', 'CrossRef', 'EBSCO'].map((db) => (
                    <span key={db} className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">
                      {db}
                    </span>
                  ))}
                </div>
                <Link to="/indexing" className="text-blue-300 hover:text-blue-200 text-sm mt-3 inline-flex items-center">
                  View all databases
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose IJTD?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are committed to providing the best publishing experience for researchers worldwide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Fast Publication',
                description: 'Quick review process with publication in as little as 2-3 weeks. We understand the importance of timely dissemination of research.',
                color: 'blue'
              },
              {
                icon: Globe,
                title: 'Global Reach',
                description: 'Open access model ensures your research is accessible worldwide. Indexed in major databases including Scopus and Web of Science.',
                color: 'green'
              },
              {
                icon: Shield,
                title: 'Quality Assurance',
                description: 'Rigorous double-blind peer review by expert reviewers. We maintain the highest standards of academic integrity.',
                color: 'purple'
              },
              {
                icon: Award,
                title: 'High Impact',
                description: 'Impact Factor of 10 with growing citations. Your research will have significant visibility in the academic community.',
                color: 'orange'
              },
              {
                icon: Users,
                title: 'Expert Review Board',
                description: 'Distinguished editorial board with leading researchers from prestigious institutions worldwide.',
                color: 'red'
              },
              {
                icon: Clock,
                title: 'Continuous Publication',
                description: 'Monthly issues with online-first publication. Your article is available as soon as it is accepted.',
                color: 'indigo'
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${
                  feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  feature.color === 'green' ? 'bg-green-100 text-green-600' :
                  feature.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  feature.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  feature.color === 'red' ? 'bg-red-100 text-red-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gradient-hero text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Publish Your Research?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of researchers who have chosen IJTD for their scholarly publications.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link to="/submit-manuscript" className="btn-white text-lg">
              Submit Your Manuscript
              <ArrowRight className="w-5 h-5 ml-2 inline" />
            </Link>
            <Link to="/contact" className="border-2 border-white text-white hover:bg-white/10 font-semibold py-3 px-8 rounded transition-all duration-300 text-lg">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Journalinformation