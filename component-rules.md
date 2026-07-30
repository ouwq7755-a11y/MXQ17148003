# 组件复用规则

## 1. 全局组件（components/）
- `Navbar.jsx` - 顶部导航，毛玻璃背景 + Logo + 搜索图标
- `Loader.jsx` - 加载状态：Spinner / SkeletonCard / SkeletonGrid / EmptyState
- `LazyVideo.jsx` - 视频播放：本地HTML5 / B站iframe（点击加载）
- `Card.jsx` - 教程卡片：封面图 + 标题 + 难度标签 + 时长
- `Footer.jsx` - 页脚（已废弃，改为底部Tab栏）

## 2. 页面组件（pages/）
- `Home.jsx` - 首页：Banner + 6宫格 + 横向滚动 + 教程列表 + 统计
- `Tutorials.jsx` - 教程库：胶囊筛选 + 左图右文卡片
- `TutorialDetail.jsx` - 教程详情：Banner + 视频 + 时间线步骤 + 相关推荐
- `Materials.jsx` - 材料库：筛选 + 双列等高卡片
- `Tools.jsx` - 工具教学：筛选 + 双列卡片 + 视频/图文切换
- `AIDesign.jsx` - AI设计：上传 + 风格选择 + 肤色匹配 + 预览
- `Search.jsx` - 全局搜索：分类结果
- `Profile.jsx` - 个人中心

## 3. 复用规则
- 所有卡片使用 `glass` 或 `bg-white rounded-3xl shadow-card`
- 所有标签使用 `tag-badge / tag-green / tag-purple / tag-blue`
- 所有页面 `max-w-lg mx-auto px-safe` 居中布局
- 颜色禁止硬编码，必须使用 Tailwind config 中的 color token
- 字号禁止硬编码px，统一使用 rpx 单位（设计稿750基准）
- 卡片hover统一使用 `float-hover` 或 `card-hover`
- 空状态统一使用 `<EmptyState>` 组件
- 加载中统一使用 `<SkeletonGrid>` 或 `<Loader>`

## 4. 禁止项
- 禁止引入新的UI库或依赖
- 禁止行内style写颜色（必须用className或从design-token引用）
- 禁止修改tailwind.config.js中的颜色定义
- 禁止删除或重命名已有页面路由
