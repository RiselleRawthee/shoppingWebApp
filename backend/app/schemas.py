from pydantic import BaseModel, Field


# ── Product schemas ──────────────────────────────────────────────────────────

class ProductResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    image_url: str
    category: str
    stock: int

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    products: list[ProductResponse]
    total: int


# ── Cart schemas ─────────────────────────────────────────────────────────────

class CartItemRequest(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)
    session_id: str


class CartItemResponse(BaseModel):
    id: int
    session_id: str
    product_id: int
    quantity: int
    product: ProductResponse

    model_config = {"from_attributes": True}


class CartResponse(BaseModel):
    items: list[CartItemResponse]
    total_price: float
    item_count: int
