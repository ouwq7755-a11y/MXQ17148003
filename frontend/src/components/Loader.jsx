/**
 * Loading states: spinner and skeleton cards
 */
export default function Loader({ text = '加载中...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ backgroundColor: 'var(--color-primary-light)' }} />
        <div className="relative w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)' }}>
          <span className="text-2xl">💅</span>
        </div>
      </div>
      <p className="mt-4" style={{ fontSize: '26rpx', color: 'var(--text-color-minor)' }}>{text}</p>
    </div>
  )
}

/** Skeleton card for tutorial list loading */
export function SkeletonCard() {
  return (
    <div className="flex gap-4 bg-white rounded-3xl shadow-card p-3 animate-pulse">
      <div className="w-28 h-28 rounded-2xl shrink-0" style={{ backgroundColor: '#F4F4F4' }} />
      <div className="flex-1 py-1 space-y-3">
        <div className="h-5 rounded w-3/4" style={{ backgroundColor: '#F4F4F4' }} />
        <div className="h-4 rounded w-full" style={{ backgroundColor: '#F4F4F4' }} />
        <div className="flex gap-2">
          <div className="h-5 w-12 rounded-full" style={{ backgroundColor: '#F4F4F4' }} />
          <div className="h-5 w-14 rounded-full" style={{ backgroundColor: '#F4F4F4' }} />
          <div className="h-5 w-16 rounded-full" style={{ backgroundColor: '#F4F4F4' }} />
        </div>
      </div>
    </div>
  )
}

/** Skeleton grid for home page loading */
export function SkeletonGrid() {
  return (
    <div className="space-y-card px-safe">
      {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}

/** Empty state with icon and message */
export function EmptyState({ icon = '📭', title = '暂无内容', message = '', link = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-primary-light)' }}>
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="font-medium mb-1" style={{ fontSize: '30rpx', color: 'var(--text-color-main)' }}>{title}</h3>
      {message && <p style={{ fontSize: '26rpx', color: 'var(--text-color-minor)', maxWidth: '280rpx', lineHeight: 1.6 }}>{message}</p>}
      {link}
    </div>
  )
}
