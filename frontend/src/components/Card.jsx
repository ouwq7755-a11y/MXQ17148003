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
      {/* Cover Image */}
      <div className="relative h-44 bg-gray-100 flex items-center justify-center overflow-hidden">
        {tutorial.cover_image ? (
          <img
            src={tutorial.cover_image}
            alt={tutorial.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none' }}
          />
        ) : null}
        <div className={`absolute inset-0 flex items-center justify-center ${tutorial.cover_image ? 'bg-black/10' : 'gradient-hero'}`}>
          {!tutorial.cover_image && (
            <span className="text-5xl opacity-60 group-hover:scale-110 transition-transform duration-500">
              {categoryIcon || '💅'}
            </span>
          )}
        </div>
        {/* Video badge */}
        {tutorial.video_url && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            视频
          </div>
        )}
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
