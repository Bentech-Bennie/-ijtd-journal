import PageHero from '../../components/ui/PageHero'
import SectionHeading from '../../components/shared/SectionHeading'
import { indexingDatabases } from '../../data/journalData'
import { CheckCircle, Database } from 'lucide-react'

const Indexing = () => {
  return (
    <div>
      <PageHero
        title="Indexing & Abstracting"
        subtitle="IJTD is indexed in major international databases"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Indexing' }
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <SectionHeading
              title="Database Coverage"
              subtitle="Ensuring maximum visibility and accessibility of published research"
            />
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {indexingDatabases.map((db, index) => (
                <div key={index} className="card flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{db}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-blue-50 rounded-xl p-8 flex items-start space-x-4">
              <Database className="w-8 h-8 text-blue-700 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Comprehensive Indexing</h3>
                <p className="text-gray-600">
                  Our indexing coverage includes major citation databases, disciplinary databases, 
                  and discovery services, ensuring that articles published in IJTD are easily 
                  discoverable by researchers worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Indexing