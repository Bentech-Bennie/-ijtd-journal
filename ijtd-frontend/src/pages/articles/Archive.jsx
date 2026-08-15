// jtd-frontend/src/pages/articles/Archive.jsx (Update the Link paths)
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PageHero from '../../components/ui/PageHero'
import { volumesApi } from '../../services/api'
import { BookOpen, ChevronRight, Loader } from 'lucide-react'

const Archive = () => {
  const [volumes, setVolumes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    volumesApi.getAll()
      .then(setVolumes)
      .catch(() => setVolumes([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <PageHero title="Archive" subtitle="Browse all published issues of IJTD" />
        <div className="py-16 text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading archive...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHero
        title="Archive"
        subtitle="Browse all published issues of IJTD"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Articles' },
          { title: 'Archive' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {volumes.map((volume) => (
              <div key={volume.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                  <div className="flex items-center text-white gap-3">
                    <BookOpen className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Volume {volume.number} ({volume.year})</h3>
                  </div>
                </div>
                <div className="p-4 divide-y divide-gray-50">
                  {(volume.issues || []).map((issue) => (
                    <Link
                      key={issue.id}
                      to={`/archive/issue/${volume.number}/${issue.number}`}  // ← UPDATED PATH
                      className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-blue-50 transition-colors group"
                    >
                      <div>
                        <span className="text-sm text-gray-700 group-hover:text-blue-700 font-medium">
                          Issue {issue.number}: {issue.month}
                        </span>
                        {issue.article_count > 0 && (
                          <span className="ml-2 text-xs text-gray-400">
                            ({issue.article_count} articles)
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Archive