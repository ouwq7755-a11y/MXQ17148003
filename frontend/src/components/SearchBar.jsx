import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export default function SearchBar({ placeholder = '搜索教程、材料、工具...', large = false }) {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className={`relative ${large ? 'text-lg' : ''}`}>
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${large ? 'w-5 h-5' : 'w-4 h-4'}`} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`w-full pl-12 pr-4 border border-gray-200 rounded-full
                     focus:outline-none focus:border-primary-300 focus:ring-2 focus:ring-primary-50
                     placeholder-gray-400 transition-all
                     ${large ? 'py-4 text-lg shadow-md' : 'py-3 text-base shadow-sm'}`}
        />
      </div>
    </form>
  )
}
