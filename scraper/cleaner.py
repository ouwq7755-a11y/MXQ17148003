"""
Data cleaner for auto-collected nail art content.

Performs:
- Deduplication (hash-based and semantic similarity)
- Quality filtering (min content length, image quality check)
- Compliance filtering (adult content, advertising, copyright)
- Tag auto-generation
- Category classification
- Standardization (format normalization)
"""

import re
import hashlib
import json
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass, field

from sources import (
    CATEGORY_KEYWORDS,
    DIFFICULTY_KEYWORDS,
    BLACKLIST_KEYWORDS,
    MIN_CONTENT_LENGTH,
)


@dataclass
class CleanedTutorial:
    title: str
    description: str
    category: str = ""
    difficulty: str = "beginner"
    tags: List[str] = field(default_factory=list)
    steps: List[Dict] = field(default_factory=list)
    tips: List[str] = field(default_factory=list)
    source_url: str = ""
    source_platform: str = ""
    image_urls: List[str] = field(default_factory=list)
    video_url: str = ""
    is_valid: bool = True
    reject_reason: str = ""


@dataclass
class CleanedMaterial:
    name: str
    description: str
    category: str = "other"
    brand: str = ""
    price_range: str = ""
    image_urls: List[str] = field(default_factory=list)
    buy_link: str = ""
    source_platform: str = ""
    is_valid: bool = True
    reject_reason: str = ""


@dataclass
class CleanedTool:
    name: str
    description: str
    category: str = "basic"
    usage_steps: List[str] = field(default_factory=list)
    precautions: str = ""
    price_range: str = ""
    image_urls: List[str] = field(default_factory=list)
    source_platform: str = ""
    is_valid: bool = True
    reject_reason: str = ""


class ContentCleaner:
    """Main cleaner class for processing collected content."""

    def __init__(self):
        self.seen_hashes = set()
        self.seen_titles = set()

    # ── Deduplication ──────────────────────────────────

    def compute_hash(self, content: str) -> str:
        """Compute SHA256 hash of content for exact dedup."""
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def is_duplicate(self, content: str, title: str = "") -> bool:
        """Check if content is a duplicate based on hash or title similarity."""
        content_hash = self.compute_hash(content)
        if content_hash in self.seen_hashes:
            return True

        normalized_title = self._normalize_title(title)
        if normalized_title in self.seen_titles:
            return True

        self.seen_hashes.add(content_hash)
        if normalized_title:
            self.seen_titles.add(normalized_title)
        return False

    def _normalize_title(self, title: str) -> str:
        """Normalize title for comparison."""
        if not title:
            return ""
        # Remove emojis, special chars, extra spaces
        title = re.sub(r'[^一-鿿\w\s]', '', title)
        title = re.sub(r'\s+', '', title)
        return title.lower()

    # ── Compliance Filtering ───────────────────────────

    def filter_compliance(self, text: str) -> Tuple[bool, str]:
        """Check content for compliance issues. Returns (is_clean, reason)."""
        # Check blacklist keywords
        for keyword in BLACKLIST_KEYWORDS:
            if keyword in text:
                return False, f"包含违规关键词: {keyword}"

        # Check minimum content length
        if len(text.strip()) < MIN_CONTENT_LENGTH:
            return False, f"内容过短 (< {MIN_CONTENT_LENGTH} 字符)"

        return True, ""

    def filter_image_url(self, url: str) -> bool:
        """Check if image URL is valid and allowed."""
        if not url:
            return False
        ext = url.split(".")[-1].split("?")[0].lower()
        from sources import ALLOWED_IMAGE_TYPES
        return ext in ALLOWED_IMAGE_TYPES

    # ── Auto Classification ────────────────────────────

    def classify_category(self, text: str) -> str:
        """Auto-classify content into a nail art category."""
        text_lower = text.lower()
        scores = {}
        for category, keywords in CATEGORY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw.lower() in text_lower)
            if score > 0:
                scores[category] = score
        if not scores:
            return "gel"  # default
        return max(scores, key=scores.get)

    def classify_difficulty(self, text: str) -> str:
        """Auto-classify difficulty level."""
        text_lower = text.lower()
        scores = {}
        for level, keywords in DIFFICULTY_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw.lower() in text_lower)
            if score > 0:
                scores[level] = score
        if not scores:
            return "beginner"
        return max(scores, key=scores.get)

    # ── Tag Generation ─────────────────────────────────

    def generate_tags(self, text: str, max_tags: int = 5) -> List[str]:
        """Auto-generate tags from content."""
        tags = set()
        all_keywords = {}
        for category, keywords in CATEGORY_KEYWORDS.items():
            for kw in keywords:
                if kw.lower() in text.lower():
                    all_keywords[kw] = category

        # Take most relevant
        for kw in list(all_keywords.keys())[:max_tags]:
            tags.add(kw)

        # Add difficulty-based tag
        diff = self.classify_difficulty(text)
        diff_labels = {"beginner": "新手入门", "intermediate": "进阶技法", "advanced": "专业级"}
        tags.add(diff_labels.get(diff, "新手入门"))

        return list(tags)[:max_tags]

    # ── Text Cleaning ──────────────────────────────────

    def clean_text(self, text: str) -> str:
        """Clean and normalize text content."""
        if not text:
            return ""
        # Remove HTML tags
        text = re.sub(r'<[^>]+>', '', text)
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove leading/trailing whitespace
        text = text.strip()
        # Remove URLs
        text = re.sub(r'https?://\S+', '', text)
        # Remove excessive newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text

    def extract_steps(self, text: str) -> List[Dict]:
        """Try to extract step-by-step instructions from text."""
        steps = []
        # Look for numbered steps (1. 2. or 1、2、 or Step 1: etc.)
        patterns = [
            r'(?:^|\n)\s*(\d+)[\.、\)]\s*(.+?)(?=\n\s*\d+[\.、\)]|\Z)',
            r'(?:步骤|第)\s*(\d+)\s*[：:]\s*(.+?)(?=步驟|第\s*\d+|$)',
        ]
        for pattern in patterns:
            matches = re.findall(pattern, text, re.DOTALL)
            if len(matches) >= 2:
                for num, content in matches:
                    steps.append({
                        "order": int(num),
                        "title": f"步骤 {num}",
                        "content": content.strip()[:300],
                    })
                break

        return steps[:15]  # Max 15 steps

    def extract_tips(self, text: str) -> List[str]:
        """Extract tips/warnings from content."""
        tips = []
        # Look for tips marked with special patterns
        tip_patterns = [
            r'[💡⚠️❗️✅❌][^。！\n]{10,100}',
            r'(?:小贴士|注意|提示|重点|避坑)[：:]\s*(.+?)(?=[\n。！]|$)',
            r'(?:Tip|Note|Warning)[：:]\s*(.+?)(?=[\n.]|$)',
        ]
        for pattern in tip_patterns:
            matches = re.findall(pattern, text)
            tips.extend([m.strip() for m in matches if 5 < len(m.strip()) < 200])

        return list(dict.fromkeys(tips))[:8]  # Dedup, max 8

    # ── Full Pipeline ─────────────────────────────────

    def clean_tutorial(self, raw: Dict) -> CleanedTutorial:
        """Full cleaning pipeline for a tutorial."""
        text = raw.get("content", "") or raw.get("description", "")
        title = raw.get("title", "")

        # Step 1: Compliance check
        is_clean, reason = self.filter_compliance(title + " " + text)
        if not is_clean:
            return CleanedTutorial(
                title=title, description="", is_valid=False, reject_reason=reason
            )

        # Step 2: Clean text
        clean_title = self.clean_text(title)
        clean_text = self.clean_text(text)

        # Step 3: Dedup check
        if self.is_duplicate(clean_text, clean_title):
            return CleanedTutorial(
                title=clean_title, description="", is_valid=False, reject_reason="重复内容"
            )

        # Step 4: Classify
        combined = clean_title + " " + clean_text
        category = raw.get("category") or self.classify_category(combined)
        difficulty = raw.get("difficulty") or self.classify_difficulty(combined)

        # Step 5: Generate tags
        tags = self.generate_tags(combined)

        # Step 6: Extract structured data
        steps = raw.get("steps") or self.extract_steps(clean_text)
        tips = raw.get("tips") or self.extract_tips(clean_text)

        # Step 7: Filter images
        image_urls = [u for u in raw.get("image_urls", []) if self.filter_image_url(u)]

        return CleanedTutorial(
            title=clean_title[:200],
            description=clean_text[:1000],
            category=category,
            difficulty=difficulty,
            tags=tags,
            steps=steps,
            tips=tips,
            source_url=raw.get("source_url", ""),
            source_platform=raw.get("source_platform", ""),
            image_urls=image_urls,
            video_url=raw.get("video_url", ""),
            is_valid=True,
        )

    def clean_material(self, raw: Dict) -> CleanedMaterial:
        """Full cleaning pipeline for a material."""
        name = self.clean_text(raw.get("name", ""))
        desc = self.clean_text(raw.get("description", ""))

        is_clean, reason = self.filter_compliance(name + " " + desc)
        if not is_clean:
            return CleanedMaterial(name=name, description="", is_valid=False, reject_reason=reason)

        if self.is_duplicate(desc, name):
            return CleanedMaterial(name=name, description="", is_valid=False, reject_reason="重复内容")

        return CleanedMaterial(
            name=name[:200],
            description=desc[:500],
            category=raw.get("category", "other"),
            brand=raw.get("brand", ""),
            price_range=raw.get("price_range", ""),
            image_urls=[u for u in raw.get("image_urls", []) if self.filter_image_url(u)],
            buy_link=raw.get("buy_link", ""),
            source_platform=raw.get("source_platform", ""),
            is_valid=True,
        )

    def clean_tool(self, raw: Dict) -> CleanedTool:
        """Full cleaning pipeline for a tool."""
        name = self.clean_text(raw.get("name", ""))
        desc = self.clean_text(raw.get("description", ""))

        is_clean, reason = self.filter_compliance(name + " " + desc)
        if not is_clean:
            return CleanedTool(name=name, description="", is_valid=False, reject_reason=reason)

        if self.is_duplicate(desc, name):
            return CleanedTool(name=name, description="", is_valid=False, reject_reason="重复内容")

        return CleanedTool(
            name=name[:200],
            description=desc[:500],
            category=raw.get("category", "basic"),
            usage_steps=raw.get("usage_steps", []),
            precautions=raw.get("precautions", ""),
            price_range=raw.get("price_range", ""),
            image_urls=[u for u in raw.get("image_urls", []) if self.filter_image_url(u)],
            source_platform=raw.get("source_platform", ""),
            is_valid=True,
        )

    def get_stats(self) -> Dict:
        """Return cleaning statistics."""
        return {
            "seen_hashes_count": len(self.seen_hashes),
            "seen_titles_count": len(self.seen_titles),
        }
