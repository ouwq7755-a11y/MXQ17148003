import { useState, useRef } from 'react'
import { Save, RotateCcw, Eye, Palette, Image, Grid3X3, Download, Trash2, Plus, MoveUp, MoveDown, Check, Upload, X, Type, Camera } from 'lucide-react'

const DEFAULT_THEME = { primary: '#E8A8A0', primaryLight: '#FCE8E0', bg: '#FCF6EB', card: '#FFFFFF', text: '#593933', textLight: '#7A5A54', textMuted: '#B89F9A', accent1: '#C5B5E5', accent2: '#8ED5A8', accent3: '#8EC8EE', radius: 24, shadow: '0 2px 12px rgba(0,0,0,0.04)' }
const DEFAULT_BANNER = { title: '零基础美甲训练营', subtitle: '从入门到专业 系统学习', emoji: '🎓', image: '' }
const DEFAULT_ENTRIES = [
  { id: 1, icon: '✨', label: 'AI生图', color: '#F3EEFA', image: '' },
  { id: 2, icon: '📖', label: '分步教程', color: '#EAF6EF', image: '' },
  { id: 3, icon: '📦', label: '耗材清单', color: '#EAF2FA', image: '' },
  { id: 4, icon: '🎨', label: '肤色配色', color: '#FEF4EC', image: '' },
  { id: 5, icon: '📷', label: '素材中心', color: '#FEF0F4', image: '' },
  { id: 6, icon: '🔧', label: '工具教学', color: '#F0F3FA', image: '' },
]
const DEFAULT_TABS = [
  { id: 1, icon: '🏠', label: '首页', image: '' },
  { id: 2, icon: '💖', label: 'AI设计', image: '' },
  { id: 3, icon: '📚', label: '教程库', image: '' },
  { id: 4, icon: '📦', label: '材料库', image: '' },
  { id: 5, icon: '👤', label: '我的', image: '' },
]
const DEFAULT_TUTORIALS = [
  { id: 1, title: '新手美甲全流程', desc: '从修甲到封层零基础入门', cover: '', video: true },
  { id: 2, title: '经典白色法式美甲', desc: '优雅永不过时', cover: '', video: true },
  { id: 3, title: '猫眼美甲制作全攻略', desc: '磁铁技法详解', cover: '', video: false },
]

const load = (key, def) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def } catch { return def } }

export default function ContentEditor() {
  const [theme, setTheme] = useState(() => load('nail-theme', DEFAULT_THEME))
  const [banner, setBanner] = useState(() => load('nail-banner', DEFAULT_BANNER))
  const [entries, setEntries] = useState(() => load('nail-entries', DEFAULT_ENTRIES))
  const [tabs, setTabs] = useState(() => load('nail-tabs', DEFAULT_TABS))
  const [tutorials, setTutorials] = useState(() => load('nail-tutorials', DEFAULT_TUTORIALS))
  const [activeTab, setActiveTab] = useState(1)
  const [toast, setToast] = useState('')
  const [previewMode, setPreviewMode] = useState(false)

  const showToast = m => { setToast(m); setTimeout(() => setToast(''), 2000) }
  const saveAll = () => {
    localStorage.setItem('nail-theme', JSON.stringify(theme))
    localStorage.setItem('nail-banner', JSON.stringify(banner))
    localStorage.setItem('nail-entries', JSON.stringify(entries))
    localStorage.setItem('nail-tabs', JSON.stringify(tabs))
    localStorage.setItem('nail-tutorials', JSON.stringify(tutorials))
    showToast('✅ 全部已保存')
  }
  const resetAll = () => { if (!confirm('重置所有为默认？')) return; setTheme(DEFAULT_THEME); setBanner(DEFAULT_BANNER); setEntries(DEFAULT_ENTRIES); setTabs(DEFAULT_TABS); setTutorials(DEFAULT_TUTORIALS); showToast('🔄 已重置') }
  const exportCfg = () => {
    const blob = new Blob([JSON.stringify({ theme, banner, entries, tabs, tutorials }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'nail-config.json'; a.click()
    showToast('📥 已导出')
  }

  return (
    <div className="max-w-lg mx-auto px-safe py-4" style={{ background: 'var(--bg-page)', minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-semibold" style={{ fontSize: '32rpx', color: 'var(--text-color-main)' }}>🎛️ 内容编辑器</h1>
        <div className="flex gap-2">
          <button onClick={() => setPreviewMode(!previewMode)} className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: previewMode ? theme.primary : '#F4F4F4', color: previewMode ? '#FFF' : '#666' }}><Eye size={14} />{previewMode ? '编辑' : '预览'}</button>
          <button onClick={saveAll} className="flex items-center gap-1 px-4 py-2 rounded-full text-white text-sm font-medium" style={{ backgroundColor: theme.primary }}><Save size={14} />保存</button>
        </div>
      </div>

      {previewMode ? (
        <Preview theme={theme} banner={banner} entries={entries} tabs={tabs} tutorials={tutorials} activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : (
        <div className="space-y-4">
          <Section icon={<Palette size={16} />} title="主题配色">
            <div className="grid grid-cols-2 gap-2">
              {[['主色','primary'],['浅底','primaryLight'],['背景','bg'],['卡片','card'],['标题字','text'],['正文','textLight'],['辅助字','textMuted']].map(([l,k]) => (
                <ColorInput key={k} label={l} value={theme[k]} onChange={v => setTheme(t => ({...t,[k]:v}))} />
              ))}
            </div>
          </Section>

          <Section icon={<Image size={16} />} title="Banner横幅">
            <ImageUploader label="背景图" value={banner.image} onChange={v => setBanner(b => ({...b, image:v}))} />
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Field l="标题" v={banner.title} onChange={v=>setBanner(b=>({...b,title:v}))} />
              <Field l="副标题" v={banner.subtitle} onChange={v=>setBanner(b=>({...b,subtitle:v}))} />
              <Field l="图标" v={banner.emoji} onChange={v=>setBanner(b=>({...b,emoji:v}))} />
            </div>
          </Section>

          <Section icon={<Grid3X3 size={16} />} title="6宫格功能入口">
            {entries.map((e,i) => (
              <div key={e.id} className="flex items-center gap-2 bg-white rounded-xl p-2 mb-2">
                <IconPicker entry={e} onChange={en => { const a=[...entries]; a[i]=en; setEntries(a) }} />
                <input value={e.label} onChange={ev => { const a=[...entries]; a[i].label=ev.target.value; setEntries(a) }}
                  className="flex-1 text-sm outline-none bg-transparent" style={{color:'#555'}} />
                <input type="color" value={e.color} onChange={ev => { const a=[...entries]; a[i].color=ev.target.value; setEntries(a) }}
                  className="w-7 h-7 rounded border-0 cursor-pointer" />
                <div className="flex flex-col">
                  <button onClick={() => { if(i>0){const a=[...entries];[a[i],a[i-1]]=[a[i-1],a[i]];setEntries(a)} }} className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded"><MoveUp size={10}/></button>
                  <button onClick={() => { if(i<entries.length-1){const a=[...entries];[a[i],a[i+1]]=[a[i+1],a[i]];setEntries(a)} }} className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded"><MoveDown size={10}/></button>
                </div>
                <button onClick={()=>setEntries(entries.filter(x=>x.id!==e.id))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50"><Trash2 size={12} color="#E05050"/></button>
              </div>
            ))}
            <button onClick={()=>setEntries([...entries,{id:Date.now(),icon:'💎',label:'新功能',color:'#F5F0F5',image:''}])}
              className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 border border-dashed" style={{borderColor:theme.primary,color:theme.primary}}><Plus size={14}/>添加入口</button>
          </Section>

          <Section icon={<Camera size={16} />} title="教程卡片">
            {tutorials.map((t,i) => (
              <div key={t.id} className="bg-white rounded-xl p-3 mb-2">
                <div className="flex items-center gap-3">
                  <ImageUploader label="" value={t.cover} onChange={v=>{const a=[...tutorials];a[i].cover=v;setTutorials(a)}} size="sm" />
                  <div className="flex-1 space-y-1">
                    <input value={t.title} onChange={e=>{const a=[...tutorials];a[i].title=e.target.value;setTutorials(a)}}
                      className="w-full text-sm font-medium outline-none bg-transparent" style={{color:'#444'}} placeholder="教程标题" />
                    <input value={t.desc} onChange={e=>{const a=[...tutorials];a[i].desc=e.target.value;setTutorials(a)}}
                      className="w-full text-xs outline-none bg-transparent" style={{color:'#999'}} placeholder="描述" />
                    <label className="flex items-center gap-1 text-xs" style={{color:'#999'}}>
                      <input type="checkbox" checked={t.video} onChange={e=>{const a=[...tutorials];a[i].video=e.target.checked;setTutorials(a)}} />
                      有视频
                    </label>
                  </div>
                  <button onClick={()=>setTutorials(tutorials.filter(x=>x.id!==t.id))} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-50"><Trash2 size={12} color="#E05050"/></button>
                </div>
              </div>
            ))}
            <button onClick={()=>setTutorials([...tutorials,{id:Date.now(),title:'新教程',desc:'描述',cover:'',video:false}])}
              className="w-full py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1 border border-dashed" style={{borderColor:theme.primary,color:theme.primary}}><Plus size={14}/>添加教程</button>
          </Section>

          <Section icon={<Type size={16} />} title="底部Tab">
            <div className="space-y-2">
              {tabs.map((t,i) => (
                <div key={t.id} className="flex items-center gap-2 bg-white rounded-xl p-2">
                  <IconPicker entry={t} onChange={en => { const a=[...tabs]; a[i]=en; setTabs(a) }} />
                  <input value={t.label} onChange={e=>{const a=[...tabs];a[i].label=e.target.value;setTabs(a)}}
                    className="flex-1 text-sm outline-none bg-transparent" style={{color:'#555'}} />
                  <button onClick={()=>setActiveTab(t.id)} className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
                    style={{borderColor:activeTab===t.id?theme.primary:'#ddd'}}>
                    {activeTab===t.id && <Check size={12} color={theme.primary}/>}
                  </button>
                </div>
              ))}
            </div>
          </Section>

          <div className="flex gap-2">
            <button onClick={resetAll} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium" style={{backgroundColor:'#F4F4F4',color:'#E05050'}}><RotateCcw size={14}/>重置</button>
            <button onClick={exportCfg} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium" style={{backgroundColor:'#F4F4F4',color:'#5088B0'}}><Download size={14}/>导出</button>
            <button onClick={saveAll} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-white text-sm font-medium" style={{backgroundColor:theme.primary}}><Save size={14}/>保存生效</button>
          </div>
        </div>
      )}
      {toast && <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl text-white text-sm font-medium shadow-lg" style={{backgroundColor:'rgba(89,57,51,0.9)'}}>{toast}</div>}
    </div>
  )
}

/* ── Sub-components ──────────────────────────── */

function Section({ icon, title, children }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-white rounded-3xl shadow-card overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 font-medium" style={{ fontSize: '28rpx', color: '#444' }}>
        <span className="flex items-center gap-2">{icon} {title}</span>
        <span style={{ fontSize: '20rpx', color: '#999', transform: open ? 'rotate(90deg)' : '', transition: 'transform .2s' }}>▶</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-gray-100">
      <input type="color" value={value} onChange={e => onChange(e.target.value)} className="w-7 h-7 rounded border-0 cursor-pointer" />
      <div className="flex-1 min-w-0">
        <div className="text-xs" style={{ color: '#999' }}>{label}</div>
        <input value={value} onChange={e => onChange(e.target.value)} className="w-full text-sm font-mono outline-none bg-transparent" style={{ color: '#555' }} />
      </div>
    </div>
  )
}

function Field({ l, v, onChange }) {
  return (
    <div className="bg-white rounded-xl p-2 border border-gray-100">
      <div className="text-xs" style={{ color: '#999' }}>{l}</div>
      <input value={v} onChange={e => onChange(e.target.value)} className="w-full text-sm outline-none bg-transparent" style={{ color: '#555' }} />
    </div>
  )
}

function IconPicker({ entry, onChange }) {
  const ref = useRef(null)
  return (
    <div className="relative flex items-center">
      {entry.image ? (
        <div className="relative w-9 h-9 rounded-lg overflow-hidden cursor-pointer group" onClick={() => onChange({ ...entry, image: '' })}>
          <img src={entry.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={12} color="#fff" /></div>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <input value={entry.icon} onChange={e => onChange({ ...entry, icon: e.target.value })}
            className="w-9 text-center text-lg outline-none bg-gray-50 rounded-lg py-1" />
          <button onClick={() => ref.current?.click()} className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-100" title="上传图标">
            <Upload size={12} color="#999" />
          </button>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => onChange({ ...entry, image: ev.target.result }); r.readAsDataURL(f) } }} />
    </div>
  )
}

function ImageUploader({ label, value, onChange, size = 'md' }) {
  const ref = useRef(null)
  const dims = size === 'sm' ? 'w-16 h-16' : 'w-full h-32'
  return (
    <div>
      {label && <div className="text-xs mb-1" style={{ color: '#999' }}>{label}</div>}
      {value ? (
        <div className={`relative ${dims} rounded-xl overflow-hidden cursor-pointer group`} onClick={() => onChange('')}>
          <img src={value} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><X size={20} color="#fff" /></div>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} className={`${dims} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all hover:border-pink-300`}
          style={{ borderColor: '#ddd', color: '#999' }}>
          <Upload size={size === 'sm' ? 14 : 20} /><span className="text-xs">上传图片</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) { const r = new FileReader(); r.onload = ev => onChange(ev.target.result); r.readAsDataURL(f) } }} />
    </div>
  )
}

function Preview({ theme, banner, entries, tabs, tutorials, activeTab, setActiveTab }) {
  return (
    <div className="overflow-hidden rounded-3xl shadow-lg relative" style={{ background: theme.bg, minHeight: '650px' }}>
      <div className="flex justify-between px-4 py-2 text-xs font-semibold" style={{ color: theme.text }}>9:41<span>📶 🔋</span></div>
      <div className="flex items-center gap-2 px-3 py-2">
        <span style={{ color: theme.text, fontWeight: 700, fontSize: 16 }}>美甲学院</span>
        <input placeholder="搜索..." readOnly className="flex-1 rounded-full px-3 py-1.5 text-xs outline-none" style={{ background: theme.primaryLight, color: theme.textMuted }} />
        <button className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: theme.primaryLight }}>📤</button>
      </div>
      {/* Banner */}
      <div className="mx-3 my-3 rounded-2xl overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${theme.accent1}, ${theme.primaryLight})` }}>
        {banner.image && <img src={banner.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative flex items-center gap-3 p-5">
          <span className="text-3xl">{banner.emoji}</span>
          <div><h3 className="font-bold" style={{ color: theme.text, fontSize: 18 }}>{banner.title}</h3><p style={{ color: theme.textLight, fontSize: 13 }}>{banner.subtitle}</p></div>
        </div>
      </div>
      {/* Grid */}
      <div className="grid grid-cols-3 gap-3 mx-3 mb-4 p-4 rounded-2xl" style={{ background: theme.card, boxShadow: theme.shadow }}>
        {entries.map(e => (
          <button key={e.id} className="flex flex-col items-center gap-1 py-1">
            <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden" style={{ background: e.color }}>
              {e.image ? <img src={e.image} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{e.icon}</span>}
            </div>
            <span className="font-medium" style={{ color: theme.text, fontSize: 12 }}>{e.label}</span>
          </button>
        ))}
      </div>
      {/* Tutorial Cards */}
      <div className="mx-3 space-y-2 mb-20">
        <h4 className="font-semibold" style={{ color: theme.text, fontSize: 15 }}>📚 新手入门教学</h4>
        {tutorials.map(t => (
          <div key={t.id} className="flex gap-3 p-3 rounded-2xl" style={{ background: theme.card, boxShadow: theme.shadow }}>
            <div className="w-16 h-16 min-w-[64px] rounded-xl flex items-center justify-center overflow-hidden" style={{ background: theme.primaryLight }}>
              {t.cover ? <img src={t.cover} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl opacity-30">💅</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium line-clamp-1" style={{ color: theme.text, fontSize: 13 }}>{t.title}</p>
              <p style={{ color: theme.textMuted, fontSize: 11 }}>{t.desc}</p>
              {t.video && <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs" style={{ background: theme.primaryLight, color: theme.primary }}>🎬 视频</span>}
            </div>
          </div>
        ))}
      </div>
      {/* Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-around py-3" style={{ background: theme.card, borderTop: `1px solid ${theme.primaryLight}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className="flex flex-col items-center gap-0.5" style={{ color: activeTab === t.id ? theme.primary : theme.textMuted, fontSize: 10 }}>
            {t.image ? <img src={t.image} alt="" className="w-5 h-5 object-cover rounded" /> : <span className="text-lg">{t.icon}</span>}
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}
