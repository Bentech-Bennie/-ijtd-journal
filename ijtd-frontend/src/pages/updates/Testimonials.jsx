// jtd-frontend/src/pages/updates/Testimonials.jsx
import PageHero from '../../components/ui/PageHero'
import SectionHeading from '../../components/shared/SectionHeading'
import { Star, Quote } from 'lucide-react'

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Prof. Sarah Johnson",
      affiliation: "University of Cambridge, UK",
      role: "Author",
      content: "The peer review process at IJTD was remarkably efficient and thorough. My article was published within 4 weeks of submission, and the reviewer feedback significantly improved the quality of my work.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=0066CC&color=fff"
    },
    {
      id: 2,
      name: "Dr. Michael Okafor",
      affiliation: "University of Lagos, Nigeria",
      role: "Reviewer",
      content: "Being a reviewer for IJTD has been an enriching experience. The editorial team is professional, and the manuscripts I've reviewed have been of high quality.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Michael+Okafor&background=0066CC&color=fff"
    },
    {
      id: 3,
      name: "Prof. Aisha Diallo",
      affiliation: "Université Cheikh Anta Diop, Senegal",
      role: "Editorial Board Member",
      content: "IJTD has quickly become a respected platform for African research. The journal's commitment to open access and quality peer review is commendable.",
      rating: 5,
      avatar: "https://ui-avatars.com/api/?name=Aisha+Diallo&background=0066CC&color=fff"
    },
    {
      id: 4,
      name: "Dr. John Mwangi",
      affiliation: "Kenyatta University, Kenya",
      role: "Author",
      content: "The submission process was straightforward, and the communication from the editorial office was excellent. I highly recommend IJTD for researchers in Africa and beyond.",
      rating: 4,
      avatar: "https://ui-avatars.com/api/?name=John+Mwangi&background=0066CC&color=fff"
    }
  ]

  return (
    <div>
      <PageHero
        title="Testimonials"
        subtitle="What our authors, reviewers, and editors say about IJTD"
        breadcrumbs={[
          { title: 'Home', path: '/' },
          { title: 'Updates', path: '/news-highlights' },
          { title: 'Testimonials' }
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <SectionHeading 
            title="What People Are Saying"
            subtitle="Hear from our community of researchers and scholars"
          />

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-xl transition-shadow">
                <Quote className="w-10 h-10 text-blue-200 mb-4" />
                
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.affiliation}</p>
                    <p className="text-xs text-blue-600">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Testimonial Section */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-10 text-center text-white max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-3">Share Your Experience</h3>
            <p className="text-blue-100 mb-6">
              Have you published with IJTD or served as a reviewer? We'd love to hear about your experience.
            </p>
            <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 rounded-lg transition-all shadow-lg">
              Submit Your Testimonial
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Testimonials