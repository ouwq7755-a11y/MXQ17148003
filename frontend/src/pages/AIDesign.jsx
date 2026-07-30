import { useState, useRef, useEffect } from 'react'
import { Upload, Sparkles, Wand2, Palette, ShoppingBag, ArrowRight, Camera, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { API_BASE } from '../App'

const styles = [
  { name: '法式', icon: '🪄', gradient: 'from-pink-100 via-white to-pink-200', dot: 'bg-pink-300' },
  { name: '猫眼', icon: '🧲', gradient: 'from-purple-200 via-indigo-100 to-blue-200', dot: 'bg-purple-400' },
  { name: '渐变', icon: '💧', gradient: 'from-blue-100 via-cyan-100 to-teal-100', dot: 'bg-cyan-400' },
  { name: '国风', icon: '🏮', gradient: 'from-red-100 via-orange-50 to-amber-100', dot: 'bg-red-400' },
  { name: '冰透', icon: '🧊', gradient: 'from-cyan-50 via-blue-50 to-sky-100', dot: 'bg-sky-300' },
  { name: '磨砂', icon: '✨', gradient: 'from-slate-100 via-gray-100 to-zinc-100', dot: 'bg-gray-400' },
  { name: '镜面', icon: '🪞', gradient: 'from-amber-50 via-yellow-50 to-orange-100', dot: 'bg-amber-400' },
  { name: '花卉', icon: '🌸', gradient: 'from-pink-100 via-rose-100 to-fuchsia-100', dot: 'bg-pink-400' },
]

const skinTones = [
  { name: '白皙', hex: '#fde8d0', desc: '偏白肤色' },
  { name: '自然', hex: '#e8c9a0', desc: '自然肤质' },
  { name: '健康', hex: '#d4a574', desc: '健康小麦' },
  { name: '深色', hex: '#b88645', desc: '深色肌肤' },
]

export default function AIDesign() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedTone, setSelectedTone] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [hotStyles, setHotStyles] = useState([])
  const fileRef = useRef(null)

  // Load some tutorial previews for style inspiration
  useEffect(() => {
    fetch(`${API_BASE}/tutorials/hot?limit=6`)
      .then(r => r.json()).then(setHotStyles).catch(() => {})
  }, [])

  const handleUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setUploadedImage(ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = () => {
    if (!uploadedImage || !selectedStyle) return
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setResult({ style: selectedStyle, tone: selectedTone, image: uploadedImage })
    }, 2000)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" /> AI 美甲设计
        </h1>
        <p className="text-sm text-gray-500 mt-1">上传手部照片，选择风格，AI 一键预览效果</p>
      </div>

      {/* Upload */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary-500" /> 上传手部照片
        </h2>
        {!uploadedImage ? (
          <button onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-10 flex flex-col items-center gap-3
                       hover:border-primary-300 hover:bg-pink-50/30 transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7 text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">点击上传手掌照片</p>
              <p className="text-xs text-gray-400 mt-1">建议光线充足、手指自然伸展拍摄</p>
            </div>
          </button>
        ) : (
          <div className="relative rounded-xl overflow-hidden">
            <img src={uploadedImage} alt="手部照片" className="w-full h-56 object-cover" />
            <button onClick={() => { setUploadedImage(null); setResult(null) }}
              className="absolute top-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              重新上传
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {/* Style Selection */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary-500" /> 选择美甲风格
        </h2>
        <div className="grid grid-cols-4 gap-2.5">
          {styles.map(s => (
            <button key={s.name} onClick={() => setSelectedStyle(s.name)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
                selectedStyle === s.name
                  ? 'ring-2 ring-primary-400 scale-105 shadow-md bg-white'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-sm`}>
                <span className="text-2xl">{s.icon}</span>
              </div>
              <span className="text-xs font-medium text-gray-600">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skin Tone */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary-500" /> 肤色匹配
        </h2>
        <div className="flex gap-3">
          {skinTones.map(t => (
            <button key={t.name} onClick={() => setSelectedTone(t.name)}
              className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl transition-all ${
                selectedTone === t.name ? 'ring-2 ring-primary-400 bg-primary-50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: t.hex }} />
              <span className="text-xs font-medium text-gray-700">{t.name}</span>
              <span className="text-[10px] text-gray-400">{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <button onClick={handleGenerate} disabled={!uploadedImage || !selectedStyle || generating}
        className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg transition-all
                   disabled:bg-gray-300 disabled:shadow-none
                   bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 active:scale-[0.98]"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2"><Sparkles className="w-5 h-5 animate-spin" /> AI 正在生成...</span>
        ) : (
          <span className="flex items-center justify-center gap-2"><Sparkles className="w-5 h-5" /> AI 一键生成美甲预览</span>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">✨ 生成结果 - {result.style}风格</h2>
          <div className="relative rounded-xl overflow-hidden">
            <img src={result.image} alt="AI美甲效果" className="w-full h-56 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
          </div>
          <div className="flex gap-2 mt-4">
            <Link to={`/tutorials?search=${result.style}`}
              className="flex-1 py-3 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium text-center">
              查看 {result.style} 教程 →
            </Link>
            <Link to="/materials"
              className="flex-1 py-3 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" /> 所需材料
            </Link>
          </div>
        </div>
      )}

      {/* Style Inspiration */}
      {hotStyles.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-500" /> 热门款式参考
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {hotStyles.map(t => (
              <Link key={t.id} to={`/tutorials/${t.slug}`}
                className="relative rounded-xl overflow-hidden h-24 bg-gray-100 group"
              >
                {t.cover_image ? (
                  <img src={t.cover_image} alt={t.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform"
                    onError={e => { e.target.style.display = 'none' }} />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                  <p className="text-[10px] text-white font-medium line-clamp-1">{t.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Material Quick Entry */}
      <Link to="/materials"
        className="block bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">需要购买美甲材料？</h3>
            <p className="text-xs text-gray-500 mt-1">查看完整材料清单和工具推荐</p>
          </div>
          <ArrowRight className="w-5 h-5 text-primary-400" />
        </div>
      </Link>
    </div>
  )
}
