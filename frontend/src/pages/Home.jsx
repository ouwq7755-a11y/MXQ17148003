import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles, BookOpen, Palette, Wrench, Package, Camera, ChevronLeft, ChevronRight, Play, Clock, Flame, GraduationCap } from 'lucide-react'
import { API_BASE } from '../App'
import { categoryIcons } from '../components/Card'
import { SkeletonGrid } from '../components/Loader'

const quickEntries = [
  { icon: Sparkles, label: 'AI生图', bg: 'rgba(229,213,245,0.5)', color: '#9070C0', to: '/ai-design' },
  { icon: BookOpen, label: '分步教程', bg: 'rgba(213,245,224,0.5)', color: '#5AA070', to: '/tutorials' },
  { icon: Package, label: '耗材清单', bg: 'rgba(213,229,245,0.5)', color: '#5088B0', to: '/materials' },
  { icon: Palette, label: '肤色配色', bg: 'rgba(255,235,220,0.5)', color: '#D09080', to: '/ai-design' },
  { icon: Camera, label: '素材中心', bg: 'rgba(245,213,224,0.5)', color: '#D08090', to: '/tutorials' },
  { icon: Wrench, label: '工具教学', bg: 'rgba(225,230,245,0.5)', color: '#6088B0', to: '/tools' },
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
          fetch(`${API_BASE}/categories`), fetch(`${API_BASE}/tutorials?page_size=8`), fetch(`${API_BASE}/stats`)
        ])
        if (!c) { setCategories(await catR.json()); setTutorials((await tutR.json()).items || []); setStats(await statR.json()) }
      } catch {} finally { if (!c) setLoading(false) }
    }
    load(); return () => { c = true }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 3500)
    return () => clearInterval(t)
  }, [])

  if (loading) return <div className="max-w-lg mx-auto py-8"><SkeletonGrid /></div>

  const scroll = (dir) => { if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 220, behavior: 'smooth' }) }
  const hotTutorials = tutorials.filter(t => t.difficulty === 'beginner').slice(0, 6)

  return (
    <div className="max-w-lg mx-auto px-safe py-3 space-y-5">
      {/* Search */}
      <Link to="/search" className="bg-white flex items-center gap-3 px-4 py-3 float-hover" style={{ borderRadius: '18rpx', boxShadow: '0 1rpx 4rpx rgba(0,0,0,0.04)' }}>
        <Search size={18} color="#999" />
        <span style={{ fontSize: '28rpx', color: 'var(--text-color-minor)' }}>搜索教程、材料、工具...</span>
      </Link>

      {/* Banner */}
      <div className="relative overflow-hidden" style={{ borderRadius: 'var(--border-radius-banner)' }}>
        <div className="px-6 py-8" style={{ background: 'linear-gradient(135deg, #E8D8F5 0%, #F5DDE5 100%)' }}>
          <div className="flex items-center gap-4">
            <GraduationCap size={32} color="#9D76E8" strokeWidth={1.5} />
            <div>
              <h2 style={{ fontSize: '36rpx', fontWeight: 600, color: 'var(--text-color-main)' }}>零基础美甲训练营</h2>
              <p style={{ fontSize: '26rpx', color: 'var(--text-color-minor)', marginTop: '4rpx' }}>从入门到专业 系统学习</p>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Grid */}
      <div className="bg-white" style={{ borderRadius: 'var(--border-radius-grid)', padding: 'var(--padding-card)', boxShadow: 'var(--shadow-card)' }}>
        <div className="grid grid-cols-3 gap-y-5">
          {quickEntries.map(({ icon: Icon, label, bg, color, to }) => (
            <Link key={label} to={to} className="flex flex-col items-center gap-1.5 float-hover">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon size={22} style={{ color }} strokeWidth={1.5} />
              </div>
              <span className="font-medium" style={{ fontSize: '24rpx', color: 'var(--text-color-main)' }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot Styles - horizontal glass cards */}
      {hotTutorials.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="font-semibold flex items-center gap-1.5" style={{ fontSize: '32rpx', color: '#333' }}>
              <Flame size={16} color="#D08090" /> 热门美甲款式
            </h2>
            <div className="flex gap-1">
              <button onClick={() => scroll(-1)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: 'var(--shadow-card)' }}><ChevronLeft size={14} color="var(--text-color-minor)" /></button>
              <button onClick={() => scroll(1)} className="w-7 h-7 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: 'var(--shadow-card)' }}><ChevronRight size={14} color="var(--text-color-minor)" /></button>
            </div>
          </div>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
            {tutorials.slice(0, 8).map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`}
                className="shrink-0 overflow-hidden float-hover" style={{ width: '180rpx', scrollSnapAlign: 'start', borderRadius: 'var(--border-radius-card)', backgroundColor: '#FFF5F8', boxShadow: 'var(--shadow-card)' }}
              >
                <div className="h-28 flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'rgba(245,213,224,0.08)' }}>
                  {t.cover_image ? <img src={t.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover" onError={e => e.target.style.display = 'none'} loading="lazy" /> : null}
                  <span className="text-3xl opacity-20">{categoryIcons[categories.find(c => c.id === t.category_id)?.icon] || '💅'}</span>
                  {t.video_url && (
                    <div className="absolute top-2 left-2 rounded-full px-1.5 py-0.5" style={{ backgroundColor: '#F0F0F0', color: 'var(--text-color-minor)', fontSize: '20rpx' }}>
                      视频
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="font-medium line-clamp-2 leading-snug" style={{ fontSize: '26rpx', color: 'var(--text-color-main)' }}>{t.title}</h3>
                  <div className="flex items-center gap-1.5 mt-1.5" style={{ fontSize: '22rpx', color: 'var(--text-color-minor)' }}>
                    <span>{t.duration_minutes}分钟</span><span>{t.category_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tutorial List - glass cards */}
      {hotTutorials.length > 0 && (
        <div className="px-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold" style={{ fontSize: '32rpx', color: '#333' }}>新手入门教学</h2>
            <Link to="/tutorials" style={{ fontSize: '28rpx', color: '#E05050' }}>全部 →</Link>
          </div>
          <div className="space-y-3">
            {hotTutorials.map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`} className="bg-white rounded-3xl shadow-card p-3 flex items-center gap-4 float-hover">
                <div className="w-24 h-24 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: 'rgba(245,213,224,0.15)' }}>
                  {t.cover_image ? <img src={t.cover_image} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} loading="lazy" /> : <span className="text-2xl">{categoryIcons[categories.find(c => c.id === t.category_id)?.icon] || '💅'}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium line-clamp-2 leading-snug" style={{ fontSize: '28rpx', color: '#333' }}>{t.title}</h3>
                  <div className="flex items-center gap-2 mt-1.5" style={{ fontSize: '22rpx' }}>
                    <span className="tag-badge">{t.duration_minutes}分钟</span>
                    <span className="tag-green">{t.difficulty === 'beginner' ? '入门' : t.difficulty}</span>
                    <span style={{ color: 'var(--text-color-minor)' }}>{t.category_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="bg-white p-5" style={{ borderRadius: 'var(--border-radius-card)', boxShadow: 'var(--shadow-card)' }}>
          <div className="grid grid-cols-4 text-center">
            {[['教程', stats.tutorial_count, '#D08090'], ['材料', stats.material_count, '#9070C0'], ['工具', stats.tool_count, '#5088B0'], ['分类', stats.category_count, '#5AA070']].map(([l, v, c]) => (
              <div key={l}><div className="font-bold" style={{ fontSize: '32rpx', color: c }}>{v}</div><div style={{ fontSize: '22rpx', color: 'var(--text-color-minor)' }}>{l}</div></div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
