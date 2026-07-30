import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { API_BASE } from '../App'
import { categoryIcons } from '../components/Card'
import Loader from '../components/Loader'
import { Play, Clock, Eye } from 'lucide-react'

const difficulties = [
  { value: '', label: '全部难度' },
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '进阶' },
  { value: 'advanced', label: '精通' },
]

export default function Tutorials() {
  const [sp, setSp] = useSearchParams()
  const [tutorials, setTutorials] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const cat = sp.get('category') || ''
  const diff = sp.get('difficulty') || ''

  useEffect(() => {
    fetch(`${API_BASE}/categories`).then(r => r.json()).then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (cat) p.set('category_id', cat)
    if (diff) p.set('difficulty', diff)
    p.set('page', page.toString())
    p.set('page_size', '12')
    fetch(`${API_BASE}/tutorials?${p}`).then(r => r.json())
      .then(d => { setTutorials(d.items || []); setTotal(d.total || 0) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [cat, diff, page])

  const setFilter = (k, v) => {
    const n = new URLSearchParams(sp)
    v ? n.set(k, v) : n.delete(k)
    setSp(n); setPage(1)
  }

  const catObj = categories.find(c => c.id.toString() === cat)

  return (
    <div className="max-w-lg mx-auto px-safe py-4" style={{ background: '#FFFCFD' }}>
      <h1 className="font-semibold mb-1" style={{ fontSize: '36rpx', color: '#222' }}>
        {catObj ? catObj.name_cn : '全部教程'}
      </h1>
      <p style={{ fontSize: '24rpx', color: '#999', marginBottom: '24rpx' }}>
        {catObj ? catObj.description : `共 ${total} 个教程 · 每日更新`}
      </p>

      {/* Filter pills */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        {difficulties.map(d => (
          <button key={d.value} onClick={() => setFilter('difficulty', d.value)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: diff === d.value ? '#F28FB2' : '#FFE6EF',
              color: diff === d.value ? '#fff' : '#F28FB2',
              fontSize: '26rpx',
            }}
          >{d.label}</button>
        ))}
      </div>

      {/* Category quick select */}
      <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
        <button onClick={() => setFilter('category', '')}
          className="shrink-0 px-3 py-1.5 rounded-full text-xs transition-all"
          style={{ backgroundColor: !cat ? '#F28FB2' : '#F4F4F4', color: !cat ? '#fff' : '#999' }}
        >全部</button>
        {categories.slice(0, 10).map(c => (
          <button key={c.id} onClick={() => setFilter('category', c.id.toString())}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs transition-all"
            style={{ backgroundColor: cat === c.id.toString() ? '#F28FB2' : '#F4F4F4', color: cat === c.id.toString() ? '#fff' : '#999' }}
          >{categoryIcons[c.icon]} {c.name_cn}</button>
        ))}
      </div>

      {/* Tutorial cards */}
      {loading ? <Loader /> : tutorials.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl">🔍</span>
          <p className="mt-2" style={{ color: '#999' }}>暂无教程，换个筛选试试</p>
        </div>
      ) : (
        <div className="space-y-card">
          {tutorials.map(t => (
            <Link key={t.id} to={`/tutorials/${t.slug}`}
              className="flex gap-4 bg-white rounded-3xl shadow-card p-3 card-hover"
            >
              <div className="w-28 h-28 rounded-2xl bg-gray-50 shrink-0 overflow-hidden relative flex items-center justify-center">
                {t.cover_image ? (
                  <img src={t.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover"
                    onError={e => e.target.style.display = 'none'} loading="lazy" />
                ) : null}
                <span className="text-3xl opacity-25">{categoryIcons[categories.find(c => c.id === t.category_id)?.icon] || '💅'}</span>
                {t.video_url && (
                  <div className="absolute bottom-1 left-1 rounded-full px-1.5 py-0.5 flex items-center gap-0.5"
                       style={{ backgroundColor: '#FFE6EF', color: '#F28FB2', fontSize: '20rpx' }}>
                    <Play size={10} fill="#F28FB2" /> 视频
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 py-1">
                <h3 className="font-medium line-clamp-2 leading-snug" style={{ fontSize: '28rpx', color: '#222' }}>{t.title}</h3>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <span className="tag-badge" style={{ fontSize: '22rpx' }}>{t.duration_minutes}分钟</span>
                  <span className="tag-green" style={{ fontSize: '22rpx' }}>{t.difficulty === 'beginner' ? '入门' : t.difficulty === 'intermediate' ? '进阶' : '精通'}</span>
                  <span className="tag-blue" style={{ fontSize: '22rpx' }}>{t.category_name}</span>
                </div>
                <div className="flex items-center gap-3 mt-2" style={{ fontSize: '22rpx', color: '#999' }}>
                  <span className="flex items-center gap-0.5"><Eye size={12} /> {t.view_count || 0} 学习</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {total > 12 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 rounded-full text-sm disabled:opacity-30" style={{ color: '#F28FB2' }}>上一页</button>
          <span className="px-3 py-2" style={{ color: '#999', fontSize: '24rpx' }}>{page}/{Math.ceil(total/12)}</span>
          <button disabled={page >= Math.ceil(total/12)} onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 rounded-full text-sm disabled:opacity-30" style={{ color: '#F28FB2' }}>下一页</button>
        </div>
      )}
    </div>
  )
}
