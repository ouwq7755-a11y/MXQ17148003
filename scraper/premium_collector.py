#!/usr/bin/env python3
"""
精品美甲教程采集器 - 只收高质量、高颜值、高播放量的精美教程
"""
import sys, os, re, time, json, logging, subprocess, argparse
from datetime import datetime
import requests

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger('premium')

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    'Referer': 'https://m.bilibili.com', 'Accept': 'application/json',
}
VIDEOS_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'videos')
os.makedirs(VIDEOS_DIR, exist_ok=True)

try:
    import imageio_ffmpeg; FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
except: FFMPEG = None

# 精品关键词 — 更专业、更艺术、更高端
PREMIUM_QUERIES = [
    # 高级技法
    "美甲雕花教程高级", "3D立体美甲教程", "美甲浮雕教程", "美甲雕塑",
    "水晶延长甲教程", "光疗延长甲教程高级", "纸托延长甲详细教程",
    # 艺术风格
    "日式美甲设计", "美甲彩绘花卉", "美甲水彩教程", "美甲油画风",
    "法式美甲设计款", "渐变美甲高级", "猫眼美甲设计款",
    "美甲晕染教程", "美甲大理石纹教程", "美甲琥珀纹",
    # 热门风格
    "极光美甲教程", "镜面美甲教程", "魔镜粉美甲", "碎钻美甲教程",
    "珍珠美甲设计", "金箔美甲教程", "贝壳美甲教程",
    # 高级定製
    "婚甲设计款", "新娘美甲高级", "礼服搭配美甲",
    "显白美甲高级", "短指甲美甲设计", "方形美甲设计",
    # 时令
    "秋冬美甲高级", "春夏美甲设计款", "2025美甲设计",
    # 包装与陈列
    "美甲款式合集", "美甲店款式推荐", "美甲设计灵感",
    # 专业教学
    "美甲建构教程详细", "美甲前处理教程", "美甲完美包边",
    "美甲持久技巧", "美甲工具专业使用",
    # 日韩
    "日本美甲师", "韩国美甲设计", "ins美甲款式",
]

def strip_html(t): return re.sub(r'<[^>]+>', '', t)

def search_premium(keyword, min_plays=10000, count=5):
    """搜索高质量视频(播放量过滤)"""
    videos = []
    for order in ['click', 'pubdate']:
        try:
            api = f'https://api.bilibili.com/x/web-interface/search/all/v2?keyword={keyword}&page=1&order={order}'
            resp = requests.get(api, headers=HEADERS, timeout=15)
            data = resp.json()
            if data.get('code') != 0: continue
            for group in data.get('data',{}).get('result',[]):
                if group.get('result_type')!='video': continue
                for v in group.get('data',[])[:count]:
                    bvid = v.get('bvid',''); title = strip_html(v.get('title',''))
                    play = v.get('play',0)
                    if not bvid or len(title)<8: continue
                    if play < min_plays: continue
                    videos.append({
                        'bvid':bvid, 'title':title[:200], 'play':play,
                        'author':v.get('author',''), 'duration':v.get('duration',''),
                        'description':strip_html(v.get('description',''))[:300],
                        'cover':v.get('pic',''),
                    })
        except: pass
        time.sleep(0.3)
    return videos

def download_video(bvid, filename):
    base = os.path.join(VIDEOS_DIR, filename); final = base+'.mp4'
    if os.path.exists(final) and os.path.getsize(final)>50000: return final
    v_tmp = base+'_v.mp4'; a_tmp = base+'_a.m4a'; m_tmp = base+'_av.mp4'
    try:
        subprocess.run(['yt-dlp','-f','30064','--no-playlist','--no-progress','-o',v_tmp,f'https://www.bilibili.com/video/{bvid}'], capture_output=True,text=True,timeout=120)
        subprocess.run(['yt-dlp','-f','30280','--no-playlist','--no-progress','-o',a_tmp,f'https://www.bilibili.com/video/{bvid}'], capture_output=True,text=True,timeout=120)
        if os.path.exists(v_tmp) and os.path.getsize(v_tmp)>10000:
            if os.path.exists(a_tmp) and os.path.getsize(a_tmp)>5000 and FFMPEG:
                subprocess.run([FFMPEG,'-y','-i',v_tmp,'-i',a_tmp,'-c:v','copy','-c:a','aac','-shortest',m_tmp],capture_output=True,timeout=120)
                if os.path.exists(m_tmp): os.replace(m_tmp,final)
                else: os.replace(v_tmp,final)
            else: os.replace(v_tmp,final)
        for t in [v_tmp,a_tmp,m_tmp]:
            if os.path.exists(t): os.remove(t)
        if os.path.exists(final) and os.path.getsize(final)>50000: return final
    except: pass
    return None

def main():
    from database import SessionLocal
    from models import Tutorial, Category, Tag

    db = SessionLocal()
    existing = set()
    for t in db.query(Tutorial).filter(Tutorial.video_url!="").all():
        m = re.search(r'BV[a-zA-Z0-9]{10}', t.video_url or '')
        if m: existing.add(m.group(0))
    cats = {c.name: c.id for c in db.query(Category).all()}

    logger.info(f"💎 精品采集 | 已有:{len(existing)} | 目标:50个高质量教程")

    all_vids, seen = [], set()
    for q in PREMIUM_QUERIES:
        vids = search_premium(q, min_plays=8000, count=3)
        new = 0
        for v in vids:
            if v['bvid'] not in seen and v['bvid'] not in existing:
                seen.add(v['bvid']); all_vids.append(v); new+=1
        if new: logger.info(f"  {q}: +{new} (最高{vids[0]['play']}播放)" if vids else f"  {q}: 0")
        time.sleep(0.25)

    all_vids.sort(key=lambda v:v['play'], reverse=True)
    logger.info(f"\n📊 发现{len(all_vids)}个精品视频")
    for v in all_vids[:10]:
        logger.info(f"  🔥 {v['play']}播放 | {v['title'][:50]}")

    # Download top 50
    to_dl = all_vids[:50]
    logger.info(f"\n📥 下载{len(to_dl)}个...")
    dl_count = 0
    for i, v in enumerate(to_dl):
        fn = f"prem_{v['bvid']}"
        path = download_video(v['bvid'], fn)
        if path:
            dl_count += 1
            v['local'] = f"/videos/{os.path.basename(path)}"
            mb = os.path.getsize(path)/1e6
            logger.info(f"  [{dl_count}] {v['title'][:40]} ({mb:.0f}MB)")
        time.sleep(0.5)

    # Import
    imported = 0
    for v in to_dl:
        if 'local' not in v: continue
        title = v['title']; text = title+v.get('description','')
        # Classify
        scores = {}
        kw_map = {
            'basic':['新手','入门','基础','零基础'],
            'french':['法式'],'gradient':['渐变','晕染'],'cat-eye':['猫眼'],
            '3d-nail':['3d','立体','雕花','浮雕','碎钻','珍珠','金箔','贝壳'],
            'marble':['大理石','琥珀'],'extension':['延长','纸托','光疗'],
            'nail-art':['彩绘','手绘','花卉','水彩','油画'],'wearable':['穿戴甲'],
            'care':['护理','养护','养甲','甲床'],'gel':['美甲','款式','设计','胶','粉'],
        }
        for cat,kws in kw_map.items():
            scores[cat] = sum(1 for k in kws if k in text)
        category = max(scores,key=scores.get) if scores else 'gel'

        diff = 'beginner'
        if any(k in text for k in ['高级','专业','雕花','3d','立体','延长','水晶']): diff='advanced'
        elif any(k in text for k in ['设计','款','进阶']): diff='intermediate'

        tags = []
        tag_map = {'新手入门':['新手','入门'],'进阶技法':['进阶','技巧'],'专业级':['专业','高级','雕花'],
                   '日系':['日式','日系','日本'],'韩系':['韩式','韩系','韩国'],
                   '秋冬款':['秋冬'],'春夏款':['春夏'],'婚甲':['婚甲','新娘','婚礼'],
                   '显白':['显白'],'日常通勤':['日常','通勤'],'约会款':['约会']}
        for tn,kws in tag_map.items():
            if any(k in text for k in kws): tags.append(tn)
        if not tags: tags=['新手入门']

        slug = re.sub(r'[^\w\s-]','',title.lower())[:60]+'-'+datetime.now().strftime('%m%d%H%M')

        existing_tut = db.query(Tutorial).filter(Tutorial.title==title).first()
        if existing_tut:
            if not existing_tut.video_url: existing_tut.video_url=v['local']; imported+=1
            continue

        tag_objs = []
        for tn in tags[:5]:
            t = db.query(Tag).filter(Tag.name==tn).first()
            if not t: t=Tag(name=tn); db.add(t); db.flush()
            tag_objs.append(t)

        tut = Tutorial(title=title, slug=slug, category_id=cats.get(category, cats.get('gel',1)),
                       difficulty=diff, description=v.get('description',''), video_url=v['local'],
                       cover_image=v.get('cover',''), source_type='auto_collected',
                       source_url=f"https://www.bilibili.com/video/{v['bvid']}",
                       steps='[]', tips='[]', tags=tag_objs)
        db.add(tut); imported+=1

    db.commit()
    total = db.query(Tutorial).count()
    with_v = db.query(Tutorial).filter(Tutorial.video_url!="").count()
    db.close()

    logger.info(f"\n✅ 入库{imported}篇 | 总计{total}篇 | {with_v}篇有视频")

if __name__ == '__main__':
    main()
