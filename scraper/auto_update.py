#!/usr/bin/env python3
"""
美甲学院 - 每日自动更新系统

完整自动化流水线：
1. 从B站搜索最新美甲教程视频
2. 下载720p视频+音频，用ffmpeg合并
3. AI清洗分类、打标签
4. 自动入库 → 前端即可观看

用法:
    python auto_update.py              # 立即执行一次完整更新
    python auto_update.py --schedule   # 每日定时模式（后台运行）
    python auto_update.py --test       # 测试模式（不入库）
"""

import sys, os, re, json, time, logging, argparse, subprocess, hashlib
from datetime import datetime
from typing import List, Dict, Optional

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'auto_update.log'), encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('auto-update')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://m.bilibili.com',
    'Accept': 'application/json',
}

VIDEOS_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'videos')
os.makedirs(VIDEOS_DIR, exist_ok=True)

# ffmpeg path
try:
    import imageio_ffmpeg
    FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG = None

# ── 搜索关键词（不断扩充新内容） ──────────────────────
SEARCH_QUERIES = [
    "美甲教程新手入门",
    "美甲教程2024",
    "美甲教程2025",
    "法式美甲教程",
    "渐变美甲教程",
    "猫眼美甲教程",
    "穿戴甲制作教程",
    "延长甲教程",
    "美甲手绘教程",
    "美甲秋冬新款",
    "美甲春夏新款",
    "日式美甲教程",
    "韩式美甲教程",
    "美甲设计教程",
    "美甲彩绘教程",
    "美甲雕花教程",
    "美甲贴钻教程",
    "大理石纹美甲",
    "磨砂美甲教程",
    "镜面美甲教程",
    "美甲diy教程",
    "新手学美甲",
]


def strip_html(text: str) -> str:
    return re.sub(r'<[^>]+>', '', text)


def search_videos(keyword: str, count: int = 5) -> List[Dict]:
    """从B站搜索视频"""
    videos = []
    try:
        api = f'https://api.bilibili.com/x/web-interface/search/all/v2?keyword={keyword}&page=1'
        resp = requests.get(api, headers=HEADERS, timeout=15)
        data = resp.json()
        if data.get('code') != 0:
            return videos

        for group in data.get('data', {}).get('result', []):
            if group.get('result_type') != 'video':
                continue
            for v in group.get('data', [])[:count]:
                bvid = v.get('bvid', '')
                title = strip_html(v.get('title', ''))
                if not bvid or len(title) < 8:
                    continue
                videos.append({
                    "bvid": bvid,
                    "title": title[:200],
                    "description": strip_html(v.get('description', ''))[:300],
                    "author": v.get('author', ''),
                    "play": v.get('play', 0),
                    "duration": v.get('duration', ''),
                    "cover": v.get('pic', ''),
                    "tag": v.get('tag', ''),
                })
    except Exception as e:
        logger.warning(f"搜索失败 [{keyword}]: {e}")
    return videos


def download_with_audio(bvid: str, filename: str) -> Optional[str]:
    """下载720p视频+音频并合并，返回文件路径"""
    base = os.path.join(VIDEOS_DIR, filename)

    # Skip if already exists
    for ext in ['.mp4', '.mkv', '.webm']:
        if os.path.exists(base + ext) and os.path.getsize(base + ext) > 50000:
            return f"/videos/{filename}{ext}"

    video_tmp = base + '_v.mp4'
    audio_tmp = base + '_a.m4a'
    merged_tmp = base + '_av.mp4'
    final = base + '.mp4'

    try:
        # Download video track (720p)
        subprocess.run(
            ['yt-dlp', '-f', '30064', '--no-playlist', '--no-progress',
             '-o', video_tmp, f'https://www.bilibili.com/video/{bvid}'],
            capture_output=True, text=True, timeout=120, cwd=VIDEOS_DIR
        )

        # Download audio track
        subprocess.run(
            ['yt-dlp', '-f', '30280', '--no-playlist', '--no-progress',
             '-o', audio_tmp, f'https://www.bilibili.com/video/{bvid}'],
            capture_output=True, text=True, timeout=120, cwd=VIDEOS_DIR
        )

        # Merge with ffmpeg
        if os.path.exists(video_tmp) and os.path.getsize(video_tmp) > 10000:
            if os.path.exists(audio_tmp) and os.path.getsize(audio_tmp) > 5000 and FFMPEG:
                subprocess.run(
                    [FFMPEG, '-y', '-i', video_tmp, '-i', audio_tmp,
                     '-c:v', 'copy', '-c:a', 'aac', '-shortest', merged_tmp],
                    capture_output=True, text=True, timeout=120
                )
                if os.path.exists(merged_tmp):
                    os.replace(merged_tmp, final)
                else:
                    os.replace(video_tmp, final)  # No audio, use video-only
            else:
                os.replace(video_tmp, final)

            # Cleanup
            for tmp in [video_tmp, audio_tmp, merged_tmp]:
                if os.path.exists(tmp):
                    os.remove(tmp)

            if os.path.exists(final) and os.path.getsize(final) > 50000:
                size_mb = os.path.getsize(final) / (1024 * 1024)
                logger.info(f"  📥 下载完成: {filename}.mp4 ({size_mb:.1f}MB)")
                return f"/videos/{filename}.mp4"

    except Exception as e:
        logger.warning(f"  ⚠️ 下载失败: {e}")

    return None


def classify_tutorial(title: str, desc: str) -> tuple:
    """AI分类 + 难度判断"""
    text = (title + ' ' + desc).lower()

    cat_kw = {
        "basic": ["新手", "入门", "基础", "零基础", "第一次"],
        "french": ["法式", "微笑线"],
        "gradient": ["渐变", "晕染", "海绵"],
        "cat-eye": ["猫眼", "磁铁", "磁石"],
        "3d-nail": ["3d", "立体", "雕花", "浮雕", "贴钻", "碎钻"],
        "marble": ["大理石", "水染", "纹路"],
        "extension": ["延长", "纸托", "甲片"],
        "nail-art": ["手绘", "彩绘", "画花", "花卉"],
        "wearable": ["穿戴甲", "diy", "果冻胶"],
        "care": ["护理", "养护", "修复"],
        "tools-guide": ["工具", "推荐", "选购", "清单"],
        "gel": ["美甲", "甲油", "配色", "款式", "磨砂", "镜面"],
    }

    scores = {}
    for cat, kws in cat_kw.items():
        score = sum(1 for kw in kws if kw in text)
        if score > 0:
            scores[cat] = score

    category = max(scores, key=scores.get) if scores else "gel"

    diff_kw = {
        "beginner": ["新手", "入门", "零基础", "简单", "基础"],
        "intermediate": ["进阶", "中级", "技巧", "提升"],
        "advanced": ["高级", "专业", "雕花", "手绘", "3d"],
    }
    d_scores = {k: sum(1 for kw in kws if kw in text) for k, kws in diff_kw.items()}
    difficulty = max(d_scores, key=d_scores.get) if max(d_scores.values()) > 0 else "beginner"

    # Generate tags
    tag_kw = {
        "新手入门": ["新手", "入门", "零基础"],
        "进阶技法": ["进阶", "技巧", "中级"],
        "专业级": ["专业", "高级", "雕花", "手绘"],
        "日系": ["日系", "日式"],
        "韩系": ["韩系", "韩式"],
        "秋冬款": ["秋冬", "冬季"],
        "春夏款": ["春夏", "夏季", "春天"],
        "婚甲": ["婚礼", "婚甲", "新娘"],
        "日常通勤": ["日常", "通勤"],
        "显白": ["显白", "显肤"],
    }
    tags = [tag for tag, kws in tag_kw.items() if any(kw in text for kw in kws)]
    if not tags:
        tags = ["新手入门"]

    return category, difficulty, tags[:5]


def generate_slug(title: str) -> str:
    slug = re.sub(r'[^\w\s-]', '', title.lower().strip())
    slug = re.sub(r'[-\s]+', '-', slug)[:80]
    ts = datetime.now().strftime('%Y%m%d')
    return f"{slug}-{ts}"


class AutoUpdater:
    def __init__(self, test_mode=False):
        self.test_mode = test_mode
        self.stats = {"searched": 0, "downloaded": 0, "imported": 0, "skipped": 0}

    def run(self):
        logger.info("=" * 60)
        logger.info("🤖 美甲学院 - 每日自动更新")
        logger.info(f"   模式: {'🧪 测试' if self.test_mode else '📥 正式'}")
        logger.info(f"   时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info(f"   ffmpeg: {'✅' if FFMPEG else '❌ 未找到（视频将无音频）'}")
        logger.info("=" * 60)

        # Phase 1: Search and collect
        all_videos = []
        seen_bvids = set()

        # Load existing BVIDs from DB to skip
        existing_bvids = self._get_existing_bvids()

        for query in SEARCH_QUERIES:
            logger.info(f"\n🔍 搜索: {query}")
            videos = search_videos(query, count=3)
            new_count = 0
            for v in videos:
                if v['bvid'] not in seen_bvids and v['bvid'] not in existing_bvids:
                    seen_bvids.add(v['bvid'])
                    all_videos.append(v)
                    new_count += 1
            logger.info(f"   → 新视频: {new_count} 个")
            self.stats["searched"] += new_count
            time.sleep(0.5)

        logger.info(f"\n📊 搜索完成: 发现 {len(all_videos)} 个新视频")

        if not all_videos:
            logger.info("没有新内容，更新完成")
            return

        # Phase 2: Download top videos (limit to avoid too much disk usage)
        to_download = all_videos[:15]  # Download up to 15 per run
        logger.info(f"\n📥 开始下载 {len(to_download)} 个视频...")

        for i, v in enumerate(to_download):
            logger.info(f"\n[{i+1}/{len(to_download)}] {v['title'][:50]}")
            filename = f"auto_{v['bvid']}"
            local_path = download_with_audio(v['bvid'], filename)

            if local_path:
                v['local_path'] = local_path
                self.stats["downloaded"] += 1
            else:
                self.stats["skipped"] += 1

            time.sleep(1)

        # Phase 3: Import to database
        if not self.test_mode:
            logger.info(f"\n📦 入库 {len([v for v in to_download if 'local_path' in v])} 个新教程...")
            self._import_to_db([v for v in to_download if 'local_path' in v])
        else:
            logger.info(f"\n🧪 测试模式: 跳过入库")
            for v in to_download:
                if 'local_path' in v:
                    logger.info(f"  📹 {v['title'][:50]} → {v['local_path']}")

        # Summary
        logger.info(f"\n{'='*60}")
        logger.info(f"📊 本次更新汇总:")
        logger.info(f"   搜索发现: {self.stats['searched']} 个")
        logger.info(f"   下载成功: {self.stats['downloaded']} 个")
        logger.info(f"   入库成功: {self.stats['imported']} 个")
        logger.info(f"   跳过:     {self.stats['skipped']} 个")
        self._show_db_stats()
        logger.info(f"{'='*60}")

    def _get_existing_bvids(self) -> set:
        """获取数据库中已有的视频BVID"""
        try:
            from database import SessionLocal
            from models import Tutorial
            db = SessionLocal()
            bvids = set()
            for tut in db.query(Tutorial).filter(Tutorial.video_url != "").all():
                match = re.search(r'BV[a-zA-Z0-9]{10}', tut.video_url or '')
                if match:
                    bvids.add(match.group(0))
            db.close()
            return bvids
        except Exception:
            return set()

    def _import_to_db(self, videos: List[Dict]):
        """导入视频到数据库"""
        from database import SessionLocal
        from models import Tutorial, Category

        db = SessionLocal()
        categories = {c.name: c.id for c in db.query(Category).all()}

        for v in videos:
            title = v['title']
            desc = v.get('description', '')
            category, difficulty, tags = classify_tutorial(title, desc)

            # Map category
            cat_id = categories.get(category)
            if not cat_id:
                cat_id = categories.get('gel', 1)  # Default to gel category

            # Check for duplicate title
            existing = db.query(Tutorial).filter(Tutorial.title == title).first()
            if existing:
                if not existing.video_url and v.get('local_path'):
                    existing.video_url = v['local_path']
                    existing.cover_image = v.get('cover', '')
                    self.stats["imported"] += 1
                    logger.info(f"  📹 补充视频: {title[:40]}")
                continue

            slug = generate_slug(title)

            # Handle tags
            from models import Tag
            tag_objs = []
            for tag_name in tags:
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()
                tag_objs.append(tag)

            tutorial = Tutorial(
                title=title,
                slug=slug,
                category_id=cat_id,
                difficulty=difficulty,
                description=desc,
                video_url=v.get('local_path', ''),
                cover_image=v.get('cover', ''),
                source_type="auto_collected",
                source_url=f"https://www.bilibili.com/video/{v['bvid']}",
                steps="[]",
                tips="[]",
                tags=tag_objs,
            )
            db.add(tutorial)
            self.stats["imported"] += 1
            logger.info(f"  ✅ 入库: [{category}|{difficulty}] {title[:45]}")

        db.commit()
        db.close()

    def _show_db_stats(self):
        try:
            from database import SessionLocal
            from models import Tutorial
            db = SessionLocal()
            total = db.query(Tutorial).count()
            with_video = db.query(Tutorial).filter(Tutorial.video_url != "").count()
            db.close()
            logger.info(f"   数据库: {total} 篇教程, {with_video} 篇有本地视频")
        except Exception:
            pass


def run_scheduled():
    """每日定时运行模式"""
    logger.info("🕐 启动每日自动更新（每天凌晨2点执行）")
    while True:
        now = datetime.now()
        # Run at 2:00 AM
        if now.hour == 2 and now.minute < 5:
            updater = AutoUpdater()
            updater.run()
            # Sleep through the rest of the hour
            time.sleep(3600)
        else:
            # Check every 5 minutes
            time.sleep(300)


def main():
    parser = argparse.ArgumentParser(description='美甲学院 - 每日自动更新')
    parser.add_argument('--test', '-t', action='store_true', help='测试模式')
    parser.add_argument('--schedule', '-s', action='store_true', help='每日定时模式')
    args = parser.parse_args()

    if args.schedule:
        run_scheduled()
    else:
        updater = AutoUpdater(test_mode=args.test)
        updater.run()


if __name__ == '__main__':
    main()
