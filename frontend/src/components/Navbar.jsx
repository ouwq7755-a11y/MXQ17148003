import { Link } from 'react-router-dom'
import { Sparkles, Search } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40" style={{
      background: 'rgba(248,244,248,0.6)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.4)',
    }}>
      <div className="max-w-lg mx-auto px-safe h-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Sparkles size={18} color="#9070C0" className="icon-glow" strokeWidth={2} />
          <span className="font-semibold" style={{ fontSize: '32rpx', color: '#444' }}>美甲学院</span>
        </Link>
        <Link to="/search" className="w-8 h-8 flex items-center justify-center rounded-full glass-light">
          <Search size={16} color="#999" strokeWidth={2} />
        </Link>
      </div>
    </header>
  )
}
