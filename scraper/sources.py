"""
Data source configurations for the nail art content collector.

Each source defines:
- name: Human-readable source name
- type: 'tutorial' | 'material' | 'tool' | 'image'
- url: Base URL or API endpoint
- enabled: Whether this source is active
- parser: Which parser function to use
- keywords: Search keywords for this source
- schedule: Cron-style schedule (when to run)
"""

SOURCES = [
    # ── Tutorial Sources ──────────────────────────────
    {
        "name": "小红书-美甲教程",
        "type": "tutorial",
        "url": "https://www.xiaohongshu.com/search_result?keyword=美甲教程",
        "enabled": True,
        "parser": "xiaohongshu",
        "keywords": ["美甲教程", "美甲新手", "法式美甲", "猫眼美甲", "渐变美甲", "穿戴甲"],
        "schedule": "daily",
        "note": "需要登录cookie，建议配合浏览器插件使用",
    },
    {
        "name": "B站-美甲实操视频",
        "type": "tutorial",
        "url": "https://api.bilibili.com/x/web-interface/search/type?search_type=video&keyword=",
        "enabled": True,
        "parser": "bilibili",
        "keywords": ["美甲教程", "美甲入门", "延长甲", "3D雕花美甲", "美甲工具使用"],
        "schedule": "daily",
        "note": "B站开放API，可直接请求",
    },
    {
        "name": "抖音-美甲教学",
        "type": "tutorial",
        "url": "https://www.douyin.com/search/美甲教学",
        "enabled": True,
        "parser": "douyin",
        "keywords": ["美甲教学", "新手美甲", "美甲款式", "美甲设计"],
        "schedule": "daily",
        "note": "需要处理反爬，建议使用Playwright",
    },
    {
        "name": "美甲帮-图文教程",
        "type": "tutorial",
        "url": "https://www.meijiabang.cn/",
        "enabled": True,
        "parser": "generic_article",
        "keywords": ["美甲", "教程", "入门", "进阶"],
        "schedule": "weekly",
        "note": "专业美甲社区平台",
    },

    # ── Material Sources ──────────────────────────────
    {
        "name": "淘宝-美甲耗材",
        "type": "material",
        "url": "https://s.taobao.com/search?q=美甲甲油胶",
        "enabled": True,
        "parser": "taobao",
        "keywords": ["甲油胶", "美甲灯", "美甲工具套装", "美甲饰品", "穿戴甲材料"],
        "schedule": "weekly",
        "note": "采集耗材价格、品牌、参数信息",
    },
    {
        "name": "1688-美甲材料批发",
        "type": "material",
        "url": "https://s.1688.com/selloffer/offer_search.htm?keywords=美甲材料",
        "enabled": True,
        "parser": "alibaba_1688",
        "keywords": ["美甲材料", "甲油胶批发", "美甲饰品批发", "美甲工具套装"],
        "schedule": "weekly",
        "note": "批发平台，可获取材料规格参数",
    },

    # ── Tool Sources ──────────────────────────────────
    {
        "name": "什么值得买-美甲工具评测",
        "type": "tool",
        "url": "https://search.smzdm.com/?c=home&s=美甲工具",
        "enabled": True,
        "parser": "smzdm",
        "keywords": ["美甲工具", "光疗灯推荐", "美甲套装", "美甲搓条"],
        "schedule": "weekly",
        "note": "消费评测平台，获取工具评价和推荐",
    },

    # ── Image/Inspiration Sources ─────────────────────
    {
        "name": "Pinterest-美甲灵感",
        "type": "image",
        "url": "https://www.pinterest.com/search/pins/?q=nail+art+tutorial",
        "enabled": True,
        "parser": "pinterest",
        "keywords": ["nail art", "french nails", "cat eye nails", "gradient nails", "3d nail art"],
        "schedule": "weekly",
        "note": "国际美甲灵感图库",
    },
    {
        "name": "小红书-美甲款式图",
        "type": "image",
        "url": "https://www.xiaohongshu.com/search_result?keyword=美甲款式",
        "enabled": True,
        "parser": "xiaohongshu_image",
        "keywords": ["美甲款式", "美甲配色", "秋冬美甲", "婚甲", "显白美甲"],
        "schedule": "daily",
    },
]


# Category mapping for auto-tagging collected content
CATEGORY_KEYWORDS = {
    "basic": ["入门", "新手", "基础", "第一次", "零基础"],
    "gel": ["甲油胶", "上色", "涂色", "颜色", "色胶"],
    "french": ["法式", "微笑线", "法式边", "French"],
    "gradient": ["渐变", "晕染", "过渡", "ombre", "gradient"],
    "cat-eye": ["猫眼", "磁铁", "磁石", "cat eye", "光带"],
    "3d-nail": ["3D", "立体", "雕花", "浮雕", "雕塑"],
    "marble": ["大理石", "水染", "纹路", "marble"],
    "extension": ["延长", "甲片", "纸托", "extension", "塑形"],
    "nail-art": ["彩绘", "手绘", "画花", "图案", "线条"],
    "wearable": ["穿戴甲", "假指甲", "可拆卸", "果冻胶"],
    "care": ["养护", "护理", "修复", "营养", "健康"],
    "tools-guide": ["工具", "使用", "选购", "推荐", "指南"],
}

DIFFICULTY_KEYWORDS = {
    "beginner": ["新手", "入门", "零基础", "第一次", "简单", "基础"],
    "intermediate": ["进阶", "中级", "提升", "技巧"],
    "advanced": ["高级", "专业", "大师", "复杂", "雕花", "3D"],
}

# Filter rules
BLACKLIST_KEYWORDS = [
    "广告", "推广", "充值", "下载APP", "加微信", "扫码",
    "医美", "整形", "丰胸", "减肥",
]
MIN_CONTENT_LENGTH = 50  # minimum characters for valid content
MAX_IMAGE_SIZE_MB = 10   # max image size to download
ALLOWED_IMAGE_TYPES = ["jpg", "jpeg", "png", "webp"]
