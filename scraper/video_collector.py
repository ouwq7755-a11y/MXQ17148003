#!/usr/bin/env python3
"""
美甲教学视频采集器
从B站API采集真实美甲教学视频，自动匹配到数据库中的教程。

Usage:
    python video_collector.py              # 采集视频并匹配入库
    python video_collector.py --test       # 测试模式（仅预览）
    python video_collector.py --stats      # 显示当前视频覆盖情况
"""

import sys
import os
import re
import time
import logging
import argparse
from typing import List, Dict, Optional

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('video-collector')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://m.bilibili.com',
    'Accept': 'application/json',
}

# 搜索关键词（按分类，每类多个关键词获得更精准的视频）
SEARCH_QUERIES = {
    "basic": ["美甲教程新手入门", "零基础美甲教程", "美甲基础入门教学"],
    "gel": ["甲油胶美甲教程", "秋冬美甲配色", "美甲上色教程"],
    "french": ["法式美甲教程", "法式美甲新手"],
    "gradient": ["渐变美甲教程", "海绵渐变美甲", "双色渐变美甲教程"],
    "cat-eye": ["猫眼美甲教程", "猫眼胶磁铁教程"],
    "3d-nail": ["美甲贴钻教程", "立体雕花美甲", "美甲饰品教程"],
    "marble": ["大理石纹美甲教程", "水染美甲教程"],
    "extension": ["延长甲教程", "纸托延长甲", "光疗延长甲教程"],
    "nail-art": ["美甲手绘教程", "美甲彩绘花朵", "美甲画花"],
    "wearable": ["穿戴甲制作教程", "穿戴甲佩戴", "DIY穿戴甲"],
    "care": ["指甲护理教程", "美甲修复", "美甲养护"],
    "tools-guide": ["美甲工具使用教程", "光疗灯推荐", "美甲工具介绍"],
}


def strip_html(text: str) -> str:
    """Remove HTML tags from text"""
    return re.sub(r'<[^>]+>', '', text)


def search_bilibili(keyword: str, max_results: int = 10) -> List[Dict]:
    """通过B站搜索API v2获取视频列表"""
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
            for v in group.get('data', [])[:max_results]:
                bvid = v.get('bvid', '')
                title = strip_html(v.get('title', ''))
                if not bvid or not title:
                    continue

                videos.append({
                    "bvid": bvid,
                    "title": title[:200],
                    "description": strip_html(v.get('description', ''))[:300],
                    "url": f"https://www.bilibili.com/video/{bvid}",
                    "embed_url": f"//player.bilibili.com/player.html?bvid={bvid}&page=1&high_quality=1&autoplay=0",
                    "cover": v.get('pic', ''),
                    "duration": v.get('duration', ''),
                    "play": v.get('play', 0),
                    "author": v.get('author', ''),
                    "platform": "bilibili",
                })

    except Exception as e:
        logger.warning(f"  ⚠️ 搜索异常 [{keyword}]: {e}")

    return videos


def match_keywords(video_title: str, tut_title: str, tut_cat: str) -> int:
    """计算视频与教程的相关性分数"""
    score = 0
    title_lower = video_title.lower()
    tut_lower = tut_title.lower()

    # 精确关键词匹配
    strong_kw = {
        "basic": ["新手", "入门", "基础", "零基础", "全流程", "保姆级"],
        "french": ["法式", "微笑线"],
        "gradient": ["渐变", "晕染", "海绵"],
        "cat-eye": ["猫眼", "磁铁", "磁石"],
        "3d-nail": ["3d", "立体", "雕花", "浮雕", "贴钻", "碎钻", "亮片", "饰品"],
        "marble": ["大理石", "水染", "纹路"],
        "extension": ["延长", "纸托", "光疗延长", "甲片"],
        "nail-art": ["手绘", "彩绘", "画花", "花卉", "图案"],
        "wearable": ["穿戴甲", "diy", "果冻胶", "可拆卸"],
        "care": ["护理", "养护", "修复"],
        "tools-guide": ["工具", "光疗灯", "推荐", "选购"],
        "gel": ["上色", "配色", "磨砂", "镜面", "秋冬", "春夏"],
    }

    cat_kw = strong_kw.get(tut_cat, [])
    for kw in cat_kw:
        if kw.lower() in title_lower:
            score += 5
        if kw.lower() in tut_lower:
            score += 3

    # 通用美甲关键词
    general_kw = ["美甲", "教程", "教学", "nail", "指甲"]
    for kw in general_kw:
        if kw.lower() in title_lower:
            score += 1

    return score


class VideoCollector:
    def __init__(self, test_mode=False):
        self.test_mode = test_mode

    def run(self):
        logger.info("=" * 60)
        logger.info("🎬 美甲教学视频采集器")
        logger.info(f"   模式: {'🧪 测试预览' if self.test_mode else '📥 正式入库'}")
        logger.info("=" * 60)

        # 1. 采集所有视频
        all_videos = []
        for category, queries in SEARCH_QUERIES.items():
            for query in queries[:2]:
                logger.info(f"  🔍 [{category}] {query}")
                videos = search_bilibili(query, max_results=6)
                for v in videos:
                    v['category'] = category
                all_videos.extend(videos)
                time.sleep(0.6)

        # 去重
        seen_bv = set()
        unique_videos = []
        for v in all_videos:
            if v['bvid'] not in seen_bv:
                seen_bv.add(v['bvid'])
                unique_videos.append(v)

        logger.info(f"\n✅ 共采集 {len(unique_videos)} 个不重复视频\n")

        if self.test_mode:
            self._preview(unique_videos)
        else:
            self._update_db(unique_videos)

    def _preview(self, videos: List[Dict]):
        """预览模式"""
        db = self._get_db()
        from models import Tutorial
        tutorials = db.query(Tutorial).all()
        tut_data = [{"id": t.id, "title": t.title, "slug": t.slug,
                      "category_name": t.category.name if t.category else ""}
                    for t in tutorials]
        db.close()

        matched = 0
        for v in videos[:40]:
            best_tut, best_score = None, 0
            for t in tut_data:
                s = match_keywords(v['title'], t['title'], t['category_name'])
                if s > best_score:
                    best_score = s
                    best_tut = t

            if best_score >= 6:
                matched += 1
                logger.info(f"  ✅ 得分{best_score:2d} | {v['title'][:50]}")
                logger.info(f"     → {best_tut['title'][:55]}")
                logger.info(f"     📺 {v['url']}")
            else:
                logger.info(f"  📹 得分{best_score:2d} | [{v['category']}] {v['title'][:60]}")

        logger.info(f"\n📊 {len(videos)} 个视频，{matched} 个成功匹配教程")

    def _update_db(self, videos: List[Dict]):
        """入库模式 - 确保每个教程都能获得最匹配的视频"""
        db = self._get_db()
        from models import Tutorial

        # Get all tutorials needing videos
        all_tuts = db.query(Tutorial).all()
        tut_data = [{"id": t.id, "title": t.title, "slug": t.slug,
                      "category_name": t.category.name if t.category else ""}
                    for t in all_tuts]

        # Organize videos by category
        cat_videos = {}
        for v in videos:
            cat = v.get('category', 'other')
            if cat not in cat_videos:
                cat_videos[cat] = []
            cat_videos[cat].append(v)

        updated = 0

        # Pass 1: High-confidence keyword matching (score >= 8)
        for t in tut_data:
            if db.query(Tutorial).filter(Tutorial.id == t['id']).first().video_url:
                continue  # Already has video

            best_v, best_score = None, 0
            for v in videos:
                s = match_keywords(v['title'], t['title'], t['category_name'])
                if s > best_score:
                    best_score = s
                    best_v = v

            if best_score >= 8 and best_v:
                self._set_video(db, t['id'], best_v)
                updated += 1
                logger.info(f"  ✅ 精确匹配(得分{best_score}) | {best_v['title'][:45]}")
                logger.info(f"     → {t['title'][:50]}")

        # Pass 2: Category-level matching (score >= 5)
        for t in tut_data:
            if db.query(Tutorial).filter(Tutorial.id == t['id']).first().video_url:
                continue

            cat = t['category_name']
            pool = cat_videos.get(cat, videos)
            best_v, best_score = None, 0
            for v in pool:
                s = match_keywords(v['title'], t['title'], cat)
                if s > best_score:
                    best_score = s
                    best_v = v

            if best_score >= 5 and best_v:
                self._set_video(db, t['id'], best_v)
                updated += 1
                logger.info(f"  🔗 分类匹配(得分{best_score}) | {best_v['title'][:45]}")
                logger.info(f"     → {t['title'][:50]}")

        # Pass 3: Assign best available video from any category
        for t in tut_data:
            if db.query(Tutorial).filter(Tutorial.id == t['id']).first().video_url:
                continue

            best_v, best_score = None, 0
            for v in videos:
                s = match_keywords(v['title'], t['title'], t['category_name'])
                if s > best_score:
                    best_score = s
                    best_v = v

            if best_v:
                self._set_video(db, t['id'], best_v)
                updated += 1
                logger.info(f"  📹 通用匹配(得分{best_score}) | {best_v['title'][:45]}")
                logger.info(f"     → {t['title'][:50]}")

        db.commit()
        db.close()

        # Summary
        logger.info(f"\n{'='*60}")
        logger.info(f"📊 入库完成: {updated} 个教程已匹配视频")
        logger.info(f"{'='*60}")
        show_stats()

    def _set_video(self, db, tut_id: int, video: Dict):
        from models import Tutorial
        tut = db.query(Tutorial).filter(Tutorial.id == tut_id).first()
        if tut:
            tut.video_url = video['embed_url']
            tut.cover_image = video.get('cover', '')

    def _get_db(self):
        from database import SessionLocal
        return SessionLocal()


def show_stats():
    """显示视频覆盖统计"""
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
    from database import SessionLocal
    from models import Tutorial

    db = SessionLocal()
    total = db.query(Tutorial).count()
    with_video = db.query(Tutorial).filter(Tutorial.video_url != "").count()
    without = total - with_video
    db.close()

    print(f"\n📺 视频覆盖: {with_video}/{total} 有视频 ({with_video*100//total}%)")
    if without > 0:
        print(f"   {without} 个教程暂无视频，再次运行 python video_collector.py 补充")


def main():
    parser = argparse.ArgumentParser(description='美甲教学视频采集器')
    parser.add_argument('--test', '-t', action='store_true', help='测试模式（不入库）')
    parser.add_argument('--stats', '-s', action='store_true', help='显示视频覆盖统计')
    args = parser.parse_args()

    if args.stats:
        show_stats()
        return

    collector = VideoCollector(test_mode=args.test)
    collector.run()


if __name__ == '__main__':
    main()
