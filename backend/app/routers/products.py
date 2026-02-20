from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Product
from app.schemas import ProductListResponse, ProductResponse

router = APIRouter()


@router.get("", response_model=ProductListResponse)
async def list_products(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
) -> ProductListResponse:
    query = db.query(Product.id, Product.name, Product.description,
                     Product.price, Product.image_url, Product.category, Product.stock)
    if category:
        query = query.filter(Product.category == category)
    rows = query.all()
    products = [ProductResponse.model_validate(r._asdict()) for r in rows]
    return ProductListResponse(products=products, total=len(products))


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
) -> ProductResponse:
    row = (
        db.query(Product.id, Product.name, Product.description,
                 Product.price, Product.image_url, Product.category, Product.stock)
        .filter(Product.id == product_id)
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductResponse.model_validate(row._asdict())
