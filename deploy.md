# 🚀 美甲学院 - 免费云部署（别人手机也能打开）

## 架构
用户手机 → Vercel(前端) → Railway(后端API+数据库)

## 第一步：后端部署到 Railway

### 1. 先把代码上传 GitHub
```bash
cd nail-art-academy
git init && git add . && git commit -m "init"
# 在 github.com 创建新仓库 nail-academy
git remote add origin https://github.com/你的用户名/nail-academy.git
git push -u origin main
```

### 2. Railway 部署
1. 打开 https://railway.app → GitHub 登录
2. New Project → Deploy from GitHub repo → 选仓库
3. 自动检测 Python 并部署
4. 获得域名 https://xxx.up.railway.app ← 记下来！

### 3. Railway 设置
- Variables: PORT=8000
- 添加 Volume 挂载到 /data

## 第二步：前端部署到 Vercel

### 1. 改 API 地址
编辑 frontend/.env.production：
VITE_API_URL=https://你的Railway域名.up.railway.app

### 2. Vercel 部署
1. 打开 https://vercel.com → GitHub 登录
2. Add New Project → 选仓库
3. Root Directory: frontend
4. Framework: Vite
5. Deploy
6. 获得域名 https://xxx.vercel.app

## 完成！
把 vercel.app 域名发给任何人，手机浏览器打开就能用。
