def test_list_products_empty(client):
    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert data["products"] == []
    assert data["total"] == 0


def test_list_products_returns_all(client, sample_product, second_product):
    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    names = [p["name"] for p in data["products"]]
    assert "Wireless Headphones" in names
    assert "Mechanical Keyboard" in names


def test_list_products_filter_by_category(client, sample_product, second_product, db):
    from app.models import Product

    clothing = Product(
        name="T-Shirt",
        description="Plain cotton tee",
        price=19.99,
        image_url="https://example.com/tshirt.jpg",
        category="Clothing",
        stock=100,
    )
    db.add(clothing)
    db.commit()

    response = client.get("/products?category=Electronics")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert all(p["category"] == "Electronics" for p in data["products"])


def test_get_product_by_id(client, sample_product):
    response = client.get(f"/products/{sample_product.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Wireless Headphones"
    assert data["price"] == 299.99
    assert data["category"] == "Electronics"


def test_get_product_not_found(client):
    response = client.get("/products/99999")
    assert response.status_code == 404


def test_product_response_has_required_fields(client, sample_product):
    response = client.get(f"/products/{sample_product.id}")
    data = response.json()
    required_fields = {"id", "name", "description", "price", "image_url", "category", "stock"}
    assert required_fields.issubset(data.keys())
