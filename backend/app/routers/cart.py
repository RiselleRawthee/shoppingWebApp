from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CartItem, Product
from app.schemas import CartItemRequest, CartItemResponse, CartResponse

router = APIRouter()


@router.get("/{session_id}", response_model=CartResponse)
async def get_cart(
    session_id: str,
    db: Session = Depends(get_db),
) -> CartResponse:
    items = (
        db.query(CartItem)
        .filter(CartItem.session_id == session_id)
        .all()
    )
    total_price = sum(item.product.price * item.quantity for item in items)
    item_count = sum(item.quantity for item in items)
    return CartResponse(
        items=[CartItemResponse.model_validate(i) for i in items],
        total_price=round(total_price, 2),
        item_count=item_count,
    )


@router.post("", response_model=CartItemResponse, status_code=201)
async def add_to_cart(
    payload: CartItemRequest,
    db: Session = Depends(get_db),
) -> CartItemResponse:
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = (
        db.query(CartItem)
        .filter(
            CartItem.session_id == payload.session_id,
            CartItem.product_id == payload.product_id,
        )
        .first()
    )
    if existing:
        existing.quantity += payload.quantity
        db.commit()
        db.refresh(existing)
        return CartItemResponse.model_validate(existing)

    item = CartItem(
        session_id=payload.session_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return CartItemResponse.model_validate(item)


@router.delete("/{session_id}/{item_id}", status_code=204)
async def remove_from_cart(
    session_id: str,
    item_id: int,
    db: Session = Depends(get_db),
) -> None:
    item = (
        db.query(CartItem)
        .filter(CartItem.id == item_id, CartItem.session_id == session_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(item)
    db.commit()
