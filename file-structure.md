# 目录结构

```
nail-art-academy/
├── design-token.scss       # 全局设计Token（颜色/字号/间距/圆角/阴影）
├── component-rules.md      # 组件复用规则
├── file-structure.md       # 本文件 - 目录结构
│
├── frontend/               # React + Vite 前端
│   ├── index.html          # 入口HTML（含微信检测）
│   ├── vite.config.js      # Vite配置（代理/api和/videos）
│   ├── tailwind.config.js  # Tailwind主题配置
│   ├── .env.production     # 生产环境API地址
│   └── src/
│       ├── main.jsx        # React入口
│       ├── App.jsx         # 路由 + 底部Tab栏
│       ├── index.css       # 全局样式 + 毛玻璃工具类
│       ├── components/     # 通用组件
│       │   ├── Navbar.jsx
│       │   ├── Loader.jsx
│       │   ├── LazyVideo.jsx
│       │   └── Card.jsx
│       └── pages/          # 页面组件
│           ├── Home.jsx
│           ├── Tutorials.jsx
│           ├── TutorialDetail.jsx
│           ├── Materials.jsx
│           ├── Tools.jsx
│           ├── AIDesign.jsx
│           ├── Search.jsx
│           └── Profile.jsx
│
├── backend/                # Python FastAPI 后端
│   ├── main.py             # API入口 + 前端静态文件服务
│   ├── models.py           # SQLAlchemy数据模型
│   ├── database.py         # 数据库连接
│   ├── seed_data.py        # 初始种子数据（10篇教程）
│   ├── seed_full.json      # 完整数据导出（117篇教程）
│   ├── static/             # 前端构建产物（部署用）
│   └── videos/             # 本地视频文件
│
├── scraper/                # Python采集脚本
│   ├── collector.py        # 通用采集器
│   ├── auto_update.py      # 每日自动更新
│   ├── trending_collector.py # 热门趋势采集
│   ├── video_collector.py  # B站视频匹配
│   └── download_videos.py  # 视频下载脚本
│
├── docs/                   # GitHub Pages部署
├── Procfile                # Railway部署配置
└── requirements.txt        # Python依赖
```
