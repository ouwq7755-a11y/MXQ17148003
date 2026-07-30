import { useState, useEffect } from 'react'
import { Wrench, Search, AlertTriangle, CheckCircle2, DollarSign, Play, FileText } from 'lucide-react'
import { API_BASE } from '../App'
import Loader from '../components/Loader'
import LazyVideo from '../components/LazyVideo'

const toolCategoryLabels = {
  basic: { label: '基础工具', icon: '✂️' },
  lamp: { label: '光疗灯', icon: '💡' },
  painting: { label: '彩绘笔', icon: '🖌️' },
  auxiliary: { label: '辅助工具', icon: '🔧' },
}

export default function Tools() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [viewMode, setViewMode] = useState({}) // per-tool: 'video' | 'text'

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)

    fetch(`${API_BASE}/tools?${params.toString()}`)
      .then(r => r.json())
      .then(setTools)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, search])

  const handleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }
    setExpandedId(id)
    // Default to video mode when expanding
    if (!viewMode[id]) {
      setViewMode(prev => ({ ...prev, [id]: 'video' }))
    }
    // Fetch full details
    fetch(`${API_BASE}/tools/${id}`)
      .then(r => r.json())
      .then(fullData => {
        setTools(prev => prev.map(t => t.id === id ? { ...t, ...fullData } : t))
      })
      .catch(() => {})
  }

  const toggleMode = (id, mode) => {
    setViewMode(prev => ({ ...prev, [id]: mode }))
  }

  const filtered = tools

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Wrench className="w-8 h-8 text-primary-500" />
          美甲工具教学
        </h1>
        <p className="text-gray-500">17种常用美甲工具详解：视频教学 + 图文教程双模式</p>
      </div>

      {/* Search + Category Filter */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-8 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索工具名称..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCategory('')}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              !category ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>全部工具</button>
          {Object.entries(toolCategoryLabels).map(([key, { label, icon }]) => (
            <button key={key} onClick={() => setCategory(key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                category === key ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>{icon} {label}</button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">🔧</div>
          <h3 className="text-lg font-semibold text-gray-700">暂无工具数据</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(tool => {
            const catInfo = toolCategoryLabels[tool.category] || { label: tool.category, icon: '🔧' }
            const isExpanded = expandedId === tool.id
            const mode = viewMode[tool.id] || 'video'
            const hasVideo = !!tool.video_url
            const hasText = tool.usage_steps?.length > 0 || tool.precautions

            return (
              <div key={tool.id}
                className={`bg-white rounded-2xl shadow-sm transition-all duration-300 ${
                  isExpanded ? 'ring-2 ring-primary-200 shadow-md' : 'card-hover'
                }`}
              >
                {/* Card Header */}
                <button onClick={() => handleExpand(tool.id)} className="w-full text-left p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{catInfo.icon}</span>
                      <span className="text-xs font-medium text-gray-400">{catInfo.label}</span>
                    </div>
                    {tool.price_range && (
                      <span className="text-xs text-primary-500 font-medium flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> {tool.price_range}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{tool.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{tool.description}</p>
                  <div className="flex items-center gap-3 mt-3">
                    {hasVideo && <span className="text-xs text-primary-500 flex items-center gap-1"><Play className="w-3 h-3" /> 视频</span>}
                    {hasText && <span className="text-xs text-green-500 flex items-center gap-1"><FileText className="w-3 h-3" /> 图文</span>}
                    {!isExpanded && <span className="text-xs text-primary-400 ml-auto">点击展开 →</span>}
                  </div>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-100">
                    {/* Mode Tabs */}
                    <div className="flex border-b border-gray-100">
                      <button
                        onClick={() => toggleMode(tool.id, 'video')}
                        disabled={!hasVideo}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                          mode === 'video'
                            ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                            : 'text-gray-400 hover:text-gray-600'
                        } ${!hasVideo ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <Play className="w-3.5 h-3.5" /> 视频教学
                      </button>
                      <button
                        onClick={() => toggleMode(tool.id, 'text')}
                        disabled={!hasText}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                          mode === 'text'
                            ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
                            : 'text-gray-400 hover:text-gray-600'
                        } ${!hasText ? 'opacity-30 cursor-not-allowed' : ''}`}
                      >
                        <FileText className="w-3.5 h-3.5" /> 图文教程
                      </button>
                    </div>

                    <div className="p-5">
                      {/* Video Mode */}
                      {mode === 'video' && hasVideo && (
                        <LazyVideo
                          videoUrl={tool.video_url}
                          coverImage={tool.image_url}
                          title={tool.name}
                        />
                      )}

                      {/* Text Mode */}
                      {mode === 'text' && (
                        <div className="space-y-4">
                          {tool.usage_steps?.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                使用方法
                              </h4>
                              <ol className="space-y-1.5">
                                {tool.usage_steps.map((step, i) => (
                                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                                    <span className="text-primary-400 font-medium shrink-0">{i + 1}.</span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}
                          {tool.precautions && (
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                                注意事项
                              </h4>
                              <p className="text-sm text-amber-700 bg-amber-50 rounded-xl p-3">{tool.precautions}</p>
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
