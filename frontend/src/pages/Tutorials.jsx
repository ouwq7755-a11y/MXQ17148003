import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Filter, X } from 'lucide-react'
import { API_BASE } from '../App'
import Card, { categoryIcons } from '../components/Card'
import Loader from '../components/Loader'

const difficultyOptions = [
  { value: '', label: '全部难度' },
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '进阶' },
  { value: 'advanced', label: '高级' },
]

export default function Tutorials() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tutorials, setTutorials] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const activeCategory = searchParams.get('category') || ''
  const activeDifficulty = searchParams.get('difficulty') || ''

  useEffect(() => {
    fetch(`${API_BASE}/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (activeCategory) params.set('category_id', activeCategory)
    if (activeDifficulty) params.set('difficulty', activeDifficulty)
    params.set('page', page.toString())
    params.set('page_size', '12')

    fetch(`${API_BASE}/tutorials?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setTutorials(data.items || [])
        setTotal(data.total || 0)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [activeCategory, activeDifficulty, page])

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
    setSearchParams(next)
    setPage(1)
  }

  const clearFilters = () => {
    setSearchParams({})
    setPage(1)
  }

  const activeCatObj = categories.find(c => c.id.toString() === activeCategory)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          {activeCatObj ? activeCatObj.name_cn : '全部美甲教程'}
        </h1>
        <p className="text-gray-500">
          {activeCatObj
            ? activeCatObj.description
            : `共 ${total} 个教程，涵盖12大美甲技法分类`}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Filter className="w-4 h-4" /> 教程分类
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => updateFilter('category', '')}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !activeCategory ? 'bg-primary-50 text-primary-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  全部教程 ({total})
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => updateFilter('category', cat.id.toString())}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat.id.toString()
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{categoryIcons[cat.icon] || '💅'}</span>
                    {cat.name_cn}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 mb-3">难度等级</h3>
              <div className="space-y-1">
                {difficultyOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => updateFilter('difficulty', opt.value)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeDifficulty === opt.value
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {(activeCategory || activeDifficulty) && (
              <button onClick={clearFilters} className="mt-4 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> 清除筛选
              </button>
            )}
          </div>
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex gap-2 mb-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-600"
          >
            <Filter className="w-4 h-4" /> 筛选
            {(activeCategory || activeDifficulty) && (
              <span className="w-2 h-2 rounded-full bg-primary-500" />
            )}
          </button>
          {activeCategory && activeCatObj && (
            <span className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium flex items-center gap-1">
              {categoryIcons[activeCatObj.icon]} {activeCatObj.name_cn}
              <button onClick={() => updateFilter('category', '')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {activeDifficulty && (
            <span className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium flex items-center gap-1">
              {difficultyOptions.find(d => d.value === activeDifficulty)?.label}
              <button onClick={() => updateFilter('difficulty', '')}>
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <div className="lg:hidden bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
            <div className="grid grid-cols-3 gap-2 mb-4">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { updateFilter('category', cat.id.toString()); setShowFilters(false) }}
                  className={`p-2 rounded-lg text-xs text-center transition-colors ${
                    activeCategory === cat.id.toString()
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-lg">{categoryIcons[cat.icon] || '💅'}</div>
                  {cat.name_cn}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {difficultyOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { updateFilter('difficulty', opt.value); setShowFilters(false) }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    activeDifficulty === opt.value
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tutorial Grid */}
        <div className="flex-1">
          {loading ? (
            <Loader />
          ) : tutorials.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无教程</h3>
              <p className="text-gray-500 text-sm">尝试调整筛选条件，或清除筛选查看全部教程</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {tutorials.map(t => (
                <Card
                  key={t.id}
                  tutorial={t}
                  categoryIcon={categoryIcons[categories.find(c => c.id === t.category_id)?.icon] || '💅'}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {total > 12 && (
            <div className="flex justify-center mt-8 gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200
                           disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-sm text-gray-500">
                {page} / {Math.ceil(total / 12)}
              </span>
              <button
                disabled={page >= Math.ceil(total / 12)}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200
                           disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                下一页
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
