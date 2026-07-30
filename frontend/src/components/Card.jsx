import { Link } from 'react-router-dom'
import { Clock, Eye, Sparkles } from 'lucide-react'

const difficultyConfig = {
  beginner: { label: '入门', color: 'bg-green-100 text-green-700' },
  intermediate: { label: '进阶', color: 'bg-yellow-100 text-yellow-700' },
  advanced: { label: '高级', color: 'bg-red-100 text-red-700' },
}

const categoryIcons = {
  sparkles: '✨', palette: '🎨', wand: '🪄', droplets: '💧',
  magnet: '🧲', box: '📦', waves: '🌊', ruler: '📏',
  brush: '🖌️', hand: '🤚', heart: '💖', wrench: '🔧',
}

export default function Card({ tutorial, categoryIcon }) {
  const diff = difficultyConfig[tutorial.difficulty] || difficultyConfig.beginner

  return (
    <Link
      to={`/tutorials/${tutorial.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm card-hover flex flex-col"
    >
      {/* Cover Image Placeholder */}
      <div className="relative h-44 gradient-hero flex items-center justify-center overflow-hidden">
        <div className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-500">
          {categoryIcon || '💅'}
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${diff.color}`}>
            {diff.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-primary-500 transition-colors leading-snug">
          {tutorial.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">
          {tutorial.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
          {tutorial.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {tutorial.duration_minutes}分钟
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {tutorial.view_count || 0}次学习
          </span>
          {tutorial.category_name && (
            <span className="flex items-center gap-1 ml-auto">
              <Sparkles className="w-3.5 h-3.5" />
              {tutorial.category_name}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export { categoryIcons, difficultyConfig }
