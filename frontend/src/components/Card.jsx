import { Link } from 'react-router-dom'
import { Clock, Eye } from 'lucide-react'

const difficultyLabels = {
  beginner: '入门', intermediate: '进阶', advanced: '高级',
}

const categoryIcons = {
  sparkles: '✨', palette: '🎨', wand: '🪄', droplets: '💧',
  magnet: '🧲', box: '📦', waves: '🌊', ruler: '📏',
  brush: '🖌️', hand: '🤚', heart: '💖', wrench: '🔧',
}

export default function Card({ tutorial, categoryIcon }) {
  const diff = difficultyLabels[tutorial.difficulty] || '入门'

  return (
    <Link
      to={`/tutorials/${tutorial.slug}`}
      className="group bg-white flex flex-col float-hover"
      style={{ borderRadius: 'var(--border-radius-card)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Cover */}
      <div className="relative h-40 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#F8F4F6' }}>
        {tutorial.cover_image ? (
          <img src={tutorial.cover_image} alt={tutorial.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy" onError={(e) => { e.target.style.display = 'none' }} />
        ) : null}
        {!tutorial.cover_image && (
          <span className="text-5xl opacity-15">{categoryIcon || '💅'}</span>
        )}
        {tutorial.video_url && (
          <div className="absolute top-2 left-2 rounded-full px-1.5 py-0.5"
               style={{ backgroundColor: '#F0F0F0', color: 'var(--text-color-minor)', fontSize: '20rpx' }}>
            视频
          </div>
        )}
        <div className="absolute top-2 right-2 rounded-full px-2 py-0.5"
             style={{ backgroundColor: '#FFF5F8', color: 'var(--color-primary)', fontSize: '20rpx', fontWeight: 500 }}>
          {diff}
        </div>
      </div>

      {/* Body */}
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-medium line-clamp-2 leading-snug mb-2 group-hover:opacity-80 transition-opacity"
            style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>
          {tutorial.title}
        </h3>
        <div className="flex items-center gap-3 mt-auto pt-2"
             style={{ fontSize: '22rpx', color: 'var(--text-color-minor)', borderTop: '1px solid var(--border-divider)' }}>
          {tutorial.duration_minutes > 0 && (
            <span className="flex items-center gap-1"><Clock size={12} />{tutorial.duration_minutes}分钟</span>
          )}
          <span className="flex items-center gap-1"><Eye size={12} />{tutorial.view_count || 0}</span>
          {tutorial.category_name && (
            <span className="ml-auto">{tutorial.category_name}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export { categoryIcons, difficultyLabels }
