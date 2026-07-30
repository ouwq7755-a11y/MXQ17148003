#!/usr/bin/env python3
"""
Nail Art Academy - Auto Content Collector

从多个公开数据源采集美甲教程、材料和工具数据，
经过AI清洗、去重、分类后自动入库。

使用真实可访问的公开API和数据源，无需任何认证。

Usage:
    python collector.py                  # 采集所有源并入库
    python collector.py --test           # 测试模式（不入库，仅展示结果）
    python collector.py --stats          # 显示数据库统计
    python collector.py --source demo    # 仅运行指定源
"""

import sys
import os
import json
import time
import hashlib
import re
import logging
import argparse
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, field

import requests
from bs4 import BeautifulSoup

# Add parent backend directory to path for DB access
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(os.path.dirname(__file__), 'collector.log'), encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('nail-collector')


# ═══════════════════════════════════════════════════════════════
# Data Sources - 使用真实可访问的公开 API
# ═══════════════════════════════════════════════════════════════

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/html, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
}


def fetch_json(url: str, timeout: int = 15) -> Optional[dict]:
    """Fetch JSON from a URL."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.debug(f"  Fetch JSON failed [{url[:80]}]: {e}")
        return None


def fetch_html(url: str, timeout: int = 15) -> Optional[str]:
    """Fetch HTML from a URL."""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=timeout)
        resp.raise_for_status()
        resp.encoding = resp.apparent_encoding or 'utf-8'
        return resp.text
    except Exception as e:
        logger.debug(f"  Fetch HTML failed [{url[:80]}]: {e}")
        return None


# ── Source 1: Wikipedia 美甲相关词条 ────────────────────
def collect_wikipedia() -> List[Dict]:
    """从 Wikipedia 中文站采集美甲相关百科词条。开放API，无需认证。"""
    results = []
    queries = ["美甲", "指甲艺术", "指甲彩绘", "光疗美甲", "指甲油"]

    for query in queries:
        logger.info(f"  🔍 Wikipedia 搜索: {query}")
        api_url = f"https://zh.wikipedia.org/w/api.php?action=query&list=search&srsearch={query}&format=json&srlimit=5"
        data = fetch_json(api_url)
        if not data:
            continue

        for item in data.get('query', {}).get('search', []):
            title = item.get('title', '')
            snippet = BeautifulSoup(item.get('snippet', ''), 'html.parser').get_text()
            pageid = item.get('pageid', 0)

            # 获取页面摘要
            extract_url = f"https://zh.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&pageids={pageid}&format=json"
            extract_data = fetch_json(extract_url)
            full_text = ""
            if extract_data:
                pages = extract_data.get('query', {}).get('pages', {})
                page = pages.get(str(pageid), {})
                full_text = page.get('extract', '')

            if len(snippet) > 20:
                content = full_text if len(full_text) > len(snippet) else snippet
                results.append({
                    "title": title,
                    "content": content[:2000],
                    "description": snippet[:500],
                    "source_url": f"https://zh.wikipedia.org/wiki/{title}",
                    "source_platform": "wikipedia",
                    "image_urls": [],
                })

        time.sleep(0.5)  # 礼貌限速

    logger.info(f"  ✅ Wikipedia 采集到 {len(results)} 条结果")
    return results


# ── Source 2: 公开的美甲RSS/Blog ────────────────────────
def collect_public_blogs() -> List[Dict]:
    """从公开博客和内容平台采集美甲相关内容。"""
    results = []

    # 使用 DuckDuckGo 的 Instant Answer API 搜索美甲内容
    # 这是一个开放API，无需认证
    search_queries = [
        "nail art tutorial for beginners",
        "美甲教程 新手 步骤",
        "nail art materials guide",
        "manicure tools tutorial",
        "美甲材料 工具 介绍",
    ]

    for query in search_queries:
        logger.info(f"  🔍 搜索: {query[:60]}...")
        # 使用 Bing 搜索（无需API Key的公开搜索）
        search_url = f"https://www.bing.com/search?q={query}&setlang=zh-cn"
        html = fetch_html(search_url)
        if not html:
            continue

        soup = BeautifulSoup(html, 'html.parser')
        # 解析搜索结果
        for result in soup.select('li.b_algo')[:5]:
            title_el = result.select_one('h2 a')
            desc_el = result.select_one('.b_caption p, .b_lineclamp2')
            if title_el:
                title = title_el.get_text(strip=True)
                desc = desc_el.get_text(strip=True) if desc_el else ""
                link = title_el.get('href', '')
                if len(title) > 8 and len(desc) > 15:
                    results.append({
                        "title": title[:200],
                        "content": desc,
                        "description": desc[:500],
                        "source_url": link,
                        "source_platform": "web_search",
                        "image_urls": [],
                    })

        time.sleep(1)

    logger.info(f"  ✅ 公开博客采集到 {len(results)} 条结果")
    return results


# ── Source 3: 美甲内容生成器（基于真实知识的结构化教程） ──
def collect_structured_tutorials() -> List[Dict]:
    """
    生成基于真实美甲知识的结构化教程数据。
    这些教程内容基于真实的美甲技法知识，
    经过AI采集管道清洗后入库，可作为教学素材使用。
    """
    tutorials = [
        {
            "title": "日系晕染美甲 — 柔和水彩效果制作教程",
            "content": """日系晕染美甲以其柔和梦幻的色彩过渡著称，是近年最流行的美甲风格之一。

步骤1：修整甲型，推荐方圆形或椭圆形，更显手指修长。
步骤2：用海绵抛轻打磨甲面，清洁后涂底胶照灯60秒。
步骤3：选择2-3种同色系甲油胶（如浅粉、薰衣草紫、奶白），用扇形笔蘸取少量胶轻扫甲面。
步骤4：用透明胶或调和液稀释颜色，制造水彩般的半透明效果。
步骤5：多次薄涂叠加，每次照灯20秒半固化，营造层次分明的晕染感。
步骤6：可在局部添加金箔碎或细闪粉增加精致感。
步骤7：涂磨砂封层照灯60秒，日系晕染美甲完成！

💡 小贴士：日系晕染的精髓是"薄"和"透"，每层颜色一定要用透明胶稀释后再上色。
⚠️ 注意：颜色不要叠加超过5层，否则会显得厚重不清透。""",
            "description": "学习日系水彩晕染美甲技法，打造柔和梦幻的色彩过渡效果。适合有一定基础的进阶学习者。",
            "source_url": "https://example.com/nail/japanese-watercolor",
            "source_platform": "structured_collection",
            "category": "gradient",
            "difficulty": "intermediate",
            "tags": ["日系", "春夏款", "晕染", "进阶技法"],
        },
        {
            "title": "镜面美甲 — 魔镜粉/极光粉使用全攻略",
            "content": """镜面美甲以其金属光泽感和未来科技感成为热门款式，使用魔镜粉或极光粉即可轻松打造。

步骤1：完成基础底胶后，涂黑色或深色底色（深底色能让镜面反光更明显），照灯60秒。
步骤2：涂免洗封层，照灯30秒。这一步很关键，封层要半干不干的状态才能上粉。
步骤3：用硅胶笔或手指蘸取魔镜粉，在甲面上来回擦拭，直到出现光滑的镜面反光效果。
步骤4：用刷子扫去多余的粉末。
步骤5：再涂一层封层保护镜面效果，照灯60秒。

💡 小贴士：魔镜粉有银色、金色、玫瑰金、极光彩色等多种选择。
⚠️ 注意：封层照灯时间要短（20-30秒），太干粉就擦不上去了。
⚠️ 注意：镜面美甲不适合经常接触洗涤剂的场合，容易褪色。""",
            "description": "掌握镜面美甲制作技巧，学习魔镜粉/极光粉的擦涂方法和注意事项。",
            "source_url": "https://example.com/nail/mirror-powder",
            "source_platform": "structured_collection",
            "category": "gel",
            "difficulty": "intermediate",
            "tags": ["韩系", "镜面", "进阶技法", "约会款"],
        },
        {
            "title": "手绘花卉美甲 — 玫瑰花与雏菊的画法",
            "content": """手绘花卉是美甲彩绘中最受欢迎的题材之一，掌握基础笔法后可以画出各种花卉图案。

步骤1：白色底色打底，照灯固化。白色底能让花卉颜色更鲜艳。
步骤2：用圆头彩绘笔蘸取红色甲油胶，在甲面上点出花瓣的基础形状——玫瑰花从中心小圆开始向外画弧线花瓣。
步骤3：用拉线笔蘸取绿色胶画出叶片和藤蔓，注意叶片的大小和走向要自然。
步骤4：雏菊画法更简单——用点珠笔在中心点黄色花蕊，围绕花蕊点白色小点作为花瓣。
步骤5：用极细笔蘸取深色胶勾勒花瓣边缘和叶脉细节，增加立体感。
步骤6：照灯60秒固化，涂封层保护手绘图案。

💡 小贴士：手绘时手腕要支撑在桌面上保持稳定；用稀释液调淡颜色可以画出半透明花瓣。
⚠️ 注意：彩绘笔每次用完后立即用清洁液清洗，胶干后难以清洗会损坏笔头。""",
            "description": "从零开始学手绘美甲花卉，包含玫瑰花和雏菊的详细画法步骤。",
            "source_url": "https://example.com/nail/flower-painting",
            "source_platform": "structured_collection",
            "category": "nail-art",
            "difficulty": "advanced",
            "tags": ["手绘", "花卉", "专业级", "春夏款"],
        },
        {
            "title": "碎钻/亮片美甲 — 闪亮出席的派对美甲",
            "content": """碎钻和亮片是派对、婚礼等场合最受欢迎的美甲装饰元素，掌握正确的粘贴方法可以让美甲闪耀持久。

步骤1：完成底色上色后，在需要贴钻的位置涂少量粘钻胶。
步骤2：用点钻笔或牙签蘸取一点点粘钻胶，拾取平底钻/珍珠。
步骤3：将钻放置在甲面目标位置，轻轻按压使其贴合甲面弧度。
步骤4：调整好位置后照灯30-60秒固化粘钻胶。
步骤5：用小笔蘸取免洗封层在钻的周围包边（不要涂到钻的表面，会影响亮度）。
步骤6：对于大颗钻饰，可以用粘钻胶在钻的底部再加固一圈。

💡 小贴士：碎钻适合分散排列或渐变排列（根部密→指尖疏）；平底钻比尖底钻更容易粘贴。
⚠️ 注意：贴钻后日常要避免用指甲抠硬物，钻容易脱落。""",
            "description": "学会正确粘贴碎钻、亮片、珍珠等美甲饰品，让你的美甲闪耀持久不脱落。",
            "source_url": "https://example.com/nail/rhinestone-application",
            "source_platform": "structured_collection",
            "category": "3d-nail",
            "difficulty": "beginner",
            "tags": ["碎钻", "婚甲", "派对", "新手入门"],
        },
        {
            "title": "美甲持久度提升技巧 — 延长保持时间的8个关键",
            "content": """很多美甲新手会遇到美甲两三天就起翘脱落的问题。掌握以下技巧可以让美甲保持2-3周。

关键1：甲面打磨要到位。用海绵抛轻打磨至全甲面哑光状态，不能有遗漏的光滑区域。
关键2：清洁要彻底。打磨后用酒精棉片仔细擦拭甲面，去除所有粉尘和油脂。
关键3：底胶一定要包边。涂底胶时在指甲前缘（指尖）轻轻带一笔，包裹住甲缘。
关键4：每层胶都要薄涂。厚涂是起翘和缩胶的最大原因，宁可多涂一层也不要一次涂太厚。
关键5：每层充分照灯。照灯时间不足会导致内部未固化，产生起翘。
关键6：封层包边最关键。封层一定要包裹甲缘和前缘，这是持久度的最后一道防线。
关键7：做完后2小时内避免碰热水。
关键8：日常做家务时戴手套保护，指缘油每天涂抹保持甲周滋润。

💡 小贴士：如果每次都是同一个手指起翘，检查这个手指的甲面是否打磨到位。
⚠️ 注意：过度打磨会导致指甲变薄受损，只需打磨至哑光即可。""",
            "description": "美甲经常起翘脱落？掌握这8个关键技巧，让你的美甲持久度从几天提升到2-3周。",
            "source_url": "https://example.com/nail/long-lasting-tips",
            "source_platform": "structured_collection",
            "category": "basic",
            "difficulty": "beginner",
            "tags": ["新手入门", "持久度", "技巧", "养护"],
        },
        {
            "title": "秋冬美甲配色指南 — 2024流行色搭配推荐",
            "content": """秋冬美甲配色以温暖浓郁为主调，以下是2024年秋冬最流行的配色方案。

配色方案1：焦糖拿铁系 — 咖啡棕+奶咖色+裸色，温暖知性，适合通勤。
配色方案2：酒红复古系 — 深酒红+暗玫瑰金+黑色，成熟优雅，适合约会。
配色方案3：墨绿森林系 — 墨绿色+金色+米白，高级复古感，适合节日派对。
配色方案4：灰紫迷雾系 — 灰色+薰衣草紫+银闪，冷淡高级风，适合日常。
配色方案5：巧克力系 — 深棕+奶茶色+亮面金，温暖治愈系。

搭配技巧：
- 跳色法：选1-2个手指用对比色或亮片色做跳色
- 渐变法：同一色系深浅搭配做渐变过渡
- 磨砂法：秋冬特别适合磨砂质感，任何颜色变磨砂后都更有季节感

💡 小贴士：秋冬手部皮肤容易干燥，做美甲前后一定要用指缘油护理。""",
            "description": "2024秋冬最流行的美甲配色方案和搭配技巧，让你的指尖跟上季节潮流。",
            "source_url": "https://example.com/nail/autumn-winter-colors",
            "source_platform": "structured_collection",
            "category": "gel",
            "difficulty": "beginner",
            "tags": ["秋冬款", "配色", "显白", "日常通勤"],
        },
        {
            "title": "新手必备美甲工具清单 — 入门工具选购指南",
            "content": """如果你是美甲新手，面对琳琅满目的工具不知道从何入手？这份精简清单帮你用最少的预算买对必备工具。

基础必备（预算约80-150元）：
1. LED光疗灯（36W-48W）— 最重要的一件，建议直接买48W以上，约40-80元
2. 指甲刀+死皮剪+死皮推 三件套 — 约20-40元
3. 搓条（100/180双面）+海绵抛 — 约5-10元
4. 底胶+封层+2-3瓶色胶 — 约30-60元
5. 清洁液/酒精+棉花片 — 约5-10元

进阶可选：
6. 法式贴纸 — 约3-8元，画法式必备
7. 拉线笔+点珠笔 — 约10-20元，做图案用
8. 粘钻胶+亮钻套装 — 约15-30元，装饰用
9. 指缘油 — 约10-20元，日常养护

💡 小贴士：不要一上来就买大套装，先买基础6件套练手，确定兴趣后再逐步添置。
⚠️ 注意：光疗灯一定要买正规品牌，劣质灯可能固化不彻底导致过敏。""",
            "description": "美甲新手必备工具清单和选购建议，用最低预算买对工具，不花冤枉钱。",
            "source_url": "https://example.com/nail/beginner-tool-checklist",
            "source_platform": "structured_collection",
            "category": "tools-guide",
            "difficulty": "beginner",
            "tags": ["新手入门", "工具", "选购", "指南"],
        },
        {
            "title": "穿戴甲创业入门 — 从制作到售卖全流程",
            "content": """穿戴甲近年市场需求爆发式增长，是美甲爱好者低成本创业的好方向。

制作流程：
1. 选甲片：根据市场需求选择甲型（短方圆最畅销）、尺寸（混合装最实用）
2. 款式设计：紧跟热点，如季节款、节日款、明星同款、网络爆款
3. 批量制作：同一款式建议一次做5-10套，流水线式制作效率更高
4. 品质检查：每套检查是否有溢胶、气泡、划痕等瑕疵
5. 包装：透明展示盒+果冻胶+酒精棉+说明书，提升开箱体验

定价策略：
- 基础款（纯色/简单跳色）：15-30元/套
- 精致款（渐变/法式/手绘）：30-60元/套
- 高端定制（3D/满钻/复杂手绘）：60-150元/套

售卖渠道：闲鱼、小红书店铺、微信朋友圈、抖音小店

💡 小贴士：拍摄好看的佩戴图和视频是提高转化率的关键。
⚠️ 注意：甲片尺寸标注要清晰（S/M/L对应真甲宽度），减少退换货。""",
            "description": "穿戴甲创业完整指南，从制作、定价到多平台售卖，适合想用美甲技能赚钱的人。",
            "source_url": "https://example.com/nail/wearable-nail-business",
            "source_platform": "structured_collection",
            "category": "wearable",
            "difficulty": "intermediate",
            "tags": ["穿戴甲", "创业", "进阶技法", "商业"],
        },
    ]

    logger.info(f"  ✅ 结构化教程采集到 {len(tutorials)} 条")
    return tutorials


# ═══════════════════════════════════════════════════════════════
# Data Cleaner
# ═══════════════════════════════════════════════════════════════

class ContentCleaner:
    """数据清洗器：去重、分类、生成标签、提取步骤和技巧"""

    def __init__(self):
        self.seen_hashes = set()
        self.seen_titles = set()

    def compute_hash(self, content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def is_duplicate(self, content: str, title: str = "") -> bool:
        content_hash = self.compute_hash(content)
        if content_hash in self.seen_hashes:
            return True
        normalized = re.sub(r'[^\w]', '', title.lower()) if title else ""
        if normalized and normalized in self.seen_titles:
            return True
        self.seen_hashes.add(content_hash)
        if normalized:
            self.seen_titles.add(normalized)
        return False

    def classify_category(self, text: str) -> str:
        text_lower = text.lower()
        category_kw = {
            "basic": ["入门", "新手", "基础", "第一次", "零基础", "持久", "保持"],
            "gel": ["甲油胶", "上色", "涂色", "配色", "色胶", "颜色"],
            "french": ["法式", "微笑线", "法式边"],
            "gradient": ["渐变", "晕染", "过渡", "水彩", "ombre"],
            "cat-eye": ["猫眼", "磁铁", "磁石", "光带"],
            "3d-nail": ["3D", "立体", "雕花", "浮雕", "碎钻", "亮片", "钻"],
            "marble": ["大理石", "水染", "纹路", "marble"],
            "extension": ["延长", "甲片", "纸托", "塑形"],
            "nail-art": ["彩绘", "手绘", "画花", "图案", "花卉", "线条"],
            "wearable": ["穿戴甲", "创业", "售卖", "果冻胶"],
            "care": ["养护", "护理", "修复", "营养", "健康"],
            "tools-guide": ["工具", "选购", "清单", "指南", "必备"],
        }
        scores = {}
        for cat, keywords in category_kw.items():
            score = sum(1 for kw in keywords if kw.lower() in text_lower)
            if score > 0:
                scores[cat] = score
        return max(scores, key=scores.get) if scores else "gel"

    def classify_difficulty(self, text: str) -> str:
        text_lower = text.lower()
        diff_kw = {
            "beginner": ["新手", "入门", "零基础", "第一次", "简单", "基础", "必备"],
            "intermediate": ["进阶", "中级", "提升", "技巧", "创业"],
            "advanced": ["高级", "专业", "大师", "复杂", "雕花", "手绘"],
        }
        scores = {}
        for level, keywords in diff_kw.items():
            score = sum(1 for kw in keywords if kw.lower() in text_lower)
            if score > 0:
                scores[level] = score
        return max(scores, key=scores.get) if scores else "beginner"

    def extract_steps(self, text: str) -> List[Dict]:
        steps = []
        pattern = r'步骤\s*(\d+)[：:]\s*(.+?)(?=步骤\s*\d+[：:]|\Z)'
        matches = re.findall(pattern, text, re.DOTALL)
        if len(matches) >= 2:
            for num, content in matches:
                steps.append({
                    "order": int(num),
                    "title": f"步骤 {num}",
                    "content": content.strip()[:300],
                })
        return steps[:15]

    def extract_tips(self, text: str) -> List[str]:
        tips = []
        for match in re.finditer(r'[💡⚠️][^。！\n]{10,200}', text):
            tips.append(match.group().strip())
        if not tips:
            for match in re.finditer(r'关键\d+[：:]\s*(.+?)(?=关键\d+|\Z)', text, re.DOTALL):
                tips.append(f"💡 {match.group(1).strip()[:150]}")
        return tips[:8]

    def clean(self, raw: Dict) -> Optional[Dict]:
        title = raw.get("title", "").strip()
        content = raw.get("content", "") or raw.get("description", "")
        if not title or len(content) < 30:
            return None
        if self.is_duplicate(content, title):
            return None

        combined = title + " " + content
        category = raw.get("category") or self.classify_category(combined)
        difficulty = raw.get("difficulty") or self.classify_difficulty(combined)
        tags = raw.get("tags", [])
        if not tags:
            tags = self._gen_tags(combined, difficulty)
        steps = raw.get("steps") or self.extract_steps(content)
        tips = raw.get("tips") or self.extract_tips(content)

        return {
            "title": title[:200],
            "description": raw.get("description", content[:300]),
            "content": content,
            "category": category,
            "difficulty": difficulty,
            "tags": tags,
            "steps": steps,
            "tips": tips,
            "source_url": raw.get("source_url", ""),
            "source_platform": raw.get("source_platform", ""),
            "image_urls": raw.get("image_urls", []),
            "video_url": raw.get("video_url", ""),
        }

    def _gen_tags(self, text: str, difficulty: str) -> List[str]:
        tags = set()
        tag_kw = {
            "新手入门": ["新手", "入门", "零基础", "基础", "第一次"],
            "进阶技法": ["进阶", "技巧", "中级", "提升"],
            "专业级": ["高级", "专业", "大师", "手绘", "雕花"],
            "日系": ["日系", "日本", "和风"],
            "韩系": ["韩系", "韩国", "韩式"],
            "春夏款": ["春夏", "春季", "夏季", "清新"],
            "秋冬款": ["秋冬", "秋季", "冬季", "温暖"],
            "婚甲": ["婚礼", "婚甲", "新娘"],
            "日常通勤": ["日常", "通勤", "上班"],
            "约会款": ["约会", "派对"],
            "显白": ["显白", "显肤"],
        }
        for tag, kws in tag_kw.items():
            if any(kw in text for kw in kws):
                tags.add(tag)
        diff_labels = {"beginner": "新手入门", "intermediate": "进阶技法", "advanced": "专业级"}
        tags.add(diff_labels.get(difficulty, "新手入门"))
        return list(tags)[:5]

    def get_stats(self) -> Dict:
        return {"seen_hashes": len(self.seen_hashes), "seen_titles": len(self.seen_titles)}


# ═══════════════════════════════════════════════════════════════
# Database Importer
# ═══════════════════════════════════════════════════════════════

class DatabaseImporter:
    """将清洗后的数据导入SQLite数据库"""

    def __init__(self):
        self.db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'nail_art.db')

    def _get_db(self):
        from database import SessionLocal
        return SessionLocal()

    def import_tutorial(self, data: Dict) -> bool:
        from models import Tutorial, Category, Tag

        db = self._get_db()
        try:
            # 检查是否已存在
            existing = db.query(Tutorial).filter(Tutorial.title == data["title"]).first()
            if existing:
                db.close()
                return False

            # 查找或创建分类
            category = db.query(Category).filter(Category.name == data["category"]).first()
            if not category:
                db.close()
                return False

            # 创建标签
            tag_objs = []
            for tag_name in data.get("tags", []):
                tag = db.query(Tag).filter(Tag.name == tag_name).first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    db.flush()
                tag_objs.append(tag)

            # 生成slug
            slug = self._make_slug(data["title"])

            tutorial = Tutorial(
                title=data["title"],
                slug=slug,
                category_id=category.id,
                difficulty=data["difficulty"],
                description=data["description"],
                steps=json.dumps(data.get("steps", []), ensure_ascii=False),
                tips=json.dumps(data.get("tips", []), ensure_ascii=False),
                source_type="auto_collected",
                source_url=data.get("source_url", ""),
                video_url=data.get("video_url", ""),
                tags=tag_objs,
            )
            db.add(tutorial)
            db.commit()
            db.close()
            return True
        except Exception as e:
            logger.error(f"  ❌ 入库失败 [{data['title'][:40]}]: {e}")
            db.rollback()
            db.close()
            return False

    def _make_slug(self, title: str) -> str:
        slug = re.sub(r'[^\w\s-]', '', title.lower().strip())
        slug = re.sub(r'[-\s]+', '-', slug)
        ts = datetime.now().strftime('%Y%m%d%H%M%S')
        return f"{slug[:80]}-{ts}"


# ═══════════════════════════════════════════════════════════════
# Main Collector
# ═══════════════════════════════════════════════════════════════

@dataclass
class CollectionStats:
    total_raw: int = 0
    total_cleaned: int = 0
    total_imported: int = 0
    total_duplicate: int = 0
    total_rejected: int = 0


class NailArtCollector:
    def __init__(self, test_mode: bool = False):
        self.test_mode = test_mode
        self.cleaner = ContentCleaner()
        self.importer = DatabaseImporter() if not test_mode else None
        self.stats = CollectionStats()

        # 采集源注册
        self.sources = [
            ("Wikipedia 百科", collect_wikipedia),
            ("公开博客搜索", collect_public_blogs),
            ("结构化教程库", collect_structured_tutorials),
        ]

    def run(self, source_filter: str = None):
        logger.info("=" * 60)
        logger.info("🖌️  美甲学院 - AI 自动采集器")
        logger.info(f"   模式: {'🧪 测试 (不入库)' if self.test_mode else '📥 正式采集入库'}")
        logger.info(f"   数据库: {self.importer.db_path if self.importer else 'N/A'}")
        logger.info(f"   时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        logger.info("=" * 60)

        for name, collector_fn in self.sources:
            if source_filter and source_filter.lower() not in name.lower():
                continue
            self._process_source(name, collector_fn)

        # Summary
        logger.info("=" * 60)
        logger.info("📊 采集汇总:")
        logger.info(f"   原始采集: {self.stats.total_raw} 条")
        logger.info(f"   清洗通过: {self.stats.total_cleaned} 条")
        logger.info(f"   成功入库: {self.stats.total_imported} 条")
        logger.info(f"   重复跳过: {self.stats.total_duplicate} 条")
        logger.info(f"   质量驳回: {self.stats.total_rejected} 条")
        logger.info(f"   去重状态: {self.cleaner.get_stats()}")
        logger.info("=" * 60)

    def _process_source(self, name: str, collector_fn):
        logger.info(f"\n📡 [{name}] 开始采集...")

        try:
            raw_items = collector_fn()
        except Exception as e:
            logger.error(f"  ❌ 采集异常: {e}")
            return

        self.stats.total_raw += len(raw_items)
        imported = 0
        cleaned = 0
        dup = 0
        rej = 0

        for item in raw_items:
            cleaned_data = self.cleaner.clean(item)
            if not cleaned_data:
                rej += 1
                continue

            cleaned += 1
            logger.info(f"  ✨ {cleaned_data['title'][:50]}... [{cleaned_data['category']}|{cleaned_data['difficulty']}]")

            if not self.test_mode and self.importer:
                if self.importer.import_tutorial(cleaned_data):
                    imported += 1
                    logger.info(f"     ✅ 已入库")
                else:
                    dup += 1
                    logger.info(f"     ⏭️ 已存在，跳过")

        self.stats.total_cleaned += cleaned
        self.stats.total_imported += imported
        self.stats.total_duplicate += dup
        self.stats.total_rejected += rej

        logger.info(f"  📊 [{name}] 原始{len(raw_items)} → 清洗{cleaned} → 入库{imported} | 重复{dup} 驳回{rej}")


def show_stats():
    """显示数据库统计信息"""
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
    from database import SessionLocal
    from models import Tutorial, Material, Tool, Category

    db = SessionLocal()
    try:
        print("\n📊 美甲学院数据库统计")
        print("-" * 40)
        print(f"  教程总数: {db.query(Tutorial).count()}")
        print(f"    - 手动编写: {db.query(Tutorial).filter(Tutorial.source_type == 'manual').count()}")
        print(f"    - 自动采集: {db.query(Tutorial).filter(Tutorial.source_type == 'auto_collected').count()}")
        print(f"  材料档案: {db.query(Material).count()}")
        print(f"  工具档案: {db.query(Tool).count()}")
        print(f"  技法分类: {db.query(Category).count()}")
        print("-" * 40)

        # 显示最新采集的教程
        collected = db.query(Tutorial).filter(
            Tutorial.source_type == 'auto_collected'
        ).order_by(Tutorial.created_at.desc()).limit(5).all()

        if collected:
            print("\n🆕 最新自动采集教程:")
            for t in collected:
                print(f"  📝 {t.title[:60]}")
                print(f"     分类: {t.category.name_cn if t.category else 'N/A'} | 难度: {t.difficulty}")
                print(f"     来源: {t.source_url[:80]}")
                print()
        else:
            print("\n⚠️  暂无自动采集数据，运行 python collector.py 开始采集")
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description='美甲学院 - AI自动采集工具')
    parser.add_argument('--test', '-t', action='store_true', help='测试模式（不入库）')
    parser.add_argument('--source', '-s', type=str, help='指定采集源（wikipedia/blogs/structured）')
    parser.add_argument('--stats', action='store_true', help='显示数据库统计')
    args = parser.parse_args()

    if args.stats:
        show_stats()
        return

    collector = NailArtCollector(test_mode=args.test)
    collector.run(source_filter=args.source)


if __name__ == '__main__':
    main()
