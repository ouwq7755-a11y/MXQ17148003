"""
Nail Art Academy - FastAPI Backend
REST API for nail art tutorials, materials, tools, and auto-collected data.
"""
from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
import json
import os

from database import get_db, init_db
from models import Category, Tutorial, Material, Tool, Tag
import seed_data

app = FastAPI(title="美甲学院 API", version="1.0.0")

# Serve local video files
VIDEOS_DIR = os.path.join(os.path.dirname(__file__), "videos")
os.makedirs(VIDEOS_DIR, exist_ok=True)
app.mount("/videos", StaticFiles(directory=VIDEOS_DIR), name="videos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_database(db: Session):
    """Seed the database with initial data if empty."""
    if db.query(Category).count() > 0:
        return

    for cat_data in seed_data.get_categories():
        db.add(Category(**cat_data))

    for tag_data in seed_data.get_tags():
        db.add(Tag(**tag_data))

    db.flush()

    for tool_data in seed_data.get_tools():
        db.add(Tool(**tool_data))

    for mat_data in seed_data.get_materials():
        db.add(Material(**mat_data))

    db.flush()

    for tut_data in seed_data.get_tutorials():
        tag_ids = tut_data.pop("tags", [])
        tutorial = Tutorial(**tut_data)
        if tag_ids:
            tags = db.query(Tag).filter(Tag.id.in_(tag_ids)).all()
            tutorial.tags = tags
        db.add(tutorial)

    db.commit()


def import_full_seed(db: Session):
    """Import all collected tutorials from seed_full.json"""
    seed_file = os.path.join(os.path.dirname(__file__), "seed_full.json")
    if not os.path.exists(seed_file):
        return
    if db.query(Tutorial).count() > 20:  # Already has data
        return

    with open(seed_file, "r", encoding="utf-8") as f:
        tutorials = json.load(f)

    for tut_data in tutorials:
        tag_names = tut_data.pop("tags", [])
        slug = tut_data.get("slug", "")
        if db.query(Tutorial).filter(Tutorial.slug == slug).first():
            continue

        tag_objs = []
        for tn in tag_names:
            tag = db.query(Tag).filter(Tag.name == tn).first()
            if not tag:
                tag = Tag(name=tn)
                db.add(tag)
                db.flush()
            tag_objs.append(tag)

        tut_data["tags"] = tag_objs
        tutorial = Tutorial(**tut_data)
        db.add(tutorial)

    db.commit()


@app.on_event("startup")
def startup():
    init_db()
    db = next(get_db())
    seed_database(db)
    import_full_seed(db)
    db.close()


# ─── Categories ───────────────────────────────────────────

@app.get("/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).order_by(Category.sort_order).all()
    return [{"id": c.id, "name": c.name, "name_cn": c.name_cn, "icon": c.icon, "description": c.description} for c in categories]


# ─── Tutorials ───────────────────────────────────────────

@app.get("/tutorials")
def list_tutorials(
    category_id: Optional[int] = Query(None),
    difficulty: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(Tutorial)

    if category_id:
        query = query.filter(Tutorial.category_id == category_id)
    if difficulty:
        query = query.filter(Tutorial.difficulty == difficulty)
    if tag:
        query = query.join(Tutorial.tags).filter(Tag.name == tag)
    if search:
        query = query.filter(
            or_(
                Tutorial.title.contains(search),
                Tutorial.description.contains(search),
            )
        )

    total = query.count()
    tutorials = query.order_by(Tutorial.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "items": [_serialize_tutorial(t) for t in tutorials],
    }


@app.get("/tutorials/{slug}")
def get_tutorial(slug: str, db: Session = Depends(get_db)):
    tutorial = db.query(Tutorial).filter(Tutorial.slug == slug).first()
    if not tutorial:
        raise HTTPException(status_code=404, detail="Tutorial not found")

    tutorial.view_count = (tutorial.view_count or 0) + 1
    db.commit()

    data = _serialize_tutorial(tutorial)
    data["steps"] = json.loads(tutorial.steps) if tutorial.steps else []
    data["tips"] = json.loads(tutorial.tips) if tutorial.tips else []
    data["tools_needed"] = json.loads(tutorial.tools_needed) if tutorial.tools_needed else []
    data["materials_needed"] = json.loads(tutorial.materials_needed) if tutorial.materials_needed else []
    return data


@app.get("/tutorials/hot")
def hot_tutorials(limit: int = Query(6, ge=1, le=20), db: Session = Depends(get_db)):
    tutorials = db.query(Tutorial).order_by(Tutorial.view_count.desc()).limit(limit).all()
    return [_serialize_tutorial(t) for t in tutorials]


def _serialize_tutorial(t: Tutorial):
    return {
        "id": t.id,
        "title": t.title,
        "slug": t.slug,
        "category_id": t.category_id,
        "category_name": t.category.name_cn if t.category else "",
        "difficulty": t.difficulty,
        "description": t.description,
        "cover_image": t.cover_image,
        "video_url": t.video_url,
        "duration_minutes": t.duration_minutes,
        "view_count": t.view_count,
        "tags": [{"id": tag.id, "name": tag.name} for tag in t.tags],
        "created_at": t.created_at.isoformat() if t.created_at else None,
    }


# ─── Materials ───────────────────────────────────────────

@app.get("/materials")
def list_materials(
    category: Optional[str] = Query(None),
    is_professional: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Material)
    if category:
        query = query.filter(Material.category == category)
    if is_professional is not None:
        query = query.filter(Material.is_professional == is_professional)
    if search:
        query = query.filter(Material.name.contains(search))
    materials = query.all()
    return [_serialize_material(m) for m in materials]


@app.get("/materials/{material_id}")
def get_material(material_id: int, db: Session = Depends(get_db)):
    material = db.query(Material).filter(Material.id == material_id).first()
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    return _serialize_material(material)


def _serialize_material(m: Material):
    return {
        "id": m.id,
        "name": m.name,
        "category": m.category,
        "brand": m.brand,
        "description": m.description,
        "usage_guide": m.usage_guide,
        "image_url": m.image_url,
        "price_range": m.price_range,
        "buy_link": m.buy_link,
        "is_professional": bool(m.is_professional),
        "tags": [{"id": t.id, "name": t.name} for t in m.tags],
    }


# ─── Tools ───────────────────────────────────────────────

@app.get("/tools")
def list_tools(
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Tool)
    if category:
        query = query.filter(Tool.category == category)
    if search:
        query = query.filter(Tool.name.contains(search))
    tools = query.all()
    return [_serialize_tool(t) for t in tools]


@app.get("/tools/{tool_id}")
def get_tool(tool_id: int, db: Session = Depends(get_db)):
    tool = db.query(Tool).filter(Tool.id == tool_id).first()
    if not tool:
        raise HTTPException(status_code=404, detail="Tool not found")
    data = _serialize_tool(tool)
    data["usage_steps"] = json.loads(tool.usage_steps) if tool.usage_steps else []
    data["precautions"] = tool.precautions
    return data


def _serialize_tool(t: Tool):
    return {
        "id": t.id,
        "name": t.name,
        "category": t.category,
        "description": t.description,
        "image_url": t.image_url,
        "video_url": t.video_url,
        "price_range": t.price_range,
        "tags": [{"id": tag.id, "name": tag.name} for tag in t.tags],
    }


# ─── Tags ────────────────────────────────────────────────

@app.get("/tags")
def list_tags(db: Session = Depends(get_db)):
    tags = db.query(Tag).all()
    return [{"id": t.id, "name": t.name} for t in tags]


# ─── Search ──────────────────────────────────────────────

@app.get("/search")
def global_search(q: str = Query(..., min_length=1), db: Session = Depends(get_db)):
    tutorials = db.query(Tutorial).filter(
        or_(Tutorial.title.contains(q), Tutorial.description.contains(q))
    ).limit(10).all()

    materials = db.query(Material).filter(
        or_(Material.name.contains(q), Material.description.contains(q))
    ).limit(10).all()

    tools = db.query(Tool).filter(
        or_(Tool.name.contains(q), Tool.description.contains(q))
    ).limit(10).all()

    return {
        "tutorials": [_serialize_tutorial(t) for t in tutorials],
        "materials": [_serialize_material(m) for m in materials],
        "tools": [_serialize_tool(t) for t in tools],
    }


# ─── Stats ───────────────────────────────────────────────

@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    return {
        "tutorial_count": db.query(Tutorial).count(),
        "material_count": db.query(Material).count(),
        "tool_count": db.query(Tool).count(),
        "category_count": db.query(Category).count(),
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
