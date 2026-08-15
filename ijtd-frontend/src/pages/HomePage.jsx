// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ChevronRight, TrendingUp, Globe, Award, Clock, Users, FileText } from 'lucide-react'
import { articlesApi } from '../services/api'
import coverImage from '../assets/ijtd-cover.jpeg'

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [animatedStats, setAnimatedStats] = useState({
    articles: 0, reviewers: 0, countries: 0, citations: 0,
  })

  useEffect(() => {
    articlesApi.getLatest(4)
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const targets = { articles: 1250, reviewers: 890, countries: 75, citations: 15000 }
    let tick = 0
    const timer = setInterval(() => {
      tick++
      const p = tick / 50
      setAnimatedStats({
        articles: Math.floor(targets.articles * p),
        reviewers: Math.floor(targets.reviewers * p),
        countries: Math.floor(targets.countries * p),
        citations: Math.floor(targets.citations * p),
      })
      if (tick >= 50) { clearInterval(timer); setAnimatedStats(targets) }
    }, 40)
    return () => clearInterval(timer)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/current-issue?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
        {/* Background glow effects */}
        <div className="absolute -top-20 -right-20 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-purple-500/15 rounded-full blur-[80px]"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M0 0h40v40H0V0zm1 1v38h38V1H1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative max-w-7xl mx-auto px-4 pt-2 pb-6 md:pb-8">
          <div className="grid md:grid-cols-2 gap-6 items-start">
            
            {/* Left Column - Text Content */}
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-xs font-semibold text-blue-200">
                  Open Access Journal
                </span>
                <span className="px-3 py-1 bg-green-500/20 border border-green-400/30 rounded-full text-xs font-semibold text-green-200">
                  Impact Factor 10
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-[1.2] mb-4">
                International Journal of<br />
                <span className="text-blue-400">Transformative Development</span>
              </h1>
              
              <p className="text-sm md:text-base text-blue-200 leading-relaxed max-w-2xl mb-4">
                A multidisciplinary, peer-reviewed open access journal publishing transformative 
                research across sciences, technology, and humanities.
              </p>

              <div className="flex flex-wrap gap-2">
                {['Agriculture', 'Medicine', 'Engineering', 'Economics', 'Pharmacy', 'Technology'].map(tag => (
                  <Link
                    key={tag}
                    to={`/current-issue?q=${tag}`}
                    className="text-[10px] text-blue-300 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-colors border border-white/10"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column - Cover Page Image - SMALLER */}
            <div className="flex justify-end items-start">
              <div className="relative w-full max-w-[160px] sm:max-w-[180px] md:max-w-[200px] lg:max-w-[220px]">
                {/* Decorative frame effect */}
                <div className="absolute -inset-1.5 bg-gradient-to-tr from-blue-500/15 via-purple-500/15 to-blue-500/15 rounded-xl blur-xl"></div>
                
                {/* Cover Image Container */}
                <div className="relative bg-white rounded-lg shadow-2xl overflow-hidden border border-white/10">
                  {/* ASAIE Badge at top - smaller */}
                  <div className="absolute top-1 left-1 z-10 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded-lg shadow-md">
                    <div className="flex items-center gap-1">
                      <span className="text-[6px] font-bold text-gray-800">ASAIE</span>
                      <span className="text-[4px] text-gray-500">JOURNALS</span>
                    </div>
                  </div>

                  {/* Cover Image */}
                  <img 
                    src={coverImage} 
                    alt="IJTD Cover Page"
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = `
                        <div class="flex flex-col items-center justify-center p-3 bg-gradient-to-br from-blue-600 to-blue-900 min-h-[140px]">
                          <div class="text-white text-center">
                            <div class="text-2xl font-bold mb-1">IJTD</div>
                            <div class="text-[10px] font-semibold">International Journal of</div>
                            <div class="text-xs font-bold text-yellow-400">Transformative Development</div>
                            <div class="mt-2 text-[8px] text-blue-200">ISSN: 1434-6028 (Print)</div>
                            <div class="text-[8px] text-blue-200">ISSN: 1434-6036 (Online)</div>
                            <div class="mt-1.5 inline-block bg-yellow-500/20 border border-yellow-400/30 px-1.5 py-0.5 rounded-full text-yellow-200 text-[6px]">
                              IF: 10
                            </div>
                          </div>
                        </div>
                      `
                    }}
                  />
                </div>

                {/* ISSN Info below cover - very small */}
                <div className="flex justify-center gap-1 mt-1 text-[6px] text-blue-300/30 flex-wrap">
                  <span>ISSN: 1434-6028 (Print)</span>
                  <span>|</span>
                  <span>ISSN: 1434-6036 (Online)</span>
                  <span>|</span>
                  <span className="text-yellow-400/30">IF: 10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles by title, author, keyword, or DOI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-28 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-lg transition-all text-sm"
              >
                <Search className="w-3.5 h-3.5 mr-1 inline" />Search
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
              {['Agriculture','Medicine','Engineering','Economics','Pharmacy','Technology'].map(tag => (
                <Link
                  key={tag}
                  to={`/current-issue?q=${tag}`}
                  className="text-[10px] text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-2.5 py-1 rounded-full transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            {[
              { icon: FileText, label: 'Articles Published', value: animatedStats.articles, suffix: '+' },
              { icon: Users, label: 'Expert Reviewers', value: animatedStats.reviewers, suffix: '+' },
              { icon: Globe, label: 'Countries Reached', value: animatedStats.countries, suffix: '+' },
              { icon: TrendingUp, label: 'Citations', value: animatedStats.citations, suffix: '+' },
            ].map((s, i) => (
              <div key={i} className="py-6 text-center">
                <div className="text-2xl font-bold text-gray-900">{s.value.toLocaleString()}{s.suffix}</div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Recent Publications</p>
              <h2 className="text-2xl font-display font-bold text-gray-900">Latest Articles</h2>
            </div>
            <Link to="/current-issue" className="hidden sm:flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-2.5 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {articles.map(a => (
                <article key={a.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-gray-300 transition-all group">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{a.category}</span>
                    <span className="text-[10px] text-gray-400">{a.date}</span>
                  </div>
                  <h3 className="text-base font-display font-bold text-gray-900 mb-1.5 group-hover:text-blue-700 transition-colors leading-snug">
                    <Link to={`/article/${a.id}`}>{a.title}</Link>
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{a.authors}</p>
                  <span className="text-[10px] text-gray-400 font-mono">DOI: {a.doi}</span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Publish */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-8">Why Publish With IJTD?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: 'Rapid Publication', desc: 'Peer review completed in 2-3 weeks with fast online publication' },
              { icon: Globe, title: 'Global Visibility', desc: 'Open access with worldwide readership. Indexed in major databases' },
              { icon: Award, title: 'High Impact', desc: 'Impact Factor of 10 with growing citations and comprehensive indexing' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl hover:bg-white transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-7 h-7 text-blue-700" />
                </div>
                <h3 className="text-lg font-display font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-3">About IJTD</h2>
          <p className="text-gray-600 leading-relaxed mb-4 text-sm">
            Published by the African Scientific Association for Innovative and Entrepreneurship (ASAIE).
            ISSN: 1434-6028 (Print) | 1434-6036 (Online). Impact Factor: 10.
          </p>
          <Link to="/journal-information" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            Learn more about the journal →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage