from sqlalchemy import Column, Integer, String, Text, Float, Table, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base


class DifficultyLevel(str, enum.Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class SourceType(str, enum.Enum):
    MANUAL = "manual"
    AUTO_COLLECTED = "auto_collected"


# Association table for tutorial-tag many-to-many
tutorial_tag = Table(
    "tutorial_tag", Base.metadata,
    Column("tutorial_id", Integer, ForeignKey("tutorials.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)

material_tag = Table(
    "material_tag", Base.metadata,
    Column("material_id", Integer, ForeignKey("materials.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False)
    name_cn = Column(String(100), nullable=False)
    icon = Column(String(50), default="sparkles")
    description = Column(Text, default="")
    sort_order = Column(Integer, default=0)

    tutorials = relationship("Tutorial", back_populates="category")


class Tutorial(Base):
    __tablename__ = "tutorials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    difficulty = Column(String(20), default=DifficultyLevel.BEGINNER.value)
    description = Column(Text, default="")
    cover_image = Column(String(500), default="")
    video_url = Column(String(500), default="")
    duration_minutes = Column(Integer, default=15)
    steps = Column(Text, default="[]")  # JSON string of steps
    tips = Column(Text, default="[]")  # JSON string of tips
    tools_needed = Column(Text, default="[]")  # JSON string of tool IDs
    materials_needed = Column(Text, default="[]")  # JSON string of material IDs
    source_type = Column(String(20), default=SourceType.MANUAL.value)
    source_url = Column(String(500), default="")
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="tutorials")
    tags = relationship("Tag", secondary=tutorial_tag, back_populates="tutorials")


class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), default="other")  # gel, polish, decoration, tool_set, etc.
    brand = Column(String(100), default="")
    description = Column(Text, default="")
    usage_guide = Column(Text, default="")
    image_url = Column(String(500), default="")
    price_range = Column(String(100), default="")
    buy_link = Column(String(500), default="")
    is_professional = Column(Integer, default=0)  # 0=beginner, 1=professional
    source_type = Column(String(20), default=SourceType.MANUAL.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    tags = relationship("Tag", secondary=material_tag, back_populates="materials")


class Tool(Base):
    __tablename__ = "tools"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(200), nullable=False)
    category = Column(String(100), default="basic")  # basic, advanced, electric, lamp, etc.
    description = Column(Text, default="")
    usage_steps = Column(Text, default="[]")  # JSON string
    precautions = Column(Text, default="")
    image_url = Column(String(500), default="")
    video_url = Column(String(500), default="")
    price_range = Column(String(100), default="")
    source_type = Column(String(20), default=SourceType.MANUAL.value)
    created_at = Column(DateTime, default=datetime.utcnow)

    tags = relationship("Tag", secondary="tool_tag", back_populates="tools")


class Tag(Base):
    __tablename__ = "tags"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(50), unique=True, nullable=False)

    tutorials = relationship("Tutorial", secondary=tutorial_tag, back_populates="tags")
    materials = relationship("Material", secondary=material_tag, back_populates="tags")
    tools = relationship("Tool", secondary="tool_tag", back_populates="tags")


# Association for tools-tags
tool_tag = Table(
    "tool_tag", Base.metadata,
    Column("tool_id", Integer, ForeignKey("tools.id"), primary_key=True),
    Column("tag_id", Integer, ForeignKey("tags.id"), primary_key=True),
)
