// jtd-frontend/src/pages/articles/IssueDetail.jsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import PageHero from '../../components/ui/PageHero'
import ArticleCard from '../../components/shared/ArticleCard'
import { volumesApi } from '../../services/api'
import { BookOpen, Calendar, ChevronLeft, Loader } from 'lucide-react'

const IssueDetail = () => {
  const { volumeId, issueId } = useParams()
  const [issue, setIssue] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchIssue = async () => {
      try {
        const data = await volumesApi.getIssueArticles(volumeId, issueId)
        setIssue(data.issue)
        setArticles(data.articles)
      } catch (err) {
        console.error('Error fetching issue:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchIssue()
  }, [volumeId, issueId])

  if (loading) {
    return (
      <div>
        <PageHero title="Loading Issue..." subtitle="Please wait" />
        <div className="py-16 text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading issue details...</p>
        </div>
      </div>
    )
  }

  if (error || !issue) {
    return (
      <div>
        <PageHero title="Issue Not Found" subtitle="The requested issue could not be found" />
        <div className="py-16 text-center">
          <p className="text-red-500 mb-4">{error || 'Issue not found'}</p>
          <Link to="/archive" className="btn-primary">Back to Archive</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHero
        title={`Volume ${volumeId}, Issue ${issueId}: ${issue.month || 'Unknown Month'}`}
        subtitle={`${articles.length} articles published in this issue`}
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Articles', path: '/current-issue' },
          { title: 'Archive', path: '/archive' },
          { title: `Issue ${issueId}` }
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Issue Info Card */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-white mb-10">
            <div className="flex items-center gap-4 mb-4">
              <BookOpen className="w-10 h-10" />
              <div>
                <h2 className="text-2xl font-bold">Issue Information</h2>
                <p className="text-blue-200">Volume {volumeId} | Issue {issueId}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-blue-200 text-sm">Publication Month</p>
                <p className="font-semibold">{issue.month} {issue.year || '2026'}</p>
              </div>
              <div>
                <p className="text-blue-200 text-sm">Total Articles</p>
                <p className="font-semibold">{articles.length} articles</p>
              </div>
            </div>
          </div>

          {/* Articles List */}
          {articles.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Articles in this Issue</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-xl">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No articles available for this issue.</p>
            </div>
          )}
          
          {/* Back Navigation */}
          <div className="mt-8 text-center">
            <Link to="/archive" className="inline-flex items-center text-blue-600 hover:text-blue-700">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Archive
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default IssueDetail