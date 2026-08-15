import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

const PageHero = ({ title, subtitle, breadcrumbs = [] }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900">
      {/* Glowing orbs */}
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-blue-500/25 rounded-full blur-[80px]"></div>
      <div className="absolute -bottom-32 -left-32 w-[350px] h-[350px] bg-purple-500/20 rounded-full blur-[80px]"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M0 0h40v40H0V0zm1 1v38h38V1H1z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-14">
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-2 text-xs text-blue-300 mb-4">
            {breadcrumbs.map((crumb, index) => (
              <span key={index} className="flex items-center">
                {index > 0 && <ChevronRight className="w-3 h-3 mx-1 text-blue-500" />}
                {crumb.path ? <Link to={crumb.path} className="hover:text-white transition-colors">{crumb.title}</Link> : <span className="text-white">{crumb.title}</span>}
              </span>
            ))}
          </nav>
        )}
        
        <div className="max-w-3xl">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-white leading-tight mb-3">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm md:text-base text-blue-200 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default PageHero