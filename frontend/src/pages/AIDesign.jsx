import { useState, useRef } from 'react'
import { Upload, Sparkles, Wand2, Palette, ShoppingBag, ArrowRight, Camera, Image } from 'lucide-react'
import { Link } from 'react-router-dom'

const styles = [
  { name: '法式', icon: '🪄', color: 'from-pink-100 to-rose-100' },
  { name: '猫眼', icon: '🧲', color: 'from-purple-100 to-blue-100' },
  { name: '渐变', icon: '💧', color: 'from-blue-100 to-cyan-100' },
  { name: '国风', icon: '🏮', color: 'from-red-100 to-orange-100' },
  { name: '冰透', icon: '🧊', color: 'from-cyan-100 to-teal-100' },
  { name: '磨砂', icon: '✨', color: 'from-gray-100 to-slate-100' },
  { name: '镜面', icon: '🪞', color: 'from-amber-100 to-yellow-100' },
  { name: '花卉', icon: '🌸', color: 'from-pink-100 to-fuchsia-100' },
]

const skinTones = [
  { name: '白皙', color: '#fde8d0', hex: '#fde8d0' },
  { name: '自然', color: '#e8c9a0', hex: '#e8c9a0' },
  { name: '健康', color: '#d4a574', hex: '#d4a574' },
  { name: '小麦', color: '#b88645', hex: '#b88645' },
]

export default function AIDesign() {
  const [uploadedImage, setUploadedImage] = useState(null)
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedTone, setSelectedTone] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

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
    // Simulate AI generation
    setTimeout(() => {
      setGenerating(false)
      setResult({
        style: selectedStyle,
        tone: selectedTone,
        image: uploadedImage,
      })
    }, 2000)
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary-500" />
          AI 美甲设计
        </h1>
        <p className="text-sm text-gray-500 mt-1">上传手部照片，AI一键预览美甲效果</p>
      </div>

      {/* Upload Section */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4 text-primary-500" />
          上传手部照片
        </h2>

        {!uploadedImage ? (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-12 flex flex-col items-center gap-3
                       hover:border-primary-300 hover:bg-primary-50/30 transition-all cursor-pointer"
          >
            <div className="w-14 h-14 rounded-full gradient-hero flex items-center justify-center">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">点击上传手掌照片</p>
              <p className="text-xs text-gray-400 mt-1">支持 JPG/PNG，建议光线充足拍摄</p>
            </div>
          </button>
        ) : (
          <div className="relative">
            <img src={uploadedImage} alt="手部照片" className="w-full h-60 object-cover rounded-xl" />
            <button
              onClick={() => { setUploadedImage(null); setResult(null) }}
              className="absolute top-2 right-2 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full"
            >
              重新上传
            </button>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {/* Style Selection */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-primary-500" />
          选择美甲风格
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {styles.map(s => (
            <button
              key={s.name}
              onClick={() => setSelectedStyle(s.name)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all ${
                selectedStyle === s.name
                  ? 'bg-primary-100 ring-2 ring-primary-400 scale-105'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs font-medium text-gray-600">{s.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skin Tone */}
      <div className="bg-white rounded-2xl p-5 shadow-sm mb-4">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary-500" />
          肤色匹配
        </h2>
        <div className="flex gap-3">
          {skinTones.map(t => (
            <button
              key={t.name}
              onClick={() => setSelectedTone(t.name)}
              className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                selectedTone === t.name ? 'ring-2 ring-primary-400 bg-primary-50' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: t.color }} />
              <span className="text-xs text-gray-600">{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!uploadedImage || !selectedStyle || generating}
        className="w-full py-4 rounded-2xl font-bold text-white text-lg shadow-lg transition-all
                   disabled:bg-gray-300 disabled:shadow-none
                   bg-gradient-to-r from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600 active:scale-[0.98]"
      >
        {generating ? (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 animate-spin" />
            AI 正在生成美甲效果...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" />
            AI 一键生成美甲预览
          </span>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-3">✨ 生成结果 - {result.style}风格</h2>
          <img src={result.image} alt="AI美甲效果" className="w-full h-60 object-cover rounded-xl mb-4" />
          <div className="flex gap-2">
            <Link to={`/tutorials?search=${result.style}`}
              className="flex-1 py-2.5 bg-primary-50 text-primary-600 rounded-xl text-sm font-medium text-center">
              查看相关教程 →
            </Link>
            <Link to="/materials"
              className="flex-1 py-2.5 bg-purple-50 text-purple-600 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5" /> 所需材料
            </Link>
          </div>
        </div>
      )}

      {/* Materials Quick Entry */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">制作美甲需要材料？</h3>
            <p className="text-xs text-gray-500 mt-1">查看完整材料清单和工具推荐</p>
          </div>
          <Link to="/materials" className="btn-primary text-sm flex items-center gap-1">
            材料库 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
