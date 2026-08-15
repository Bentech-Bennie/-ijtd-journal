// src/components/shared/ArticleCard.jsx
import { Link } from 'react-router-dom'
import { Calendar, User, Download, Eye, ArrowRight } from 'lucide-react'

const ArticleCard = ({ article }) => {
  const detailUrl = `/article/${article.id}`

  return (
    <article className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-200 transition-all duration-200 group flex flex-col h-full">

      {/* Top — category + stats */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
          {article.category}
        </span>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />{article.views || 0}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />{article.downloads || 0}
          </span>
        </div>
      </div>

      {/* Title — clickable */}
      <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors leading-snug flex-1">
        <Link to={detailUrl} className="hover:text-blue-700">
          {article.title}
        </Link>
      </h3>

      {/* Authors */}
      <p className="text-sm text-gray-500 mb-3 flex items-center gap-1.5">
        <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
        <span className="truncate">{article.authors}</span>
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          {article.date || 'In Press'}
        </div>
        <Link to={detailUrl}
          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
          Read article <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </article>
  )
}

export default ArticleCard