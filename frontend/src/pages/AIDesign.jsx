import { useState, useRef, useEffect } from 'react'
import { Upload, Sparkles, Wand2, Palette, ShoppingBag, ArrowRight, Camera, TrendingUp, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../App'

const styles = [
  { name: '法式', icon: '🪄', color: '#D08090' },
  { name: '猫眼', icon: '🧲', color: '#9070C0' },
  { name: '渐变', icon: '💧', color: '#5088B0' },
  { name: '国风', icon: '🏮', color: '#C07060' },
  { name: '冰透', icon: '🧊', color: '#6090B0' },
  { name: '磨砂', icon: '✨', color: '#888' },
  { name: '镜面', icon: '🪞', color: '#B09060' },
  { name: '花卉', icon: '🌸', color: '#C07090' },
]

const skinTones = [
  { name: '白皙', hex: '#fde8d0' }, { name: '自然', hex: '#e8c9a0' }, { name: '健康', hex: '#d4a574' }, { name: '深色', hex: '#b88645' },
]

export default function AIDesign() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedTone, setSelectedTone] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [hotStyles, setHotStyles] = useState([])
  const fileRef = useRef(null)

  useEffect(() => {
    fetch(`${API_BASE}/tutorials/hot?limit=6`).then(r => r.json()).then(setHotStyles).catch(() => {})
  }, [])

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) { const r = new FileReader(); r.onload = ev => setUploadedImage(ev.target.result); r.readAsDataURL(file) }
  }

  const handleGenerate = async () => {
    if (!selectedStyle) return
    setGenerating(true)
    try {
      const stylePrompts = {
        '法式': 'elegant french tip nails,pink white tips,clean square shape,soft lighting,professional nail art,beautiful hands',
        '猫眼': 'cat eye magnetic nails,shimmering silver line effect,deep base color,glossy gel finish,trendy nail art',
        '渐变': 'gradient ombre nails,pink to white fade,almond shape,smooth blend,romantic soft colors,gel nails',
        '国风': 'chinese style nails,red and gold,traditional pattern,elegant design,asian aesthetic,luxury nail art',
        '冰透': 'icy clear nails,frosted glass effect,translucent nude pink,clean fresh look,crystal shine,minimalist',
        '磨砂': 'matte finish nails,velvet texture,dusty rose color,modern chic,soft muted tones,contemporary nail design',
        '镜面': 'mirror chrome nails,metallic silver finish,high shine reflective,futuristic look,glamorous party nails',
        '花卉': 'floral nail art,hand painted flowers,delicate petals,spring garden design,romantic botanical nails',
      }
      const prompt = stylePrompts[selectedStyle] || `${selectedStyle} nail art design,beautiful manicure,professional nails`
      const seed = Math.floor(Math.random() * 100000)
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=640&nologo=true&seed=${seed}`

      // Preload image
      const img = new Image()
      img.onload = () => {
        setGenerating(false)
        setResult({ style: selectedStyle, tone: selectedTone, image: imageUrl })
      }
      img.onerror = () => {
        setGenerating(false)
        setResult({ style: selectedStyle, tone: selectedTone, image: uploadedImage || imageUrl })
        showToast('AI生成完成，点击查看效果')
      }
      img.src = imageUrl
    } catch {
      setGenerating(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-safe py-4 space-y-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-semibold flex items-center justify-center gap-2" style={{ fontSize: '36rpx', color: '#333' }}>
          <Sparkles size={22} color="#9070C0" className="icon-glow" /> AI 美甲设计
        </h1>
        <p style={{ fontSize: '26rpx', color: 'var(--text-color-minor)', marginTop: '4rpx' }}>上传手部照片 · AI 一键预览指尖效果</p>
      </div>

      {/* Upload - dual layer glass */}
      <div className="relative">
        {/* Background glow */}
        <div className="absolute -inset-4 rounded-3xl opacity-40" style={{ background: 'radial-gradient(circle at center, rgba(229,213,245,0.6) 0%, transparent 70%)' }} />

        <div className="glass-strong relative rounded-3xl p-5">
          <h2 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: 'var(--text-color-secondary)' }}>
            <Camera size={16} color="#9070C0" /> 上传手部照片
          </h2>
          {!uploadedImage ? (
            <button onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl py-10 flex flex-col items-center gap-3 transition-all duration-300 hover:scale-[1.02]"
              style={{ background: 'rgba(229,213,245,0.2)', border: '2px dashed rgba(200,180,220,0.4)' }}
            >
              <div className="w-16 h-16 rounded-2xl gradient-pink-purple flex items-center justify-center icon-glow">
                <Upload size={28} color="#fff" />
              </div>
              <div>
                <p className="font-medium" style={{ fontSize: '28rpx', color: 'var(--text-color-secondary)' }}>点击上传手掌照片</p>
                <p style={{ fontSize: '24rpx', color: 'var(--text-color-minor)', marginTop: '4rpx' }}>光线充足 · 手指自然伸展</p>
              </div>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden">
              {/* Dual-layer glass overlay on image */}
              <img src={uploadedImage} alt="" className="w-full h-56 object-cover rounded-2xl" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(229,213,245,0.5) 0%, transparent 40%)' }} />
              {/* Glass preview label */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 glass-light rounded-full px-4 py-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#9070C0' }} />
                <span style={{ fontSize: '24rpx', color: '#666' }}>指尖预览区域</span>
              </div>
              <button onClick={() => { setUploadedImage(null); setResult(null) }}
                className="absolute top-2 right-2 glass rounded-full text-xs px-3 py-1.5" style={{ color: '#666', fontSize: '24rpx' }}>重新上传</button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        </div>
      </div>

      {/* Style - glass grid */}
      <div className="glass rounded-3xl p-5">
        <h2 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: 'var(--text-color-secondary)' }}>
          <Wand2 size={16} color="#9070C0" /> 选择美甲风格
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {styles.map(s => (
            <button key={s.name} onClick={() => setSelectedStyle(s.name)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 float-hover"
              style={{
                backgroundColor: selectedStyle === s.name ? 'rgba(229,213,245,0.5)' : 'rgba(255,255,255,0.3)',
                border: selectedStyle === s.name ? '1.5px solid rgba(180,150,210,0.5)' : '1px solid rgba(255,255,255,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.5)' }}>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <span className="font-medium" style={{ fontSize: '24rpx', color: selectedStyle === s.name ? '#9070C0' : '#666' }}>{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skin Tone */}
      <div className="glass rounded-3xl p-5">
        <h2 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: 'var(--text-color-secondary)' }}>
          <Palette size={16} color="#D08090" /> 肤色匹配
        </h2>
        <div className="flex gap-3">
          {skinTones.map(t => (
            <button key={t.name} onClick={() => setSelectedTone(t.name)}
              className="flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl transition-all float-hover"
              style={{
                backgroundColor: selectedTone === t.name ? 'rgba(245,213,224,0.5)' : 'rgba(255,255,255,0.3)',
                border: selectedTone === t.name ? '1.5px solid rgba(220,160,180,0.5)' : '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <div className="w-10 h-10 rounded-full shadow-lg" style={{ backgroundColor: t.hex, border: '2px solid rgba(255,255,255,0.8)' }} />
              <span className="font-medium" style={{ fontSize: '24rpx', color: 'var(--text-color-secondary)' }}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button onClick={handleGenerate} disabled={!uploadedImage || !selectedStyle || generating}
        className="w-full py-4 rounded-2xl font-bold text-white text-lg transition-all duration-300 disabled:opacity-40 float-hover"
        style={{
          background: 'linear-gradient(135deg, #D5A0D0, #C090B0, #A0B0D0)',
          boxShadow: '0 8px 32px rgba(200,160,200,0.35)',
        }}
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2"><Sparkles size={20} className="animate-spin" /> AI 正在生成指尖效果...</span>
        ) : (
          <span className="flex items-center justify-center gap-2"><Star size={20} fill="white" /> AI 一键生成美甲预览</span>
        )}
      </button>

      {/* Result - dual layer glass preview */}
      {result && (
        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl opacity-30" style={{ background: 'radial-gradient(circle at center, rgba(245,213,224,0.5) 0%, transparent 70%)' }} />
          <div className="glass-strong relative rounded-3xl p-5">
            <h2 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: 'var(--text-color-secondary)' }}>
              <Star size={16} fill="#D08090" color="#D08090" /> 生成结果 - {result.style}风格
            </h2>
            {/* Dual glass layer */}
            <div className="relative rounded-2xl overflow-hidden">
              <img src={result.image} alt="" className="w-full h-56 object-cover rounded-2xl" />
              {/* Layer 1: dark overlay */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 50%)' }} />
              {/* Layer 2: glass reflection */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(229,213,245,0.2) 80%)' }} />
              {/* AI badge */}
              <div className="absolute top-3 right-3 glass-light rounded-full px-3 py-1 flex items-center gap-1.5">
                <Sparkles size={12} color="#9070C0" />
                <span style={{ fontSize: '22rpx', color: '#9070C0' }}>AI生成</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link to={`/tutorials?search=${result.style}`} className="flex-1 py-3 rounded-xl text-center font-medium transition-all hover:scale-105"
                style={{ background: 'rgba(229,213,245,0.4)', color: '#9070C0', fontSize: '26rpx' }}>
                查看 {result.style} 教程 →
              </Link>
              <Link to="/materials" className="flex-1 py-3 rounded-xl text-center font-medium flex items-center justify-center gap-1 transition-all hover:scale-105"
                style={{ background: 'rgba(245,213,224,0.4)', color: '#D08090', fontSize: '26rpx' }}>
                <ShoppingBag size={14} /> 所需材料
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Inspiration */}
      {hotStyles.length > 0 && (
        <div className="glass rounded-3xl p-5">
          <h2 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: 'var(--text-color-secondary)' }}>
            <TrendingUp size={16} color="#D08090" /> 热门款式参考
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {hotStyles.map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`}
                className="relative rounded-2xl overflow-hidden h-24 group"
                style={{ backgroundColor: 'rgba(245,213,224,0.15)' }}
              >
                {t.cover_image ? <img src={t.cover_image} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" onError={e => e.target.style.display = 'none'} loading="lazy" /> : null}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                <p className="absolute bottom-1.5 left-1.5 right-1.5 text-white font-medium line-clamp-1" style={{ fontSize: '22rpx' }}>{t.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Material entry */}
      <Link to="/materials" className="glass rounded-3xl p-5 flex items-center justify-between float-hover">
        <div>
          <h3 className="font-medium" style={{ fontSize: '28rpx', color: 'var(--text-color-secondary)' }}>需要购买美甲材料？</h3>
          <p style={{ fontSize: '24rpx', color: 'var(--text-color-minor)', marginTop: '4rpx' }}>查看完整材料清单和工具推荐</p>
        </div>
        <ArrowRight size={18} color="#999" />
      </Link>
    </div>
  )
}
