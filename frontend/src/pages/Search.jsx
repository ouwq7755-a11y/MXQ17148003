import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search as SearchIcon, BookOpen, Package, Wrench, TrendingUp } from 'lucide-react'
import { API_BASE } from '../App'
import Loader, { EmptyState } from '../components/Loader'

export default function Search() {
  const [sp] = useSearchParams()
  const query = sp.get('q') || ''
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) return
    setLoading(true)
    fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`)
      .then(r => r.ok ? r.json() : { tutorials: [], materials: [], tools: [] })
      .then(setResults).catch(() => setResults({ tutorials: [], materials: [], tools: [] }))
      .finally(() => setLoading(false))
  }, [query])

  if (!query.trim()) {
    return (
      <div className="max-w-lg mx-auto px-safe py-4" style={{ background: '#FFFCFD', minHeight: '100vh' }}>
        <div className="relative mb-6">
          <SearchIcon size={18} color="#999" className="absolute left-4 top-1/2 -translate-y-1/2" />
          <input autoFocus placeholder="搜索教程、材料、工具..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl text-sm outline-none shadow-card"
            style={{ backgroundColor: '#FFF', border: '1px solid #F4E8ED', fontSize: '28rpx' }}
            onKeyDown={e => { if (e.key === 'Enter' && e.target.value.trim()) window.location.href = `/search?q=${encodeURIComponent(e.target.value.trim())}` }} />
        </div>
        <EmptyState icon="🔍" title="输入关键词搜索" message="搜索美甲教程、材料、工具等内容" />
      </div>
    )
  }

  if (loading) return <div className="max-w-lg mx-auto py-12" style={{ background: '#FFFCFD' }}><Loader text={`搜索 "${query}"...`} /></div>

  const total = results ? results.tutorials.length + results.materials.length + results.tools.length : 0

  return (
    <div className="max-w-lg mx-auto px-safe py-4" style={{ background: '#FFFCFD' }}>
      <h1 className="font-semibold mb-1" style={{ fontSize: '32rpx', color: '#222' }}>搜索 "{query}"</h1>
      <p style={{ fontSize: '24rpx', color: '#999', marginBottom: '24rpx' }}>{total > 0 ? `找到 ${total} 个结果` : '未找到相关内容'}</p>

      {!results ? null : total === 0 ? (
        <EmptyState icon="🔍" title="未找到相关内容" message="试试其他关键词"
          link={<Link to="/tutorials" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium mt-4" style={{ backgroundColor: '#F28FB2', fontSize: '26rpx' }}><TrendingUp size={16} /> 浏览全部教程</Link>} />
      ) : (
        <div className="space-y-section">
          {results.tutorials.length > 0 && (
            <Section title="教程" icon={<BookOpen size={16} color="#F28FB2" />} count={results.tutorials.length}>
              {results.tutorials.map(t => (
                <ResultCard key={t.id} to={`/tutorials/${t.slug}`} title={t.title} desc={t.description} meta={t.category_name} cover={t.cover_image} />
              ))}
            </Section>
          )}
          {results.materials.length > 0 && (
            <Section title="材料" icon={<Package size={16} color="#48A8E6" />} count={results.materials.length}>
              {results.materials.map(m => (
                <ResultCard key={m.id} to="/materials" title={m.name} desc={m.description} meta={m.price_range} />
              ))}
            </Section>
          )}
          {results.tools.length > 0 && (
            <Section title="工具" icon={<Wrench size={16} color="#62C490" />} count={results.tools.length}>
              {results.tools.map(t => (
                <ResultCard key={t.id} to="/tools" title={t.name} desc={t.description} meta={t.price_range} />
              ))}
            </Section>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, icon, count, children }) {
  return (
    <div>
      <h2 className="font-semibold mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: '#222' }}>
        {icon} {title}
        <span style={{ fontSize: '24rpx', color: '#999', fontWeight: 400 }}>({count})</span>
      </h2>
      <div className="space-y-card">{children}</div>
    </div>
  )
}

function ResultCard({ to, title, desc, meta, cover }) {
  return (
    <Link to={to} className="flex gap-3 bg-white rounded-2xl shadow-card p-3 card-hover">
      <div className="w-16 h-16 rounded-2xl bg-gray-50 shrink-0 flex items-center justify-center overflow-hidden">
        {cover ? <img src={cover} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} loading="lazy" />
          : <span className="text-xl opacity-30">💅</span>}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium line-clamp-1" style={{ fontSize: '26rpx', color: '#222' }}>{title}</h3>
        <p className="line-clamp-1 mt-0.5" style={{ fontSize: '24rpx', color: '#999' }}>{desc}</p>
        {meta && <span className="tag-blue mt-1.5" style={{ fontSize: '22rpx' }}>{meta}</span>}
      </div>
    </Link>
  )
}
