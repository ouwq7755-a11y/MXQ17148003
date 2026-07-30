import { useState, useEffect } from 'react'
import { Search, Package } from 'lucide-react'
import { API_BASE } from '../App'
import Loader from '../components/Loader'

const catOpts = [
  { v: '', l: '全部', i: '📦' },
  { v: 'gel', l: '甲油胶', i: '🎨' },
  { v: 'decoration', l: '装饰', i: '💎' },
  { v: 'accessory', l: '耗材', i: '🔧' },
]

export default function Materials() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [pro, setPro] = useState(null)

  useEffect(() => {
    setLoading(true)
    const p = new URLSearchParams()
    if (category) p.set('category', category)
    if (search) p.set('search', search)
    if (pro !== null) p.set('is_professional', pro.toString())
    fetch(`${API_BASE}/materials?${p}`).then(r => r.json()).then(setMaterials).catch(() => {}).finally(() => setLoading(false))
  }, [category, search, pro])

  return (
    <div className="max-w-lg mx-auto px-safe py-4" style={{ background: '#FFFCFD' }}>
      <h1 className="font-semibold mb-1 flex items-center gap-2" style={{ fontSize: '36rpx', color: '#222' }}>
        <Package size={22} color="#48A8E6" /> 材料数据库
      </h1>
      <p style={{ fontSize: '24rpx', color: '#999', marginBottom: '24rpx' }}>耗材参数 · 使用指南 · 价格参考 · 选购建议</p>

      {/* Search + Filters */}
      <div className="bg-white rounded-3xl shadow-card p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={16} color="#999" className="absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索材料名称..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none"
            style={{ backgroundColor: '#FFFCFD', border: '1px solid #F4E8ED', fontSize: '28rpx', color: '#555' }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {catOpts.map(o => (
            <button key={o.v} onClick={() => setCategory(o.v)}
              className="px-4 py-2 rounded-full text-sm transition-all"
              style={{
                backgroundColor: category === o.v ? '#E6F3FF' : '#F4F4F4',
                color: category === o.v ? '#48A8E6' : '#999',
                fontSize: '26rpx',
              }}>{o.i} {o.l}</button>
          ))}
          <div className="w-px bg-[#F4E8ED]" />
          <button onClick={() => setPro(null)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{ backgroundColor: pro === null ? '#FFE6EF' : '#F4F4F4', color: pro === null ? '#F28FB2' : '#999', fontSize: '26rpx' }}>全部</button>
          <button onClick={() => setPro(0)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{ backgroundColor: pro === 0 ? '#E6F7EF' : '#F4F4F4', color: pro === 0 ? '#62C490' : '#999', fontSize: '26rpx' }}>新手适用</button>
          <button onClick={() => setPro(1)}
            className="px-4 py-2 rounded-full text-sm transition-all"
            style={{ backgroundColor: pro === 1 ? '#F3EDFF' : '#F4F4F4', color: pro === 1 ? '#9D76E8' : '#999', fontSize: '26rpx' }}>专业级</button>
        </div>
      </div>

      {/* Cards */}
      {loading ? <Loader /> : materials.length === 0 ? (
        <div className="text-center py-20"><span className="text-5xl">📦</span><p style={{ color: '#999', marginTop: '8rpx' }}>暂无材料数据</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {materials.map(m => (
            <div key={m.id} className="bg-white rounded-3xl shadow-card card-hover" style={{ padding: '32rpx' }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E6F3FF' }}>
                  <Package size={20} color="#48A8E6" strokeWidth={2} />
                </div>
                <span className="rounded-full px-2.5 py-1"
                  style={{
                    backgroundColor: m.is_professional ? '#F3EDFF' : '#E6F7EF',
                    color: m.is_professional ? '#9D76E8' : '#62C490',
                    fontSize: '22rpx', fontWeight: 500,
                  }}>{m.is_professional ? '专业级' : '新手适用'}</span>
              </div>
              <h3 className="font-medium mb-1" style={{ fontSize: '28rpx', color: '#222' }}>{m.name}</h3>
              <p style={{ fontSize: '26rpx', color: '#555', lineHeight: 1.6, marginBottom: '16rpx' }}>{m.description}</p>

              {/* Usage guide */}
              {m.usage_guide && (
                <div className="rounded-2xl mb-4" style={{ backgroundColor: '#FFE6EF', padding: '24rpx' }}>
                  <p style={{ fontSize: '26rpx', color: '#555' }}><strong style={{ color: '#222' }}>使用方法：</strong>{m.usage_guide}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #F4E8ED' }}>
                <span style={{ fontSize: '28rpx', color: '#F28FB2', fontWeight: 500 }}>{m.price_range || '价格待查'}</span>
                {m.category && (
                  <span className="tag-blue" style={{ fontSize: '22rpx' }}>{m.category}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
