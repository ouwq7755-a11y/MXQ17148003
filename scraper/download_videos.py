#!/usr/bin/env python3
"""
Download nail art tutorial videos from Bilibili to local storage.
Stores videos in backend/videos/ for local playback.
"""
import sys, os, subprocess, json, time, re, logging

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('video-downloader')

VIDEOS_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'videos')
os.makedirs(VIDEOS_DIR, exist_ok=True)


def download_video(bvid: str, filename: str = None) -> str | None:
    """Download a Bilibili video. Returns the local filename if successful."""
    if not filename:
        filename = bvid

    # Check if already exists
    existing = [f for f in os.listdir(VIDEOS_DIR) if f.startswith(filename) and f.endswith('.mp4')]
    if existing:
        logger.info(f"  ✅ Already downloaded: {existing[0]}")
        return existing[0]

    url = f"https://www.bilibili.com/video/{bvid}"
    output = os.path.join(VIDEOS_DIR, f"{filename}.mp4")

    try:
        # Download 360p video-only (no audio needed for tutorial, keeps file small)
        # Bilibili format 30016 = 640x360 mp4, universally available
        cmd = [
            'yt-dlp', '-f', '30016',  # 360p video-only
            '--no-playlist', '--no-progress',
            '-o', output,
            url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, cwd=VIDEOS_DIR)
        if result.returncode != 0:
            # Fallback: try 360p av01 codec
            cmd = ['yt-dlp', '-f', '100022', '--no-playlist', '--no-progress', '-o', output, url]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120, cwd=VIDEOS_DIR)

        # Check if file was created
        if os.path.exists(output) and os.path.getsize(output) > 10000:
            size_mb = os.path.getsize(output) / (1024 * 1024)
            logger.info(f"  ✅ Downloaded: {filename}.mp4 ({size_mb:.1f}MB)")
            return f"{filename}.mp4"
        else:
            # Check for other extensions
            for ext in ['.mp4', '.mkv', '.flv', '.webm']:
                alt = os.path.join(VIDEOS_DIR, f"{filename}{ext}")
                if os.path.exists(alt) and os.path.getsize(alt) > 10000:
                    size_mb = os.path.getsize(alt) / (1024 * 1024)
                    logger.info(f"  ✅ Downloaded: {filename}{ext} ({size_mb:.1f}MB)")
                    return f"{filename}{ext}"
            return None

    except subprocess.TimeoutExpired:
        logger.warning(f"  ⚠️ Timeout: {url}")
        return None
    except Exception as e:
        logger.warning(f"  ⚠️ Error: {e}")
        return None


def main():
    from database import SessionLocal
    from models import Tutorial, Tool

    db = SessionLocal()

    # Get all tutorials and tools that have video URLs
    tutorials = db.query(Tutorial).filter(Tutorial.video_url != "").all()
    tools = db.query(Tool).filter(Tool.video_url != "").all()

    logger.info("=" * 60)
    logger.info("📥 批量下载美甲教学视频到本地")
    logger.info(f"   教程视频: {len(tutorials)} 个")
    logger.info(f"   工具视频: {len(tools)} 个")
    logger.info(f"   存储目录: {VIDEOS_DIR}")
    logger.info("=" * 60)

    downloaded = 0
    skipped = 0
    failed = 0

    # Download tutorial videos (pick key ones first)
    priority_tuts = [t for t in tutorials if t.difficulty in ('beginner', 'intermediate')][:10]
    for tut in priority_tuts:
        bvid_match = re.search(r'BV[a-zA-Z0-9]{10}', tut.video_url or '')
        if not bvid_match:
            continue
        bvid = bvid_match.group(0)

        logger.info(f"\n📹 {tut.title[:50]}...")
        filename = f"tut_{tut.id}"
        result = download_video(bvid, filename)

        if result:
            tut.video_url = f"/videos/{result}"
            downloaded += 1
        else:
            failed += 1

        time.sleep(1)  # polite delay

    # Download tool videos (pick a few key ones)
    priority_tools = tools[:5]
    for tool in priority_tools:
        bvid_match = re.search(r'BV[a-zA-Z0-9]{10}', tool.video_url or '')
        if not bvid_match:
            continue
        bvid = bvid_match.group(0)

        logger.info(f"\n🔧 {tool.name}...")
        filename = f"tool_{tool.id}"
        result = download_video(bvid, filename)

        if result:
            tool.video_url = f"/videos/{result}"
            downloaded += 1
        else:
            failed += 1

        time.sleep(1)

    db.commit()
    db.close()

    logger.info(f"\n{'='*60}")
    logger.info(f"📊 完成: {downloaded} 下载, {failed} 失败")
    logger.info(f"{'='*60}")


if __name__ == '__main__':
    main()
