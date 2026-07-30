import { useState, useEffect } from 'react'
import { Search, Package, ShoppingBag, Star, Filter } from 'lucide-react'
import { API_BASE } from '../App'
import Loader from '../components/Loader'

const categoryOptions = [
  { value: '', label: '全部类型', icon: '📦' },
  { value: 'gel', label: '甲油胶类', icon: '🎨' },
  { value: 'decoration', label: '装饰材料', icon: '💎' },
  { value: 'accessory', label: '辅助耗材', icon: '🔧' },
  { value: 'tool', label: '工具类', icon: '🛠️' },
]

export default function Materials() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [professional, setProfessional] = useState(null) // null=all, 1=pro, 0=beginner

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (search) params.set('search', search)
    if (professional !== null) params.set('is_professional', professional.toString())

    fetch(`${API_BASE}/materials?${params.toString()}`)
      .then(r => r.json())
      .then(setMaterials)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [category, search, professional])

  const filtered = materials

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <Package className="w-8 h-8 text-primary-500" />
          美甲材料数据库
        </h1>
        <p className="text-gray-500">详细的材料参数、用途指南、价格参考与选购建议</p>
      </div>

      {/* Search + Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索材料名称..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm
                         focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-50"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-primary-300"
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={() => setProfessional(null)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                professional === null ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setProfessional(0)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                professional === 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              新手适用
            </button>
            <button
              onClick={() => setProfessional(1)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                professional === 1 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              专业级
            </button>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-lg font-semibold text-gray-700">暂无材料数据</h3>
          <p className="text-gray-500 text-sm">请确认后端 API 已启动</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(mat => (
            <div key={mat.id} className="bg-white rounded-2xl p-6 shadow-sm card-hover flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">
                    {mat.category === 'gel' ? '🎨' : mat.category === 'decoration' ? '💎' : mat.category === 'accessory' ? '🔧' : '📦'}
                  </span>
                  <span className="text-xs font-medium text-gray-400 uppercase">
                    {mat.category}
                  </span>
                </div>
                <div className="flex gap-1">
                  {mat.is_professional ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">专业级</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">新手适用</span>
                  )}
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">{mat.name}</h3>
              <p className="text-sm text-gray-500 mb-4 flex-1 line-clamp-2">{mat.description}</p>

              {mat.usage_guide && (
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">使用方法：</span>{mat.usage_guide}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-sm font-medium text-primary-600">
                  {mat.price_range || '价格待查'}
                </span>
                {mat.brand && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" /> {mat.brand}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
