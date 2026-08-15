// jtd-frontend/src/pages/about/Editorialboard.jsx
import { useState, useEffect } from 'react'
import PageHero from '../../components/ui/PageHero'
import SectionHeading from '../../components/shared/SectionHeading'
import { editorialApi } from '../../services/api'
import { User, Award, Mail, Building, BookOpen, Loader } from 'lucide-react'
import { Link } from 'react-router-dom'

const Editorialboard = () => {
  const [editorialData, setEditorialData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEditorialBoard = async () => {
      try {
        const data = await editorialApi.getAll()
        setEditorialData(data)
      } catch (err) {
        console.error('Error fetching editorial board:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEditorialBoard()
  }, [])

  if (loading) {
    return (
      <div>
        <PageHero title="Editorial Board" subtitle="Loading..." />
        <div className="py-16 text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading editorial board...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <PageHero title="Editorial Board" subtitle="Meet our distinguished editorial team" />
        <div className="py-16 text-center">
          <p className="text-red-500">Error loading editorial board: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHero
        title="Editorial Board"
        subtitle="Meet our distinguished editorial team"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Editorial Board' }
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {editorialData.map((group) => (
            <div key={group.role} className="mb-12">
              <SectionHeading
                title={group.role}
                centered={false}
              />
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {group.members.map((member) => (
                  <div key={member.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all">
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-blue-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                        <p className="text-blue-700 font-semibold mt-1">{member.role}</p>
                        <p className="text-gray-600 text-sm mt-1 flex items-start gap-1">
                          <Building className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {member.institution}
                        </p>
                        {member.country && (
                          <p className="text-gray-500 text-xs mt-1">{member.country}</p>
                        )}
                        {member.specialization && (
                          <p className="text-gray-500 text-xs mt-1 flex items-start gap-1">
                            <BookOpen className="w-3 h-3 mt-0.5" />
                            {member.specialization}
                          </p>
                        )}
                        {member.email && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Mail className="w-3 h-3 mr-1" />
                            <span>{member.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Call to Join Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center text-white mt-12">
            <Award className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Join Our Editorial Board</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              We welcome applications from qualified researchers to join our editorial board.
            </p>
            <Link to="/join" className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-all shadow-lg inline-flex items-center">
              Apply Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Editorialboard