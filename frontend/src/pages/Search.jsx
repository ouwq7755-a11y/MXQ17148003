import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, BookOpen, Package, Wrench, Sparkles } from 'lucide-react'
import { API_BASE } from '../App'
import Loader from '../components/Loader'

export default function Search() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) return
    setLoading(true)
    fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      .then(r => r.ok ? r.json() : Promise.reject('Search failed'))
      .then(data => setResults(data))
      .catch(() => setResults({ tutorials: [], materials: [], tools: [] }))
      .finally(() => setLoading(false))
  }, [query])

  if (!query.trim()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-500">请输入搜索关键词</h2>
        <p className="text-gray-400 text-sm mt-2">搜索教程、材料、工具等美甲相关内容</p>
      </div>
    )
  }

  if (loading) return <Loader text={`正在搜索 "${query}"...`} />

  const totalHits = results
    ? results.tutorials.length + results.materials.length + results.tools.length
    : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">
          搜索 "{query}"
        </h1>
        <p className="text-gray-500 text-sm">
          {results ? `找到 ${totalHits} 个相关结果` : '搜索中...'}
        </p>
      </div>

      {!results ? null : totalHits === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">未找到相关内容</h3>
          <p className="text-gray-500 text-sm mb-6">尝试使用不同的关键词搜索</p>
          <div className="flex gap-3 justify-center">
            <Link to="/tutorials" className="btn-primary text-sm">浏览教程</Link>
            <Link to="/materials" className="btn-outline text-sm">查看材料</Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tutorials */}
          {results.tutorials.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-500" />
                教程 ({results.tutorials.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.tutorials.map(t => (
                  <Link key={t.id} to={`/tutorials/${t.slug}`}
                    className="bg-white rounded-xl p-5 shadow-sm card-hover flex gap-4"
                  >
                    <div className="w-14 h-14 rounded-xl gradient-hero flex items-center justify-center text-2xl shrink-0">
                      💅
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 mb-1">{t.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-1">{t.description}</p>
                      <span className="inline-block mt-2 text-xs text-primary-500">{t.category_name}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Materials */}
          {results.materials.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-purple-500" />
                材料 ({results.materials.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.materials.map(m => (
                  <Link key={m.id} to="/materials"
                    className="bg-white rounded-xl p-5 shadow-sm card-hover"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">📦</span>
                      {m.is_professional && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-600">专业级</span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-800 mb-1">{m.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{m.description}</p>
                    <span className="text-xs font-medium text-primary-600">{m.price_range}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Tools */}
          {results.tools.length > 0 && (
            <section>
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" />
                工具 ({results.tools.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.tools.map(t => (
                  <Link key={t.id} to="/tools"
                    className="bg-white rounded-xl p-5 shadow-sm card-hover"
                  >
                    <h3 className="font-semibold text-sm text-gray-800 mb-1">{t.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{t.description}</p>
                    <span className="text-xs text-primary-500">{t.price_range}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
