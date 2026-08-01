import { useState } from 'react'
import { useTheme } from '../ThemeContext'
import { Check, Sparkles, Smartphone } from 'lucide-react'

export default function ThemeStore() {
  const { theme, applyPreset, presets, resetTheme } = useTheme()
  const [selected, setSelected] = useState(() => {
    const found = Object.entries(presets).find(([,t]) => t.primary === theme.primary)
    return found ? found[0] : '柔雾裸粉'
  })

  const handleApply = (name) => {
    applyPreset(name)
    setSelected(name)
  }

  return (
    <div className="max-w-lg mx-auto px-safe py-4" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <h1 className="font-semibold mb-1 flex items-center gap-2" style={{ fontSize: '32rpx', color: 'var(--text-color-main)' }}>
        <Sparkles size={20} color="var(--color-primary)" /> 主题商店
      </h1>
      <p style={{ fontSize: '24rpx', color: 'var(--text-color-minor)', marginBottom: '24rpx' }}>一键更换整套视觉风格</p>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(presets).map(([name, t]) => (
          <button key={name} onClick={() => handleApply(name)}
            className="relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{
              border: selected === name ? `2px solid ${t.primary}` : '2px solid transparent',
              boxShadow: selected === name ? `0 8px 24px ${t.primary}40` : 'var(--shadow-card)',
            }}>
            {/* Mini Phone Preview */}
            <div className="relative" style={{ background: t.bg }}>
              {/* Status Bar */}
              <div className="flex justify-between px-3 py-1.5 text-[8px] font-semibold" style={{ color: t.text }}>9:41 <span>📶 🔋</span></div>
              {/* Header */}
              <div className="flex items-center gap-1 px-2 py-1">
                <span className="text-[8px] font-bold" style={{ color: t.text }}>美甲学院</span>
                <div className="flex-1 h-3 rounded-full" style={{ background: t.primaryLight }} />
              </div>
              {/* Banner */}
              <div className="mx-2 my-1.5 p-2 rounded-xl" style={{ background: `linear-gradient(135deg, ${t.accent1}, ${t.primaryLight})` }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🎓</span>
                  <div>
                    <div className="h-2 w-20 rounded" style={{ background: t.text, opacity: 0.8 }} />
                    <div className="h-1.5 w-14 rounded mt-0.5" style={{ background: t.textLight }} />
                  </div>
                </div>
              </div>
              {/* Grid */}
              <div className="grid grid-cols-3 gap-1.5 mx-2 mb-1.5 p-2 rounded-xl" style={{ background: t.card }}>
                {[0,1,2,3,4,5].map(i => (
                  <div key={i} className="flex flex-col items-center gap-0.5 py-0.5">
                    <div className="w-6 h-6 rounded-full" style={{ background: [t.primaryLight, t.accent1+'40', t.accent2+'40', t.accent3+'40', t.primaryLight, t.accent1+'40'][i] }} />
                    <div className="h-1 w-8 rounded" style={{ background: t.textLight, opacity: 0.3 }} />
                  </div>
                ))}
              </div>
              {/* Cards */}
              <div className="mx-2 space-y-1 pb-8">
                <div className="flex gap-1.5 p-1.5 rounded-xl" style={{ background: t.card }}>
                  <div className="w-10 h-10 rounded-lg" style={{ background: t.primaryLight }} />
                  <div className="flex-1">
                    <div className="h-2 w-24 rounded" style={{ background: t.text, opacity: 0.7 }} />
                    <div className="h-1.5 w-16 rounded mt-0.5" style={{ background: t.textMuted }} />
                  </div>
                </div>
              </div>
              {/* Tab Bar */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-around py-1.5" style={{ background: t.card, borderTop: `1px solid ${t.primaryLight}` }}>
                {['🏠','💖','📚','📦','👤'].map((icon, i) => (
                  <span key={i} className="text-[10px]" style={{ color: i === 1 ? t.primary : t.textMuted }}>{icon}</span>
                ))}
              </div>
            </div>

            {/* Label */}
            <div className="py-2.5 text-center" style={{ background: t.card }}>
              <p className="font-semibold" style={{ fontSize: '26rpx', color: t.text }}>{name}</p>
              <div className="flex justify-center gap-1 mt-1">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.primary }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent1 }} />
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.accent2 }} />
              </div>
            </div>

            {/* Checkmark */}
            {selected === name && (
              <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primary }}>
                <Check size={14} color="#fff" strokeWidth={3} />
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Reset */}
      <button onClick={() => { resetTheme(); setSelected('柔雾裸粉') }}
        className="w-full mt-4 py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2"
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-color-minor)', boxShadow: 'var(--shadow-card)' }}>
        🔄 恢复默认主题
      </button>
    </div>
  )
}
