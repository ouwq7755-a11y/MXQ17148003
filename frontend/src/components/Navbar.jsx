import { Link } from 'react-router-dom'
import { Sparkles, Search } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-50">
      <div className="max-w-lg mx-auto px-4 h-12 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-hero flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-gray-800">美甲学院</span>
        </Link>
        <Link to="/search" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
          <Search className="w-4 h-4 text-gray-500" />
        </Link>
      </div>
    </header>
  )
}
