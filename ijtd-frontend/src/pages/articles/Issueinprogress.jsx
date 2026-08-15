// src/pages/articles/Issueinprogress.jsx
import { useState, useEffect } from 'react'
import PageHero from '../../components/ui/PageHero'
import ArticleCard from '../../components/shared/ArticleCard'
import { articlesApi } from '../../services/api'
import { Clock, Loader, BookOpen } from 'lucide-react'

const Issueinprogress = () => {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  useEffect(() => {
    articlesApi.getInProgress()
      .then(setArticles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHero
        title="Issue in Progress"
        subtitle="Articles accepted for publication and currently being processed"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Articles' },
          { title: 'Issue in Progress' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Info banner */}
          <div className="flex items-start gap-4 bg-blue-50 border border-blue-200 rounded-xl p-5 mb-10">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Articles in Progress</p>
              <p className="text-sm text-blue-700 mt-0.5">
                These manuscripts have been accepted and are currently being typeset, proofread, and assigned
                to an upcoming issue. They will appear in the archive once fully published.
              </p>
            </div>
          </div>

          {loading && (
            <div className="text-center py-12">
              <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-gray-500">Loading in-progress articles…</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-500">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-2xl">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Articles in Progress</h3>
              <p className="text-gray-400">Check back soon — newly accepted manuscripts will appear here.</p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <>
              <p className="text-sm text-gray-500 mb-6">
                {articles.length} article{articles.length !== 1 ? 's' : ''} currently in progress
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                {articles.map(article => (
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

export default Issueinprogress