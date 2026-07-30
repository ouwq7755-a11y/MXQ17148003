#!/usr/bin/env python3
"""
美甲工具教学视频采集器
专门采集工具使用教学视频，匹配到数据库中的工具档案。

Usage:
    python tool_video_collector.py              # 采集并入库
    python tool_video_collector.py --test       # 测试预览
"""

import sys
import os
import re
import time
import logging
import argparse
from typing import List, Dict

import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('tool-video')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://m.bilibili.com',
    'Accept': 'application/json',
}

# 每类工具对应的搜索关键词
TOOL_SEARCH_QUERIES = {
    "指甲刀": ["美甲指甲刀怎么选", "指甲刀使用教程"],
    "指甲搓条": ["美甲搓条使用方法", "美甲打磨条教程"],
    "海绵抛": ["美甲海绵抛怎么用", "美甲打磨教程"],
    "LED光疗灯": ["美甲光疗灯推荐", "光疗灯怎么选", "美甲烤灯教程"],
    "死皮剪": ["美甲死皮剪使用教程", "死皮剪怎么用"],
    "死皮推": ["美甲死皮推教程", "美甲前置处理教程"],
    "拉线笔/细毛笔": ["美甲拉线笔教程", "美甲彩绘笔使用"],
    "彩绘笔套装": ["美甲彩绘笔推荐", "美甲手绘工具介绍"],
    "法式贴纸": ["美甲法式贴纸教程", "法式贴纸怎么用"],
    "猫眼磁铁": ["猫眼磁铁使用方法", "美甲磁铁教程"],
    "化妆海绵": ["美甲海绵渐变教程", "海绵渐变美甲"],
    "雕花笔": ["美甲雕花笔教程", "3D雕花美甲教程"],
    "拉花针/牙签": ["美甲拉花教程", "大理石纹美甲教程"],
    "解胶剂": ["穿戴甲卸除教程", "美甲解胶剂使用"],
    "点钻笔/拾取笔": ["美甲点钻教程", "美甲贴钻教程"],
    "延甲笔": ["延长甲教程", "光疗延长教程"],
    "抛光条": ["美甲抛光教程", "指甲抛光教程"],
}


def strip_html(text: str) -> str:
    return re.sub(r'<[^>]+>', '', text)


def search_bilibili(keyword: str, max_results: int = 5) -> List[Dict]:
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
                    "embed_url": f"//player.bilibili.com/player.html?bvid={bvid}&page=1&high_quality=1&autoplay=0&danmaku=0",
                    "cover": v.get('pic', ''),
                    "url": f"https://www.bilibili.com/video/{bvid}",
                })
    except Exception as e:
        logger.warning(f"  ⚠️ 搜索异常 [{keyword}]: {e}")
    return videos


def main():
    parser = argparse.ArgumentParser(description='工具教学视频采集器')
    parser.add_argument('--test', '-t', action='store_true', help='测试模式')
    args = parser.parse_args()

    from database import SessionLocal
    from models import Tool

    logger.info("=" * 60)
    logger.info("🔧 美甲工具教学视频采集器")
    logger.info(f"   模式: {'🧪 测试' if args.test else '📥 入库'}")
    logger.info("=" * 60)

    # Collect videos for each tool
    db = SessionLocal()
    tools = db.query(Tool).all()
    updated = 0

    for tool in tools:
        tool_name = tool.name.split('(')[0].strip()  # Remove parenthetical info
        queries = TOOL_SEARCH_QUERIES.get(tool_name, [f"{tool_name} 美甲教程"])

        logger.info(f"\n🔍 {tool_name}")
        best_video = None

        for query in queries[:2]:
            videos = search_bilibili(query, max_results=3)
            for v in videos:
                # Score: prefer title containing the tool name
                score = sum(1 for ch in tool_name if ch in v['title'])
                if best_video is None or score > best_video.get('_score', 0):
                    v['_score'] = score
                    best_video = v
            time.sleep(0.5)

        if best_video:
            logger.info(f"  ✅ {best_video['title'][:55]}")
            if not args.test:
                if not tool.video_url:
                    tool.video_url = best_video['embed_url']
                    tool.image_url = best_video.get('cover', '')
                    updated += 1
                    logger.info(f"     → 已入库")
                else:
                    logger.info(f"     → 已有视频，跳过")
        else:
            logger.info(f"  ❌ 未找到相关视频")

    if not args.test:
        db.commit()
    db.close()

    logger.info(f"\n{'='*60}")
    logger.info(f"📊 完成: {updated} 个工具已匹配视频")
    logger.info(f"{'='*60}")


if __name__ == '__main__':
    main()
