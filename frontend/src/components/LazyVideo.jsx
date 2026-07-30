import { useState } from 'react'
import { Play, ExternalLink, Copy, Check } from 'lucide-react'

/**
 * Smart video component:
 * - Local videos (/videos/*): HTML5 player, instant playback
 * - External videos (Bilibili): Compact link card
 */
export default function LazyVideo({ videoUrl, coverImage, title }) {
  const [copied, setCopied] = useState(false)

  const isLocal = videoUrl?.startsWith('/videos/')

  if (!videoUrl) return null

  // ── LOCAL VIDEO: HTML5 player ──────────────────────
  if (isLocal) {
    return (
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
          <span>🎬</span> 视频教学
          <span className="text-xs font-normal text-gray-400">720p · 有声</span>
        </h3>
        <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
          <video
            src={videoUrl}
            controls
            controlsList="nodownload"
            preload="auto"
            playsInline
            crossOrigin="anonymous"
            className="w-full max-h-[500px]"
            style={{ background: '#000' }}
          >
            <track kind="captions" />
            您的浏览器不支持视频播放
          </video>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          本地高清视频 · 点击播放器右下角音量图标确保声音开启 🔊
        </p>
      </div>
    )
  }

  // ── EXTERNAL: Bilibili link card ────────────────────
  const bvidMatch = videoUrl?.match(/bvid=(BV[a-zA-Z0-9]{10})/)
  const bvid = bvidMatch ? bvidMatch[1] : null
  const directUrl = bvid ? `https://www.bilibili.com/video/${bvid}` : null

  const handleCopy = () => {
    if (directUrl) {
      navigator.clipboard.writeText(directUrl).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="mb-2">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
        <span>🎬</span> 视频教程
        <span className="text-xs font-normal text-gray-400">（外部链接）</span>
      </h3>
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-5 border border-pink-100">
        <p className="text-sm text-gray-700 mb-3 line-clamp-1">{title}</p>
        <div className="flex gap-2">
          {directUrl && (
            <a href={directUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium
                         hover:bg-primary-600 transition-colors shadow-sm">
              <Play className="w-4 h-4" fill="currentColor" />
              打开B站观看
              <ExternalLink className="w-3 h-3 opacity-70" />
            </a>
          )}
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white text-gray-600 rounded-xl text-sm font-medium
                       hover:bg-gray-50 transition-colors border border-gray-200">
            {copied ? <><Check className="w-4 h-4 text-green-500" />已复制</> : <><Copy className="w-4 h-4" />复制链接</>}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">如无法播放，可复制链接到B站App尝试</p>
      </div>
    </div>
  )
}
