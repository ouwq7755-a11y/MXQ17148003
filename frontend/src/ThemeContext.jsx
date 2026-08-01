import { createContext, useContext, useState, useEffect } from 'react'

const DEFAULT_THEME = {
  primary: '#F5A8C0', primaryLight: '#FFF0F4', bg: '#F5F3F6', card: '#FFFFFF',
  text: '#222222', textLight: '#666666', textMuted: '#AAAAAA',
  accent1: '#C5B5E5', accent2: '#8ED5A8', accent3: '#8EC8EE',
  radius: 24, shadow: '0 1rpx 6rpx rgba(0,0,0,0.025)',
}

const PRESET_THEMES = {
  '柔雾裸粉': {
    primary: '#F5A8C0', primaryLight: '#FFF0F4', bg: '#F5F3F6', card: '#FFFFFF',
    text: '#222222', textLight: '#666666', textMuted: '#AAAAAA',
    accent1: '#C5B5E5', accent2: '#8ED5A8', accent3: '#8EC8EE',
    radius: 30, shadow: '0 1rpx 6rpx rgba(0,0,0,0.025)',
  },
  '暖橘杏色': {
    primary: '#E8A8A0', primaryLight: '#FCE8E0', bg: '#FCF6EB', card: '#FFFFFF',
    text: '#593933', textLight: '#7A5A54', textMuted: '#B89F9A',
    accent1: '#D5C0C0', accent2: '#A8C8B8', accent3: '#A0C0D8',
    radius: 24, shadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  '冰透蓝紫': {
    primary: '#8EB8E8', primaryLight: '#EEF4FA', bg: '#F5F7FB', card: '#FFFFFF',
    text: '#2A3040', textLight: '#5A6070', textMuted: '#9AA0B0',
    accent1: '#B8C8E8', accent2: '#8EC8C0', accent3: '#C0B8E8',
    radius: 28, shadow: '0 2px 10px rgba(100,140,200,0.06)',
  },
  '奶绿清新': {
    primary: '#7ED0A0', primaryLight: '#EDF8F2', bg: '#F6FAF7', card: '#FFFFFF',
    text: '#2A3A30', textLight: '#5A6A60', textMuted: '#9AAAA0',
    accent1: '#B0D8C0', accent2: '#90D0A8', accent3: '#A8C8D0',
    radius: 26, shadow: '0 2px 10px rgba(100,180,140,0.06)',
  },
  '暗夜模式': {
    primary: '#D090A0', primaryLight: '#3A2830', bg: '#1A1819', card: '#2A2628',
    text: '#E8E0E2', textLight: '#B0A8AA', textMuted: '#70686A',
    accent1: '#483848', accent2: '#384838', accent3: '#384858',
    radius: 24, shadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
}

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('app-theme')
    if (saved) return JSON.parse(saved)
    return DEFAULT_THEME
  })

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--color-primary', theme.primary)
    root.style.setProperty('--color-primary-light', theme.primaryLight)
    root.style.setProperty('--bg-page', theme.bg)
    root.style.setProperty('--bg-card', theme.card)
    root.style.setProperty('--text-color-main', theme.text)
    root.style.setProperty('--text-color-secondary', theme.textLight)
    root.style.setProperty('--text-color-minor', theme.textMuted)
    root.style.setProperty('--color-secondary-purple', theme.accent1)
    root.style.setProperty('--color-secondary-green', theme.accent2)
    root.style.setProperty('--color-secondary-blue', theme.accent3)
    root.style.setProperty('--border-radius-card', `${theme.radius}rpx`)
    root.style.setProperty('--shadow-card', theme.shadow)
    localStorage.setItem('app-theme', JSON.stringify(theme))
  }, [theme])

  const applyPreset = (name) => {
    if (PRESET_THEMES[name]) setTheme(PRESET_THEMES[name])
  }
  const updateColor = (key, val) => setTheme(t => ({ ...t, [key]: val }))
  const resetTheme = () => setTheme(DEFAULT_THEME)

  return (
    <ThemeContext.Provider value={{ theme, setTheme, applyPreset, updateColor, resetTheme, presets: PRESET_THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
