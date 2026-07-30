"""
生产模式服务器 — 同时提供 API + 前端静态文件 + 视频
一键启动，无需分别启动前后端。适合部署到服务器。

用法:
    python serve.py              # 开发模式 (localhost:8000)
    python serve.py --host 0.0.0.0 --port 80   # 生产模式，监听所有网络接口
"""
import os
import sys
import argparse
import uvicorn

# Add frontend dist directory to static files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIST = os.path.join(BASE_DIR, '..', 'frontend', 'dist')

def main():
    parser = argparse.ArgumentParser(description='美甲学院 - 生产服务器')
    parser.add_argument('--host', default='0.0.0.0', help='监听地址')
    parser.add_argument('--port', type=int, default=8000, help='监听端口')
    parser.add_argument('--reload', action='store_true', help='开发模式热重载')
    args = parser.parse_args()

    # Check if frontend is built
    if not os.path.exists(FRONTEND_DIST):
        print("⚠️  前端未构建，正在构建...")
        import subprocess
        frontend_dir = os.path.join(BASE_DIR, '..', 'frontend')
        subprocess.run(['npm', 'run', 'build'], cwd=frontend_dir, check=True)
        print("✅ 前端构建完成")

    print(f"""
╔══════════════════════════════════════════╗
║     💅 美甲学院 Nail Art Academy       ║
║                                          ║
║   📱 访问地址: http://{args.host}:{args.port}     ║
║   📺 API文档:  http://{args.host}:{args.port}/docs ║
║   🎬 本地视频: {args.host}:{args.port}/videos  ║
║                                          ║
║   每日更新: python scraper/auto_update.py║
╚══════════════════════════════════════════╝
""")

    # Update main.py to serve frontend static files
    import main as app_module
    from fastapi.staticfiles import StaticFiles
    from fastapi import FastAPI

    # Mount frontend static files
    app_module.app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, 'assets')), name="assets")

    # Serve index.html for all non-API routes (SPA fallback)
    from fastapi.responses import FileResponse
    @app_module.app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Skip API routes
        if full_path.startswith(('api/', 'videos/', 'docs', 'openapi.json')):
            from fastapi import HTTPException
            raise HTTPException(status_code=404)

        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and not os.path.isdir(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, 'index.html'))

    uvicorn.run(
        "main:app",
        host=args.host,
        port=args.port,
        reload=args.reload,
    )

if __name__ == '__main__':
    main()
