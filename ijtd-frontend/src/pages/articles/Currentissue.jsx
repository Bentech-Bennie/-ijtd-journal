import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHero from '../../components/ui/PageHero'
import ArticleCard from '../../components/shared/ArticleCard'
import { articlesApi } from '../../services/api'
import { Search } from 'lucide-react'

const Currentissue = () => {
  const [searchParams] = useSearchParams()
  const [data, setData]       = useState({ issue: null, articles: [], volume: null })
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const searchQuery = searchParams.get('q') || ''

  useEffect(() => {
    articlesApi.getCurrentIssue()
      .then((res) => {
        setData(res)
        setFiltered(res.articles)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Client-side search filter
  useEffect(() => {
    if (!searchQuery) {
      setFiltered(data.articles)
      return
    }
    const q = searchQuery.toLowerCase()
    setFiltered(
      data.articles.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.authors.toLowerCase().includes(q) ||
          (a.keywords || []).some((k) => k.toLowerCase().includes(q))
      )
    )
  }, [searchQuery, data.articles])

  const issueLabel = data.volume && data.issue
    ? `Volume ${data.volume.number}, Issue ${data.issue.number}: ${data.issue.month} ${data.volume.year}`
    : 'Current Issue'

  return (
    <div>
      <PageHero
        title="Current Issue"
        subtitle={issueLabel}
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Articles' },
          { title: 'Current Issue' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {searchQuery && (
            <div className="mb-6 flex items-center gap-2 text-gray-600">
              <Search className="w-4 h-4" />
              <span>Showing results for <strong>"{searchQuery}"</strong> — {filtered.length} article{filtered.length !== 1 ? 's' : ''} found</span>
            </div>
          )}

          {loading && (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="text-center text-gray-500 py-16">No articles found.</p>
          )}

          {!loading && !error && filtered.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-6">{filtered.length} article{filtered.length !== 1 ? 's' : ''}</p>
              <div className="grid md:grid-cols-2 gap-6">
                {filtered.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Currentissue