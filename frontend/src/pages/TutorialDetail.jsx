import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, BarChart3, Tag, AlertCircle, CheckCircle2, ArrowLeft, Eye } from 'lucide-react'
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
      <div className="gradient-hero rounded-3xl p-8 md:p-12 mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${diff.color}`}>
            {diff.label}
          </span>
          {tutorial.category_name && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/60 text-gray-700">
              {tutorial.category_name}
            </span>
          )}
          {tutorial.tags?.map(tag => (
            <span key={tag.id} className="tag-badge">{tag.name}</span>
          ))}
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-3">{tutorial.title}</h1>
        <p className="text-gray-600 mb-4 max-w-2xl">{tutorial.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {tutorial.duration_minutes}分钟</span>
          <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> {diff.label}难度</span>
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {tutorial.view_count}次学习</span>
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
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm flex gap-5">
                {/* Step Number */}
                <div className="shrink-0 w-10 h-10 rounded-full gradient-hero flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {step.order || i + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.content}</p>
                  {step.image && (
                    <div className="mt-3 bg-gray-100 rounded-xl h-40 flex items-center justify-center text-gray-400 text-sm">
                      [图片: {step.title}]
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          {tips.length > 0 && (
            <div className="bg-amber-50 rounded-2xl p-5">
              <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                避坑指南 & 小贴士
              </h3>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-amber-700">
                    <span className="text-amber-400 shrink-0">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tools Needed */}
          {tutorial.tools_needed?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">所需工具</h3>
              <div className="flex flex-wrap gap-2">
                {tutorial.tools_needed.map(id => (
                  <Link
                    key={id}
                    to={`/tools`}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    工具 #{id}
                  </Link>
                ))}
              </div>
              <Link to="/tools" className="block mt-3 text-xs text-primary-500 hover:text-primary-600">
                查看完整工具指南 →
              </Link>
            </div>
          )}

          {/* Materials Needed */}
          {tutorial.materials_needed?.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">所需材料</h3>
              <div className="flex flex-wrap gap-2">
                {tutorial.materials_needed.map(id => (
                  <Link
                    key={id}
                    to={`/materials`}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-xs text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                  >
                    材料 #{id}
                  </Link>
                ))}
              </div>
              <Link to="/materials" className="block mt-3 text-xs text-primary-500 hover:text-primary-600">
                查看完整材料清单 →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
