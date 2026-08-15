import { Link } from 'react-router-dom'
import { BookOpen, Mail, MapPin, Globe } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-journal-navy text-gray-300">
      {/* Top section with gradient */}
      <div className="bg-gradient-to-r from-journal-blue to-blue-900 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-display text-white mb-4">
            Ready to publish your research?
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Submit your manuscript to IJTD and join our global community of researchers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submit-manuscript" className="bg-white text-journal-blue font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-lg">
              Submit Manuscript
            </Link>
            <Link to="/instructions" className="border-2 border-white/50 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-all">
              Author Guidelines
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <span className="text-white font-bold text-lg">IJTD</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              International Journal of Transformative Development is a multidisciplinary, 
              peer-reviewed open access journal.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>Yaoundé, Cameroon</span>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Journal</h4>
            <ul className="space-y-3">
              {[
                { label: 'About the Journal', path: '/journal-information' },
                { label: 'Aims & Scope', path: '/aims-and-scope' },
                { label: 'Editorial Board', path: '/editorial-board' },
                { label: 'Indexing', path: '/indexing' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">For Authors</h4>
            <ul className="space-y-3">
              {[
                { label: 'Author Guidelines', path: '/instructions' },
                { label: 'Submit Manuscript', path: '/submit-manuscript' },
                { label: 'Processing Charges', path: '/charges' },
                { label: 'Track Manuscript', path: '/track-manuscript' },
              ].map((link) => (
                <li key={link.label}>
                  <Link to={link.path} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 uppercase text-xs tracking-wider">Connect</h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@ijtd.com" className="hover:text-white transition-colors">
                  contact@ijtd.com
                </a>
              </li>
              <li className="flex items-center space-x-2 text-sm text-gray-400">
                <Globe className="w-4 h-4" />
                <span>www.ijtd.com</span>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact Form
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} ASAIE Publishing. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer