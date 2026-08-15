import PageHero from '../../components/ui/PageHero'
import SectionHeading from '../../components/shared/SectionHeading'
import { DollarSign, CreditCard } from 'lucide-react'

const Charges = () => {
  return (
    <div>
      <PageHero
        title="Article Processing Charges"
        subtitle="Publication fees and payment information"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'For Authors' },
          { title: 'Processing Charges' }
        ]}
      />

      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Publication Fees</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Author Category</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="py-3 px-4 text-gray-600">Foreign Authors</td>
                    <td className="py-3 px-4 font-bold text-gray-900">120 USD</td>
                  </tr>
                  <tr className="border-t">
                    <td className="py-3 px-4 text-gray-600">Cameroon Authors</td>
                    <td className="py-3 px-4 font-bold text-gray-900">60,000 FCFA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <DollarSign className="w-8 h-8 text-blue-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Information</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• No charges for rejected articles</li>
                <li>• No submission charges</li>
                <li>• No surcharges based on article length</li>
                <li>• Any transaction fees borne by authors</li>
                <li>• Corrections free within 3 days of online publication</li>
              </ul>
            </div>
            <div className="card">
              <CreditCard className="w-8 h-8 text-blue-700 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Payment Methods</h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>• PayPal (for foreign authors)</li>
                <li>• Direct Deposit (Cameroon authors)</li>
                <li>• Mobile Money (Cameroon authors)</li>
                <li>• Orange Money (Cameroon authors)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Charges