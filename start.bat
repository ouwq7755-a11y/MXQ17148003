@echo off
chcp 65001 >nul
title 美甲学院 - Nail Art Academy

echo ========================================
echo 🎨 美甲学院 - AI美甲教学平台
echo ========================================
echo.

:: Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Python，请先安装Python 3
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

:: Install backend dependencies
echo 📥 检查后端依赖...
cd /d "%~dp0backend"
pip install fastapi uvicorn sqlalchemy pydantic >nul 2>&1

:: Install frontend dependencies
echo 📥 检查前端依赖...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo 📥 安装前端依赖（首次需要几分钟）...
    npm install
)

:: Start backend
echo 🚀 启动后端API (端口8000)...
cd /d "%~dp0backend"
start "美甲学院-后端" cmd /c "python main.py"

:: Wait for backend
echo ⏳ 等待后端启动...
timeout /t 3 >nul

:: Start frontend
echo 🎨 启动前端界面 (端口5173)...
cd /d "%~dp0frontend"
start "美甲学院-前端" cmd /c "npx vite --host 0.0.0.0"

echo.
echo ========================================
echo ✅ 启动完成！
echo.
echo 📱 本机访问: http://localhost:5173
echo 📱 局域网访问: 查看前端窗口显示的地址
echo.
echo ⏰ 每日更新: 新开终端运行
echo    cd scraper
echo    python auto_update.py --schedule
echo ========================================
echo.
pause
