// src/components/layout/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { ChevronDown, Search, Menu, X, Globe, ArrowRight, BookOpen, LogOut, LayoutDashboard, User } from 'lucide-react'

const Navbar = () => {
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [activeDropdown, setActiveDropdown] = useState(null)
  const [scrolled, setScrolled]         = useState(false)
  const dropdownRef = useRef(null)
  const location    = useLocation()
  const { user, logout, isAuthenticated, isEditor, isReviewer } = useAuth()

  useEffect(() => {
    setActiveDropdown(null)
    setMobileOpen(false)
  }, [location])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setActiveDropdown(null)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    { label: 'About', children: [
      { label: 'About this Journal', path: '/journal-information' },
      { label: 'Aims and Scope',     path: '/aims-and-scope' },
      { label: 'Editorial Board',    path: '/editorial-board' },
      { label: 'Editorial Policies', path: '/editorial-policies' },
      { label: 'Ethics and Disclosures', path: '/ethics' },
      { label: 'Indexing',           path: '/indexing' },
    ]},
    { label: 'For Authors', children: [
      { label: 'Instructions for Authors', path: '/instructions' },
      { label: 'Submit Manuscript',        path: '/submit-manuscript' },
      { label: 'Processing Charges',       path: '/charges' },
      { label: 'Track Manuscript',         path: '/track-manuscript' },
      { label: 'My Submissions',           path: '/my-submissions' },
      { label: 'Get Publication Certificate', path: '/get-certificate' },
    ]},
    { label: 'Articles', children: [
      { label: 'Current Issue',    path: '/current-issue' },
      { label: 'Issue in Progress', path: '/issue-in-progress' },
      { label: 'Archive',          path: '/archive' },
    ]},
    { label: 'Join IJTD', path: '/join' },
    { label: 'Contact',   path: '/contact' },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg' : 'bg-white border-b border-gray-200'}`}>
      {/* Top Bar - ASAIE branding (no logo) */}
      <div className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-10">
          <Link to="/" className="hover:text-white transition-colors">
            <span className="font-bold text-white text-sm">ASAIE Journals</span>
            <span className="hidden lg:inline text-gray-400 text-xs ml-2">African Scientific Association for Innovative and Entrepreneurship</span>
          </Link>

          <div className="flex items-center space-x-4 text-xs">
            <button className="hover:text-white transition-colors flex items-center space-x-1.5">
              <Globe className="w-4 h-4" /><span>English</span>
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {isEditor && (
                  <Link to="/admin/dashboard" className="flex items-center gap-1.5 hover:text-white transition-colors font-medium">
                    <LayoutDashboard className="w-3.5 h-3.5" />Admin
                  </Link>
                )}
                {isReviewer && !isEditor && (
                  <Link to="/reviewer/pending-reviews" className="hover:text-white transition-colors font-medium">
                    Reviews
                  </Link>
                )}
                <span className="text-gray-500">|</span>
                <span className="text-gray-300">{user?.full_name?.split(' ')[0]}</span>
                <button onClick={logout} className="flex items-center gap-1 hover:text-red-400 transition-colors">
                  <LogOut className="w-3.5 h-3.5" />Sign out
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="hover:text-white transition-colors font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />Sign in
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navigation - IJTD logo on the left */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* IJTD Logo - Now uses the actual IJTD logo image */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="w-30 h-14 bg-white rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all overflow-hidden">
              <img
                src="/images/ijtd-logo.jpeg"
                alt="IJTD"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.target.style.display = 'none'
                  // Fallback to text if logo not found
                  e.target.parentNode.innerHTML = '<span class="text-xl font-bold text-blue-700">IJ</span>'
                }}
              />
            </div>
            <div className="hidden lg:block">
              <div className="text-xs font-medium text-gray-500 leading-tight">International Journal of</div>
              <div className="text-sm font-bold text-blue-600 leading-tight">Transformative Development</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center" ref={dropdownRef}>
            {navItems.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.label ? null : item.label)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg flex items-center space-x-1 ${activeDropdown === item.label ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className={`px-3 py-2 text-sm font-medium rounded-lg block ${location.pathname === item.path ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}
                  >
                    {item.label}
                  </Link>
                )}
                {item.children && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border py-2 z-50">
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.path}
                        onClick={() => setActiveDropdown(null)}
                        className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-600 mx-2 rounded-lg"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-2">
            <Link
              to="/submit-manuscript"
              className="hidden sm:inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-sm"
            >
              Submit <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t py-4">
            {navItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">{item.label}</div>
                    {item.children.map((child) => (
                      <Link
                        key={child.label}
                        to={child.path}
                        onClick={() => setMobileOpen(false)}
                        className="block px-6 py-2.5 text-sm text-gray-700 hover:bg-blue-50 mx-2 rounded-lg"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 mx-2 rounded-lg"
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}

            {isAuthenticated && isEditor && (
              <div className="mt-2 mx-2 pt-2 border-t border-gray-100">
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  Admin Dashboard
                </Link>
              </div>
            )}

            <div className="mt-4 px-3">
              <Link
                to="/submit-manuscript"
                onClick={() => setMobileOpen(false)}
                className="block w-full bg-blue-600 text-white text-center py-2.5 rounded-lg font-semibold"
              >
                Submit Manuscript
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar