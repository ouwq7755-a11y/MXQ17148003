import { SparklesIcon } from 'lucide-react'

export default function Loader({ text = '加载中...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 rounded-full gradient-hero flex items-center justify-center animate-bounce">
        <SparklesIcon className="w-6 h-6 text-white" />
      </div>
      <p className="mt-4 text-gray-500 text-sm">{text}</p>
    </div>
  )
}
