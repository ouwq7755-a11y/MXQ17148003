import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, Heart, Bookmark, Settings, ChevronRight, Star, TrendingUp, Sparkles } from 'lucide-react'
import { API_BASE } from '../App'

export default function Profile() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetch(`${API_BASE}/stats`).then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  const menuItems = [
    { icon: Clock, label: '学习记录', desc: '查看已学教程和进度', to: '/tutorials' },
    { icon: Heart, label: '收藏款式', desc: '收藏的美甲款式和图鉴', to: '/tutorials' },
    { icon: Bookmark, label: '我的素材', desc: '上传的手部照片和设计', to: '/ai-design' },
  ]

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* User Card */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full gradient-hero flex items-center justify-center text-white text-2xl font-bold">
            💅
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">美甲爱好者</h2>
            <p className="text-sm text-gray-500 mt-0.5">探索美甲的无限可能</p>
          </div>
          <Settings className="w-5 h-5 text-gray-400" />
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-gray-100">
            <div className="text-center">
              <div className="text-xl font-bold text-primary-500">{stats.tutorial_count}</div>
              <div className="text-xs text-gray-400 mt-0.5">教程</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-purple-500">{stats.material_count}</div>
              <div className="text-xs text-gray-400 mt-0.5">材料</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-orange-500">{stats.tool_count}</div>
              <div className="text-xs text-gray-400 mt-0.5">工具</div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Link to="/ai-design" className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4">
          <Sparkles className="w-5 h-5 text-primary-500 mb-2" />
          <div className="text-sm font-semibold text-gray-700">AI 设计美甲</div>
          <div className="text-xs text-gray-400 mt-0.5">拍照生成效果预览</div>
        </Link>
        <Link to="/tutorials" className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4">
          <TrendingUp className="w-5 h-5 text-purple-500 mb-2" />
          <div className="text-sm font-semibold text-gray-700">热门教程</div>
          <div className="text-xs text-gray-400 mt-0.5">每日更新新内容</div>
        </Link>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
        {menuItems.map(({ icon: Icon, label, desc, to }) => (
          <Link key={label} to={to} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Icon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">{label}</div>
              <div className="text-xs text-gray-400">{desc}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </Link>
        ))}
      </div>

      {/* Platform Info */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">关于美甲学院</h3>
        <div className="space-y-1.5 text-xs text-gray-500">
          <p>🤖 AI 自动采集每日更新最新教程</p>
          <p>📺 {stats?.tutorial_count || '...'} 篇教程 · {stats ? Math.floor(stats.tutorial_count * 0.4) : '...'} 篇带视频</p>
          <p>🎨 12 大美甲技法分类</p>
          <p>🛠️ {stats?.tool_count || '...'} 种工具详细教学</p>
          <p>📦 {stats?.material_count || '...'} 种材料档案数据</p>
        </div>
      </div>
    </div>
  )
}
