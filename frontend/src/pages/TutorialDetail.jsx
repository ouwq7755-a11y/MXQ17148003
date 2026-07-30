import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, BarChart3, CheckCircle2, ArrowLeft, Eye } from 'lucide-react'
import { API_BASE } from '../App'
import { categoryIcons, difficultyConfig } from '../components/Card'
import Loader from '../components/Loader'
import LazyVideo from '../components/LazyVideo'

export default function TutorialDetail() {
  const { slug } = useParams()
  const [tutorial, setTutorial] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(`${API_BASE}/tutorials/${slug}`)
      .then(r => r.ok ? r.json() : Promise.reject('Not found'))
      .then(data => setTutorial(data))
      .catch(() => setError('教程未找到'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <Loader text="加载教程中..." />
  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-4">😢</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">{error}</h2>
      <Link to="/tutorials" className="btn-primary inline-flex items-center gap-2 mt-4">
        <ArrowLeft className="w-4 h-4" /> 返回教程列表
      </Link>
    </div>
  )
  if (!tutorial) return null

  const diff = difficultyConfig[tutorial.difficulty] || difficultyConfig.beginner
  const steps = tutorial.steps || []
  const tips = tutorial.tips || []

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back Link */}
      <Link to="/tutorials" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回教程列表
      </Link>

      {/* Hero */}
      <div className="gradient-banner rounded-3xl p-8 mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full font-medium" style={{ fontSize: '24rpx', backgroundColor: '#FFE6EF', color: '#F28FB2' }}>
            {diff.label}
          </span>
          {tutorial.category_name && (
            <span className="px-3 py-1 rounded-full font-medium" style={{ fontSize: '24rpx', backgroundColor: 'rgba(255,255,255,0.6)', color: '#555' }}>
              {tutorial.category_name}
            </span>
          )}
          {tutorial.tags?.map(tag => (
            <span key={tag.id} className="tag-badge" style={{ fontSize: '24rpx' }}>{tag.name}</span>
          ))}
        </div>
        <h1 className="font-semibold mb-3" style={{ fontSize: '32rpx', color: '#222' }}>{tutorial.title}</h1>
        <p style={{ fontSize: '28rpx', color: '#555', marginBottom: '16rpx' }}>{tutorial.description}</p>
        <div className="flex flex-wrap gap-3" style={{ fontSize: '24rpx', color: '#999' }}>
          <span className="flex items-center gap-1"><Clock size={14} /> {tutorial.duration_minutes}分钟</span>
          <span className="flex items-center gap-1"><BarChart3 size={14} /> {diff.label}难度</span>
          <span className="flex items-center gap-1"><Eye size={14} /> {tutorial.view_count}次学习</span>
        </div>
      </div>

      {/* Lazy Video Player — click thumbnail to load */}
      {tutorial.video_url && (
        <LazyVideo videoUrl={tutorial.video_url} coverImage={tutorial.cover_image} title={tutorial.title} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Steps */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary-500" />
            操作步骤
          </h2>
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                {/* Timeline */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold shadow-sm"
                       style={{ backgroundColor: '#F28FB2', fontSize: '26rpx' }}>
                    {step.order || i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: '#F4E8ED' }} />
                  )}
                </div>
                {/* Content */}
                <div className={`flex-1 pb-6 ${i === steps.length - 1 ? '' : ''}`}>
                  <div className="bg-white rounded-2xl shadow-card p-4">
                    <h3 className="font-medium mb-1.5" style={{ fontSize: '28rpx', color: '#222' }}>{step.title}</h3>
                    <p className="leading-relaxed" style={{ fontSize: '26rpx', color: '#555' }}>{step.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          {tips.length > 0 && (
            <div className="rounded-3xl p-5 shadow-card" style={{ backgroundColor: '#FFF5F8' }}>
              <h3 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: '#F28FB2' }}>
                💡 避坑指南 & 小贴士
              </h3>
              <ul className="space-y-2.5">
                {tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 leading-relaxed" style={{ fontSize: '26rpx', color: '#555' }}>
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#F28FB2' }} />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tools */}
          {tutorial.tools_needed?.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <h3 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: '#222' }}>🛠️ 所需工具</h3>
              <div className="flex flex-wrap gap-2">
                {tutorial.tools_needed.map(id => (
                  <Link key={id} to="/tools" className="px-3 py-1.5 rounded-full transition-colors"
                    style={{ backgroundColor: '#F4F4F4', color: '#555', fontSize: '24rpx' }}>
                    工具 #{id}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {tutorial.materials_needed?.length > 0 && (
            <div className="bg-white rounded-3xl p-5 shadow-card">
              <h3 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: '#222' }}>📦 所需材料</h3>
              <div className="flex flex-wrap gap-2">
                {tutorial.materials_needed.map(id => (
                  <Link key={id} to="/materials" className="px-3 py-1.5 rounded-full transition-colors"
                    style={{ backgroundColor: '#F4F4F4', color: '#555', fontSize: '24rpx' }}>
                    材料 #{id}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
