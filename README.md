# 💅 美甲学院 - AI 美甲教学工具

一个完整的 AI 驱动的美甲教学 Web 平台，包含多种美甲款式教学、材料数据库、工具教学指南，以及 Python 自动采集脚本。

## 项目结构

```
nail-art-academy/
├── frontend/          # React 18 + Vite + Tailwind CSS 前端
│   ├── src/
│   │   ├── components/   # Navbar, Card, SearchBar, Footer, Loader
│   │   ├── pages/        # Home, Tutorials, TutorialDetail, Materials, Tools, Search
│   │   ├── App.jsx       # 路由配置
│   │   └── main.jsx      # 入口
│   └── package.json
├── backend/           # Python FastAPI + SQLAlchemy + SQLite 后端
│   ├── main.py        # API 端点 (RESTful)
│   ├── models.py      # 数据模型 (12分类, 教程, 材料, 工具, 标签)
│   ├── database.py    # SQLite 连接配置
│   └── seed_data.py   # 初始种子数据 (10个教程, 22个材料, 17个工具)
├── scraper/           # Python 自动采集脚本
│   ├── collector.py   # 主采集控制器 (支持定时/手动/测试模式)
│   ├── sources.py     # 9个采集源配置 (B站, 小红书, 淘宝, Pinterest等)
│   └── cleaner.py     # 数据清洗/去重/合规过滤/自动分类标签
└── README.md
```

## 快速启动

### 1. 启动后端 API

```bash
cd backend
pip install -r requirements.txt
python main.py
# API 运行在 http://localhost:8000
# 首次启动自动创建数据库并填充初始数据
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
# 前端运行在 http://localhost:5173
```

### 3. 运行自动采集 (可选)

```bash
cd scraper
pip install -r requirements.txt
python collector.py --test    # 测试模式 (不入库)
python collector.py           # 正式采集
python collector.py --source bilibili  # 采集指定源
python collector.py --schedule          # 定时模式 (每24h)
```

## 功能特性

### 📚 教程中心
- **12大美甲分类**：基础入门、甲油胶、法式、渐变、猫眼、3D浮雕、大理石纹、延甲、彩绘、穿戴甲、甲面养护、工具教学
- **分步教学**：每款教程拆解为详细操作步骤
- **难度分级**：入门/进阶/高级
- **材料清单**：每款教程附带完整工具和材料列表
- **避坑指南**：实用小贴士和常见错误提醒

### 📦 材料数据库
- 22种常用美甲材料详细参数
- 分类浏览：甲油胶类、装饰材料、辅助耗材、工具类
- 新手适用/专业级 双档分类
- 使用方法和价格参考
- 品牌信息

### 🔧 工具教学
- 17种美甲工具详解
- 正确使用步骤演示
- 注意事项和安全提醒
- 价格范围参考
- 选购建议

### 🤖 AI 自动采集
- **9个采集源**：B站、小红书、抖音、淘宝、1688、什么值得买、Pinterest、美甲帮
- **智能清洗**：去重、合规过滤、广告检测
- **自动分类**：AI自动识别教程类型和难度等级
- **标签生成**：自动提取关键词标签
- **定时任务**：支持每日/每周定时自动采集

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/categories` | GET | 获取所有分类 |
| `/tutorials` | GET | 教程列表 (支持筛选/搜索/分页) |
| `/tutorials/{slug}` | GET | 教程详情 |
| `/tutorials/hot` | GET | 热门教程 |
| `/materials` | GET | 材料列表 (支持筛选/搜索) |
| `/materials/{id}` | GET | 材料详情 |
| `/tools` | GET | 工具列表 (支持筛选/搜索) |
| `/tools/{id}` | GET | 工具详情 (含使用步骤) |
| `/search?q=` | GET | 全局搜索 (教程+材料+工具) |
| `/tags` | GET | 所有标签 |
| `/stats` | GET | 数据统计 |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18, Vite, React Router 6, Tailwind CSS 3, Lucide React |
| 后端 | Python 3, FastAPI, SQLAlchemy, SQLite |
| 采集 | Python, BeautifulSoup4, Requests, aiohttp |
