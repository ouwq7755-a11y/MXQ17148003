import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, BarChart3, CheckCircle2, ArrowLeft, Eye, ChevronRight } from 'lucide-react'
import { API_BASE } from '../App'
import { categoryIcons, difficultyConfig } from '../components/Card'
import Loader, { EmptyState } from '../components/Loader'
import LazyVideo from '../components/LazyVideo'

export default function TutorialDetail() {
  const { slug } = useParams()
  const [tutorial, setTutorial] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/tutorials/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(data => {
        setTutorial(data)
        // Fetch related tutorials from same category
        return fetch(`${API_BASE}/tutorials?category_id=${data.category_id}&page_size=4`)
      })
      .then(r => r.json())
      .then(d => setRelated((d.items || []).filter(t => t.slug !== slug).slice(0, 3)))
      .catch(() => setError('教程未找到'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="max-w-lg mx-auto py-12" style={{ background: 'var(--bg-page)' }}><Loader text="加载教程中..." /></div>
  if (error) return (
    <div className="max-w-lg mx-auto px-safe" style={{ background: 'var(--bg-page)' }}>
      <EmptyState icon="😢" title={error} message="请返回教程列表浏览其他内容"
        link={<Link to="/tutorials" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium mt-4" style={{ backgroundColor: 'var(--color-primary)', fontSize: '28rpx' }}><ArrowLeft size={16} /> 返回教程列表</Link>} />
    </div>
  )
  if (!tutorial) return null

  const diff = difficultyConfig[tutorial.difficulty] || difficultyConfig.beginner
  const steps = tutorial.steps || []
  const tips = tutorial.tips || []

  return (
    <div className="max-w-lg mx-auto py-4" style={{ background: 'var(--bg-page)' }}>
      {/* Back */}
      <Link to="/tutorials" className="inline-flex items-center gap-1.5 px-safe mb-4 transition-colors" style={{ fontSize: '26rpx', color: 'var(--text-color-minor)' }}>
        <ArrowLeft size={16} /> 返回教程列表
      </Link>

      {/* Hero Banner */}
      <div className="mx-safe gradient-banner rounded-3xl p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-3 py-1 rounded-full font-medium" style={{ fontSize: '22rpx', backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>{diff.label}</span>
          {tutorial.category_name && (
            <span className="px-3 py-1 rounded-full font-medium" style={{ fontSize: '22rpx', backgroundColor: 'rgba(255,255,255,0.6)', color: 'var(--text-color-secondary)' }}>{tutorial.category_name}</span>
          )}
        </div>
        <h1 className="font-semibold mb-2 leading-snug" style={{ fontSize: '32rpx', color: 'var(--text-color-main)' }}>{tutorial.title}</h1>
        <p style={{ fontSize: '26rpx', color: 'var(--text-color-secondary)', marginBottom: '12rpx' }}>{tutorial.description}</p>
        <div className="flex flex-wrap gap-3" style={{ fontSize: '22rpx', color: 'var(--text-color-minor)' }}>
          <span className="flex items-center gap-1"><Clock size={12} /> {tutorial.duration_minutes}分钟</span>
          <span className="flex items-center gap-1"><Eye size={12} /> {tutorial.view_count}次学习</span>
          {tutorial.tags?.slice(0, 2).map(tag => (
            <span key={tag.id} className="tag-badge" style={{ fontSize: '22rpx' }}>{tag.name}</span>
          ))}
        </div>
      </div>

      {/* Video */}
      {tutorial.video_url && (
        <div className="mx-safe mb-6">
          <LazyVideo videoUrl={tutorial.video_url} coverImage={tutorial.cover_image} title={tutorial.title} />
        </div>
      )}

      {/* Steps with Timeline */}
      <div className="mx-safe mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2" style={{ fontSize: '32rpx', color: 'var(--text-color-main)' }}>
          <CheckCircle2 size={18} color="#F28FB2" strokeWidth={2} /> 操作步骤
        </h2>
        {steps.length > 0 ? (
          <div>
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                       style={{ backgroundColor: 'var(--color-primary)', fontSize: '24rpx' }}>{step.order || i + 1}</div>
                  {i < steps.length - 1 && <div className="w-0.5 flex-1 my-0.5" style={{ backgroundColor: 'var(--border-divider)' }} />}
                </div>
                <div className="flex-1" style={{ paddingBottom: i < steps.length - 1 ? '24rpx' : '0' }}>
                  <div className="bg-white rounded-2xl shadow-card p-4">
                    <h3 className="font-medium mb-1" style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>{step.title}</h3>
                    <p className="leading-relaxed" style={{ fontSize: '26rpx', color: 'var(--text-color-secondary)' }}>{step.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card p-6 text-center" style={{ color: 'var(--text-color-minor)', fontSize: '26rpx' }}>
            教程步骤加载中，请先观看上方视频教学
          </div>
        )}
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="mx-safe mb-6 rounded-3xl p-5 shadow-card" style={{ backgroundColor: '#FFF5F8' }}>
          <h2 className="font-medium mb-3" style={{ fontSize: '28rpx', color: 'var(--color-primary)' }}>💡 避坑指南 & 小贴士</h2>
          <div className="space-y-2">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-2 leading-relaxed" style={{ fontSize: '26rpx', color: 'var(--text-color-secondary)' }}>
                <span className="shrink-0 mt-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-primary)' }} />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools & Materials */}
      <div className="mx-safe grid grid-cols-2 gap-3 mb-6">
        <Link to="/tools" className="bg-white rounded-3xl shadow-card p-4 flex items-center gap-2">
          <span className="text-xl">🛠️</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium" style={{ fontSize: '26rpx', color: 'var(--text-color-main)' }}>工具指南</div>
            <div style={{ fontSize: '22rpx', color: 'var(--text-color-minor)' }}>查看所需工具</div>
          </div>
          <ChevronRight size={14} color="#999" />
        </Link>
        <Link to="/materials" className="bg-white rounded-3xl shadow-card p-4 flex items-center gap-2">
          <span className="text-xl">📦</span>
          <div className="flex-1 min-w-0">
            <div className="font-medium" style={{ fontSize: '26rpx', color: 'var(--text-color-main)' }}>材料清单</div>
            <div style={{ fontSize: '22rpx', color: 'var(--text-color-minor)' }}>查看所需材料</div>
          </div>
          <ChevronRight size={14} color="#999" />
        </Link>
      </div>

      {/* Related Tutorials */}
      {related.length > 0 && (
        <div className="mx-safe">
          <h2 className="font-semibold mb-3" style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>📎 相关推荐</h2>
          <div className="space-y-card">
            {related.map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`}
                className="flex gap-3 bg-white rounded-2xl shadow-card p-3 card-hover"
              >
                <div className="w-20 h-20 rounded-2xl bg-gray-50 shrink-0 flex items-center justify-center overflow-hidden">
                  {t.cover_image ? (
                    <img src={t.cover_image} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} loading="lazy" />
                  ) : <span className="text-2xl opacity-30">💅</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2 leading-snug" style={{ fontSize: '26rpx', color: 'var(--text-color-main)' }}>{t.title}</h3>
                  <div className="flex items-center gap-2 mt-1" style={{ fontSize: '22rpx', color: 'var(--text-color-minor)' }}>
                    <span>{t.duration_minutes}分钟</span>
                    <span>·</span>
                    <span>{t.category_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
