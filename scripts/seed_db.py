"""Seed the ShopLite SQLite database with realistic product data.

Run from the project root:
    python scripts/seed_db.py
"""

import sys
from pathlib import Path

# Allow importing the backend app from scripts/
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.database import Base, SessionLocal, engine
from app.models import Product

PRODUCTS = [
    {
        "name": "Wireless Noise-Cancelling Headphones",
        "description": "Premium over-ear headphones with 30-hour battery life and active noise cancellation. Perfect for work and travel.",
        "price": 299.99,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
        "category": "Electronics",
        "stock": 45,
    },
    {
        "name": "Mechanical Keyboard — TKL RGB",
        "description": "Compact tenkeyless mechanical keyboard with Cherry MX switches and per-key RGB lighting.",
        "price": 149.99,
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400",
        "category": "Electronics",
        "stock": 30,
    },
    {
        "name": "Ultrawide 34\" Monitor",
        "description": "34-inch curved ultrawide monitor, 3440x1440 resolution, 144Hz refresh rate. Ideal for productivity and gaming.",
        "price": 799.99,
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
        "category": "Electronics",
        "stock": 12,
    },
    {
        "name": "Ergonomic Office Chair",
        "description": "Fully adjustable lumbar support, breathable mesh back, and 4D armrests. Your back will thank you.",
        "price": 459.00,
        "image_url": "https://images.unsplash.com/photo-1589384267710-7a170981ca78?w=400",
        "category": "Furniture",
        "stock": 8,
    },
    {
        "name": "Standing Desk — Electric Height Adjustable",
        "description": "Dual-motor electric standing desk. Smooth, quiet height adjustment with memory presets.",
        "price": 649.00,
        "image_url": "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400",
        "category": "Furniture",
        "stock": 5,
    },
    {
        "name": "USB-C Hub — 12-in-1",
        "description": "Expand your laptop with HDMI 4K, 3x USB-A, 2x USB-C PD, SD/microSD, Ethernet, and audio jack.",
        "price": 79.99,
        "image_url": "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?w=400",
        "category": "Electronics",
        "stock": 60,
    },
    {
        "name": "Webcam 4K Ultra HD",
        "description": "4K autofocus webcam with built-in dual microphones. Plug-and-play, no drivers needed.",
        "price": 129.99,
        "image_url": "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400",
        "category": "Electronics",
        "stock": 25,
    },
    {
        "name": "Desk Lamp — LED Smart",
        "description": "Touch-dimmable smart LED desk lamp with USB charging port, adjustable colour temperature 2700K-6500K.",
        "price": 59.99,
        "image_url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400",
        "category": "Lighting",
        "stock": 40,
    },
    {
        "name": "Laptop Stand — Aluminium",
        "description": "Adjustable aluminium laptop stand with anti-slip pads. Compatible with 11–17 inch laptops.",
        "price": 49.99,
        "image_url": "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400",
        "category": "Accessories",
        "stock": 55,
    },
    {
        "name": "Cable Management Kit",
        "description": "Complete kit: cable raceways, ties, clips, and a cable tray. Tame your desk chaos for good.",
        "price": 24.99,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
        "category": "Accessories",
        "stock": 100,
    },
]


def seed() -> None:
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        existing = db.query(Product).count()
        if existing > 0:
            print(f"Database already has {existing} products. Skipping seed.")
            return

        print(f"Seeding {len(PRODUCTS)} products...")
        for product_data in PRODUCTS:
            db.add(Product(**product_data))
        db.commit()
        print("Done! Database seeded successfully.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
