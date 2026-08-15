import PageHero from '../../components/ui/PageHero'
import SectionHeading from '../../components/shared/SectionHeading'
import { Globe, FileText, Lock, Shield, Archive } from 'lucide-react'

const Editorialpolicies = () => {
  const policies = [
    {
      icon: Globe,
      title: 'Open Access Policy',
      description: 'IJTD is an open access journal. All content is freely available without charge to the user or their institution. Users are allowed to read, download, copy, distribute, print, search, or link to the full texts of the articles without asking prior permission from the publisher or the author, in accordance with the Budapest Open Access Initiative (BOAI) definition of open access.'
    },
    {
      icon: FileText,
      title: 'Peer-Review Policy',
      description: 'The manuscript will be reviewed by two suitable experts in respective subject area. The reports of both reviewers will be considered when deciding on acceptance/revision or rejection of a manuscript. The Editor-in-Chief will make the final decision, based on reviewer comments.'
    },
    {
      icon: Lock,
      title: 'Copyright Policy',
      description: 'All articles published in IJTD are distributed under a Creative Commons license. The journal allows the author(s) to hold the copyright of their work (all usages allowed except for commercial purpose).'
    },
    {
      icon: Shield,
      title: 'Plagiarism Policy',
      description: 'The authors should ensure that they have written entirely original works, and if the authors have used the work and/or words of others that this has been appropriately cited or quoted.'
    }
  ]

  return (
    <div>
      <PageHero
        title="Editorial Policies"
        subtitle="Our commitment to quality and integrity in publishing"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Editorial Policies' }
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {policies.map((policy, index) => (
              <div key={index} className="card">
                <div className="p-3 bg-blue-100 rounded-lg inline-block mb-4">
                  <policy.icon className="w-6 h-6 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{policy.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{policy.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Author Self-Archiving Policy</h3>
            <p className="text-gray-600">
              IJTD allows the authors to self-archive pre-print, post-print and publisher's version 
              of the article in any OAI-compliant repository.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Editorialpolicies