import { useState } from 'react'
import { Play, Loader2 } from 'lucide-react'

/**
 * Video component with in-site playback:
 * - Local videos: HTML5 player
 * - Bilibili videos: iframe embed (click to load)
 */
export default function LazyVideo({ videoUrl, coverImage, title }) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)

  const isLocal = videoUrl?.startsWith('/videos/')
  const isEmbed = videoUrl?.includes('bilibili')

  if (!videoUrl) return null

  // ── LOCAL VIDEO: HTML5 player ──────────────────────
  if (isLocal) {
    return (
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
          <span>🎬</span> 视频教学 <span className="text-xs font-normal text-gray-400">720p</span>
        </h3>
        <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg">
          <video src={videoUrl} controls preload="metadata" playsInline
            className="w-full max-h-[500px]" style={{ background: '#000' }} />
        </div>
      </div>
    )
  }

  // ── BILIBILI EMBED ──────────────────────────────────
  if (isEmbed) {
    const bvidMatch = videoUrl.match(/bvid=(BV[a-zA-Z0-9]{10})/)
    const bvid = bvidMatch ? bvidMatch[1] : null
    const embedUrl = bvid
      ? `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&high_quality=1&autoplay=1&danmaku=0`
      : null

    // Cover image from Bilibili
    const cover = coverImage || (bvid
      ? `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
      : null)

    const handlePlay = () => {
      setPlaying(true)
      setLoading(true)
    }

    return (
      <div className="mb-2">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
          <span>🎬</span> 视频教学
        </h3>

        {!playing ? (
          <button onClick={handlePlay}
            className="relative w-full rounded-xl overflow-hidden shadow-md group"
            style={{ paddingBottom: '56.25%' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-100 via-rose-100 to-purple-200 flex items-center justify-center">
              <span className="text-6xl opacity-30">💅</span>
            </div>
            {cover && !cover.startsWith('https://api.bilibili.com') && (
              <img src={cover} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-50"
                onError={e => e.target.style.display = 'none'} />
            )}
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 flex items-center justify-center shadow-xl transition-all">
                <Play className="w-7 h-7 text-primary-500 ml-1" fill="currentColor" />
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              点击播放教学视频
            </div>
          </button>
        ) : (
          <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              </div>
            )}
            {embedUrl && (
              <iframe src={embedUrl} scrolling="no" frameBorder="0" allowFullScreen
                className="absolute inset-0 w-full h-full" title={title}
                onLoad={() => setLoading(false)}
              />
            )}
          </div>
        )}
        <p className="text-xs text-gray-400 mt-2 text-center">B站高清教学视频 · 站内直接播放</p>
      </div>
    )
  }

  // Fallback
  return null
}

/**
 * Generate cover image URL from Bilibili BV ID
 */
export function getBilibiliCover(bvid) {
  if (!bvid) return null
  return `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`
}
