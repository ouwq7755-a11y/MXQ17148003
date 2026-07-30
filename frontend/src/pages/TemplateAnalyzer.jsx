import { useState, useRef, useEffect } from 'react'
import { Upload, Download, Copy, Check, Eye, Droplets, Ruler, Type, Box } from 'lucide-react'

/**
 * 内置模板分析工具
 * 拖入参考图片 → 自动提取色板/间距/字号/圆角 → 生成设计参数JSON → 一键导出
 */
export default function TemplateAnalyzer() {
  const [image, setImage] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const fileRef = useRef(null)

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setImage(ev.target.result)
      setResult(null)
    }
    reader.readAsDataURL(file)
  }

  const analyze = () => {
    if (!imgRef.current || !canvasRef.current) return
    setAnalyzing(true)

    const img = imgRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Scale for analysis (max 750px wide to match design spec)
    const scale = Math.min(750 / img.naturalWidth, 1)
    const w = Math.round(img.naturalWidth * scale)
    const h = Math.round(img.naturalHeight * scale)
    canvas.width = w
    canvas.height = h
    ctx.drawImage(img, 0, 0, w, h)

    const imageData = ctx.getImageData(0, 0, w, h)
    const pixels = imageData.data

    // ── 1. Color palette extraction ────────────
    const colorMap = new Map()
    const sampleStep = 4 // every 4th pixel
    for (let y = 0; y < h; y += sampleStep) {
      for (let x = 0; x < w; x += sampleStep) {
        const i = (y * w + x) * 4
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2]
        // Quantize to nearest 8 for grouping
        const qr = Math.round(r/8)*8, qg = Math.round(g/8)*8, qb = Math.round(b/8)*8
        const key = `${qr},${qg},${qb}`
        colorMap.set(key, (colorMap.get(key) || 0) + 1)
      }
    }

    // Sort and get top colors, convert to hex
    const palette = [...colorMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([key, count]) => {
        const [r,g,b] = key.split(',').map(Number)
        const hex = '#' + [r,g,b].map(c => c.toString(16).padStart(2,'0')).join('')
        const pct = (count / (w*h/(sampleStep*sampleStep)) * 100).toFixed(1)
        // Classify
        let type = 'other'
        const avg = (r+g+b)/3
        if (avg > 240) type = 'white-bg'
        else if (avg > 210 && r>g && r>b) type = 'warm-skin'
        else if (avg > 200 && b>r && b>g) type = 'cool-blue'
        else if (avg > 200 && r>b && r>g) type = 'soft-pink'
        else if (avg < 100) type = 'dark-text'
        else if (avg < 160) type = 'mid-tone'
        return { hex, pct: parseFloat(pct), type, r, g, b }
      })

    // ── 2. Detect margins ──────────────────────
    let leftMargin = 0, rightMargin = 0
    for (let x = 0; x < w; x++) {
      let allWhite = true
      for (let y = 0; y < h; y += 10) {
        const i = (y * w + x) * 4
        if (pixels[i] < 245 || pixels[i+1] < 245 || pixels[i+2] < 245) {
          allWhite = false; break
        }
      }
      if (!allWhite) { leftMargin = x; break }
    }
    for (let x = w-1; x >= 0; x--) {
      let allWhite = true
      for (let y = 0; y < h; y += 10) {
        const i = (y * w + x) * 4
        if (pixels[i] < 245 || pixels[i+1] < 245 || pixels[i+2] < 245) {
          allWhite = false; break
        }
      }
      if (!allWhite) { rightMargin = w-1-x; break }
    }
    const marginRpx = Math.round((leftMargin+rightMargin)/2 / w * 750)

    // ── 3. Detect text sizes ──────────────────
    const textSizes = []
    for (let y = 0; y < h-1; y++) {
      let darkCount = 0
      for (let x = 0; x < w; x += 3) {
        const i = (y * w + x) * 4
        if (pixels[i] < 100 && pixels[i+1] < 100 && pixels[i+2] < 100) darkCount++
      }
      if (darkCount > w/20) {
        // Found text line, measure height
        let height = 1
        for (let dy = 1; dy < 40 && y+dy < h; dy++) {
          let stillDark = 0
          for (let x = 0; x < w; x += 3) {
            const j = ((y+dy) * w + x) * 4
            if (pixels[j] < 100 && pixels[j+1] < 100 && pixels[j+2] < 100) stillDark++
          }
          if (stillDark < w/30) break
          height = dy
        }
        if (height > 5 && height < 36) {
          const rpx = Math.round(height / w * 750)
          textSizes.push({ y, height, rpx })
        }
        y += height
      }
    }
    // Get unique text sizes
    const uniqueSizes = [...new Set(textSizes.map(t => t.rpx))]
      .filter(s => s >= 20 && s <= 40)
      .sort((a,b) => b-a)

    // ── 4. Detect section gaps ────────────────
    const gaps = []
    let inGap = false, gapStart = 0
    for (let y = 0; y < h; y++) {
      let whiteCount = 0
      for (let x = 0; x < w; x += 3) {
        const i = (y * w + x) * 4
        if (pixels[i] > 245 && pixels[i+1] > 245 && pixels[i+2] > 245) whiteCount++
      }
      if (whiteCount > w*0.85/3) {
        if (!inGap) { gapStart = y; inGap = true }
      } else {
        if (inGap && y - gapStart > 4) {
          gaps.push({ y: gapStart, size: y - gapStart, rpx: Math.round((y-gapStart)/w*750) })
        }
        inGap = false
      }
    }

    // ── 5. Detect border radius ───────────────
    // Sample corners of card-like white rectangles
    const corners = []
    for (let y = 20; y < h-20; y += 15) {
      for (let x = leftMargin + 20; x < w - rightMargin - 20; x += 15) {
        const i = (y * w + x) * 4
        const brightness = (pixels[i]+pixels[i+1]+pixels[i+2])/3
        // Look for edge transitions
        if (brightness > 240) {
          // Check if this is a corner of a card
          let diagWhite = 0
          for (let d = 1; d < 15; d++) {
            try {
              const j = ((y+d) * w + (x+d)) * 4
              if ((pixels[j]+pixels[j+1]+pixels[j+2])/3 < 220) { diagWhite = d; break }
            } catch(e) {}
          }
          if (diagWhite > 2 && diagWhite < 14) {
            corners.push({ x, y, radius: diagWhite, rpx: Math.round(diagWhite/w*750) })
          }
        }
      }
    }
    const avgRadius = corners.length > 3
      ? Math.round(corners.reduce((s,c) => s + c.rpx, 0) / corners.length)
      : 20

    setResult({
      dimensions: { width: w, height: h, originalW: img.naturalWidth, originalH: img.naturalHeight },
      palette: palette.slice(0, 10),
      margins: { left: leftMargin, right: rightMargin, rpx: marginRpx },
      textSizes: uniqueSizes.slice(0, 5),
      gaps: gaps.slice(0, 8),
      radius: avgRadius,
      designTokens: {
        pageBg: palette.find(p => p.type === 'white-bg')?.hex || '#FFFBFC',
        primaryColor: palette.find(p => ['soft-pink','warm-skin'].includes(p.type))?.hex || '#F5A8C0',
        accentColor: palette.find(p => p.type === 'cool-blue')?.hex || '#6EB8E8',
        titleSize: uniqueSizes[0] || 36,
        bodySize: uniqueSizes[1] || 28,
        captionSize: uniqueSizes[2] || 24,
        pageMargin: marginRpx || 32,
        cardRadius: avgRadius,
      }
    })
    setAnalyzing(false)
  }

  const copyJSON = () => {
    if (!result) return
    navigator.clipboard.writeText(JSON.stringify(result.designTokens, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto px-safe py-4" style={{ background: 'var(--bg-page)' }}>
      <h1 className="font-semibold mb-1 flex items-center gap-2" style={{ fontSize: '36rpx', color: 'var(--text-color-main)' }}>
        <Eye size={22} color="var(--color-primary)" /> 模板分析工具
      </h1>
      <p style={{ fontSize: '24rpx', color: 'var(--text-color-minor)', marginBottom: '24rpx' }}>
        上传参考图片 → 自动提取色板/间距/字号/圆角 → 导出设计参数
      </p>

      {/* Upload */}
      <div className="bg-white rounded-3xl shadow-card p-6 mb-5">
        {!image ? (
          <button onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed rounded-2xl py-12 flex flex-col items-center gap-3 transition-all hover:border-pink-300"
            style={{ borderColor: 'var(--border-divider)' }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-ai)' }}>
              <Upload size={24} color="var(--color-secondary-purple)" />
            </div>
            <div className="text-center">
              <p className="font-medium" style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>点击上传参考图片</p>
              <p style={{ fontSize: '24rpx', color: 'var(--text-color-minor)', marginTop: '4rpx' }}>
                建议 750×1334 分辨率 · 支持 PNG/JPG
              </p>
            </div>
          </button>
        ) : (
          <div>
            <div className="flex gap-3 mb-4">
              <img ref={imgRef} src={image} alt="reference" className="w-32 rounded-2xl object-contain bg-gray-50"
                   onLoad={() => {}} crossOrigin="anonymous" />
              <div className="flex-1">
                <p className="font-medium" style={{ fontSize: '26rpx', color: 'var(--text-color-main)' }}>图片已加载</p>
                <button onClick={analyze} disabled={analyzing}
                  className="mt-2 px-6 py-2.5 rounded-full text-white font-medium transition-all"
                  style={{ backgroundColor: analyzing ? '#ccc' : 'var(--color-primary)', fontSize: '26rpx' }}>
                  {analyzing ? '分析中...' : '开始分析'}
                </button>
                <button onClick={() => { setImage(null); setResult(null) }}
                  className="ml-3 px-4 py-2.5 rounded-full font-medium transition-all"
                  style={{ backgroundColor: '#F4F4F4', color: 'var(--text-color-minor)', fontSize: '26rpx' }}>
                  重新上传
                </button>
              </div>
            </div>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Color Palette */}
          <div className="bg-white rounded-3xl shadow-card p-5">
            <h3 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>
              <Droplets size={16} color="var(--color-primary)" /> 色板提取
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.palette.filter(p => p.pct > 1).slice(0, 10).map((c, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: '#F8F8F8' }}>
                  <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                  <span style={{ fontSize: '20rpx', color: 'var(--text-color-secondary)' }}>{c.hex}</span>
                  <span style={{ fontSize: '18rpx', color: 'var(--text-color-minor)' }}>{c.pct}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Layout */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-3xl shadow-card p-5">
              <h3 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>
                <Ruler size={16} color="var(--color-secondary-green)" /> 间距测绘
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between" style={{ fontSize: '26rpx' }}>
                  <span style={{ color: 'var(--text-color-minor)' }}>页面边距</span>
                  <span className="font-medium" style={{ color: 'var(--text-color-main)' }}>{result.margins.rpx}rpx</span>
                </div>
                {result.gaps.slice(0, 4).map((g, i) => (
                  <div key={i} className="flex justify-between" style={{ fontSize: '26rpx' }}>
                    <span style={{ color: 'var(--text-color-minor)' }}>模块间距{i+1}</span>
                    <span className="font-medium" style={{ color: 'var(--text-color-main)' }}>{g.rpx}rpx</span>
                  </div>
                ))}
                <div className="flex justify-between" style={{ fontSize: '26rpx' }}>
                  <span style={{ color: 'var(--text-color-minor)' }}>卡片圆角</span>
                  <span className="font-medium" style={{ color: 'var(--text-color-main)' }}>{result.radius}rpx</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-card p-5">
              <h3 className="font-medium mb-3 flex items-center gap-2" style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>
                <Type size={16} color="var(--color-secondary-blue)" /> 字号检测
              </h3>
              <div className="space-y-2">
                {result.textSizes.map((s, i) => (
                  <div key={i} className="flex justify-between" style={{ fontSize: '26rpx' }}>
                    <span style={{ color: 'var(--text-color-minor)' }}>{i===0?'大标题':i===1?'正文':i===2?'辅助字':`字号${i+1}`}</span>
                    <span className="font-medium" style={{ color: 'var(--text-color-main)' }}>{s}rpx</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Design Tokens JSON */}
          <div className="bg-white rounded-3xl shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium" style={{ fontSize: '28rpx', color: 'var(--text-color-main)' }}>📋 导出设计参数</h3>
              <button onClick={copyJSON}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white font-medium transition-all"
                style={{ backgroundColor: copied ? 'var(--color-secondary-green)' : 'var(--color-primary)', fontSize: '24rpx' }}>
                {copied ? <><Check size={12} />已复制</> : <><Copy size={12} />复制JSON</>}
              </button>
            </div>
            <pre className="rounded-2xl p-4 text-left overflow-x-auto" style={{ backgroundColor: '#F8F8F8', fontSize: '22rpx', color: 'var(--text-color-secondary)', maxHeight: '300rpx', overflowY: 'auto' }}>
              {JSON.stringify(result.designTokens, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
