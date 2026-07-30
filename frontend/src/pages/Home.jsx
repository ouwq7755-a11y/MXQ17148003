import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles, BookOpen, Palette, Wrench, Package, Camera, ChevronLeft, ChevronRight, Play, Clock, Flame } from 'lucide-react'
import { API_BASE } from '../App'
import { categoryIcons } from '../components/Card'
import Loader, { SkeletonGrid } from '../components/Loader'

const quickEntries = [
  { icon: Sparkles, label: 'AI生图', bg: 'surface-ai', color: 'text-[#9D76E8]', to: '/ai-design' },
  { icon: BookOpen, label: '分步教程', bg: 'surface-teach', color: 'text-[#62C490]', to: '/tutorials' },
  { icon: Package, label: '耗材清单', bg: 'surface-material', color: 'text-[#48A8E6]', to: '/materials' },
  { icon: Palette, label: '肤色配色', bg: 'surface-skin', color: 'text-[#E07098]', to: '/ai-design' },
  { icon: Camera, label: '素材中心', bg: 'surface-media', color: 'text-[#F28FB2]', to: '/tutorials' },
  { icon: Wrench, label: '工具教学', bg: 'surface-tool', color: 'text-[#48A8E6]', to: '/tools' },
]

const banners = [
  { title: '2025 夏季新款美甲', sub: '50+ 流行款式每日更新', emoji: '🌸' },
  { title: '零基础美甲训练营', sub: '从入门到专业 系统学习', emoji: '🎓' },
  { title: 'AI 一键生成美甲效果', sub: '上传手部照片即刻预览', emoji: '🤖' },
]

export default function Home() {
  const [categories, setCategories] = useState([])
  const [tutorials, setTutorials] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bannerIdx, setBannerIdx] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    let c = false
    async function load() {
      try {
        const [catR, tutR, statR] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/tutorials?page_size=8&page=1`),
          fetch(`${API_BASE}/stats`),
        ])
        if (!c) {
          setCategories(await catR.json())
          setTutorials((await tutR.json()).items || [])
          setStats(await statR.json())
        }
      } catch {} finally { if (!c) setLoading(false) }
    }
    load()
    return () => { c = true }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 3500)
    return () => clearInterval(t)
  }, [])

  if (loading) return <div className="max-w-lg mx-auto py-8" style={{ background: '#FFFCFD' }}><SkeletonGrid /></div>

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' })
  }

  const hotTutorials = tutorials.filter(t => t.difficulty === 'beginner').slice(0, 6)

  return (
    <div className="max-w-lg mx-auto px-safe py-3 space-y-section" style={{ background: '#FFFCFD' }}>
      {/* Search */}
      <Link to="/search" className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-card">
        <Search className="w-5 h-5" color="#999" />
        <span className="text-sm" style={{ color: '#999' }}>搜索教程、材料、工具...</span>
      </Link>

      {/* Banner */}
      <div className="relative rounded-3xl overflow-hidden" style={{ marginTop: '40rpx', marginBottom: '40rpx' }}>
        <div className="gradient-banner px-6 py-8 transition-all duration-500">
          <div className="flex items-center gap-4">
            <span className="text-4xl opacity-70">{banners[bannerIdx].emoji}</span>
            <div>
              <h2 className="font-semibold" style={{ fontSize: '36rpx', color: '#222' }}>{banners[bannerIdx].title}</h2>
              <p style={{ fontSize: '28rpx', color: '#999', marginTop: '4rpx' }}>{banners[bannerIdx].sub}</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}
              className="rounded-full transition-all"
              style={{
                width: i === bannerIdx ? '24rpx' : '8rpx',
                height: '8rpx',
                backgroundColor: i === bannerIdx ? '#F28FB2' : 'rgba(242,143,178,0.3)',
              }} />
          ))}
        </div>
      </div>

      {/* 6-Grid */}
      <div className="bg-white rounded-3xl shadow-card" style={{ padding: '32rpx' }}>
        <div className="grid grid-cols-3 gap-y-6">
          {quickEntries.map(({ icon: Icon, label, bg, color, to }) => (
            <Link key={label} to={to} className="flex flex-col items-center gap-1.5 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-colors" style={{ backgroundColor: `var(--tw-${bg})` }}>
                <Icon className="w-6 h-6" style={{ color: color.replace('text-[', '').replace(']', '') }} strokeWidth={2} />
              </div>
              <span className="font-medium" style={{ fontSize: '24rpx', color: '#222' }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot styles - horizontal scroll */}
      {hotTutorials.length > 0 && (
        <div style={{ marginTop: '40rpx' }}>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-semibold flex items-center gap-1.5" style={{ fontSize: '32rpx', color: '#222' }}>
              <Flame size={16} color="#F28FB2" /> 热门美甲款式
            </h2>
            <div className="flex gap-1">
              <button onClick={() => scroll(-1)} className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center">
                <ChevronLeft size={14} color="#999" />
              </button>
              <button onClick={() => scroll(1)} className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center">
                <ChevronRight size={14} color="#999" />
              </button>
            </div>
          </div>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
            {tutorials.slice(0, 8).map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`}
                className="shrink-0 bg-white rounded-3xl overflow-hidden shadow-card" style={{ width: '180rpx', scrollSnapAlign: 'start' }}
              >
                <div className="h-28 bg-gray-50 flex items-center justify-center relative">
                  {t.cover_image ? (
                    <img src={t.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover"
                      onError={e => e.target.style.display = 'none'} loading="lazy" />
                  ) : null}
                  <span className="text-3xl opacity-30">{categoryIcons[categories.find(c => c.id === t.category_id)?.icon] || '💅'}</span>
                  {t.video_url && (
                    <div className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5"
                         style={{ backgroundColor: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '20rpx' }}>
                      <Play size={10} fill="white" /> 视频
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-medium line-clamp-2 leading-snug" style={{ fontSize: '28rpx', color: '#222' }}>{t.title}</h3>
                  <div className="flex items-center gap-2 mt-2" style={{ fontSize: '22rpx', color: '#999' }}>
                    <span>{t.duration_minutes}分钟</span>
                    <span>{t.category_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tutorial List */}
      {hotTutorials.length > 0 && (
        <div className="px-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ fontSize: '32rpx', color: '#222' }}>新手入门教学</h2>
            <Link to="/tutorials" style={{ fontSize: '28rpx', color: '#F28FB2' }}>全部 →</Link>
          </div>
          <div className="space-y-card">
            {hotTutorials.map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`}
                className="flex items-center gap-4 bg-white rounded-3xl p-3 shadow-card card-hover"
              >
                <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden relative">
                  {t.cover_image ? (
                    <img src={t.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover"
                      onError={e => e.target.style.display = 'none'} loading="lazy" />
                  ) : null}
                  <span className="text-2xl">{categoryIcons[categories.find(c => c.id === t.category_id)?.icon] || '💅'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2 leading-snug" style={{ fontSize: '28rpx', color: '#222' }}>{t.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5" style={{ fontSize: '22rpx', color: '#999' }}>
                    <span className="tag-badge">{t.duration_minutes}分钟</span>
                    <span className="tag-green">{t.difficulty === 'beginner' ? '入门' : t.difficulty}</span>
                    <span>{t.category_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="bg-white rounded-3xl shadow-card p-5">
          <div className="grid grid-cols-4 text-center">
            {[['教程', stats.tutorial_count, '#F28FB2'], ['材料', stats.material_count, '#9D76E8'], ['工具', stats.tool_count, '#48A8E6'], ['分类', stats.category_count, '#62C490']].map(([l, v, c]) => (
              <div key={l}>
                <div className="font-bold" style={{ fontSize: '32rpx', color: c }}>{v}</div>
                <div style={{ fontSize: '22rpx', color: '#999' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
