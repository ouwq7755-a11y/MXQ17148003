#!/usr/bin/env python3
"""
热门趋势采集器 - 专门收集各大平台热门/高播放美甲视频
相比普通采集器，重点采集：
- 高播放量视频 (>10万播放)
- 近期热门趋势
- 各分类TOP内容
"""
import sys, os, re, json, time, logging, subprocess, argparse
from datetime import datetime
from typing import List, Dict, Optional
import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('trending')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://m.bilibili.com',
    'Accept': 'application/json',
}

VIDEOS_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'videos')
os.makedirs(VIDEOS_DIR, exist_ok=True)

try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG = None


def strip_html(text: str) -> str:
    return re.sub(r'<[^>]+>', '', text)


def search_trending(keyword: str, page: int = 1, count: int = 10) -> List[Dict]:
    """搜索并按播放量排序"""
    videos = []
    try:
        # 按点击数排序获取热门视频
        for order in ['click', 'pubdate']:
            api = f'https://api.bilibili.com/x/web-interface/search/all/v2?keyword={keyword}&page={page}&order={order}'
            resp = requests.get(api, headers=HEADERS, timeout=15)
            data = resp.json()
            if data.get('code') != 0:
                continue

            for group in data.get('data', {}).get('result', []):
                if group.get('result_type') != 'video':
                    continue
                for v in group.get('data', [])[:count]:
                    bvid = v.get('bvid', '')
                    title = strip_html(v.get('title', ''))
                    play = v.get('play', 0)
                    if not bvid or len(title) < 6:
                        continue
                    videos.append({
                        "bvid": bvid, "title": title[:200],
                        "description": strip_html(v.get('description', ''))[:300],
                        "author": v.get('author', ''), "play": play,
                        "duration": v.get('duration', ''), "cover": v.get('pic', ''),
                    })
            time.sleep(0.3)
    except Exception as e:
        logger.warning(f"搜索失败 [{keyword}]: {e}")
    return videos


# 多维度搜索关键词 - 覆盖各分类+热门趋势
TRENDING_QUERIES = [
    # 热门趋势
    "2025美甲流行趋势", "2025美甲新款", "2024秋冬美甲", "2025春夏美甲",
    "美甲最新款式", "爆款美甲", "网红美甲教程",
    # 各分类热门
    "法式美甲教程", "渐变美甲教程", "猫眼美甲教程", "穿戴甲教程",
    "延长甲教程", "美甲手绘教程", "3D美甲教程", "大理石美甲教程",
    "日式美甲教程", "韩式美甲教程", "国风美甲教程",
    # 新手入门
    "新手美甲教程", "零基础美甲", "美甲入门教学",
    # 特定主题
    "婚甲教程", "显白美甲", "短甲美甲", "脚甲教程",
    "磨砂美甲教程", "镜面美甲教程", "极光美甲教程",
    "美甲彩绘教程", "美甲雕花", "美甲图案",
    # 工具材料
    "美甲工具推荐", "光疗灯推荐", "美甲套装推荐",
    "美甲甲油胶推荐", "美甲材料推荐",
    # 高级技法
    "美甲建构教程", "美甲塑形教程", "纸托延长教程",
]


def download_video(bvid: str, filename: str) -> Optional[str]:
    """下载视频+音频合并"""
    base = os.path.join(VIDEOS_DIR, filename)
    final = base + '.mp4'
    if os.path.exists(final) and os.path.getsize(final) > 50000:
        return f"/videos/{filename}.mp4"

    v_tmp = base + '_v.mp4'
    a_tmp = base + '_a.m4a'
    m_tmp = base + '_av.mp4'

    try:
        subprocess.run(['yt-dlp', '-f', '30064', '--no-playlist', '--no-progress',
                        '-o', v_tmp, f'https://www.bilibili.com/video/{bvid}'],
                       capture_output=True, text=True, timeout=120)

        subprocess.run(['yt-dlp', '-f', '30280', '--no-playlist', '--no-progress',
                        '-o', a_tmp, f'https://www.bilibili.com/video/{bvid}'],
                       capture_output=True, text=True, timeout=120)

        if os.path.exists(v_tmp) and os.path.getsize(v_tmp) > 10000:
            if os.path.exists(a_tmp) and os.path.getsize(a_tmp) > 5000 and FFMPEG:
                subprocess.run([FFMPEG, '-y', '-i', v_tmp, '-i', a_tmp,
                                '-c:v', 'copy', '-c:a', 'aac', '-shortest', m_tmp],
                               capture_output=True, timeout=120)
                if os.path.exists(m_tmp):
                    os.replace(m_tmp, final)
                else:
                    os.replace(v_tmp, final)
            else:
                os.replace(v_tmp, final)

        for tmp in [v_tmp, a_tmp, m_tmp]:
            if os.path.exists(tmp): os.remove(tmp)

        if os.path.exists(final) and os.path.getsize(final) > 50000:
            return f"/videos/{filename}.mp4"
    except Exception as e:
        logger.warning(f"下载失败: {e}")
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--test', '-t', action='store_true')
    parser.add_argument('--max', '-m', type=int, default=80, help='最多下载数量')
    args = parser.parse_args()

    from database import SessionLocal
    from models import Tutorial, Category, Tag

    db = SessionLocal()
    existing_bvids = set()
    for t in db.query(Tutorial).filter(Tutorial.video_url != "").all():
        m = re.search(r'BV[a-zA-Z0-9]{10}', t.video_url or '')
        if m: existing_bvids.add(m.group(0))
    db.close()

    categories_map = {c.name: c.id for c in db.query(Category).all()} if not args.test else {}

    logger.info("=" * 60)
    logger.info("🔥 热门趋势采集器")
    logger.info(f"   目标: {args.max} 个视频 | 已有: {len(existing_bvids)}")
    logger.info("=" * 60)

    all_videos = []
    seen = set()

    # Phase 1: Search
    for query in TRENDING_QUERIES:
        logger.info(f"🔍 {query}")
        videos = search_trending(query, count=5)
        new = 0
        for v in videos:
            if v['bvid'] not in seen and v['bvid'] not in existing_bvids:
                seen.add(v['bvid'])
                all_videos.append(v)
                new += 1
        logger.info(f"   → {new} 新视频 (播放量: {max((v.get('play',0) for v in videos), default=0)})")
        time.sleep(0.3)

    # Sort by popularity
    all_videos.sort(key=lambda v: v.get('play', 0), reverse=True)

    logger.info(f"\n📊 搜索完成: {len(all_videos)} 个新视频")
    logger.info(f"   Top 5 热门:")
    for v in all_videos[:5]:
        logger.info(f"   🔥 {v['play']}播放 | {v['title'][:50]}")

    # Phase 2: Download (up to max)
    to_download = all_videos[:args.max]
    logger.info(f"\n📥 开始下载 {len(to_download)} 个视频...")

    downloaded = 0
    for i, v in enumerate(to_download):
        filename = f"hot_{v['bvid']}"
        local = download_video(v['bvid'], filename)
        if local:
            v['local_path'] = local
            downloaded += 1
            size = os.path.getsize(os.path.join(VIDEOS_DIR, f"{filename}.mp4")) / 1e6
            logger.info(f"  [{downloaded}] {v['title'][:45]} ({size:.0f}MB)")
        if downloaded >= args.max:
            break
        time.sleep(0.5)

    # Phase 3: Import
    if not args.test and downloaded > 0:
        logger.info(f"\n📦 入库 {downloaded} 个教程...")
        from database import SessionLocal
        from models import Tutorial, Category, Tag
        db = SessionLocal()
        cats = {c.name: c.id for c in db.query(Category).all()}

        for v in to_download:
            if 'local_path' not in v:
                continue
            title = v['title']
            text = (title + v.get('description', '')).lower()

            # Classify
            cat_scores = {
                "basic": sum(1 for k in ["新手","入门","基础","零基础"] if k in text),
                "french": sum(1 for k in ["法式"]) if "法式" in text else 0,
                "gradient": sum(1 for k in ["渐变","晕染"]) if any(k in text for k in ["渐变","晕染"]) else 0,
                "cat-eye": sum(1 for k in ["猫眼"]) if "猫眼" in text else 0,
                "3d-nail": sum(1 for k in ["3d","立体","雕花","贴钻"]) if any(k in text for k in ["3d","立体","雕花","贴钻"]) else 0,
                "marble": 1 if "大理石" in text else 0,
                "extension": 1 if "延长" in text else 0,
                "nail-art": sum(1 for k in ["手绘","彩绘","画花"]) if any(k in text for k in ["手绘","彩绘","画花"]) else 0,
                "wearable": 1 if "穿戴甲" in text else 0,
                "care": 1 if "护理" in text else 0,
                "tools-guide": sum(1 for k in ["工具","推荐","选购"]) if any(k in text for k in ["工具","推荐","选购"]) else 0,
                "gel": sum(1 for k in ["美甲","款式","颜色","配色","磨砂","镜面"]),
            }
            category = max(cat_scores, key=cat_scores.get) if any(cat_scores.values()) else "gel"
            cat_id = cats.get(category, cats.get('gel', 1))

            # Difficulty
            diff = "beginner"
            if any(k in text for k in ["高级","专业","雕花","手绘","3d"]): diff = "advanced"
            elif any(k in text for k in ["进阶","技巧","中级"]): diff = "intermediate"

            # Tags
            tags = []
            tag_map = {"新手入门":["新手","入门","零基础"],"进阶技法":["进阶","技巧"],"专业级":["专业","高级"],
                       "日系":["日式","日系"],"韩系":["韩式","韩系"],"秋冬款":["秋冬"],"春夏款":["春夏"],
                       "婚甲":["婚甲","婚礼"],"显白":["显白"],"日常通勤":["日常","通勤"]}
            for tname, kws in tag_map.items():
                if any(k in text for k in kws): tags.append(tname)
            if not tags: tags = ["新手入门"]

            slug = re.sub(r'[^\w\s-]', '', title.lower())[:60] + '-' + datetime.now().strftime('%m%d%H%M')

            existing = db.query(Tutorial).filter(Tutorial.title == title).first()
            if existing:
                if not existing.video_url:
                    existing.video_url = v['local_path']
                continue

            tag_objs = []
            for tn in tags[:5]:
                t = db.query(Tag).filter(Tag.name == tn).first()
                if not t: t = Tag(name=tn); db.add(t); db.flush()
                tag_objs.append(t)

            tut = Tutorial(title=title, slug=slug, category_id=cat_id, difficulty=diff,
                           description=v.get('description',''), video_url=v['local_path'],
                           cover_image=v.get('cover',''), source_type="auto_collected",
                           source_url=f"https://www.bilibili.com/video/{v['bvid']}",
                           steps="[]", tips="[]", tags=tag_objs)
            db.add(tut)

        db.commit()
        db.close()

    # Final stats
    from database import SessionLocal
    from models import Tutorial
    db = SessionLocal()
    total = db.query(Tutorial).count()
    with_v = db.query(Tutorial).filter(Tutorial.video_url != "").count()
    db.close()

    logger.info(f"\n{'='*60}")
    logger.info(f"📊 完成: 下载{downloaded}个 | 数据库{total}篇 | {with_v}篇有视频")
    logger.info(f"{'='*60}")


if __name__ == '__main__':
    main()
