import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles, BookOpen, Palette, Wrench, Package, Camera, ChevronLeft, ChevronRight, Play, Clock, Flame, TrendingUp } from 'lucide-react'
import { API_BASE } from '../App'
import { categoryIcons } from '../components/Card'
import Loader from '../components/Loader'

const quickEntries = [
  { icon: Sparkles, label: 'AI生图', desc: '一键预览', to: '/ai-design', color: 'from-pink-400 to-rose-500' },
  { icon: BookOpen, label: '分步教程', desc: '零基础学', to: '/tutorials', color: 'from-purple-400 to-violet-500' },
  { icon: Package, label: '耗材清单', desc: '买对材料', to: '/materials', color: 'from-blue-400 to-cyan-500' },
  { icon: Palette, label: '肤色配色', desc: '显白推荐', to: '/ai-design', color: 'from-orange-400 to-amber-500' },
  { icon: Camera, label: '素材中心', desc: '款式图库', to: '/tutorials', color: 'from-green-400 to-emerald-500' },
  { icon: Wrench, label: '工具教学', desc: '正确使用', to: '/tools', color: 'from-indigo-400 to-blue-500' },
]

const banners = [
  { title: '2025 夏季新款美甲', subtitle: '50+ 流行款式每日更新', bg: 'from-pink-300 via-rose-300 to-orange-300', emoji: '🌸' },
  { title: '零基础美甲训练营', subtitle: '从入门到专业 系统学习', bg: 'from-purple-300 via-violet-300 to-blue-300', emoji: '🎓' },
  { title: 'AI 一键生成美甲效果', subtitle: '上传手部照片即刻预览', bg: 'from-cyan-300 via-teal-300 to-emerald-300', emoji: '🤖' },
]

export default function Home() {
  const [categories, setCategories] = useState([])
  const [hotTutorials, setHotTutorials] = useState([])
  const [recentTutorials, setRecentTutorials] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bannerIdx, setBannerIdx] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    async function fetchData() {
      try {
        const [catRes, hotRes, recentRes, statsRes] = await Promise.all([
          fetch(`${API_BASE}/categories`),
          fetch(`${API_BASE}/tutorials/hot?limit=10`),
          fetch(`${API_BASE}/tutorials?page=1&page_size=10`),
          fetch(`${API_BASE}/stats`),
        ])
        if (!cancelled) {
          setCategories(await catRes.json())
          setHotTutorials(await hotRes.json())
          setRecentTutorials((await recentRes.json()).items || [])
          setStats(await statsRes.json())
        }
      } catch {} finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchData()
    return () => { cancelled = true }
  }, [])

  // Auto-rotate banner
  useEffect(() => {
    const timer = setInterval(() => setBannerIdx(i => (i + 1) % banners.length), 3500)
    return () => clearInterval(timer)
  }, [])

  if (loading) return <Loader text="正在加载美甲学院..." />

  const scroll = (dir) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: dir * 260, behavior: 'smooth' })
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-3 space-y-5">
      {/* Search Bar */}
      <Link to="/search" className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
        <Search className="w-5 h-5 text-gray-400" />
        <span className="text-sm text-gray-400 flex-1">搜索教程、材料、工具...</span>
      </Link>

      {/* Banner Carousel */}
      <div className="relative rounded-2xl overflow-hidden shadow-sm">
        <div className={`bg-gradient-to-r ${banners[bannerIdx].bg} px-6 py-8 transition-all duration-500`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{banners[bannerIdx].emoji}</span>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{banners[bannerIdx].title}</h2>
              <p className="text-sm text-gray-700/70 mt-1">{banners[bannerIdx].subtitle}</p>
            </div>
          </div>
        </div>
        {/* Banner dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {banners.map((_, i) => (
            <button key={i} onClick={() => setBannerIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === bannerIdx ? 'bg-white w-4' : 'bg-white/50'}`} />
          ))}
        </div>
      </div>

      {/* Quick Entry Grid - 2 rows x 3 cols */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-3">
          {quickEntries.map(({ icon: Icon, label, desc, to, color }) => (
            <Link key={label} to={to} className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 transition-colors">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-gray-700">{label}</span>
              <span className="text-[10px] text-gray-400 -mt-0.5">{desc}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot Styles - Horizontal Scroll */}
      {hotTutorials.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-500" /> 热门美甲款式
            </h2>
            <div className="flex gap-1">
              <button onClick={() => scroll(-1)} className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center">
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400" />
              </button>
              <button onClick={() => scroll(1)} className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          </div>
          <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
            {hotTutorials.map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`}
                className="shrink-0 w-[180px] bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                style={{ scrollSnapAlign: 'start' }}
              >
                <div className="h-28 gradient-hero flex items-center justify-center relative">
                  <span className="text-4xl opacity-50">{categoryIcons[categories.find(c => c.id === t.category_id)?.icon] || '💅'}</span>
                  {t.video_url?.startsWith('/videos/') && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <Play className="w-2.5 h-2.5" fill="white" /> 视频
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">{t.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{t.duration_minutes}分</span>
                    <span>{t.category_name}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent Tutorials - Video List Style */}
      {recentTutorials.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary-500" /> 新手入门教学
            </h2>
            <Link to="/tutorials" className="text-xs text-primary-500 font-medium">全部 →</Link>
          </div>
          <div className="space-y-2">
            {recentTutorials.filter(t => t.difficulty === 'beginner').slice(0, 6).map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`}
                className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center shrink-0">
                  <span className="text-2xl">{categoryIcons[categories.find(c => c.id === t.category_id)?.icon] || '💅'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xs font-semibold text-gray-800 line-clamp-1">{t.title}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 line-clamp-1">{t.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                    <span className="flex items-center gap-0.5"><Play className="w-3 h-3" fill="currentColor" />{t.duration_minutes}分钟</span>
                    <span>{t.category_name}</span>
                    {t.video_url?.startsWith('/videos/') && <span className="text-primary-400 font-medium">🎬 视频</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tools Recommendation - 2-col waterfall */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-gray-800 flex items-center gap-1.5">
            <Wrench className="w-4 h-4 text-amber-500" /> 美甲工具推荐
          </h2>
          <Link to="/tools" className="text-xs text-primary-500 font-medium">全部 →</Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'LED光疗灯 48W', price: '¥40-80', icon: '💡' },
            { name: '美甲搓条套装', price: '¥5-15', icon: '📏' },
            { name: '甲油胶12色套装', price: '¥30-60', icon: '🎨' },
            { name: '死皮剪+推子', price: '¥15-40', icon: '✂️' },
          ].map(item => (
            <Link key={item.name} to="/tools"
              className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-3xl">{item.icon}</span>
              <h3 className="text-xs font-semibold text-gray-700 mt-2">{item.name}</h3>
              <p className="text-xs text-primary-500 font-medium mt-1">{item.price}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="grid grid-cols-4 text-center">
            <div>
              <div className="text-lg font-bold text-primary-500">{stats.tutorial_count}</div>
              <div className="text-[10px] text-gray-400">教程</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-500">{stats.material_count}</div>
              <div className="text-[10px] text-gray-400">材料</div>
            </div>
            <div>
              <div className="text-lg font-bold text-orange-500">{stats.tool_count}</div>
              <div className="text-[10px] text-gray-400">工具</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-500">{stats.category_count}</div>
              <div className="text-[10px] text-gray-400">分类</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
