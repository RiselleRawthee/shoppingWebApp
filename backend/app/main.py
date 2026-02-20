from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import cart, products, reviews

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ShopLite API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router, prefix="/products", tags=["products"])
app.include_router(cart.router, prefix="/cart", tags=["cart"])
app.include_router(reviews.router, prefix="/products", tags=["reviews"])


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
