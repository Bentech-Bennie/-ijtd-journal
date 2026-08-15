import PageHero from '../../components/ui/PageHero'
import SectionHeading from '../../components/shared/SectionHeading'
import { Shield, Eye, Scale, FileText, Lock } from 'lucide-react'

const Ethics = () => {
  const ethicSections = [
    {
      icon: Eye,
      title: 'For Editors',
      items: [
        'Publication decisions based on manuscript quality and relevance',
        'Fair evaluation without regard to race, gender, or political philosophy',
        'Confidentiality of submitted manuscripts',
        'Disclosure and conflicts of interest management'
      ]
    },
    {
      icon: Scale,
      title: 'For Reviewers',
      items: [
        'Contribution to editorial decisions through objective assessment',
        'Prompt review process',
        'Confidentiality of manuscripts',
        'Standards of objectivity with supporting arguments',
        'Identification of unacknowledged sources'
      ]
    },
    {
      icon: FileText,
      title: 'For Authors',
      items: [
        'Accurate reporting of original research',
        'Data access and retention',
        'Originality and plagiarism prevention',
        'No multiple or redundant publication',
        'Proper acknowledgment of sources',
        'Authorship limited to significant contributors',
        'Disclosure of conflicts of interest',
        'Prompt notification of errors in published works'
      ]
    }
  ]

  return (
    <div>
      <PageHero
        title="Ethics and Disclosures"
        subtitle="Maintaining the highest standards of integrity in publishing"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Ethics and Disclosures' }
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-gray-600 mb-12 text-center">
              IJTD is committed to maintaining the highest level of integrity in the content published. 
              Our ethics statements are based on COPE's Best Practice Guidelines for Journal Editors.
            </p>

            <div className="space-y-8">
              {ethicSections.map((section, index) => (
                <div key={index} className="card">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <section.icon className="w-6 h-6 text-blue-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                  </div>
                  <ul className="space-y-3">
                    {section.items.map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <h3 className="font-semibold text-yellow-800 mb-2">Disclaimer</h3>
              <p className="text-yellow-700 text-sm">
                The author(s) of the articles published in IJTD is/are solely responsible for the 
                content of the article. Neither IJTD nor its editors, publisher, or anyone else 
                involved in creating, producing or distribution assumes any liability or responsibility 
                for the accuracy, completeness, or usefulness of any information provided in the journal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Ethics