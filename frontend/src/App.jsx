import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { Home, Sparkles, BookOpen, Package, User } from 'lucide-react'
import Navbar from './components/Navbar'
import HomePage from './pages/Home'
import Tutorials from './pages/Tutorials'
import TutorialDetail from './pages/TutorialDetail'
import Materials from './pages/Materials'
import Tools from './pages/Tools'
import SearchPage from './pages/Search'
import AIDesign from './pages/AIDesign'
import Profile from './pages/Profile'

export const API_BASE = import.meta.env.VITE_API_URL || '/api'

const tabs = [
  { path: '/', label: '首页', icon: Home },
  { path: '/ai-design', label: 'AI设计', icon: Sparkles },
  { path: '/tutorials', label: '教程库', icon: BookOpen },
  { path: '/materials', label: '材料库', icon: Package },
  { path: '/profile', label: '我的', icon: User },
]

export default function App() {
  const location = useLocation()
  const isDetailPage = location.pathname.includes('/tutorials/') && location.pathname !== '/tutorials'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isDetailPage && <Navbar />}
      <main className={`flex-1 ${!isDetailPage ? 'pb-16' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai-design" element={<AIDesign />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/tutorials/:slug" element={<TutorialDetail />} />
          <Route path="/materials" element={<Materials />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      {!isDetailPage && (
        <BottomTabBar currentPath={location.pathname} />
      )}
    </div>
  )
}

function BottomTabBar({ currentPath }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50"
         style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {tabs.map(({ path, label, icon: Icon }) => {
          const active = currentPath === path || (path !== '/' && currentPath.startsWith(path))
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[60px] transition-colors ${
                active ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon className="w-5 h-5" fill={active ? 'currentColor' : 'none'} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] font-medium`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
