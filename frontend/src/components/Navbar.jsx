import { Link } from 'react-router-dom'
import { Sparkles, Search } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'rgba(255,252,253,0.85)', backdropFilter: 'blur(12px)', borderColor: '#F4E8ED' }}>
      <div className="max-w-lg mx-auto px-safe h-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles size={20} color="#F28FB2" strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: '32rpx', color: '#222' }}>美甲学院</span>
        </Link>
        <Link to="/search" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
          <Search size={18} color="#999" strokeWidth={2} />
        </Link>
      </div>
    </header>
  )
}
