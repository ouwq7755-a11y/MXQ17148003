import { useState, useEffect } from 'react'
import { Wrench, Search, CheckCircle2, AlertTriangle, DollarSign, Play, FileText } from 'lucide-react'
import { API_BASE } from '../App'
import Loader, { EmptyState, SkeletonGrid } from '../components/Loader'
import LazyVideo from '../components/LazyVideo'

const cats = [
  { v: '', l: '全部工具', i: '🔧' },
  { v: 'basic', l: '基础工具', i: '✂️' },
  { v: 'lamp', l: '光疗灯', i: '💡' },
  { v: 'painting', l: '彩绘笔', i: '🖌️' },
  { v: 'auxiliary', l: '辅助工具', i: '🛠️' },
]

export default function Tools() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [viewMode, setViewMode] = useState({})

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (category) p.set('category', category)
    if (search) p.set('search', search)
    fetch(`${API_BASE}/tools?${p}`).then(r => r.json()).then(setTools).catch(() => {}).finally(() => setLoading(false))
  }, [category, search])

  const handleExpand = (id) => {
    if (expandedId === id) { setExpandedId(null); return }
    setExpandedId(id)
    if (!viewMode[id]) setViewMode(prev => ({ ...prev, [id]: 'text' }))
    fetch(`${API_BASE}/tools/${id}`).then(r => r.json())
      .then(d => setTools(prev => prev.map(t => t.id === id ? { ...t, ...d } : t))).catch(() => {})
  }

  return (
    <div className="max-w-lg mx-auto px-safe py-4" style={{ background: 'var(--bg-page)' }}>
      <h1 className="font-semibold mb-1 flex items-center gap-2" style={{ fontSize: '36rpx', color: 'var(--text-color-main)' }}>
        <Wrench size={22} color="#F28FB2" strokeWidth={2} /> 美甲工具教学
      </h1>
      <p style={{ fontSize: '24rpx', color: 'var(--text-color-minor)', marginBottom: '24rpx' }}>17种工具详解 · 视频+图文双模式</p>

      {/* Search + Filters */}
      <div className="bg-white rounded-3xl shadow-card p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} color="#999" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索工具名称..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-page)', border: '1px solid #F4E8ED', fontSize: '28rpx', color: 'var(--text-color-secondary)' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {cats.map(c => (
            <button key={c.v} onClick={() => setCategory(c.v)}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={{
                backgroundColor: category === c.v ? 'var(--color-primary-light)' : '#F4F4F4',
                color: category === c.v ? 'var(--color-primary)' : 'var(--text-color-minor)',
                fontSize: '26rpx',
              }}>{c.i} {c.l}</button>
          ))}
        </div>
      </div>

      {loading ? <SkeletonGrid /> : tools.length === 0 ? (
        <EmptyState icon="🔧" title="暂无工具数据" message="请确认后端API已启动" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {tools.map(tool => {
            const catInfo = cats.find(c => c.v === tool.category) || cats[0]
            const isExpanded = expandedId === tool.id
            const mode = viewMode[tool.id] || 'text'
            const hasVideo = !!tool.video_url
            const hasText = tool.usage_steps?.length > 0 || tool.precautions

            return (
              <div key={tool.id} className={`bg-white rounded-3xl shadow-card transition-all ${isExpanded ? 'ring-2' : ''}`}
                   style={{ ringColor: isExpanded ? 'var(--color-primary)' : undefined }}>
                <button onClick={() => handleExpand(tool.id)} className="w-full text-left" style={{ padding: '32rpx' }}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-2xl">{catInfo.i}</span>
                    {tool.price_range && (
                      <span className="flex items-center gap-0.5 font-medium" style={{ fontSize: '24rpx', color: 'var(--color-primary)' }}>
                        <DollarSign size={12} /> {tool.price_range}
                      </span>
                    )}
                  </div>
                  <h3 className="font-medium mb-1" style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>{tool.name}</h3>
                  <p className="line-clamp-2 leading-relaxed" style={{ fontSize: '26rpx', color: 'var(--text-color-secondary)' }}>{tool.description}</p>
                  <div className="flex items-center gap-3 mt-3" style={{ fontSize: '22rpx' }}>
                    {hasVideo && <span className="flex items-center gap-1" style={{ color: 'var(--color-primary)' }}><Play size={12} /> 视频</span>}
                    {hasText && <span className="flex items-center gap-1" style={{ color: 'var(--color-secondary-green)' }}><FileText size={12} /> 图文</span>}
                  </div>
                </button>

                {isExpanded && (
                  <div style={{ borderTop: '1px solid #F4E8ED' }}>
                    <div className="flex border-b" style={{ borderColor: 'var(--border-divider)' }}>
                      <button onClick={() => setViewMode(prev => ({ ...prev, [tool.id]: 'text' }))} disabled={!hasText}
                        className={`flex-1 py-2.5 text-center font-medium transition-all ${mode === 'text' ? '' : ''}`}
                        style={{
                          fontSize: '26rpx',
                          color: mode === 'text' ? 'var(--color-primary)' : 'var(--text-color-minor)',
                          borderBottom: mode === 'text' ? '2px solid #F28FB2' : 'none',
                          opacity: hasText ? 1 : 0.3,
                        }}>📝 图文教程</button>
                      <button onClick={() => setViewMode(prev => ({ ...prev, [tool.id]: 'video' }))} disabled={!hasVideo}
                        className={`flex-1 py-2.5 text-center font-medium transition-all`}
                        style={{
                          fontSize: '26rpx',
                          color: mode === 'video' ? 'var(--color-primary)' : 'var(--text-color-minor)',
                          borderBottom: mode === 'video' ? '2px solid #F28FB2' : 'none',
                          opacity: hasVideo ? 1 : 0.3,
                        }}>🎬 视频教学</button>
                    </div>
                    <div className="p-5">
                      {mode === 'video' && hasVideo && <LazyVideo videoUrl={tool.video_url} title={tool.name} />}
                      {mode === 'text' && (
                        <div className="space-y-4">
                          {tool.usage_steps?.length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-1.5" style={{ fontSize: '26rpx', color: 'var(--color-secondary-green)' }}>
                                <CheckCircle2 size={14} /> 使用方法
                              </h4>
                              <ol className="space-y-1.5">
                                {tool.usage_steps.map((s, i) => (
                                  <li key={i} className="flex gap-2" style={{ fontSize: '26rpx', color: 'var(--text-color-secondary)' }}>
                                    <span style={{ color: 'var(--color-primary)' }}>{i + 1}.</span> {s}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {tool.precautions && (
                            <div className="rounded-2xl p-4" style={{ backgroundColor: '#FFF5F8' }}>
                              <h4 className="font-medium mb-1.5 flex items-center gap-1.5" style={{ fontSize: '26rpx', color: 'var(--color-primary)' }}>
                                <AlertTriangle size={14} /> 注意事项
                              </h4>
                              <p style={{ fontSize: '26rpx', color: 'var(--text-color-secondary)' }}>{tool.precautions}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
